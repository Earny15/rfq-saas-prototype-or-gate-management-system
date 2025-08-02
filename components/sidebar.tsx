"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, Package, BarChart3, Ship, Truck, ClipboardList, Anchor } from "lucide-react"

const navigationItems = [
  {
    name: "Orders",
    href: "/orders",
    icon: Package,
  },
  {
    name: "Dispatch Orders",
    href: "/dispatch-orders",
    icon: ClipboardList,
  },
  {
    name: "RFQ",
    href: "/rfq",
    icon: FileText,
  },
  {
    name: "EXIM",
    href: "/exim",
    icon: Ship,
  },
  {
    name: "Gate Management",
    href: "/gate-management",
    icon: Truck,
  },
  {
    name: "Dock Management",
    href: "/dock-management",
    icon: Anchor,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50",
        isExpanded ? "w-64" : "w-16",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex-shrink-0">
            <img
              src="/images/roado-logo.png"
              alt="RoaDo Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.style.display = "none"
                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement
                if (nextSibling) {
                  nextSibling.style.display = "flex"
                }
              }}
            />
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center" style={{ display: "none" }}>
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
              </div>
            </div>
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-yellow-500" style={{ color: "#F59E0B", fontWeight: "700" }}>
                RoaDo
              </span>
              <span
                className="text-xs text-gray-600 uppercase tracking-wider font-medium"
                style={{ color: "#6B7280", letterSpacing: "0.1em" }}
              >
                LOGISTICS SIMPLIFIED
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const hasSubItems = false // No sub items in current navigation
            const isSubExpanded = expandedItems.includes(item.name)

            return (
              <li key={item.name}>
                <Link href={item.href} className="block">
                  <div
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                      isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="ml-3 flex-1">
                          {item.name}
                        </span>
                      </>
                    )}
                  </div>
                </Link>

                {/* Sub Items - disabled for now */}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 text-center">
          {isExpanded ? "https://industry.roado.tech/dispatch-orders" : ""}
        </div>
      </div>
    </div>
  )
}
