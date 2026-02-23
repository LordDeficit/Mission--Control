"use client";

import { useState, useEffect } from "react";
import { Card, Column, ArchivedCard } from "@/types";
import CardComponent from "./Card";
import SidePanel from "./SidePanel";

const defaultColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-gray-700",
    cards: [],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-600",
    cards: [],
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
    cards: [],
  },
];

const tagColors: Record<string, string> = {
  simulator: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  content: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  book: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  canon: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  tool: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  writing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export default function Board() {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [archivedCards, setArchivedCards] = useState<ArchivedCard[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardColumn, setNewCardColumn] = useState("backlog");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardTag, setNewCardTag] = useState("content");
  const [newCardPriority, setNewCardPriority] = useState<"low" | "medium" | "high">("medium");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("mission-control-columns");
    const savedArchive = localStorage.getItem("mission-control-archive");
    
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch {
        setColumns(defaultColumns);
      }
    }
    
    if (savedArchive) {
      try {
        setArchivedCards(JSON.parse(savedArchive));
      } catch {
        setArchivedCards([]);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mission-control-columns", JSON.stringify(columns));
    }
  }, [columns, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mission-control-archive", JSON.stringify(archivedCards));
    }
  }, [archivedCards, isLoaded]);

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

  const handleCompleteCard = (card: Card) => {
    const archived: ArchivedCard = {
      ...card,
      archivedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    
    setArchivedCards((prev) => [archived, ...prev]);
    
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== card.id),
      }))
    );
    
    setSelectedCard(null);
  };

  const handleRestoreCard = (archivedCard: ArchivedCard) => {
    const { archivedAt, completedAt, ...card } = archivedCard;
    
    setColumns((prev) =>
      prev.map((col) =>
        col.id === "done"
          ? { ...col, cards: [...col.cards, card] }
          : col
      )
    );
    
    setArchivedCards((prev) =>
      prev.filter((c) => c.id !== archivedCard.id)
    );
  };

  const handleCreateCard = () => {
    if (!newCardTitle.trim()) return;
    
    const newCard: Card = {
      id: Date.now().toString(),
      title: newCardTitle,
      description: "",
      tag: newCardTag,
      priority: newCardPriority,
      assignee: "Profit",
    };
    
    setColumns((prev) =>
      prev.map((col) =>
        col.id === newCardColumn
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    );
    
    setNewCardTitle("");
    setShowNewCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }))
    );
    setSelectedCard(null);
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

  if (!isLoaded) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#111118] px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={exportStaticHTML}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            📥 Export
          </button>
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            📦 Archive ({archivedCards.length})
          </button>
        </div>
        <button 
          onClick={() => setShowNewCard(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
        >
          + New Task
        </button>
      </div>

      {/* Archive View */}
      {showArchive ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Archived Cards</h2>
            <button
              onClick={() => setShowArchive(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to Board
            </button>
          </div>
          
          {archivedCards.length === 0 ? (
            <p className="text-gray-500">No archived cards yet.</p>
          ) : (
            <div className="space-y-3">
              {archivedCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-gray-800 bg-[#111118] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{card.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Completed: {new Date(card.completedAt).toLocaleDateString()}
                      </p>
                      {card.tag && (
                        <span className={`mt-2 inline-block rounded border px-2 py-0.5 text-xs ${tagColors[card.tag]}`}>
                          {card.tag}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRestoreCard(card)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`flex flex-1 gap-4 overflow-x-auto p-6 transition-all ${selectedCard ? 'pr-[600px]' : ''}`}>
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex min-w-[280px] flex-1 flex-col rounded-lg border border-gray-800 bg-[#111118]"
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
                <button 
                  onClick={() => {
                    setNewCardColumn(column.id);
                    setShowNewCard(true);
                  }}
                  className="text-gray-500 hover:text-white"
                >
                  +
                </button>
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

          <div className="flex min-w-[280px] items-start">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 bg-[#111118]/50 px-4 py-3 text-sm text-gray-500 hover:border-gray-600 hover:text-gray-400">
              + Add Column
            </button>
          </div>
        </div>
      )}

      {/* Side Panel */}
      {selectedCard && (
        <SidePanel
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
          onComplete={handleCompleteCard}
          onDelete={handleDeleteCard}
        />
      )}

      {/* New Card Modal */}
      {showNewCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCard()}
                  className="w-full bg-[#0a0a0f] border border-gray-800 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Column</label>
                <select
                  value={newCardColumn}
                  onChange={(e) => setNewCardColumn(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-gray-800 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tag</label>
                <select
                  value={newCardTag}
                  onChange={(e) => setNewCardTag(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-gray-800 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="content">Content</option>
                  <option value="simulator">Simulator</option>
                  <option value="book">Book</option>
                  <option value="canon">Canon</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="tool">Tool</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewCardPriority(p)}
                      className={`flex-1 py-2 rounded text-sm capitalize ${
                        newCardPriority === p
                          ? p === "high"
                            ? "bg-red-600 text-white"
                            : p === "medium"
                            ? "bg-yellow-600 text-white"
                            : "bg-gray-600 text-white"
                          : "bg-[#0a0a0f] border border-gray-800 text-gray-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateCard}
                disabled={!newCardTitle.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
              <button
                onClick={() => {
                  setShowNewCard(false);
                  setNewCardTitle("");
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
