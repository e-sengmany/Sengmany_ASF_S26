import React from "react";

export default function EventImage({ action }) {
  const images = {
    travel: '../src/assets/traveling_ruck_forest.gif',
    rest: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60",
    hunt: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60",
    sick: "../src/assets/keno.jpeg",
    default: "../src/assets/traveling_ruck_forest.gif"
  };

  const imageSrc = images[action] || images.default;

  return (
    <div style={{ marginTop: "20px" }}>
      <img
        src={imageSrc}
        alt={action}
        style={{
          width: "90%",
          height: "30%",
          objectFit: "cover",
          borderRadius: "10px",
          border: "5px solid black"
        }}
      />
      <p style={{ textAlign: "center" }}>
        Current action: <strong>{action}</strong>
      </p>
    </div>
  );
}
