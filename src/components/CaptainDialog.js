import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import { Input } from "./Input";
import { FiEye, FiXCircle, FiChevronDown } from "react-icons/fi";
import TeamSwitch from "./TeamSwitch";
import "../styles/dialogs.css";
import "../styles/captain-helper.css";

const CONFIRMATION_PHRASE = "Я КАПИТАН";

const WordsList = ({
  title,
  words,
  remainingCount,
  isOpponent,
  onDragHandlers,
  expanded,
  onExpandToggle,
}) => (
  <div className={`words-list ${words[0]?.color}`}>
    <div
      className={`words-header${isOpponent ? " opponent-header" : ""}`}
      onClick={isOpponent ? onExpandToggle : undefined}
    >
      <span className="words-title">
        {title}
        {isOpponent && (
          <FiChevronDown
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          />
        )}
      </span>
      <span className="words-count">Осталось: {remainingCount}</span>
    </div>
    <div
      className={`${isOpponent ? "opponent-content" : "words-content"} ${
        expanded ? "expanded" : ""
      }`}
    >
      <div className="word-items-container">
        {[false, true].map((isRevealed) => {
          const filteredWords = words.filter(
            (item) => item.revealed === isRevealed
          );
          if (!filteredWords.length) return null;

          return (
            <div
              key={isRevealed}
              className={`word-items-${isRevealed ? "revealed" : "unrevealed"}`}
            >
              {filteredWords.map((item) => (
                <div
                  key={item.word}
                  className={`word-item${
                    !isRevealed && !isOpponent ? " draggable" : ""
                  }${isRevealed ? " revealed" : ""}`}
                  {...(!isRevealed && !isOpponent
                    ? {
                        draggable: true,
                        onDragStart: (e) => onDragHandlers.start(e, item),
                        onDragEnter: (e) => onDragHandlers.enter(e, item),
                        onDragEnd: onDragHandlers.end,
                        onDragOver: (e) => e.preventDefault(),
                      }
                    : {})}
                >
                  {item.word}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const CaptainDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isCaptainConfirmed,
  gameState,
}) => {
  const [phrase, setPhrase] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("blue");
  const [isOpponentExpanded, setIsOpponentExpanded] = useState(false);
  const [unrevealedOrders, setUnrevealedOrders] = useState({
    blue: null,
    red: null,
  });
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const getTeamWords = (team) => {
    if (!gameState?.words) return [];

    const words = gameState.words
      .map((word, index) => ({
        word,
        index,
        revealed: gameState.revealed[index],
        color: gameState.colors[index],
      }))
      .filter((item) => item.color === team);

    const [unrevealed, revealed] = [
      words.filter((item) => !item.revealed),
      words.filter((item) => item.revealed),
    ];

    if (unrevealedOrders[team]) {
      unrevealed.sort((a, b) => {
        const [indexA, indexB] = [a, b].map((item) =>
          unrevealedOrders[team].indexOf(item.word)
        );
        return indexA === -1 ? 1 : indexB === -1 ? -1 : indexA - indexB;
      });
    }

    return [...unrevealed, ...revealed];
  };

  const dragHandlers = {
    start: (e, item) => {
      if (item.revealed) {
        e.preventDefault();
        return;
      }
      dragItem.current = item;
      e.target.classList.add("dragging");
    },
    enter: (e, item) => {
      if (item.revealed) {
        e.preventDefault();
        return;
      }
      dragOverItem.current = item;
      e.preventDefault();
    },
    end: (e) => {
      e.target.classList.remove("dragging");
      if (!dragItem.current || !dragOverItem.current) return;

      const words = getTeamWords(selectedTeam);
      const unrevealed = words.filter((w) => !w.revealed);

      const [fromIndex, toIndex] = [dragItem.current, dragOverItem.current].map(
        (item) => unrevealed.findIndex((w) => w.word === item.word)
      );

      if (fromIndex !== -1 && toIndex !== -1) {
        const newUnrevealed = [...unrevealed];
        const [movedItem] = newUnrevealed.splice(fromIndex, 1);
        newUnrevealed.splice(toIndex, 0, movedItem);

        setUnrevealedOrders((prev) => ({
          ...prev,
          [selectedTeam]: newUnrevealed.map((w) => w.word),
        }));
      }

      dragItem.current = null;
      dragOverItem.current = null;
    },
  };

  useEffect(() => {
    if (gameState) {
      setUnrevealedOrders((prev) => {
        const newOrders = { ...prev };
        ["blue", "red"].forEach((team) => {
          if (!newOrders[team]) {
            const unrevealed = getTeamWords(team)
              .filter((item) => !item.revealed)
              .map((item) => item.word);
            newOrders[team] = unrevealed;
          }
        });
        return newOrders;
      });
    }
  }, [gameState]);

  const handleClose = () => {
    setPhrase("");
    onClose();
  };

  const VerificationContent = (
    <>
      <DialogHeader>
        <DialogTitle>Режим капитана</DialogTitle>
        <DialogDescription>
          В режиме капитана вы будете видеть цвета всех карточек. Помните, что
          подсказывать цвета карточек своей команде запрещено - это испортит
          удовольствие от игры.
        </DialogDescription>
      </DialogHeader>

      <div className="captain-content">
        <div className="confirmation-container">
          <p className="confirmation-instruction">
            Для подтверждения введите фразу:
          </p>
          <div className="confirmation-wrapper">
            <div className="confirmation-phrase">{CONFIRMATION_PHRASE}</div>
            <Input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value.toUpperCase())}
              className="confirmation-input"
              maxLength={9}
              placeholder="Фраза"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <div className="footer-buttons">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              if (phrase.trim().toUpperCase() === CONFIRMATION_PHRASE) {
                onConfirm();
                setPhrase("");
              }
            }}
            disabled={phrase.trim().toUpperCase() !== CONFIRMATION_PHRASE}
          >
            Подтвердить
          </Button>
        </div>
      </DialogFooter>
    </>
  );

  const HelperContent = (
    <>
      <DialogHeader>
        <DialogTitle>Помощник капитана</DialogTitle>
      </DialogHeader>

      <div className="helper-tip">
        Удерживайте кнопку{" "}
        <span className="eye-icon">
          <FiEye size={16} />
        </span>{" "}
        1 секунду для переключения режима игрового поля
      </div>

      <div className="captain-helper-content">
        <TeamSwitch team={selectedTeam} onChange={setSelectedTeam} />

        {gameState && (
          <>
            <WordsList
              title={selectedTeam === "blue" ? "Синие" : "Красные"}
              words={getTeamWords(selectedTeam)}
              remainingCount={gameState.remainingCards[selectedTeam]}
              onDragHandlers={dragHandlers}
            />

            <WordsList
              title={selectedTeam === "blue" ? "Красные" : "Синие"}
              words={getTeamWords(selectedTeam === "blue" ? "red" : "blue")}
              remainingCount={
                gameState.remainingCards[
                  selectedTeam === "blue" ? "red" : "blue"
                ]
              }
              isOpponent
              expanded={isOpponentExpanded}
              onExpandToggle={() => setIsOpponentExpanded(!isOpponentExpanded)}
            />

            <div className="assassin-section">
              <div className="assassin-title">
                <FiXCircle />
                Слово-убийца
              </div>
              <div className="assassin-word">
                {gameState.words.find(
                  (_, index) => gameState.colors[index] === "black"
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <DialogFooter>
        <Button onClick={handleClose} variant="outline">
          Закрыть
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`dialog-content captain-dialog ${
          isCaptainConfirmed ? "helper-mode" : ""
        }`}
      >
        {!isCaptainConfirmed ? VerificationContent : HelperContent}
      </DialogContent>
    </Dialog>
  );
};

export default CaptainDialog;
