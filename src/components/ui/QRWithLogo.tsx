import { QRCodeCanvas } from "qrcode.react";

type Props = {
  value: string;
  logoUrl?: string;
  size?: number;
};

export default function QRWithLogo({ 
  value, 
  logoUrl,
  size = 240      
}: Props) {
  const logoSize = Math.floor(size * 0.25);
  return (
    <div style={{ 
      position: "relative", 
      width: size, 
      height: size 
      }}
    >
      <QRCodeCanvas
        value={value}
        size={size}
        level="H"
        includeMargin
      />

      {logoUrl && (
        <img
          src={logoUrl}
          alt="logo"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: logoSize,
            height: logoSize,
            transform: "translate(-50%, -50%)",
            borderRadius: 8,
            background: "white",
            padding: 4
          }}
        />
      )}
    </div>
  );
}
