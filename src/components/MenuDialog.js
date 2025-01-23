import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import { Switch } from "./Switch";
import { Label } from "./Label";
import { Select } from "./Select";
import { FaTelegram, FaWhatsapp, FaVk } from "react-icons/fa";
import { FiLink, FiHelpCircle } from "react-icons/fi";
import InfoDialog from "./InfoDialog";
import Notification, { NOTIFICATION_MESSAGES } from "./Notification";
import "../styles/dialogs.css";

const MenuDialog = ({
  isOpen,
  onClose,
  isCaptain,
  onCaptainChange,
  onNewGame,
  onShowKey,
  dictionaries,
  currentDictionary,
  onDictionaryChange,
  serverStatus = false,
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const handleShare = async (platform) => {
    const url = new URL(window.location);
    const shareText = encodeURIComponent("Давай сыграем в Codenames! 🎮\n");
    const shareUrl = encodeURIComponent(url.toString());

    let shareLink = "";
    switch (platform) {
      case "telegram":
        shareLink = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${shareText}${shareUrl}`;
        break;
      case "vk":
        shareLink = `https://vk.com/share.php?url=${shareUrl}&title=${shareText}`;
        break;
      default:
        try {
          await navigator.clipboard.writeText(url.toString());
          setShowNotification(true);
        } catch (err) {
          console.error("Failed to copy link:", err);
        }
        return;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleDictionarySelect = (e) => {
    const dictionary = dictionaries.find((d) => d.id === e.target.value);
    if (dictionary) {
      onDictionaryChange(dictionary);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="dialog-content">
          <DialogHeader className="dialog-header">
            <DialogTitle>Меню игры</DialogTitle>
          </DialogHeader>

          <div className="menu-content">
            <div className="menu-item">
              <div className="switch-container">
                <Switch
                  id="captain-mode"
                  checked={isCaptain}
                  onCheckedChange={onCaptainChange}
                />
                <Label htmlFor="captain-mode">Режим капитана</Label>
              </div>
            </div>

            <div className="dictionary-select-container">
              <label className="section-label">Словарь:</label>
              <Select
                value={currentDictionary?.id || ""}
                onChange={handleDictionarySelect}
                options={dictionaries.map((dic) => ({
                  value: dic.id,
                  label: dic.title,
                }))}
                className="dictionary-select"
              />
            </div>

            <div className="menu-actions">
              <Button onClick={onNewGame}>Новая игра</Button>
              <Button onClick={onShowKey} variant="outline">
                Ключ игры
              </Button>

              <div className="share-container">
                <label className="section-label">Поделиться этой игрой</label>
                <div className="share-icons">
                  <Button
                    onClick={() => handleShare("copy")}
                    variant="outline"
                    className="icon-button"
                    title="Копировать ссылку"
                  >
                    <FiLink size={20} />
                  </Button>
                  <Button
                    onClick={() => handleShare("telegram")}
                    variant="outline"
                    className="icon-button"
                    title="Поделиться в Telegram"
                  >
                    <FaTelegram size={20} />
                  </Button>
                  <Button
                    onClick={() => handleShare("whatsapp")}
                    variant="outline"
                    className="icon-button"
                    title="Поделиться в WhatsApp"
                  >
                    <FaWhatsapp size={20} />
                  </Button>
                  <Button
                    onClick={() => handleShare("vk")}
                    variant="outline"
                    className="icon-button"
                    title="Поделиться в VK"
                  >
                    <FaVk size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="menu-footer">
              <div className="menu-footer-left">
                <Button
                  variant="ghost"
                  className="icon-button"
                  onClick={() => setShowInfoDialog(true)}
                  title="Информация"
                >
                  <FiHelpCircle size={20} />
                </Button>
                <div
                  className="server-status"
                  title={serverStatus ? "Сервер онлайн" : "Сервер офлайн"}
                >
                  <div
                    className={`status-indicator ${
                      serverStatus ? "online" : "offline"
                    }`}
                  ></div>
                  <span className="status-text">
                    {serverStatus ? "Сервер онлайн" : "Сервер офлайн"}
                  </span>
                </div>
              </div>
              <Button onClick={onClose} variant="outline">
                Закрыть
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        isOpen={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
      />

      <Notification
        message={NOTIFICATION_MESSAGES.COPIED_LINK}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};

export default MenuDialog;
