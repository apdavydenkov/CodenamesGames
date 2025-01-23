import React, { useState, useEffect } from "react";
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
import { FiDelete, FiPlus } from "react-icons/fi";
import Notification, { NOTIFICATION_MESSAGES } from "./Notification";
import { isValidKeyFormat, generateNewKey } from "../utils/gameGenerator";
import "../styles/dialogs.css";

const KeyDialog = ({
  isOpen,
  onClose,
  onKeySubmit,
  currentKey,
  onBack,
  currentDictionary,
}) => {
  const [key, setKey] = useState(currentKey || "");
  const [isValidInput, setIsValidInput] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setKey(currentKey || "");
    setIsValidInput(currentKey ? isValidKeyFormat(currentKey) : true);
  }, [currentKey, isOpen]);

  const handleKeyInput = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^А-ЯЁ]/g, "");
    const cleanValue = value.slice(0, 7);
    setKey(cleanValue);
    setIsValidInput(cleanValue.length !== 7 || isValidKeyFormat(cleanValue));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(key);
      setShowNotification(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const formattedText = text
        .toUpperCase()
        .replace(/[^А-ЯЁ]/g, "")
        .slice(0, 7);
      setKey(formattedText);
      setIsValidInput(
        formattedText.length !== 7 || isValidKeyFormat(formattedText)
      );
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  const handleClear = () => {
    setKey("");
    setIsValidInput(true);
  };

  const handleNewKey = () => {
    if (currentDictionary) {
      const newKey = generateNewKey(currentDictionary.index);
      setKey(newKey);
      setIsValidInput(true);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="dialog-content">
          <DialogHeader className="dialog-header">
            <DialogTitle>Ключ игры</DialogTitle>
            <DialogDescription>
              Введите ключ для создания новой игры. Формат: СГСГСГС (С -
              согласная, Г - гласная), последняя буква определяет словарь
            </DialogDescription>
          </DialogHeader>

          <div className="key-content">
            <div>
              <div className="input-container">
                <Input
                  value={key}
                  onChange={handleKeyInput}
                  placeholder="БАКОСУМ"
                  error={!isValidInput}
                  className="key-input"
                />
                <Button
                  onClick={handleClear}
                  title="Очистить"
                  variant="outline"
                  className="icon-button"
                >
                  <FiDelete size={20} />
                </Button>
              </div>
              {!isValidInput && key.length === 7 && (
                <p className="error-message">Неверный ключ</p>
              )}
            </div>

            <div className="action-buttons">
              <Button
                onClick={handleNewKey}
                variant="outline"
                className="icon-button"
                title="Новый ключ"
                disabled={!currentDictionary}
              >
                <FiPlus size={20} />
              </Button>
              <Button onClick={handleCopy} variant="outline">
                Копировать
              </Button>
              <Button onClick={handlePaste} variant="outline">
                Вставить
              </Button>
            </div>
          </div>

          <DialogFooter>
            <div className="footer-buttons">
              <Button variant="outline" onClick={onBack}>
                Назад
              </Button>
              <Button
                onClick={() => {
                  if (isValidInput && key && isValidKeyFormat(key)) {
                    onKeySubmit(key);
                    onClose();
                  }
                }}
                disabled={
                  !isValidInput ||
                  !key ||
                  key.length !== 7 ||
                  !isValidKeyFormat(key)
                }
              >
                Создать
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Notification
        message={NOTIFICATION_MESSAGES.COPIED_KEY}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};

export default KeyDialog;
