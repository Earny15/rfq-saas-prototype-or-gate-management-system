"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Truck, AlertTriangle, Plus, Minus, Calendar } from "lucide-react"

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
  dimensions: {
    length: number
    width: number
    height: number
  }
}

interface VehiclePlan {
  id: string
  vehicleType: string
  plannedDispatchDate: string
  maxVehicleAge?: number
  lineItems: LineItem[]
  totalWeight: number
  totalQuantity: number
  transporter?: string
  driverRequirements?: string[]
  specialInstructions?: string
}

interface VehiclePlanningDialogProps {
  isOpen: boolean
  onClose: () => void
  order: DispatchOrder | null
  selectedLineItems: string[]
  onConfirm: (vehiclePlans: VehiclePlan[]) => void
}

const vehicleTypes: VehicleType[] = [
  {
    id: "truck-10t",
    name: "10 Ton Truck",
    capacity: 100,
    maxWeight: 10000,
    dimensions: { length: 6, width: 2.4, height: 2.4 },
  },
  {
    id: "truck-16t",
    name: "16 Ton Truck",
    capacity: 160,
    maxWeight: 16000,
    dimensions: { length: 7.5, width: 2.4, height: 2.6 },
  },
  {
    id: "truck-25t",
    name: "25 Ton Truck",
    capacity: 250,
    maxWeight: 25000,
    dimensions: { length: 9, width: 2.5, height: 2.8 },
  },
  {
    id: "trailer-32t",
    name: "32 Ton Trailer",
    capacity: 320,
    maxWeight: 32000,
    dimensions: { length: 12, width: 2.5, height: 3 },
  },
  {
    id: "container-20ft",
    name: "20ft Container",
    capacity: 200,
    maxWeight: 20000,
    dimensions: { length: 6, width: 2.4, height: 2.6 },
  },
  {
    id: "container-40ft",
    name: "40ft Container",
    capacity: 400,
    maxWeight: 30000,
    dimensions: { length: 12, width: 2.4, height: 2.6 },
  },
]

const transporters = [
  "TCI Supply Chain Solutions",
  "Automobile Carriers",
  "Dhivyasree Transport",
  "Express Logistics",
  "Blue Dart Express",
  "Gati Limited",
]

export default function VehiclePlanningDialog({
  isOpen,
  onClose,
  order,
  selectedLineItems,
  onConfirm,
}: VehiclePlanningDialogProps) {
  const [vehiclePlans, setVehiclePlans] = useState<VehiclePlan[]>([])
  const [planningMode, setPlanningMode] = useState<"auto" | "manual">("auto")
  const [defaultVehicleType, setDefaultVehicleType] = useState<string>("")
  const [unassignedItems, setUnassignedItems] = useState<LineItem[]>([])

  useEffect(() => {
    if (order && selectedLineItems.length > 0) {
      const selectedItems = order.lineItems.filter((item) => selectedLineItems.includes(item.id))
      setUnassignedItems(selectedItems)
      setVehiclePlans([])
    }
  }, [order, selectedLineItems])

  const handleAutoPlanning = () => {
    if (!order || !defaultVehicleType) return

    const vehicleType = vehicleTypes.find((v) => v.id === defaultVehicleType)
    if (!vehicleType) return

    const newVehiclePlans: VehiclePlan[] = []
    const remainingItems = [...unassignedItems]
    let planIndex = 1

    // Sort items by priority and weight for optimal packing
    remainingItems.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return b.weight - a.weight
    })

    while (remainingItems.length > 0) {
      const currentPlan: VehiclePlan = {
        id: `plan-${planIndex}`,
        vehicleType: defaultVehicleType,
        plannedDispatchDate: order.plannedDispatchDate.slice(0, 16),
        maxVehicleAge: order.maxVehicleAge,
        lineItems: [],
        totalWeight: 0,
        totalQuantity: 0,
        specialInstructions: "",
      }

      // Add items until capacity is reached
      for (let i = remainingItems.length - 1; i >= 0; i--) {
        const item = remainingItems[i]
        const newWeight = currentPlan.totalWeight + item.weight
        const newQuantity = currentPlan.totalQuantity + item.quantity

        if (newWeight <= vehicleType.maxWeight && newQuantity <= vehicleType.capacity) {
          currentPlan.lineItems.push(item)
          currentPlan.totalWeight = newWeight
          currentPlan.totalQuantity = newQuantity
          remainingItems.splice(i, 1)
        }
      }

      if (currentPlan.lineItems.length > 0) {
        newVehiclePlans.push(currentPlan)
        planIndex++
      } else {
        // If no items can fit, break to avoid infinite loop
        break
      }
    }

    setVehiclePlans(newVehiclePlans)
    setUnassignedItems(remainingItems)
  }

  const handleManualPlanning = () => {
    const newPlan: VehiclePlan = {
      id: `plan-${vehiclePlans.length + 1}`,
      vehicleType: defaultVehicleType || "truck-10t",
      plannedDispatchDate: order?.plannedDispatchDate.slice(0, 16) || "",
      maxVehicleAge: order?.maxVehicleAge,
      lineItems: [],
      totalWeight: 0,
      totalQuantity: 0,
      specialInstructions: "",
    }

    setVehiclePlans([...vehiclePlans, newPlan])
  }

  const handleAddItemToPlan = (planId: string, item: LineItem) => {
    setVehiclePlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const vehicleType = vehicleTypes.find((v) => v.id === plan.vehicleType)
          const newWeight = plan.totalWeight + item.weight
          const newQuantity = plan.totalQuantity + item.quantity

          if (vehicleType && (newWeight > vehicleType.maxWeight || newQuantity > vehicleType.capacity)) {
            alert(
              `Item exceeds vehicle capacity. Max weight: ${vehicleType.maxWeight}kg, Max quantity: ${vehicleType.capacity}`,
            )
            return plan
          }

          return {
            ...plan,
            lineItems: [...plan.lineItems, item],
            totalWeight: newWeight,
            totalQuantity: newQuantity,
          }
        }
        return plan
      }),
    )

    setUnassignedItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleRemoveItemFromPlan = (planId: string, item: LineItem) => {
    setVehiclePlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            lineItems: plan.lineItems.filter((i) => i.id !== item.id),
            totalWeight: plan.totalWeight - item.weight,
            totalQuantity: plan.totalQuantity - item.quantity,
          }
        }
        return plan
      }),
    )

    setUnassignedItems((prev) => [...prev, item])
  }

  const handleRemovePlan = (planId: string) => {
    const planToRemove = vehiclePlans.find((plan) => plan.id === planId)
    if (planToRemove) {
      setUnassignedItems((prev) => [...prev, ...planToRemove.lineItems])
      setVehiclePlans((prev) => prev.filter((plan) => plan.id !== planId))
    }
  }

  const handleUpdatePlan = (planId: string, field: string, value: any) => {
    setVehiclePlans((prev) => prev.map((plan) => (plan.id === planId ? { ...plan, [field]: value } : plan)))
  }

  const handleConfirm = () => {
    if (!order) return

    if (unassignedItems.length > 0) {
      alert("Please assign all selected line items to vehicle plans before confirming")
      return
    }

    if (vehiclePlans.length === 0) {
      alert("Please create at least one vehicle plan")
      return
    }

    // Validate all plans have required fields
    const invalidPlans = vehiclePlans.filter(
      (plan) => !plan.vehicleType || !plan.plannedDispatchDate || plan.lineItems.length === 0,
    )

    if (invalidPlans.length > 0) {
      alert("Please ensure all vehicle plans have vehicle type, dispatch date, and line items")
      return
    }

    onConfirm(vehiclePlans)
  }

  const getVehicleCapacityInfo = (vehicleTypeId: string) => {
    return vehicleTypes.find((v) => v.id === vehicleTypeId)
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "text-red-600 font-bold"
    if (priority === 2) return "text-orange-600 font-semibold"
    return "text-gray-600"
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>
              Vehicle Planning: {order.doNumber} ({selectedLineItems.length} items selected)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Items Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Selected Items:</span>
                <div className="font-medium text-blue-600">{selectedLineItems.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Weight:</span>
                <div className="font-medium text-blue-600">
                  {order.lineItems
                    .filter((item) => selectedLineItems.includes(item.id))
                    .reduce((sum, item) => sum + item.weight, 0)}{" "}
                  kg
                </div>
              </div>
              <div>
                <span className="text-gray-600">Total Quantity:</span>
                <div className="font-medium text-blue-600">
                  {order.lineItems
                    .filter((item) => selectedLineItems.includes(item.id))
                    .reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  units
                </div>
              </div>
              <div>
                <span className="text-gray-600">Destination:</span>
                <div className="font-medium text-blue-600">{order.destination.city}</div>
              </div>
            </div>
          </div>

          {/* Planning Mode Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Planning Mode</Label>
            <div className="flex space-x-4">
              <Button
                variant={planningMode === "auto" ? "default" : "outline"}
                onClick={() => setPlanningMode("auto")}
                className="flex-1"
              >
                Auto Planning by Vehicle Capacity
              </Button>
              <Button
                variant={planningMode === "manual" ? "default" : "outline"}
                onClick={() => setPlanningMode("manual")}
                className="flex-1"
              >
                Manual Planning
              </Button>
            </div>
          </div>

          {/* Default Vehicle Type Selection */}
          <div className="space-y-2">
            <Label>Default Vehicle Type</Label>
            <Select value={defaultVehicleType} onValueChange={setDefaultVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select default vehicle type" />
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

          {/* Planning Action Buttons */}
          <div className="flex space-x-4">
            {planningMode === "auto" && (
              <Button
                onClick={handleAutoPlanning}
                disabled={!defaultVehicleType}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generate Auto Planning
              </Button>
            )}
            {planningMode === "manual" && (
              <Button
                onClick={handleManualPlanning}
                disabled={!defaultVehicleType}
                variant="outline"
                className="bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle Plan
              </Button>
            )}
          </div>

          {/* Unassigned Items */}
          {unassignedItems.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold text-orange-600">
                Unassigned Items ({unassignedItems.length})
              </Label>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="grid gap-2">
                  {unassignedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.materialDescription}</div>
                        <div className="text-xs text-gray-600">
                          {item.batchNumber} • {item.quantity} {item.unit} • {item.weight}kg •{" "}
                          <span className={getPriorityColor(item.priority)}>P{item.priority}</span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          item.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : item.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Plans */}
          {vehiclePlans.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Vehicle Plans ({vehiclePlans.length})</Label>

              {vehiclePlans.map((plan, index) => {
                const vehicleInfo = getVehicleCapacityInfo(plan.vehicleType)
                const isOverCapacity =
                  vehicleInfo && (plan.totalWeight > vehicleInfo.maxWeight || plan.totalQuantity > vehicleInfo.capacity)

                return (
                  <div key={plan.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Vehicle Plan {index + 1}</h3>
                        {isOverCapacity && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemovePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Vehicle Type</Label>
                        <Select
                          value={plan.vehicleType}
                          onValueChange={(value) => handleUpdatePlan(plan.id, "vehicleType", value)}
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
                        <Label className="text-sm">Planned Dispatch Date</Label>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            value={plan.plannedDispatchDate}
                            onChange={(e) => handleUpdatePlan(plan.id, "plannedDispatchDate", e.target.value)}
                          />
                          <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Transporter</Label>
                        <Select
                          value={plan.transporter || ""}
                          onValueChange={(value) => handleUpdatePlan(plan.id, "transporter", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transporter" />
                          </SelectTrigger>
                          <SelectContent>
                            {transporters.map((transporter) => (
                              <SelectItem key={transporter} value={transporter}>
                                {transporter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Capacity Info */}
                    {vehicleInfo && (
                      <div
                        className={`grid grid-cols-3 gap-4 p-3 rounded-lg ${isOverCapacity ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
                      >
                        <div>
                          <div className="text-sm text-gray-600">Weight Utilization</div>
                          <div
                            className={`font-medium ${plan.totalWeight > vehicleInfo.maxWeight ? "text-red-600" : "text-green-600"}`}
                          >
                            {plan.totalWeight} / {vehicleInfo.maxWeight} kg (
                            {Math.round((plan.totalWeight / vehicleInfo.maxWeight) * 100)}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Quantity Utilization</div>
                          <div
                            className={`font-medium ${plan.totalQuantity > vehicleInfo.capacity ? "text-red-600" : "text-green-600"}`}
                          >
                            {plan.totalQuantity} / {vehicleInfo.capacity} units (
                            {Math.round((plan.totalQuantity / vehicleInfo.capacity) * 100)}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Dimensions (L×W×H)</div>
                          <div className="font-medium text-gray-700">
                            {vehicleInfo.dimensions.length}×{vehicleInfo.dimensions.width}×
                            {vehicleInfo.dimensions.height}m
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Line Items */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Assigned Items ({plan.lineItems.length})</Label>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {plan.lineItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.materialDescription}</div>
                              <div className="text-xs text-gray-600">
                                {item.batchNumber} • {item.quantity} {item.unit} • {item.weight}kg •{" "}
                                <span className={getPriorityColor(item.priority)}>P{item.priority}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItemFromPlan(plan.id, item)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add Items from Unassigned */}
                      {planningMode === "manual" && unassignedItems.length > 0 && (
                        <div className="border-t pt-2">
                          <Label className="text-xs text-gray-600">Add from unassigned:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {unassignedItems.map((item) => (
                              <Button
                                key={item.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddItemToPlan(plan.id, item)}
                                className="text-xs h-6"
                              >
                                {item.batchNumber}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <Label className="text-sm">Special Instructions</Label>
                      <Input
                        value={plan.specialInstructions || ""}
                        onChange={(e) => handleUpdatePlan(plan.id, "specialInstructions", e.target.value)}
                        placeholder="Enter any special handling instructions..."
                      />
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
              disabled={vehiclePlans.length === 0 || unassignedItems.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Vehicle Planning ({vehiclePlans.length} vehicles)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
