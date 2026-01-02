// PhubDivider.tsx
import React from "react";
import "../../assets/css/MimicStyles.css";

export default function PhubDivider() {
  return (
    <div className="phub-divider-wrapper">
      <div className="divider-line">
        <div className="divider-segment flat"></div>
        <div className="divider-segment angled"></div>
      </div>
    </div>
  );
}
