
"use client"

import { useState } from "react"
import Dashboard from "@/app/components/admin/Dashboard"
import ChangeHistory from "@/app/components/admin/ChangeHistory"
import { LayoutDashboard, History } from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`${
              activeTab === "dashboard"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium`}
          >
            <LayoutDashboard className="-ml-0.5 mr-2 h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`${
              activeTab === "history"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium`}
          >
            <History className="-ml-0.5 mr-2 h-5 w-5" />
            Change History
          </button>
        </nav>
      </div>

      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "history" && <ChangeHistory />}
    </div>
  )
}
