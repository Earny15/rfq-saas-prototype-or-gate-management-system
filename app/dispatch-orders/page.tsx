"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, RefreshCw, Plus, Truck, MapPin, Calendar, Edit, ChevronUp, ChevronDown } from "lucide-react"
import Sidebar from "@/components/sidebar"
import DOManagementDrawer from "@/components/do-management-drawer"
import DOSplitDialog from "@/components/do-split-dialog"
import DOClubDialog from "@/components/do-club-dialog"
import VehiclePlanningDialog from "@/components/vehicle-planning-dialog"

interface LineItem {
  id: string
  batchNumber: string
  materialCode: string
  materialDescription: string
  quantity: number
  weight: number
  unit: string
  priority: number
  status: "pending" | "ready" | "assigned" | "shipped"
  readyDate?: string
}

interface DispatchOrder {
  id: string
  doNumber: string
  sapId: string
  status: "draft" | "ready" | "assigned" | "in-transit" | "delivered" | "cancelled"
  priority: number
  loadingPoint: {
    id: string
    name: string
    address: string
    canOverride: boolean
  }
  destination: {
    city: string
    address: string
    zone: string
  }
  totalWeight: number
  totalQuantity: number
  lineItems: LineItem[]
  createdDate: string
  plannedDispatchDate: string
  maxVehicleAge?: number
  transporterAllocation?: Record<string, number> // transporter -> percentage
  consolidationGroup?: string
  isMotherDO: boolean
  childDOs?: string[]
  parentDO?: string
  lastSyncTime: string
  isDeleted: boolean
}

const mockDispatchOrders: DispatchOrder[] = [
  {
    id: "1",
    doNumber: "DO-2025-001",
    sapId: "SAP-DO-001",
    status: "ready",
    priority: 1,
    loadingPoint: {
      id: "LP001",
      name: "Chennai Plant - Gate 1",
      address: "Oragadam Industrial Area, Chennai",
      canOverride: true,
    },
    destination: {
      city: "Bengaluru",
      address: "Electronic City, Bengaluru",
      zone: "South Zone",
    },
    totalWeight: 2500,
    totalQuantity: 100,
    lineItems: [
      {
        id: "li1",
        batchNumber: "BATCH-001",
        materialCode: "SC-450-001",
        materialDescription: "SC-450 Horizontal lines",
        quantity: 50,
        weight: 1250,
        unit: "EA",
        priority: 1,
        status: "ready",
        readyDate: "2025-08-03T10:00:00",
      },
      {
        id: "li2",
        batchNumber: "BATCH-002",
        materialCode: "SC-BLK-001",
        materialDescription: "SC-Black pattern (Silver accent)",
        quantity: 50,
        weight: 1250,
        unit: "EA",
        priority: 2,
        status: "ready",
        readyDate: "2025-08-03T14:00:00",
      },
    ],
    createdDate: "2025-08-02T08:00:00",
    plannedDispatchDate: "2025-08-03T16:00:00",
    maxVehicleAge: 5,
    isMotherDO: true,
    childDOs: ["2", "3"],
    lastSyncTime: "2025-08-02T15:30:00",
    isDeleted: false,
  },
  {
    id: "2",
    doNumber: "DO-2025-002",
    sapId: "SAP-DO-002",
    status: "assigned",
    priority: 2,
    loadingPoint: {
      id: "LP001",
      name: "Chennai Plant - Gate 1",
      address: "Oragadam Industrial Area, Chennai",
      canOverride: true,
    },
    destination: {
      city: "Mumbai",
      address: "Andheri Industrial Estate, Mumbai",
      zone: "West Zone",
    },
    totalWeight: 3200,
    totalQuantity: 80,
    lineItems: [
      {
        id: "li3",
        batchNumber: "BATCH-003",
        materialCode: "GS-200-001",
        materialDescription: "Galvanized Steel Sheets 2mm",
        quantity: 40,
        weight: 1600,
        unit: "SHEETS",
        priority: 1,
        status: "assigned",
      },
      {
        id: "li4",
        batchNumber: "BATCH-004",
        materialCode: "CC-RAL-001",
        materialDescription: "Color Coated Coils - RAL 9005",
        quantity: 40,
        weight: 1600,
        unit: "COILS",
        priority: 1,
        status: "assigned",
      },
    ],
    createdDate: "2025-08-02T09:00:00",
    plannedDispatchDate: "2025-08-04T10:00:00",
    maxVehicleAge: 3,
    transporterAllocation: {
      "TCI Supply Chain": 60,
      "Automobile Carriers": 40,
    },
    isMotherDO: false,
    parentDO: "1",
    lastSyncTime: "2025-08-02T15:30:00",
    isDeleted: false,
  },
  {
    id: "3",
    doNumber: "DO-2025-003",
    sapId: "SAP-DO-003",
    status: "draft",
    priority: 3,
    loadingPoint: {
      id: "LP002",
      name: "Mumbai Plant - Gate 2",
      address: "MIDC Industrial Area, Mumbai",
      canOverride: false,
    },
    destination: {
      city: "Delhi",
      address: "Gurgaon Industrial Area, Delhi NCR",
      zone: "North Zone",
    },
    totalWeight: 1800,
    totalQuantity: 120,
    lineItems: [
      {
        id: "li5",
        batchNumber: "BATCH-005",
        materialCode: "ZC-PRM-001",
        materialDescription: "Zinc Coating Primer",
        quantity: 60,
        weight: 900,
        unit: "LTRS",
        priority: 2,
        status: "pending",
      },
      {
        id: "li6",
        batchNumber: "BATCH-006",
        materialCode: "AC-TRT-001",
        materialDescription: "Anti-Corrosion Treatment",
        quantity: 60,
        weight: 900,
        unit: "LTRS",
        priority: 3,
        status: "pending",
      },
    ],
    createdDate: "2025-08-02T11:00:00",
    plannedDispatchDate: "2025-08-05T08:00:00",
    isMotherDO: false,
    parentDO: "1",
    lastSyncTime: "2025-08-02T15:30:00",
    isDeleted: false,
  },
]

export default function DispatchOrdersPage() {
  const [dispatchOrders, setDispatchOrders] = useState<DispatchOrder[]>(mockDispatchOrders)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("All")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())
  const [isClient, setIsClient] = useState(false)
  const [planningMode, setPlanningMode] = useState<"actual" | "forecast">("actual")
  const [showSplitDialog, setShowSplitDialog] = useState(false)
  const [showClubDialog, setShowClubDialog] = useState(false)
  const [splitDO, setSplitDO] = useState<DispatchOrder | null>(null)

  // Add state for expanded DOs and selected line items
  const [expandedDOs, setExpandedDOs] = useState<string[]>([])
  const [selectedLineItems, setSelectedLineItems] = useState<Record<string, string[]>>({}) // DOId -> LineItemIds[]
  const [showVehiclePlanningDialog, setShowVehiclePlanningDialog] = useState(false)
  const [planningDO, setPlanningDO] = useState<DispatchOrder | null>(null)

  // Simulate SAP sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setLastSyncTime(new Date())
      // Simulate SAP updates
      setDispatchOrders((prev) =>
        prev.map((order) => ({
          ...order,
          lastSyncTime: new Date().toISOString(),
        })),
      )
    }, 30000) // Sync every 30 seconds

    return () => clearInterval(syncInterval)
  }, [])

  // Set client flag to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleOrderClick = (order: DispatchOrder) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handleSyncWithSAP = () => {
    // Simulate SAP sync
    setLastSyncTime(new Date())
    // In real implementation, this would call SAP API
    console.log("Syncing with SAP...")
  }

  const handleClubDOs = () => {
    if (selectedOrders.length < 2) {
      alert("Please select at least 2 orders to club together")
      return
    }
    setShowClubDialog(true)
  }

  const handleSplitDO = (order: DispatchOrder) => {
    setSplitDO(order)
    setShowSplitDialog(true)
  }

  const handleReleaseForBooking = () => {
    if (selectedOrders.length === 0) {
      alert("Please select orders to release")
      return
    }
    // Release logic would go here
    console.log("Releasing orders for booking:", selectedOrders)
  }

  const handleCreateChildDOs = (parentDO: DispatchOrder, childDOsData: any[]) => {
    const newChildDOs = childDOsData.map((childData, index) => ({
      ...parentDO,
      id: `${parentDO.id}-child-${index + 1}`,
      doNumber: `${parentDO.doNumber}-C${index + 1}`,
      sapId: `${parentDO.sapId}-C${index + 1}`,
      status: "draft" as const,
      isMotherDO: false,
      parentDO: parentDO.id,
      childDOs: undefined,
      lineItems: childData.lineItems,
      totalWeight: childData.lineItems.reduce((sum: number, item: any) => sum + item.weight, 0),
      totalQuantity: childData.lineItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      maxVehicleAge: childData.maxVehicleAge,
      plannedDispatchDate: childData.plannedDispatchDate,
      createdDate: new Date().toISOString(),
      lastSyncTime: new Date().toISOString(),
    }))

    // Update parent DO to be Mother DO
    const updatedParentDO = {
      ...parentDO,
      isMotherDO: true,
      childDOs: newChildDOs.map((child) => child.id),
      status: "ready" as const,
      lastSyncTime: new Date().toISOString(),
    }

    setDispatchOrders((prev) => [
      ...prev.map((order) => (order.id === parentDO.id ? updatedParentDO : order)),
      ...newChildDOs,
    ])

    setShowSplitDialog(false)
    setSplitDO(null)
  }

  const handleClubDOsConfirm = (clubbedDOData: any) => {
    const selectedDOsData = dispatchOrders.filter((order) => selectedOrders.includes(order.id))

    // Create new clubbed DO
    const clubbedDO: DispatchOrder = {
      id: `clubbed-${Date.now()}`,
      doNumber: `DO-CLUB-${Date.now()}`,
      sapId: `SAP-CLUB-${Date.now()}`,
      status: "draft",
      priority: Math.min(...selectedDOsData.map((order) => order.priority)),
      loadingPoint: clubbedDOData.loadingPoint,
      destination: clubbedDOData.destination,
      totalWeight: selectedDOsData.reduce((sum, order) => sum + order.totalWeight, 0),
      totalQuantity: selectedDOsData.reduce((sum, order) => sum + order.totalQuantity, 0),
      lineItems: selectedDOsData.flatMap((order) => order.lineItems),
      createdDate: new Date().toISOString(),
      plannedDispatchDate: clubbedDOData.plannedDispatchDate,
      maxVehicleAge: clubbedDOData.maxVehicleAge,
      consolidationGroup: clubbedDOData.consolidationGroup,
      isMotherDO: true,
      childDOs: selectedOrders,
      lastSyncTime: new Date().toISOString(),
      isDeleted: false,
    }

    // Mark original DOs as children
    const updatedOrders = dispatchOrders.map((order) => {
      if (selectedOrders.includes(order.id)) {
        return {
          ...order,
          parentDO: clubbedDO.id,
          status: "assigned" as const,
          lastSyncTime: new Date().toISOString(),
        }
      }
      return order
    })

    setDispatchOrders([...updatedOrders, clubbedDO])
    setSelectedOrders([])
    setShowClubDialog(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "DRAFT", className: "bg-gray-100 text-gray-700" },
      ready: { label: "READY", className: "bg-green-100 text-green-700" },
      assigned: { label: "ASSIGNED", className: "bg-blue-100 text-blue-700" },
      "in-transit": { label: "IN TRANSIT", className: "bg-yellow-100 text-yellow-700" },
      delivered: { label: "DELIVERED", className: "bg-green-100 text-green-700" },
      cancelled: { label: "CANCELLED", className: "bg-red-100 text-red-700" },
    }
    return statusConfig[status] || statusConfig.draft
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "text-red-600 font-bold"
    if (priority === 2) return "text-orange-600 font-semibold"
    return "text-gray-600"
  }

  const tabs = [
    { name: "All", count: dispatchOrders.filter((o) => !o.isDeleted).length },
    { name: "Draft", count: dispatchOrders.filter((o) => o.status === "draft" && !o.isDeleted).length },
    { name: "Ready", count: dispatchOrders.filter((o) => o.status === "ready" && !o.isDeleted).length },
    { name: "Assigned", count: dispatchOrders.filter((o) => o.status === "assigned" && !o.isDeleted).length },
    { name: "In Transit", count: dispatchOrders.filter((o) => o.status === "in-transit" && !o.isDeleted).length },
    { name: "Delivered", count: dispatchOrders.filter((o) => o.status === "delivered" && !o.isDeleted).length },
  ]

  const filteredOrders = dispatchOrders.filter((order) => {
    if (order.isDeleted) return false
    if (activeTab === "All") return true
    if (activeTab === "Draft") return order.status === "draft"
    if (activeTab === "Ready") return order.status === "ready"
    if (activeTab === "Assigned") return order.status === "assigned"
    if (activeTab === "In Transit") return order.status === "in-transit"
    if (activeTab === "Delivered") return order.status === "delivered"
    return true
  })

  // Add function to handle DO expansion
  const handleDOExpansion = (doId: string) => {
    if (expandedDOs.includes(doId)) {
      setExpandedDOs(expandedDOs.filter((id) => id !== doId))
    } else {
      setExpandedDOs([...expandedDOs, doId])
    }
  }

  // Add function to handle line item selection
  const handleLineItemSelection = (doId: string, lineItemId: string, checked: boolean) => {
    setSelectedLineItems((prev) => {
      const currentSelected = prev[doId] || []
      if (checked) {
        return { ...prev, [doId]: [...currentSelected, lineItemId] }
      } else {
        return { ...prev, [doId]: currentSelected.filter((id) => id !== lineItemId) }
      }
    })
  }

  // Add function to handle vehicle planning
  const handleCreateVehiclePlanning = (order: DispatchOrder) => {
    const selectedItems = selectedLineItems[order.id] || []
    if (selectedItems.length === 0) {
      alert("Please select at least one line item for vehicle planning")
      return
    }
    setPlanningDO(order)
    setShowVehiclePlanningDialog(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-16">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Dispatch Orders</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Planning Mode</span>
                <Select value={planningMode} onValueChange={(value: "actual" | "forecast") => setPlanningMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actual">Actual</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                Last SAP Sync: {isClient ? lastSyncTime.toLocaleTimeString() : '--:--:--'}
              </div>
              <Button onClick={handleSyncWithSAP} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync SAP
              </Button>
              <Search className="h-5 w-5 text-gray-400" />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Shipment
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm">PRIORITY | HIGH TO LOW</span>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">DISPATCH DATE - ALL</span>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 bg-transparent">
                RESET
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.name
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>

          {/* Action Bar */}
          {selectedOrders.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">{selectedOrders.length} order(s) selected</span>
                <div className="flex space-x-2">
                  <Button onClick={handleClubDOs} variant="outline" size="sm">
                    Club DOs
                  </Button>
                  <Button onClick={handleReleaseForBooking} className="bg-blue-600 hover:bg-blue-700">
                    Release for Booking
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Dispatch Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => handleOrderSelection(order.id, checked as boolean)}
                    />
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <div>
                        <button
                          onClick={() => handleOrderClick(order)}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {order.doNumber}
                        </button>
                        <div className="text-sm text-gray-500">SAP ID: {order.sapId}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs font-medium ${getStatusBadge(order.status).className}`}>
                        {getStatusBadge(order.status).label}
                      </Badge>
                      <div className={`text-sm ${getPriorityColor(order.priority)}`}>P{order.priority}</div>
                      {order.isMotherDO && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          Mother DO
                        </Badge>
                      )}
                      {order.parentDO && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                          Child DO
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleOrderClick(order)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {!order.parentDO && order.lineItems.length > 1 && (
                      <Button
                        onClick={() => handleSplitDO(order)}
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        Split DO
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Loading Point */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Loading Point:</div>
                    <div className="font-medium text-gray-900">{order.loadingPoint.name}</div>
                    <div className="text-sm text-gray-500">{order.loadingPoint.address}</div>
                    {order.loadingPoint.canOverride && <div className="text-xs text-blue-600">Can Override</div>}
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Destination:</div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium text-gray-900">{order.destination.city}</div>
                        <div className="text-sm text-gray-500">{order.destination.zone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Order Details:</div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">Weight:</span>{" "}
                        <span className="font-medium">{order.totalWeight} kg</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Quantity:</span>{" "}
                        <span className="font-medium">{order.totalQuantity} units</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Line Items:</span>{" "}
                        <span className="font-medium">{order.lineItems.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Constraints */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Dispatch Date:</div>
                    <div className="font-medium text-gray-900">
                      {isClient ? new Date(order.plannedDispatchDate).toLocaleDateString() : new Date(order.plannedDispatchDate).toISOString().split('T')[0]}
                    </div>
                    {order.maxVehicleAge && (
                      <div className="text-sm">
                        <span className="text-gray-600">Max Vehicle Age:</span>{" "}
                        <span className="font-medium">{order.maxVehicleAge} years</span>
                      </div>
                    )}
                    {order.transporterAllocation && <div className="text-xs text-blue-600">Multi-Transporter</div>}
                  </div>
                </div>

                {/* Line Items Accordion */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDOExpansion(order.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="text-sm text-gray-600">
                      Line Items ({order.lineItems.length}) - Click to{" "}
                      {expandedDOs.includes(order.id) ? "collapse" : "expand"}
                    </div>
                    {expandedDOs.includes(order.id) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {expandedDOs.includes(order.id) && (
                    <div className="mt-4 space-y-3">
                      {/* Line Items Selection Header */}
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={
                              selectedLineItems[order.id]?.length === order.lineItems.length &&
                              order.lineItems.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLineItems((prev) => ({
                                  ...prev,
                                  [order.id]: order.lineItems.map((item) => item.id),
                                }))
                              } else {
                                setSelectedLineItems((prev) => ({
                                  ...prev,
                                  [order.id]: [],
                                }))
                              }
                            }}
                          />
                          <span className="text-sm font-medium">
                            Select All ({selectedLineItems[order.id]?.length || 0}/{order.lineItems.length})
                          </span>
                        </div>
                        {(selectedLineItems[order.id]?.length || 0) > 0 && (
                          <Button
                            onClick={() => handleCreateVehiclePlanning(order)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Plan Vehicle ({selectedLineItems[order.id]?.length})
                          </Button>
                        )}
                      </div>

                      {/* Line Items Table */}
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left w-12">Select</th>
                              <th className="px-3 py-2 text-left">Batch Number</th>
                              <th className="px-3 py-2 text-left">Material Description</th>
                              <th className="px-3 py-2 text-left">Quantity</th>
                              <th className="px-3 py-2 text-left">Weight</th>
                              <th className="px-3 py-2 text-left">Priority</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-left">Ready Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {order.lineItems.map((item) => (
                              <tr
                                key={item.id}
                                className={`hover:bg-gray-50 ${
                                  selectedLineItems[order.id]?.includes(item.id) ? "bg-blue-50" : ""
                                }`}
                              >
                                <td className="px-3 py-3">
                                  <Checkbox
                                    checked={selectedLineItems[order.id]?.includes(item.id) || false}
                                    onCheckedChange={(checked) =>
                                      handleLineItemSelection(order.id, item.id, checked as boolean)
                                    }
                                  />
                                </td>
                                <td className="px-3 py-3 font-mono text-xs">{item.batchNumber}</td>
                                <td className="px-3 py-3 font-medium">{item.materialDescription}</td>
                                <td className="px-3 py-3">
                                  {item.quantity} {item.unit}
                                </td>
                                <td className="px-3 py-3">{item.weight} kg</td>
                                <td className="px-3 py-3">
                                  <span className={getPriorityColor(item.priority)}>P{item.priority}</span>
                                </td>
                                <td className="px-3 py-3">
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      item.status === "ready"
                                        ? "bg-green-100 text-green-700"
                                        : item.status === "pending"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : item.status === "assigned"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {item.status.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-600">
                                  {item.readyDate ? (isClient ? new Date(item.readyDate).toLocaleDateString() : new Date(item.readyDate).toISOString().split('T')[0]) : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary for Selected Items */}
                      {(selectedLineItems[order.id]?.length || 0) > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-sm text-blue-800">
                            <strong>Selected Items Summary:</strong>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-blue-600">Items:</span>{" "}
                              <span className="font-medium">{selectedLineItems[order.id]?.length}</span>
                            </div>
                            <div>
                              <span className="text-blue-600">Total Weight:</span>{" "}
                              <span className="font-medium">
                                {order.lineItems
                                  .filter((item) => selectedLineItems[order.id]?.includes(item.id))
                                  .reduce((sum, item) => sum + item.weight, 0)}{" "}
                                kg
                              </span>
                            </div>
                            <div>
                              <span className="text-blue-600">Total Quantity:</span>{" "}
                              <span className="font-medium">
                                {order.lineItems
                                  .filter((item) => selectedLineItems[order.id]?.includes(item.id))
                                  .reduce((sum, item) => sum + item.quantity, 0)}{" "}
                                units
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No dispatch orders found</p>
            </div>
          )}
        </div>

        <DOManagementDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          order={selectedOrder}
          onUpdate={(updatedOrder) => {
            setDispatchOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
          }}
        />

        <DOSplitDialog
          isOpen={showSplitDialog}
          onClose={() => {
            setShowSplitDialog(false)
            setSplitDO(null)
          }}
          order={splitDO}
          onConfirm={handleCreateChildDOs}
        />

        <DOClubDialog
          isOpen={showClubDialog}
          onClose={() => setShowClubDialog(false)}
          selectedOrders={dispatchOrders.filter((order) => selectedOrders.includes(order.id))}
          onConfirm={handleClubDOsConfirm}
        />

        <VehiclePlanningDialog
          isOpen={showVehiclePlanningDialog}
          onClose={() => {
            setShowVehiclePlanningDialog(false)
            setPlanningDO(null)
          }}
          order={planningDO}
          selectedLineItems={planningDO ? selectedLineItems[planningDO.id] || [] : []}
          onConfirm={(vehiclePlans) => {
            // Handle vehicle planning confirmation
            console.log("Vehicle plans created:", vehiclePlans)
            setShowVehiclePlanningDialog(false)
            setPlanningDO(null)
            // Clear selections
            if (planningDO) {
              setSelectedLineItems((prev) => ({ ...prev, [planningDO.id]: [] }))
            }
          }}
        />
      </div>
    </div>
  )
}
