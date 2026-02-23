"use client";

import SidebarLayout from "@/components/SidebarLayout";

export default function Calendar() {
  return (
    <SidebarLayout>
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Calendar</h2>
          <p className="text-gray-500">Coming soon — content calendar and deadlines</p>
        </div>
      </div>
    </SidebarLayout>
  );
}
