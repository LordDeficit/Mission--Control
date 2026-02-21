"use client";

import { useState } from "react";
import { Card, Column } from "@/types";
import CardComponent from "./Card";
import SidePanel from "./SidePanel";

const initialColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-gray-700",
    cards: [
      {
        id: "1",
        title: "Load book chapters into simulator",
        description: "Take chapters from manuscript, convert to filesystem entries",
        tag: "simulator",
        priority: "high",
        assignee: "Profit",
      },
      {
        id: "2",
        title: "Build Azazel response trigger",
        description: "Detect when user accesses certain files, trigger Azazel message",
        tag: "simulator",
        priority: "high",
        assignee: "Profit",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-600",
    cards: [
      {
        id: "3",
        title: "Draft Twitter content",
        description: "10 thread ideas, Heaven as infrastructure angle",
        tag: "content",
        priority: "high",
        assignee: "Deficit",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "bg-yellow-600",
    cards: [],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-600",
    cards: [
      {
        id: "4",
        title: "Build terminal simulator",
        description: "Linux terminal in browser, filesystem, commands",
        tag: "simulator",
        priority: "high",
        assignee: "Profit",
      },
    ],
  },
];

const tagColors: Record<string, string> = {
  simulator: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  content: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  book: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  canon: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  tool: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

export default function Board() {
  const [columns, setColumns] = useState(initialColumns);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);

  const handleDragStart = (card: Card, columnId: string) => {
    setDraggedCard(card);
    setDraggedFrom(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedCard || !draggedFrom || draggedFrom === targetColumnId) return;

    setColumns((prev) => {
      const newColumns = prev.map((col) => {
        if (col.id === draggedFrom) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== draggedCard.id),
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [...col.cards, draggedCard],
          };
        }
        return col;
      });
      return newColumns;
    });

    setDraggedCard(null);
    setDraggedFrom(null);
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
      }))
    );
    setSelectedCard(updatedCard);
  };

  const exportStaticHTML = () => {
    const html = `<!DOCTYPE html>...`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hub-preview.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex h-[calc(100vh-65px)] flex-col">
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#111118] px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={exportStaticHTML}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            📥 Export Preview
          </button>
          <span className="text-sm text-gray-500">
            Download static HTML to view anywhere
          </span>
        </div>
        <button className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700">
          + New Card
        </button>
      </div>

      <div className={`flex flex-1 gap-4 overflow-x-auto p-6 transition-all ${selectedCard ? 'pr-[500px]' : ''}`}>
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex min-w-[300px] flex-1 flex-col rounded-lg border border-gray-800 bg-[#111118]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${column.color}`} />
                <h2 className="font-medium text-white">{column.title}</h2>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {column.cards.length}
                </span>
              </div>
              <button className="text-gray-500 hover:text-white">+</button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {column.cards.map((card) => (
                <div key={card.id} onClick={() => handleCardClick(card)}>
                  <CardComponent
                    card={card}
                    tagColors={tagColors}
                    onDragStart={() => handleDragStart(card, column.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex min-w-[300px] items-start">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 bg-[#111118]/50 px-4 py-3 text-sm text-gray-500 hover:border-gray-600 hover:text-gray-400">
            + Add Column
          </button>
        </div>
      </div>

      {selectedCard && (
        <SidePanel
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
        />
      )}
    </div>
  );
}
