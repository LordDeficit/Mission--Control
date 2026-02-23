"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import { Card } from "@/types";

interface SidePanelProps {
  card: Card | null;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onComplete?: (card: Card) => void;
}

export default function SidePanel({ card, onClose, onUpdate, onComplete }: SidePanelProps) {
  const [description, setDescription] = useState(card?.description || "");
  const [preview, setPreview] = useState(false);
  
  useEffect(() => {
    setDescription(card?.description || "");
  }, [card?.description]);

  if (!card) return null;

  const tagColors: Record<string, string> = {
    simulator: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    content: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    book: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    canon: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    tool: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  const priorityColors = {
    low: "text-gray-500",
    medium: "text-yellow-500",
    high: "text-red-500",
  };

  const handleSave = () => {
    onUpdate({ ...card, description });
  };

  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const charCount = description.length;

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] border-l border-gray-800 bg-[#111118] shadow-2xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-2 py-0.5 text-xs ${tagColors[card.tag]}`}>
              {card.tag}
            </span>
            <span className={priorityColors[card.priority]} title={`Priority: ${card.priority}`}>
              {card.priority === "high" && "🔥 High"}
              {card.priority === "medium" && "⚡ Medium"}
              {card.priority === "low" && "📌 Low"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <input
              type="text"
              value={card.title}
              onChange={(e) => onUpdate({ ...card, title: e.target.value })}
              className="mb-4 w-full bg-transparent text-xl font-semibold text-white placeholder-gray-600 focus:outline-none"
              placeholder="Card title..."
            />

            <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs text-white">
                  {card.assignee.charAt(0)}
                </div>
                <span>{card.assignee}</span>
              </div>
              {card.dueDate && (
                <span>📅 {card.dueDate}</span>
              )}
            </div>
          </div>

          {/* Editor Tabs */}
          <div className="border-t border-gray-800">
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setPreview(false)}
                className={`px-4 py-2 text-sm ${!preview ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Edit
              </button>
              <button
                onClick={() => setPreview(true)}
                className={`px-4 py-2 text-sm ${preview ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Preview
              </button>
            </div>

            <div className="bg-[#0a0a0f]">
              {!preview ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[400px] bg-transparent px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none resize-none font-mono text-sm"
                  placeholder="# Write markdown here...

## Headers work
- Lists work
**Bold** and *italic* work too

```code blocks```

[links](url)"
                />
              ) : (
                <div 
                  className="w-full min-h-[400px] px-4 py-3 prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: marked.parse(description) }}
                />
              )}
            </div>
            
            {/* Word Count */}
            <div className="flex items-center justify-between border-t border-gray-800 px-4 py-2 text-xs text-gray-500">
              <span>Markdown supported</span>
              <div className="flex gap-4">
                <span>{wordCount.toLocaleString()} words</span>
                <span>{charCount.toLocaleString()} chars</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 px-6 py-4">
          <div className="flex gap-3">
            <button 
              onClick={handleSave}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Save Changes
            </button>
            {onComplete && (
              <button 
                onClick={() => {
                  if (confirm('Mark this task as complete? It will be archived.')) {
                    onComplete(card);
                  }
                }}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
              >
                ✓ Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
