"use client";

import { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";

// Mock data for files
const mockFiles = [
  { id: "1", name: "newsletter-2026-02-18-vibe-coding.md", type: "md", tags: ["Newsletter", "Content"], date: "about 1 hour ago", size: "3.4 KB" },
  { id: "2", name: "2026-02-18.md", type: "md", tags: ["Journal"], date: "about 13 hours ago", size: "2.1 KB" },
  { id: "3", name: "2026-02-17.md", type: "md", tags: ["Journal"], date: "1 day ago", size: "1.8 KB" },
  { id: "4", name: "multi-agent-deployment-plan.md", type: "md", tags: ["Other"], date: "3 days ago", size: "5.2 KB" },
];

const tagColors: Record<string, string> = {
  Newsletter: "bg-purple-500/20 text-purple-400",
  Content: "bg-blue-500/20 text-blue-400",
  Journal: "bg-yellow-500/20 text-yellow-400",
  Other: "bg-gray-500/20 text-gray-400",
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(mockFiles[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles = mockFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="flex h-full">
        {/* File List Panel */}
        <div className="w-80 border-r border-gray-800 bg-[#0f0f0f] flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-gray-800">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-gray-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter tags */}
          <div className="px-3 py-2 border-b border-gray-800 flex gap-2 overflow-x-auto">
            {["All", "Newsletter", "Journal", "Content", "Other"].map((tag) => (
              <button
                key={tag}
                className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300 hover:bg-gray-700 whitespace-nowrap"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto">
            {filteredFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-3 border-b border-gray-800/50 hover:bg-[#1a1a1a] transition ${
                  selectedFile?.id === file.id ? "bg-[#1a1a1a]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {file.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-1.5 py-0.5 rounded ${tagColors[tag] || tagColors.Other}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{file.date} • {file.size}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Preview Panel */}
        <div className="flex-1 bg-[#0f0f0f] overflow-auto">
          {selectedFile ? (
            <div className="max-w-3xl mx-auto p-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span>Docs</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>{selectedFile.name}</span>
              </div>

              {/* File meta */}
              <div className="flex items-center gap-2 mb-6">
                {selectedFile.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-1 rounded ${tagColors[tag] || tagColors.Other}`}
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-xs text-gray-500">
                  {selectedFile.size} • {selectedFile.date}
                </span>
              </div>

              {/* Content placeholder */}
              <div className="prose prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-white mb-4">Newsletter Draft: Vibe Coding Just Went Mainstream</h1>
                
                <p className="text-gray-400 italic mb-6">
                  Draft date: February 18, 2026 • ~650 words • Status: Awaiting review
                </p>

                <hr className="border-gray-800 my-6" />

                <h2 className="text-xl font-semibold text-white mb-3">Subject Lines</h2>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-6">
                  <li><strong>Vibe coding just went mainstream. Here's how to cash in before everyone else.</strong> ← recommended</li>
                  <li>A startup hit $100M in 8 months with vibe coding. You NEED to start NOW.</li>
                  <li>The New York Times just told the world about vibe coding. Here's your head start.</li>
                  <li>Vibe coding is no longer a secret. Here's how to stay ahead.</li>
                  <li>Everyone is about to learn vibe coding. Here's how to be first.</li>
                </ol>

                <hr className="border-gray-800 my-6" />

                <h2 className="text-xl font-semibold text-white mb-3">Draft</h2>
                <p className="text-gray-300 mb-4">
                  This week the New York Times published an opinion piece about vibe coding.
                </p>
                <p className="text-gray-300 mb-4">
                  Let that sink in for a second.
                </p>
                <p className="text-gray-300 mb-4">
                  A year ago, most people had never heard the term. Now <strong className="text-white">the most influential newspaper on the planet</strong> is telling millions of readers that anyone can build software with AI.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a file to view
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
