import { io } from "socket.io-client";

class GameSocket {
  constructor() {
    this.socket = null;
    this.gameKey = null;
  }

  connect(serverUrl = "https://p6dxkv-8080.csb.app") {
    this.socket = io(serverUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Connected to game server");
      if (this.gameKey) {
        this.joinGame(this.gameKey);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from game server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinGame(gameKey, words, colors) {
    this.gameKey = gameKey;
    if (this.socket) {
      this.socket.emit("JOIN_GAME", { gameKey, words, colors });
    }
  }

  revealCard(cardIndex) {
    if (this.socket && this.gameKey) {
      this.socket.emit("REVEAL_CARD", {
        gameKey: this.gameKey,
        cardIndex,
      });
    }
  }

  startNewGame(gameKey, words, colors) {
    this.gameKey = gameKey;
    if (this.socket) {
      this.socket.emit("NEW_GAME", { gameKey, words, colors });
    }
  }

  onGameState(callback) {
    if (this.socket) {
      this.socket.on("GAME_STATE", callback);
    }
  }

  onPlayerJoined(callback) {
    if (this.socket) {
      this.socket.on("PLAYER_JOINED", callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Создаём единственный экземпляр для всего приложения
const gameSocket = new GameSocket();

export default gameSocket;
