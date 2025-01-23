import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import "../styles/dialogs.css";

const WinDialog = ({ isOpen, winner, onClose, onReturn }) => {
  const message =
    winner === "assassin"
      ? {
          title: "Игра окончена!",
          description: "Команда, которая открыла убийцу, проиграла!",
        }
      : {
          title: "Игра окончена!",
          description: `${
            winner === "blue" ? "Синяя" : "Красная"
          } команда победила, раскрыв все свои карты!`,
        };

  return (
    <Dialog open={isOpen} onOpenChange={onReturn}>
      <DialogContent className="dialog-content win-dialog">
        <DialogHeader className="dialog-header">
          <DialogTitle>{message.title}</DialogTitle>
          <DialogDescription>{message.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="win-footer">
          <div className="footer-buttons">
            <Button variant="outline" onClick={onReturn}>
              Вернуться к полю
            </Button>
            <Button onClick={onClose}>Новая игра</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WinDialog;
