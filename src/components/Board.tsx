"use client";

import { useState, useEffect } from "react";
import { Card, Column } from "@/types";
import CardComponent from "./Card";
import SidePanel from "./SidePanel";

const DATABASE_ID = "3109d67f-fd53-807d-a8ec-c93d1eea80a5";

const tagColors: Record<string, string> = {
  Simulator: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Content: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Book: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Canon: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Tool: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Writing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

const statusToColumn: Record<string, string> = {
  "Backlog": "backlog",
  "In Progress": "in-progress",
  "Review": "review",
  "Done": "done",
};

const columnToStatus: Record<string, string> = {
  "backlog": "Backlog",
  "in-progress": "In Progress",
  "review": "Review",
  "done": "Done",
};

interface NotionTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  tag: string[];
  description: string;
  dueDate?: string;
}

export default function Board() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "backlog", title: "Backlog", color: "bg-gray-700", cards: [] },
    { id: "in-progress", title: "In Progress", color: "bg-blue-600", cards: [] },
    { id: "review", title: "Review", color: "bg-yellow-600", cards: [] },
    { id: "done", title: "Done", color: "bg-green-600", cards: [] },
  ]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardColumn, setNewCardColumn] = useState("backlog");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardTag, setNewCardTag] = useState("Content");
  const [newCardPriority, setNewCardPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from Notion
  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/notion/tasks?databaseId=${DATABASE_ID}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const tasks: NotionTask[] = await response.json();
      
      // Organize into columns
      const newColumns = [
        { id: "backlog", title: "Backlog", color: "bg-gray-700", cards: [] as Card[] },
        { id: "in-progress", title: "In Progress", color: "bg-blue-600", cards: [] as Card[] },
        { id: "review", title: "Review", color: "bg-yellow-600", cards: [] as Card[] },
        { id: "done", title: "Done", color: "bg-green-600", cards: [] as Card[] },
      ];

      tasks.forEach((task) => {
        const card: Card = {
          id: task.id,
          title: task.name,
          description: task.description,
          tag: task.tag[0] || "Content",
          priority: (task.priority?.toLowerCase() || "medium") as "low" | "medium" | "high",
          assignee: "Profit",
          dueDate: task.dueDate,
        };

        const columnId = statusToColumn[task.status] || "backlog";
        const column = newColumns.find((c) => c.id === columnId);
        if (column) column.cards.push(card);
      });

      setColumns(newColumns);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks from Notion");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragStart = (card: Card, columnId: string) => {
    setDraggedCard(card);
    setDraggedFrom(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedCard || !draggedFrom || draggedFrom === targetColumnId) return;

    // Optimistic update
    setColumns((prev) => {
      const newColumns = prev.map((col) => {
        if (col.id === draggedFrom) {
          return { ...col, cards: col.cards.filter((c) => c.id !== draggedCard.id) };
        }
        if (col.id === targetColumnId) {
          return { ...col, cards: [...col.cards, draggedCard] };
        }
        return col;
      });
      return newColumns;
    });

    // Update in Notion
    try {
      await fetch("/api/notion/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: draggedCard.id,
          status: columnToStatus[targetColumnId],
        }),
      });
    } catch (err) {
      console.error("Failed to update task:", err);
      fetchTasks(); // Revert on error
    }

    setDraggedCard(null);
    setDraggedFrom(null);
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleUpdateCard = async (updatedCard: Card) => {
    try {
      await fetch("/api/notion/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: updatedCard.id,
          name: updatedCard.title,
          description: updatedCard.description,
          priority: updatedCard.priority.charAt(0).toUpperCase() + updatedCard.priority.slice(1),
          tag: [updatedCard.tag],
        }),
      });

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
        }))
      );
      setSelectedCard(updatedCard);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleCreateCard = async () => {
    if (!newCardTitle.trim()) return;

    try {
      const response = await fetch("/api/notion/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databaseId: DATABASE_ID,
          name: newCardTitle,
          status: columnToStatus[newCardColumn],
          priority: newCardPriority,
          tag: [newCardTag],
          description: "",
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");
      
      await fetchTasks(); // Refresh from Notion
      setNewCardTitle("");
      setShowNewCard(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await fetch("/api/notion/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: cardId }),
      });

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== cardId),
        }))
      );
      setSelectedCard(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleCompleteCard = async (card: Card) => {
    try {
      await fetch("/api/notion/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: card.id,
          status: "Done",
        }),
      });

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== card.id),
        }))
      );
      
      // Add to Done column
      setColumns((prev) =>
        prev.map((col) =>
          col.id === "done" ? { ...col, cards: [...col.cards, { ...card }] } : col
        )
      );
      
      setSelectedCard(null);
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading tasks from Notion...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#111118] px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            🔄 Sync
          </button>
        </div>
        <button 
          onClick={() => setShowNewCard(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
        >
          + New Task
        </button>
      </div>

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
      </div>

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
                  {Object.keys(tagColors).map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <div className="flex gap-2">
                  {(["Low", "Medium", "High"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewCardPriority(p)}
                      className={`flex-1 py-2 rounded text-sm ${
                        newCardPriority === p
                          ? p === "High"
                            ? "bg-red-600 text-white"
                            : p === "Medium"
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
