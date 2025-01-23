import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "../styles/notifications.css";

const Notification = ({ message, isVisible, duration = 2000, onClose }) => {
  useEffect(() => {
    let timeoutId;
    if (isVisible) {
      timeoutId = setTimeout(() => {
        onClose();
      }, duration);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <div className="notification-container">
      <div className={`notification ${isVisible ? "visible" : ""}`}>
        {message}
      </div>
    </div>,
    document.body
  );
};

// Предопределенные тексты уведомлений для переиспользования
export const NOTIFICATION_MESSAGES = {
  PRESS_AND_HOLD: "Удерживайте карточку для открытия",
  COPIED_KEY: "Ключ скопирован",
  COPIED_LINK: "Ссылка скопирована",
  NEW_GAME_LINK: "Автоматически создана новая игра и скопирована ссылка",
};

export default Notification;
