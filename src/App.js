import React, { useState, useEffect } from "react";
import GameCard from "./components/GameCard";
import GameStatus from "./components/GameStatus";
import WinDialog from "./components/WinDialog";
import KeyDialog from "./components/KeyDialog";
import MenuDialog from "./components/MenuDialog";
import CaptainDialog from "./components/CaptainDialog";
import {
  generateGameFromKey,
  generateNewKey,
  getDictionaryIndexFromKey,
} from "./utils/gameGenerator";
import gameSocket from "./services/socket";
import "./styles/game.css";

const App = () => {
  const [gameState, setGameState] = useState({
    words: [],
    colors: [],
    revealed: Array(25).fill(false),
    currentTeam: "blue",
    remainingCards: { blue: 9, red: 8 },
    gameOver: false,
    winner: null,
  });

  const [isCaptain, setIsCaptain] = useState(false);
  const [isCaptainConfirmed, setIsCaptainConfirmed] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [wasWinDialogShown, setWasWinDialogShown] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showCaptainDialog, setShowCaptainDialog] = useState(false);
  const [currentKey, setCurrentKey] = useState("");
  const [isServerConnected, setIsServerConnected] = useState(false);

  const [availableWords, setAvailableWords] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [currentDictionary, setCurrentDictionary] = useState(null);

  const loadDictionary = async (filename, index) => {
    try {
      const response = await fetch(`/CodenamesGames/dic/${filename}`);
      const text = await response.text();

      const titleMatch = text.match(/#TITLE=(.*?)#/);
      if (!titleMatch) return null;

      const title = titleMatch[1];
      const wordsText = text.substring(text.indexOf("#", 1) + 1).trim();
      const words = wordsText
        .split(",")
        .map((word) => word.trim().toUpperCase())
        .sort((a, b) => a.localeCompare(b));

      return {
        id: filename,
        index,
        title,
        words,
      };
    } catch (error) {
      console.error("Error loading dictionary:", error);
      return null;
    }
  };

  useEffect(() => {
    gameSocket.connect();

    const handleConnect = () => setIsServerConnected(true);
    const handleDisconnect = () => setIsServerConnected(false);

    const handleGameState = (newState) => {
      setGameState((prevState) => ({
        ...prevState,
        words: newState.words || prevState.words,
        colors: newState.colors || prevState.colors,
        revealed: newState.revealed,
        currentTeam: newState.currentTeam,
        remainingCards: newState.remainingCards,
        gameOver: newState.gameOver,
        winner: newState.winner,
      }));

      if (newState.gameOver && newState.winner && !wasWinDialogShown) {
        setShowWinDialog(true);
        setWasWinDialogShown(true);
      }
    };

    gameSocket.socket.on("connect", handleConnect);
    gameSocket.socket.on("disconnect", handleDisconnect);
    gameSocket.onGameState(handleGameState);

    return () => {
      gameSocket.removeAllListeners();
      gameSocket.disconnect();
    };
  }, [wasWinDialogShown]);

  useEffect(() => {
    const init = async () => {
      const dicFiles = ["words1.txt", "words2.txt", "words3.txt"];
      const loadedDictionaries = await Promise.all(
        dicFiles.map((file, index) => loadDictionary(file, index))
      );
      const validDictionaries = loadedDictionaries.filter(
        (dic) => dic !== null
      );
      setDictionaries(validDictionaries);

      const urlParams = new URLSearchParams(window.location.search);
      const keyFromUrl = urlParams.get("key");
      const dictionary = validDictionaries[0];

      if (!dictionary) return;

      if (keyFromUrl) {
        const dictionaryIndex = getDictionaryIndexFromKey(keyFromUrl);
        const keyDictionary = validDictionaries.find(
          (d) => d.index === dictionaryIndex
        );

        if (keyDictionary) {
          const gameData = generateGameFromKey(
            keyFromUrl,
            keyDictionary.words,
            keyDictionary.index
          );

          if (gameData) {
            setCurrentDictionary(keyDictionary);
            setAvailableWords(keyDictionary.words);
            setCurrentKey(keyFromUrl);

            setGameState({
              words: gameData.words,
              colors: gameData.colors,
              revealed: Array(25).fill(false),
              currentTeam: gameData.startingTeam,
              remainingCards: {
                blue: gameData.colors.filter((c) => c === "blue").length,
                red: gameData.colors.filter((c) => c === "red").length,
              },
              gameOver: false,
              winner: null,
            });

            gameSocket.joinGame(keyFromUrl);
            return;
          }
        }
      }

      // Если ключ невалидный или его нет - создаем новую игру
      const newKey = generateNewKey(dictionary.index);
      const gameData = generateGameFromKey(
        newKey,
        dictionary.words,
        dictionary.index
      );

      if (gameData) {
        setCurrentDictionary(dictionary);
        setAvailableWords(dictionary.words);
        setCurrentKey(newKey);

        const url = new URL(window.location);
        url.searchParams.set("key", newKey);
        window.history.pushState({}, "", url.toString());

        setGameState({
          words: gameData.words,
          colors: gameData.colors,
          revealed: Array(25).fill(false),
          currentTeam: gameData.startingTeam,
          remainingCards: {
            blue: gameData.colors.filter((c) => c === "blue").length,
            red: gameData.colors.filter((c) => c === "red").length,
          },
          gameOver: false,
          winner: null,
        });

        gameSocket.startNewGame(newKey, gameData.words, gameData.colors);
      }
    };

    init();
  }, []);

  const handleDictionaryChange = (dictionary) => {
    setCurrentDictionary(dictionary);
    setAvailableWords(dictionary.words);
  };

  const startNewGame = (key = null) => {
    if (!currentDictionary) return;

    let gameKey = key;
    let newGameData;
    let gameDictionary = currentDictionary;

    if (key) {
      const dictionaryIndex = getDictionaryIndexFromKey(key);
      const keyDictionary = dictionaries.find(
        (d) => d.index === dictionaryIndex
      );

      if (keyDictionary) {
        newGameData = generateGameFromKey(
          key,
          keyDictionary.words,
          keyDictionary.index
        );
        if (newGameData) {
          gameDictionary = keyDictionary;
        }
      }
    }

    if (!newGameData) {
      gameKey = generateNewKey(gameDictionary.index);
      newGameData = generateGameFromKey(
        gameKey,
        gameDictionary.words,
        gameDictionary.index
      );
    }

    if (newGameData) {
      setCurrentDictionary(gameDictionary);
      setAvailableWords(gameDictionary.words);
      setCurrentKey(gameKey);
      setWasWinDialogShown(false);
      setIsCaptain(false);
      setIsCaptainConfirmed(false);

      const url = new URL(window.location);
      url.searchParams.set("key", gameKey);
      window.history.pushState({}, "", url.toString());

      setGameState({
        words: newGameData.words,
        colors: newGameData.colors,
        revealed: Array(25).fill(false),
        currentTeam: newGameData.startingTeam,
        remainingCards: {
          blue: newGameData.colors.filter((c) => c === "blue").length,
          red: newGameData.colors.filter((c) => c === "red").length,
        },
        gameOver: false,
        winner: null,
      });

      if (key) {
        gameSocket.joinGame(gameKey);
      } else {
        gameSocket.startNewGame(gameKey, newGameData.words, newGameData.colors);
      }
    }

    setShowWinDialog(false);
    setShowMenuDialog(false);
    setShowKeyDialog(false);
  };

  const handleCaptainRequest = (value) => {
    if (value) {
      if (!isCaptainConfirmed) {
        setShowCaptainDialog(true);
      } else {
        setIsCaptain(true);
      }
    } else {
      setIsCaptain(false);
    }
  };

  const handleCaptainConfirm = () => {
    setIsCaptainConfirmed(true);
    setIsCaptain(true);
    setShowCaptainDialog(false);
  };

  const handleCaptainModeToggle = () => {
    if (isCaptainConfirmed) {
      setIsCaptain(!isCaptain);
    }
  };

  const handleCaptainHelperClick = () => {
    setShowCaptainDialog(true);
  };

  const handleCardClick = (index) => {
    if (gameState.revealed[index] || isCaptain) return;
    gameSocket.revealCard(index);
  };

  return (
    <div className="container">
      <div className="game-grid">
        {gameState.words.map((word, index) => (
          <GameCard
            key={index}
            word={word}
            color={gameState.colors[index]}
            revealed={gameState.revealed[index]}
            onConfirm={() => handleCardClick(index)}
            isCaptain={isCaptain}
          />
        ))}
      </div>

      <GameStatus
        remainingCards={gameState.remainingCards}
        onMenuClick={() => setShowMenuDialog(true)}
        isCaptain={isCaptain}
        isCaptainConfirmed={isCaptainConfirmed}
        onCaptainModeToggle={handleCaptainModeToggle}
        onCaptainHelperClick={handleCaptainHelperClick}
      />

      <WinDialog
        isOpen={showWinDialog}
        winner={gameState.winner}
        onClose={() => startNewGame()}
        onReturn={() => setShowWinDialog(false)}
      />

      <KeyDialog
        isOpen={showKeyDialog}
        onClose={() => setShowKeyDialog(false)}
        onKeySubmit={startNewGame}
        currentKey={currentKey}
        onBack={() => {
          setShowKeyDialog(false);
          setShowMenuDialog(true);
        }}
        currentDictionary={currentDictionary}
      />

      <MenuDialog
        isOpen={showMenuDialog}
        onClose={() => setShowMenuDialog(false)}
        isCaptain={isCaptain}
        onCaptainChange={handleCaptainRequest}
        onNewGame={() => startNewGame()}
        onShowKey={() => {
          setShowMenuDialog(false);
          setShowKeyDialog(true);
        }}
        dictionaries={dictionaries}
        currentDictionary={currentDictionary}
        onDictionaryChange={handleDictionaryChange}
        serverStatus={isServerConnected}
      />

      <CaptainDialog
        isOpen={showCaptainDialog}
        onClose={() => setShowCaptainDialog(false)}
        onConfirm={handleCaptainConfirm}
        isCaptain={isCaptain}
        isCaptainConfirmed={isCaptainConfirmed}
        gameState={gameState}
      />
    </div>
  );
};

export default App;
