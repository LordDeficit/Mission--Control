"use client";

import Board from "@/components/Board";
import SidebarLayout from "@/components/SidebarLayout";

export default function Home() {
  return (
    <SidebarLayout>
      <div className="h-full overflow-hidden">
        <Board />
      </div>
    </SidebarLayout>
  );
}
