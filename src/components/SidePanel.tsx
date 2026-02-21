"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { Card } from "@/types";
import TiptapToolbar from "./TiptapToolbar";

interface SidePanelProps {
  card: Card | null;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
}

export default function SidePanel({ card, onClose, onUpdate }: SidePanelProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 underline" },
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: "Type '/' for commands or just start writing...",
      }),
    ],
    content: card?.description || "<p>Start writing...",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

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

  const wordCount = editor?.storage.characterCount?.words() ?? 0;
  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] border-l border-gray-800 bg-[#111118] shadow-2xl">
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

          {/* Editor */}
          <div className="border-t border-gray-800">
            <TiptapToolbar editor={editor} />
            <div className="bg-[#0a0a0f]">
              <EditorContent editor={editor} />
            </div>
            
            {/* Word Count */}
            <div className="flex items-center justify-end gap-4 border-t border-gray-800 px-4 py-2 text-xs text-gray-500">
              <span>{wordCount.toLocaleString()} words</span>
              <span>{charCount.toLocaleString()} chars</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 px-6 py-4">
          <div className="flex gap-3">
            <button className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
              Save Changes
            </button>
            <button className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
