"use client";

import { Card } from "@/types";

interface CardProps {
  card: Card;
  tagColors: Record<string, string>;
  onDragStart: () => void;
}

export default function CardComponent({ card, tagColors, onDragStart }: CardProps) {
  const priorityColors = {
    low: "text-gray-500",
    medium: "text-yellow-500",
    high: "text-red-500",
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group cursor-pointer rounded-lg border border-gray-800 bg-[#1a1a22] p-4 shadow-sm transition-all hover:border-gray-700 hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between">
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${
            tagColors[card.tag] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
          }`}
        >
          {card.tag}
        </span>
        <span className={priorityColors[card.priority]} title={`Priority: ${card.priority}`}>
          {card.priority === "high" && "🔥"}
          {card.priority === "medium" && "⚡"}
          {card.priority === "low" && "📌"}
        </span>
      </div>

      <h3 className="mb-1 font-medium text-white group-hover:text-blue-400">{card.title}</h3>
      <p className="mb-3 text-sm text-gray-500 line-clamp-2">{card.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white">
            {card.assignee.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">{card.assignee}</span>
        </div>

        {card.dueDate && (
          <span className="text-xs text-gray-600">{card.dueDate}</span>
        )}
      </div>
    </div>
  );
}
