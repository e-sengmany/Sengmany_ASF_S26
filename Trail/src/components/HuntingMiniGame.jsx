import { useState, useEffect } from "react";

export default function HuntMiniGame({ onComplete }) {
  const [targetVisible, setTargetVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);

  // Spawn targets randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setTargetVisible(Math.random() > 0.5);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(score); // 👈 send result back
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  function shoot() {
    if (targetVisible) {
      setScore(s => s + 1);
      setTargetVisible(false);
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>🎯 Patrol Engagement</h2>
      <p>Time Left: {timeLeft}s</p>
      <p>Score: {score}</p>

      <div
        onClick={shoot}
        style={{
          width: "400px",
          height: "250px",
          backgroundColor: targetVisible ? "red" : "gray",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: "10px"
        }}
      >
        {targetVisible ? "ENEMY!" : "SCAN AREA"}
      </div>
    </div>
  );
}
