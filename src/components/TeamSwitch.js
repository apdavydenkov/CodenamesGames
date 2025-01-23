import React from "react";
import "../styles/captain-helper.css";

const TeamSwitch = ({ team, onChange }) => {
  return (
    <div className="team-switch-row">
      <span className="team-switch-label">Моя команда:</span>
      <label className="team-switch-container">
        <input
          type="checkbox"
          className="team-switch-input"
          checked={team === "red"}
          onChange={(e) => onChange(e.target.checked ? "red" : "blue")}
        />
        <div className={`team-switch-slider ${team}`}>
          <span className="team-switch-button"></span>
        </div>
      </label>
    </div>
  );
};

export default TeamSwitch;
