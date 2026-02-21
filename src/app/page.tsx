"use client";

import Board from "@/components/Board";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <header className="border-b border-gray-800 bg-[#111118] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
              D
            </div>
            <h1 className="text-lg font-semibold text-white">Deficit Hub</h1>
          </div>
          <nav className="flex gap-1">
            <button className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700">
              Board
            </button>
            <button className="rounded-md px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">
              Tools
            </button>
            <button className="rounded-md px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">
              Calendar
            </button>
          </nav>
        </div>
      </header>
      <Board />
    </main>
  );
}
