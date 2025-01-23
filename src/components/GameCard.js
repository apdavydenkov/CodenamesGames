// GameCard.js
import React, { useState, useEffect, useRef } from "react";
import Notification, { NOTIFICATION_MESSAGES } from "./Notification";

const GameCard = ({
  word,
  color,
  revealed,
  onConfirm,
  isCaptain,
  gameOver,
}) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const pressTimer = useRef(null);
  const progressTimer = useRef(null);

  const PRESS_DURATION = 1500;
  const PROGRESS_INTERVAL = 50;

  const getCardStyle = () => {
    if (revealed || isCaptain) {
      return `game-card card-${color}`;
    }
    return "game-card card-unrevealed";
  };

  const progressBarStyles = {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: `${progress}%`,
    height: "100%",
    backgroundColor: pressing ? "rgba(0, 0, 0, 0.1)" : "transparent",
    transition: "width 50ms linear",
    pointerEvents: "none",
  };

  const handleClick = () => {
    if (!revealed && !isCaptain && !pressing) {
      setShowNotification(true);
    }
  };

  const startPress = (e) => {
    if (isCaptain || revealed) return;

    e.preventDefault();
    setPressing(true);
    setProgress(0);

    pressTimer.current = setTimeout(() => {
      setPressing(false);
      setProgress(0);
      onConfirm();
    }, PRESS_DURATION);

    let currentProgress = 0;
    progressTimer.current = setInterval(() => {
      currentProgress += (100 * PROGRESS_INTERVAL) / PRESS_DURATION;
      if (currentProgress >= 100) {
        clearInterval(progressTimer.current);
      } else {
        setProgress(currentProgress);
      }
    }, PROGRESS_INTERVAL);
  };

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      clearInterval(progressTimer.current);
      setPressing(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  return (
    <>
      <div
        className={getCardStyle()}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onClick={handleClick}
      >
        <div style={progressBarStyles} />
        <div className="card-content">
          <span className="card-word">{word}</span>
        </div>
      </div>
      <Notification
        message={NOTIFICATION_MESSAGES.PRESS_AND_HOLD}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};

export default GameCard;
