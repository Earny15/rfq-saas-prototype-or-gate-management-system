"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Trash2, Plus, AlertTriangle } from "lucide-react"

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
  transporterAllocation?: Record<string, number>
  consolidationGroup?: string
  isMotherDO: boolean
  childDOs?: string[]
  parentDO?: string
  lastSyncTime: string
  isDeleted: boolean
}

interface DOManagementDrawerProps {
  isOpen: boolean
  onClose: () => void
  order: DispatchOrder | null
  onUpdate: (order: DispatchOrder) => void
}

export default function DOManagementDrawer({ isOpen, onClose, order, onUpdate }: DOManagementDrawerProps) {
  const [editingOrder, setEditingOrder] = useState<DispatchOrder | null>(null)
  const [activeTab, setActiveTab] = useState<"details" | "lineitems" | "allocation" | "consolidation">("details")
  const [editingLineItem, setEditingLineItem] = useState<string | null>(null)
  const [newTransporter, setNewTransporter] = useState("")
  const [newPercentage, setNewPercentage] = useState("")

  useEffect(() => {
    if (order) {
      setEditingOrder({ ...order })
    }
  }, [order])

  const handleClose = () => {
    setEditingOrder(null)
    setActiveTab("details")
    setEditingLineItem(null)
    onClose()
  }

  const handleSave = () => {
    if (editingOrder) {
      // Recalculate totals
      const totalWeight = editingOrder.lineItems.reduce((sum, item) => sum + item.weight, 0)
      const totalQuantity = editingOrder.lineItems.reduce((sum, item) => sum + item.quantity, 0)

      const updatedOrder = {
        ...editingOrder,
        totalWeight,
        totalQuantity,
        lastSyncTime: new Date().toISOString(),
      }

      onUpdate(updatedOrder)
      handleClose()
    }
  }

  const handleLineItemUpdate = (itemId: string, field: string, value: any) => {
    if (!editingOrder) return

    setEditingOrder({
      ...editingOrder,
      lineItems: editingOrder.lineItems.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    })
  }

  const handleDeleteLineItem = (itemId: string) => {
    if (!editingOrder) return

    setEditingOrder({
      ...editingOrder,
      lineItems: editingOrder.lineItems.filter((item) => item.id !== itemId),
    })
  }

  const handleReplaceBatch = (itemId: string) => {
    // In real implementation, this would open a batch selection dialog
    console.log("Replace batch for item:", itemId)
  }

  const handleAddTransporter = () => {
    if (!editingOrder || !newTransporter || !newPercentage) return

    const percentage = Number.parseInt(newPercentage)
    if (percentage <= 0 || percentage > 100) return

    const currentTotal = Object.values(editingOrder.transporterAllocation || {}).reduce((sum, p) => sum + p, 0)
    if (currentTotal + percentage > 100) {
      alert("Total percentage cannot exceed 100%")
      return
    }

    setEditingOrder({
      ...editingOrder,
      transporterAllocation: {
        ...editingOrder.transporterAllocation,
        [newTransporter]: percentage,
      },
    })

    setNewTransporter("")
    setNewPercentage("")
  }

  const handleRemoveTransporter = (transporter: string) => {
    if (!editingOrder?.transporterAllocation) return

    const { [transporter]: removed, ...remaining } = editingOrder.transporterAllocation

    setEditingOrder({
      ...editingOrder,
      transporterAllocation: remaining,
    })
  }

  const canEdit = editingOrder?.status === "draft" || editingOrder?.status === "ready"

  if (!editingOrder) return null

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>DO Number</Label>
            <Input value={editingOrder.doNumber} disabled />
          </div>
          <div>
            <Label>SAP ID</Label>
            <Input value={editingOrder.sapId} disabled />
          </div>
          <div>
            <Label>Priority</Label>
            <Select
              value={editingOrder.priority.toString()}
              onValueChange={(value) => setEditingOrder({ ...editingOrder, priority: Number.parseInt(value) })}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Priority 1 (High)</SelectItem>
                <SelectItem value="2">Priority 2 (Medium)</SelectItem>
                <SelectItem value="3">Priority 3 (Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Input value={editingOrder.status.toUpperCase()} disabled />
          </div>
        </div>
      </div>

      {/* Loading Point */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Point</h3>
        <div className="space-y-3">
          <div>
            <Label>Loading Point</Label>
            <Select
              value={editingOrder.loadingPoint.id}
              onValueChange={(value) => {
                // In real implementation, fetch loading point details
                const loadingPoints = {
                  LP001: {
                    id: "LP001",
                    name: "Chennai Plant - Gate 1",
                    address: "Oragadam Industrial Area, Chennai",
                    canOverride: true,
                  },
                  LP002: {
                    id: "LP002",
                    name: "Mumbai Plant - Gate 2",
                    address: "MIDC Industrial Area, Mumbai",
                    canOverride: false,
                  },
                  LP003: {
                    id: "LP003",
                    name: "Delhi Plant - Gate 1",
                    address: "Gurgaon Industrial Area, Delhi NCR",
                    canOverride: true,
                  },
                }
                setEditingOrder({ ...editingOrder, loadingPoint: loadingPoints[value] || editingOrder.loadingPoint })
              }}
              disabled={!canEdit || !editingOrder.loadingPoint.canOverride}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LP001">Chennai Plant - Gate 1</SelectItem>
                <SelectItem value="LP002">Mumbai Plant - Gate 2</SelectItem>
                <SelectItem value="LP003">Delhi Plant - Gate 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600">{editingOrder.loadingPoint.address}</div>
          {!editingOrder.loadingPoint.canOverride && (
            <div className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Cannot override SAP loading point</span>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Constraints */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vehicle Constraints</h3>
        <div>
          <Label>Maximum Vehicle Age (years)</Label>
          <Input
            type="number"
            value={editingOrder.maxVehicleAge || ""}
            onChange={(e) =>
              setEditingOrder({ ...editingOrder, maxVehicleAge: Number.parseInt(e.target.value) || undefined })
            }
            placeholder="No limit"
            disabled={!canEdit}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dates</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Created Date</Label>
            <Input value={new Date(editingOrder.createdDate).toLocaleString()} disabled />
          </div>
          <div>
            <Label>Planned Dispatch Date</Label>
            <Input
              type="datetime-local"
              value={editingOrder.plannedDispatchDate.slice(0, 16)}
              onChange={(e) => setEditingOrder({ ...editingOrder, plannedDispatchDate: e.target.value + ":00" })}
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderLineItemsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Line Items</h3>
        <div className="text-sm text-gray-600">
          Total: {editingOrder.lineItems.length} items, {editingOrder.totalWeight} kg
        </div>
      </div>

      <div className="space-y-4">
        {editingOrder.lineItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{item.batchNumber}</Badge>
                <div className="text-sm font-medium">{item.materialDescription}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLineItem(editingLineItem === item.id ? null : item.id)}
                  disabled={!canEdit}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleReplaceBatch(item.id)} disabled={!canEdit}>
                  Replace Batch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteLineItem(item.id)}
                  disabled={!canEdit}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {editingLineItem === item.id ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleLineItemUpdate(item.id, "quantity", Number.parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input
                    type="number"
                    value={item.weight}
                    onChange={(e) => handleLineItemUpdate(item.id, "weight", Number.parseFloat(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select
                    value={item.priority.toString()}
                    onValueChange={(value) => handleLineItemUpdate(item.id, "priority", Number.parseInt(value))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Priority 1</SelectItem>
                      <SelectItem value="2">Priority 2</SelectItem>
                      <SelectItem value="3">Priority 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={item.status} onValueChange={(value) => handleLineItemUpdate(item.id, "status", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Quantity:</span> {item.quantity} {item.unit}
                </div>
                <div>
                  <span className="text-gray-600">Weight:</span> {item.weight} kg
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span> P{item.priority}
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>{" "}
                  <Badge variant="secondary" className="text-xs">
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAllocationTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Transporter Allocation</h3>

      {editingOrder.destination.zone && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            Zone: <strong>{editingOrder.destination.zone}</strong>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Multiple transporters serve this zone. Set allocation percentages below.
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(editingOrder.transporterAllocation || {}).map(([transporter, percentage]) => (
          <div key={transporter} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{transporter}</div>
              <div className="text-sm text-gray-600">{percentage}% allocation</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveTransporter(transporter)}
              disabled={!canEdit}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {canEdit && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-sm font-medium mb-3">Add Transporter</div>
            <div className="grid grid-cols-3 gap-3">
              <Select value={newTransporter} onValueChange={setNewTransporter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Transporter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TCI Supply Chain">TCI Supply Chain</SelectItem>
                  <SelectItem value="Automobile Carriers">Automobile Carriers</SelectItem>
                  <SelectItem value="Dhivyasree Transport">Dhivyasree Transport</SelectItem>
                  <SelectItem value="Express Logistics">Express Logistics</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Percentage"
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                min="1"
                max="100"
              />
              <Button onClick={handleAddTransporter} disabled={!newTransporter || !newPercentage}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          Total Allocation: {Object.values(editingOrder.transporterAllocation || {}).reduce((sum, p) => sum + p, 0)}%
        </div>
      </div>
    </div>
  )

  const renderConsolidationTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Consolidation</h3>

      <div className="space-y-4">
        <div>
          <Label>Consolidation Group</Label>
          <Input
            value={editingOrder.consolidationGroup || ""}
            onChange={(e) => setEditingOrder({ ...editingOrder, consolidationGroup: e.target.value })}
            placeholder="Enter group name for consolidation"
            disabled={!canEdit}
          />
          <div className="text-xs text-gray-600 mt-1">
            Orders with the same consolidation group can be combined into one shipment
          </div>
        </div>

        {editingOrder.isMotherDO && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-800 font-medium">Mother DO</div>
            <div className="text-xs text-purple-600 mt-1">
              This is a parent dispatch order with {editingOrder.childDOs?.length || 0} child orders
            </div>
            {editingOrder.childDOs && (
              <div className="mt-2 space-y-1">
                {editingOrder.childDOs.map((childId) => (
                  <div key={childId} className="text-xs text-purple-600">
                    • Child DO: {childId}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {editingOrder.parentDO && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-800 font-medium">Child DO</div>
            <div className="text-xs text-gray-600 mt-1">This order is part of Mother DO: {editingOrder.parentDO}</div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {editingOrder.doNumber} - {editingOrder.sapId}
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex space-x-4 border-b mt-4">
          {[
            { id: "details", label: "Details" },
            { id: "lineitems", label: "Line Items" },
            { id: "allocation", label: "Allocation" },
            { id: "consolidation", label: "Consolidation" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === "details" && renderDetailsTab()}
          {activeTab === "lineitems" && renderLineItemsTab()}
          {activeTab === "allocation" && renderAllocationTab()}
          {activeTab === "consolidation" && renderConsolidationTab()}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-between">
          <div className="text-xs text-gray-500">
            Last SAP Sync: {new Date(editingOrder.lastSyncTime).toLocaleString()}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={!canEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
