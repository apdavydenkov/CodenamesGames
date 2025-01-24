import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import "../styles/dialogs.css";

const InfoDialog = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>О приложении</DialogTitle>
          <div className="dialog-description">
            Это тестовая версия приложения Codenames.
            <br />
            <br />
            В следующей версии будет добавлена:
            <br />
            - Доработка офлайн режима
            <br />- Фановый режим
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
