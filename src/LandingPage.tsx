import { useState } from "react";

interface Props {
  onStart: () => void;
}

const percepts = [
  {
    icon: "💨",
    name: "Stench",
    desc: "The Wumpus is in an adjacent cell",
    color: "bg-purple-100 border-purple-300 text-purple-800",
  },
  {
    icon: "🌬️",
    name: "Breeze",
    desc: "A pit is in an adjacent cell",
    color: "bg-blue-100 border-blue-300 text-blue-800",
  },
  {
    icon: "✨",
    name: "Glitter",
    desc: "Gold is in the current cell",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
  },
];

const rules = [
  { icon: "🗺️", title: "4×4 Grid", desc: "The world is a 4×4 grid of rooms connected by passages." },
  { icon: "🧟", title: "The Wumpus", desc: "A monster lurks in one room. Entering its room means death." },
  { icon: "🕳️", title: "Pits", desc: "Bottomless pits are scattered around. Falling in is fatal." },
  { icon: "🏆", title: "Gold", desc: "One piece of gold is hidden. Grab it to win the game!" },
  { icon: "🤖", title: "The Agent", desc: "You start at (1,1). Navigate using percepts to find the gold safely." },
  { icon: "🎯", title: "Goal", desc: "Reach the gold and grab it without dying. Use logic to survive!" },
];

export default function LandingPage({ onStart }: Props) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center min-h-screen relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-8xl mb-6 animate-bounce-slow">🏔️</div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-4 leading-tight">
            Wumpus World
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">
              Adventure
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-4 font-light">
            Explore AI through an interactive game
          </p>
          <p className="text-base md:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Navigate a dangerous cave, avoid the Wumpus and deadly pits, and find the hidden gold.
            A classic AI problem brought to life — can you reason your way to victory?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onStart}
              className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <span>Start Game</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => setShowLearnMore(!showLearnMore)}
              className="px-10 py-4 bg-white/80 backdrop-blur text-slate-700 text-lg font-semibold rounded-2xl shadow-md hover:shadow-lg hover:bg-white transition-all duration-200 border border-slate-200"
            >
              {showLearnMore ? "Hide Info" : "Learn More"}
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {[
              { val: "4×4", label: "Grid" },
              { val: "3", label: "Hazards" },
              { val: "1", label: "Gold" },
            ].map((s) => (
              <div key={s.label} className="bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm border border-white">
                <div className="text-2xl font-bold text-slate-800">{s.val}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        {!showLearnMore && (
          <button
            onClick={() => setShowLearnMore(true)}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce flex flex-col items-center gap-1 hover:text-slate-600 transition-colors"
          >
            <span className="text-xs uppercase tracking-widest">Learn More</span>
            <span>↓</span>
          </button>
        )}
      </section>

      {/* Learn More Section */}
      {showLearnMore && (
        <section className="px-6 py-16 bg-white/60 backdrop-blur border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">How It Works</h2>
            <p className="text-slate-500 text-center mb-12">
              Wumpus World is a classic AI problem from Russell & Norvig's "Artificial Intelligence: A Modern Approach"
            </p>

            {/* Rules grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
              {rules.map((r) => (
                <div
                  key={r.title}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-3">{r.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-1">{r.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>

            {/* Percepts */}
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Percepts</h2>
            <p className="text-slate-500 text-center mb-8">
              Your agent senses the environment through these signals
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {percepts.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-2xl p-6 border-2 text-center ${p.color}`}
                >
                  <div className="text-4xl mb-3">{p.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                  <p className="text-sm opacity-80">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Agent actions */}
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Agent Actions</h2>
            <p className="text-slate-500 text-center mb-8">
              You can perform these actions each turn
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
              {[
                { icon: "⬆️", action: "Move Up" },
                { icon: "⬇️", action: "Move Down" },
                { icon: "⬅️", action: "Move Left" },
                { icon: "➡️", action: "Move Right" },
                { icon: "🤲", action: "Grab Gold" },
                { icon: "🔄", action: "Restart" },
              ].map((a) => (
                <div
                  key={a.action}
                  className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl mb-1">{a.icon}</div>
                  <div className="text-sm font-medium text-slate-700">{a.action}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={onStart}
                className="group px-12 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <span>Play Now</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
