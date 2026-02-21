"use client";

import { useState } from "react";

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [sheetTitle, setSheetTitle] = useState("");
  const [sheetData, setSheetData] = useState("Name,Status\\nTask 1,Done");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createDoc = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tools/doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: docTitle, content: docContent }),
      });
      const data = await response.json();
      setResult(`📄 Doc created: ${data.link}`);
    } catch (err) {
      setResult("Error creating doc");
    }
    setLoading(false);
  };

  const createSheet = async () => {
    setLoading(true);
    try {
      const rows = sheetData.split("\\n").map(row => row.split(","));
      const response = await fetch("/api/tools/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sheetTitle, data: rows }),
      });
      const data = await response.json();
      setResult(`📊 Sheet created: ${data.link}`);
    } catch (err) {
      setResult("Error creating sheet");
    }
    setLoading(false);
  };

  const tools = [
    {
      id: "doc",
      name: "Google Doc",
      icon: "📄",
      description: "Create a new Google Doc",
    },
    {
      id: "sheet",
      name: "Google Sheet",
      icon: "📊",
      description: "Create a new Google Sheet",
    },
    {
      id: "gmail",
      name: "Gmail",
      icon: "📧",
      description: "Check/send emails (coming soon)",
      disabled: true,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">Tools</h2>

      {!activeTool ? (
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => !tool.disabled && setActiveTool(tool.id)}
              disabled={tool.disabled}
              className={`rounded-lg border border-gray-800 bg-[#111118] p-6 text-left transition hover:border-gray-700 ${
                tool.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1a1a24]"
              }`}
            >
              <div className="mb-2 text-3xl">{tool.icon}</div>
              <h3 className="mb-1 font-semibold text-white">{tool.name}</h3>
              <p className="text-sm text-gray-500">{tool.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-800 bg-[#111118] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {tools.find((t) => t.id === activeTool)?.icon}{" "}
              {tools.find((t) => t.id === activeTool)?.name}
            </h3>
            <button
              onClick={() => {
                setActiveTool(null);
                setResult(null);
              }}
              className="text-sm text-gray-500 hover:text-white"
            >
              ← Back
            </button>
          </div>

          {activeTool === "doc" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded bg-[#0a0a0f] border border-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Document title..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Content (optional)</label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full min-h-[150px] rounded bg-[#0a0a0f] border border-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  placeholder="Start writing..."
                />
              </div>
              <button
                onClick={createDoc}
                disabled={!docTitle || loading}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Doc"}
              </button>
            </div>
          )}

          {activeTool === "sheet" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Title</label>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  className="w-full rounded bg-[#0a0a0f] border border-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Sheet title..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Data (CSV format)
                </label>
                <textarea
                  value={sheetData}
                  onChange={(e) => setSheetData(e.target.value)}
                  className="w-full min-h-[150px] rounded bg-[#0a0a0f] border border-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                />
              </div>
              <button
                onClick={createSheet}
                disabled={!sheetTitle || loading}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Sheet"}
              </button>
            </div>
          )}

          {result && (
            <div className="mt-4 rounded bg-[#0a0a0f] border border-gray-800 p-4">
              <p className="text-sm text-gray-300 break-all">{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
