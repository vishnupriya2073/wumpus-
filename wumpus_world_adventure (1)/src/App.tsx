import { useState } from "react";
import LandingPage from "./LandingPage";
import GameScreen from "./GameScreen";

type Screen = "landing" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {screen === "landing" ? (
        <LandingPage onStart={() => setScreen("game")} />
      ) : (
        <GameScreen onBack={() => setScreen("landing")} />
      )}
    </div>
  );
}
