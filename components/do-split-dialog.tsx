"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Truck, Package, AlertTriangle, Plus, Minus } from "lucide-react"

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

interface VehicleType {
  id: string
  name: string
  capacity: number
  maxWeight: number
}

interface ChildDO {
  id: string
  name: string
  lineItems: LineItem[]
  vehicleType: string
  maxVehicleAge?: number
  plannedDispatchDate: string
  totalWeight: number
  totalQuantity: number
}

interface DOSplitDialogProps {
  isOpen: boolean
  onClose: () => void
  order: DispatchOrder | null
  onConfirm: (parentDO: DispatchOrder, childDOs: ChildDO[]) => void
}

const vehicleTypes: VehicleType[] = [
  { id: "truck-10t", name: "10 Ton Truck", capacity: 100, maxWeight: 10000 },
  { id: "truck-16t", name: "16 Ton Truck", capacity: 160, maxWeight: 16000 },
  { id: "truck-25t", name: "25 Ton Truck", capacity: 250, maxWeight: 25000 },
  { id: "trailer-32t", name: "32 Ton Trailer", capacity: 320, maxWeight: 32000 },
  { id: "container-20ft", name: "20ft Container", capacity: 200, maxWeight: 20000 },
  { id: "container-40ft", name: "40ft Container", capacity: 400, maxWeight: 30000 },
]

export default function DOSplitDialog({ isOpen, onClose, order, onConfirm }: DOSplitDialogProps) {
  const [childDOs, setChildDOs] = useState<ChildDO[]>([])
  const [splitMode, setSplitMode] = useState<"auto" | "manual">("auto")
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("")
  const [unassignedItems, setUnassignedItems] = useState<LineItem[]>([])

  useEffect(() => {
    if (order) {
      setUnassignedItems([...order.lineItems])
      setChildDOs([])
    }
  }, [order])

  const handleAutoSplit = () => {
    if (!order || !selectedVehicleType) return

    const vehicleType = vehicleTypes.find((v) => v.id === selectedVehicleType)
    if (!vehicleType) return

    const newChildDOs: ChildDO[] = []
    const remainingItems = [...order.lineItems]
    let childIndex = 1

    while (remainingItems.length > 0) {
      const currentChild: ChildDO = {
        id: `child-${childIndex}`,
        name: `Child DO ${childIndex}`,
        lineItems: [],
        vehicleType: selectedVehicleType,
        maxVehicleAge: order.maxVehicleAge,
        plannedDispatchDate: order.plannedDispatchDate,
        totalWeight: 0,
        totalQuantity: 0,
      }

      // Add items until capacity is reached
      for (let i = remainingItems.length - 1; i >= 0; i--) {
        const item = remainingItems[i]
        const newWeight = currentChild.totalWeight + item.weight
        const newQuantity = currentChild.totalQuantity + item.quantity

        if (newWeight <= vehicleType.maxWeight && newQuantity <= vehicleType.capacity) {
          currentChild.lineItems.push(item)
          currentChild.totalWeight = newWeight
          currentChild.totalQuantity = newQuantity
          remainingItems.splice(i, 1)
        }
      }

      if (currentChild.lineItems.length > 0) {
        newChildDOs.push(currentChild)
        childIndex++
      } else {
        // If no items can fit, break to avoid infinite loop
        break
      }
    }

    setChildDOs(newChildDOs)
    setUnassignedItems(remainingItems)
  }

  const handleManualSplit = () => {
    const newChild: ChildDO = {
      id: `child-${childDOs.length + 1}`,
      name: `Child DO ${childDOs.length + 1}`,
      lineItems: [],
      vehicleType: selectedVehicleType || "truck-10t",
      maxVehicleAge: order?.maxVehicleAge,
      plannedDispatchDate: order?.plannedDispatchDate || "",
      totalWeight: 0,
      totalQuantity: 0,
    }

    setChildDOs([...childDOs, newChild])
  }

  const handleAddItemToChild = (childId: string, item: LineItem) => {
    setChildDOs((prev) =>
      prev.map((child) => {
        if (child.id === childId) {
          const vehicleType = vehicleTypes.find((v) => v.id === child.vehicleType)
          const newWeight = child.totalWeight + item.weight
          const newQuantity = child.totalQuantity + item.quantity

          if (vehicleType && (newWeight > vehicleType.maxWeight || newQuantity > vehicleType.capacity)) {
            alert(
              `Item exceeds vehicle capacity. Max weight: ${vehicleType.maxWeight}kg, Max quantity: ${vehicleType.capacity}`,
            )
            return child
          }

          return {
            ...child,
            lineItems: [...child.lineItems, item],
            totalWeight: newWeight,
            totalQuantity: newQuantity,
          }
        }
        return child
      }),
    )

    setUnassignedItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleRemoveItemFromChild = (childId: string, item: LineItem) => {
    setChildDOs((prev) =>
      prev.map((child) => {
        if (child.id === childId) {
          return {
            ...child,
            lineItems: child.lineItems.filter((i) => i.id !== item.id),
            totalWeight: child.totalWeight - item.weight,
            totalQuantity: child.totalQuantity - item.quantity,
          }
        }
        return child
      }),
    )

    setUnassignedItems((prev) => [...prev, item])
  }

  const handleRemoveChild = (childId: string) => {
    const childToRemove = childDOs.find((child) => child.id === childId)
    if (childToRemove) {
      setUnassignedItems((prev) => [...prev, ...childToRemove.lineItems])
      setChildDOs((prev) => prev.filter((child) => child.id !== childId))
    }
  }

  const handleUpdateChild = (childId: string, field: string, value: any) => {
    setChildDOs((prev) => prev.map((child) => (child.id === childId ? { ...child, [field]: value } : child)))
  }

  const handleConfirm = () => {
    if (!order) return

    if (unassignedItems.length > 0) {
      alert("Please assign all line items to child DOs before confirming")
      return
    }

    if (childDOs.length === 0) {
      alert("Please create at least one child DO")
      return
    }

    onConfirm(order, childDOs)
  }

  const getVehicleCapacityInfo = (vehicleTypeId: string) => {
    return vehicleTypes.find((v) => v.id === vehicleTypeId)
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Split Dispatch Order: {order.doNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original DO Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Weight:</span>
                <div className="font-medium">{order.totalWeight} kg</div>
              </div>
              <div>
                <span className="text-gray-600">Total Quantity:</span>
                <div className="font-medium">{order.totalQuantity} units</div>
              </div>
              <div>
                <span className="text-gray-600">Line Items:</span>
                <div className="font-medium">{order.lineItems.length}</div>
              </div>
            </div>
          </div>

          {/* Split Mode Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Split Mode</Label>
            <div className="flex space-x-4">
              <Button
                variant={splitMode === "auto" ? "default" : "outline"}
                onClick={() => setSplitMode("auto")}
                className="flex-1"
              >
                Auto Split by Vehicle Capacity
              </Button>
              <Button
                variant={splitMode === "manual" ? "default" : "outline"}
                onClick={() => setSplitMode("manual")}
                className="flex-1"
              >
                Manual Split
              </Button>
            </div>
          </div>

          {/* Vehicle Type Selection */}
          <div className="space-y-2">
            <Label>Default Vehicle Type</Label>
            <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} (Max: {vehicle.maxWeight}kg, {vehicle.capacity} units)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto Split Button */}
          {splitMode === "auto" && (
            <Button
              onClick={handleAutoSplit}
              disabled={!selectedVehicleType}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Generate Auto Split
            </Button>
          )}

          {/* Manual Split Button */}
          {splitMode === "manual" && (
            <Button
              onClick={handleManualSplit}
              disabled={!selectedVehicleType}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child DO
            </Button>
          )}

          {/* Unassigned Items */}
          {unassignedItems.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold text-orange-600">
                Unassigned Items ({unassignedItems.length})
              </Label>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                {unassignedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-orange-200 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.materialDescription}</div>
                      <div className="text-xs text-gray-600">
                        {item.batchNumber} • {item.quantity} {item.unit} • {item.weight}kg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Child DOs */}
          {childDOs.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Child Dispatch Orders ({childDOs.length})</Label>

              {childDOs.map((child, index) => {
                const vehicleInfo = getVehicleCapacityInfo(child.vehicleType)
                const isOverCapacity =
                  vehicleInfo &&
                  (child.totalWeight > vehicleInfo.maxWeight || child.totalQuantity > vehicleInfo.capacity)

                return (
                  <div key={child.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <Input
                          value={child.name}
                          onChange={(e) => handleUpdateChild(child.id, "name", e.target.value)}
                          className="font-medium"
                        />
                        {isOverCapacity && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveChild(child.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Vehicle Type</Label>
                        <Select
                          value={child.vehicleType}
                          onValueChange={(value) => handleUpdateChild(child.id, "vehicleType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Max Vehicle Age</Label>
                        <Input
                          type="number"
                          value={child.maxVehicleAge || ""}
                          onChange={(e) =>
                            handleUpdateChild(child.id, "maxVehicleAge", Number.parseInt(e.target.value) || undefined)
                          }
                          placeholder="No limit"
                        />
                      </div>
                    </div>

                    {/* Capacity Info */}
                    {vehicleInfo && (
                      <div
                        className={`grid grid-cols-2 gap-4 p-3 rounded-lg ${isOverCapacity ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
                      >
                        <div>
                          <div className="text-sm text-gray-600">Weight Utilization</div>
                          <div
                            className={`font-medium ${child.totalWeight > vehicleInfo.maxWeight ? "text-red-600" : "text-green-600"}`}
                          >
                            {child.totalWeight} / {vehicleInfo.maxWeight} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Quantity Utilization</div>
                          <div
                            className={`font-medium ${child.totalQuantity > vehicleInfo.capacity ? "text-red-600" : "text-green-600"}`}
                          >
                            {child.totalQuantity} / {vehicleInfo.capacity} units
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Line Items */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Line Items ({child.lineItems.length})</Label>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {child.lineItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.materialDescription}</div>
                              <div className="text-xs text-gray-600">
                                {item.batchNumber} • {item.quantity} {item.unit} • {item.weight}kg
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItemFromChild(child.id, item)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add Items from Unassigned */}
                      {splitMode === "manual" && unassignedItems.length > 0 && (
                        <div className="border-t pt-2">
                          <Label className="text-xs text-gray-600">Add from unassigned:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {unassignedItems.map((item) => (
                              <Button
                                key={item.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddItemToChild(child.id, item)}
                                className="text-xs h-6"
                              >
                                {item.batchNumber}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={childDOs.length === 0 || unassignedItems.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Split ({childDOs.length} Child DOs)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
