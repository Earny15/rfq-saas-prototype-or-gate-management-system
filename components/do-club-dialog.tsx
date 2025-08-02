"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Users, Package, AlertTriangle } from "lucide-react"

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

interface DOClubDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedOrders: DispatchOrder[]
  onConfirm: (clubbedDOData: any) => void
}

export default function DOClubDialog({ isOpen, onClose, selectedOrders, onConfirm }: DOClubDialogProps) {
  const [clubbedDOData, setClubbedDOData] = useState({
    doNumber: "",
    loadingPoint: "",
    destination: "",
    plannedDispatchDate: "",
    maxVehicleAge: "",
    consolidationGroup: "",
    priority: 1,
    notes: "",
  })

  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([])

  useEffect(() => {
    if (selectedOrders.length > 0) {
      // Auto-generate DO number
      setClubbedDOData((prev) => ({
        ...prev,
        doNumber: `DO-CLUB-${Date.now()}`,
        plannedDispatchDate: selectedOrders[0].plannedDispatchDate.slice(0, 16),
        priority: Math.min(...selectedOrders.map((order) => order.priority)),
      }))

      // Check compatibility
      checkCompatibility()
    }
  }, [selectedOrders])

  const checkCompatibility = () => {
    const issues: string[] = []

    // Check loading points
    const loadingPoints = [...new Set(selectedOrders.map((order) => order.loadingPoint.id))]
    if (loadingPoints.length > 1) {
      issues.push("Multiple loading points detected - consolidation may require coordination")
    }

    // Check destinations
    const destinations = [...new Set(selectedOrders.map((order) => order.destination.city))]
    if (destinations.length > 1) {
      issues.push("Multiple destinations - may require route optimization")
    }

    // Check zones
    const zones = [...new Set(selectedOrders.map((order) => order.destination.zone))]
    if (zones.length > 1) {
      issues.push("Multiple zones - may affect transporter allocation")
    }

    // Check material compatibility
    const allMaterials = selectedOrders.flatMap((order) => order.lineItems.map((item) => item.materialCode))
    const hazardousMaterials = allMaterials.filter(
      (code) => code.includes("CHEM") || code.includes("ACID") || code.includes("FLAM"),
    )
    if (hazardousMaterials.length > 0) {
      issues.push("Hazardous materials detected - special handling required")
    }

    // Check dispatch dates
    const dates = selectedOrders.map((order) => new Date(order.plannedDispatchDate))
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    const daysDiff = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff > 2) {
      issues.push("Dispatch dates vary by more than 2 days - timing coordination needed")
    }

    setCompatibilityIssues(issues)
  }

  const handleInputChange = (field: string, value: any) => {
    setClubbedDOData((prev) => ({ ...prev, [field]: value }))
  }

  const handleConfirm = () => {
    if (!clubbedDOData.doNumber || !clubbedDOData.loadingPoint || !clubbedDOData.destination) {
      alert("Please fill in all required fields")
      return
    }

    const loadingPointData = {
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

    const destinationData = {
      bengaluru: { city: "Bengaluru", address: "Electronic City, Bengaluru", zone: "South Zone" },
      mumbai: { city: "Mumbai", address: "Andheri Industrial Estate, Mumbai", zone: "West Zone" },
      delhi: { city: "Delhi", address: "Gurgaon Industrial Area, Delhi NCR", zone: "North Zone" },
      chennai: { city: "Chennai", address: "Guindy Industrial Estate, Chennai", zone: "South Zone" },
    }

    onConfirm({
      ...clubbedDOData,
      loadingPoint: loadingPointData[clubbedDOData.loadingPoint] || loadingPointData.LP001,
      destination: destinationData[clubbedDOData.destination] || destinationData.bengaluru,
      plannedDispatchDate: clubbedDOData.plannedDispatchDate + ":00",
      maxVehicleAge: clubbedDOData.maxVehicleAge ? Number.parseInt(clubbedDOData.maxVehicleAge) : undefined,
    })
  }

  const getTotalStats = () => {
    const totalWeight = selectedOrders.reduce((sum, order) => sum + order.totalWeight, 0)
    const totalQuantity = selectedOrders.reduce((sum, order) => sum + order.totalQuantity, 0)
    const totalLineItems = selectedOrders.reduce((sum, order) => sum + order.lineItems.length, 0)

    return { totalWeight, totalQuantity, totalLineItems }
  }

  const stats = getTotalStats()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Club Dispatch Orders ({selectedOrders.length} DOs)</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total DOs:</span>
                <div className="font-medium text-blue-600">{selectedOrders.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Weight:</span>
                <div className="font-medium text-blue-600">{stats.totalWeight} kg</div>
              </div>
              <div>
                <span className="text-gray-600">Total Quantity:</span>
                <div className="font-medium text-blue-600">{stats.totalQuantity} units</div>
              </div>
              <div>
                <span className="text-gray-600">Total Line Items:</span>
                <div className="font-medium text-blue-600">{stats.totalLineItems}</div>
              </div>
            </div>
          </div>

          {/* Compatibility Issues */}
          {compatibilityIssues.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Compatibility Issues</span>
              </div>
              <ul className="space-y-1">
                {compatibilityIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-orange-700">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Selected DOs Preview */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Selected Dispatch Orders</Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {selectedOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{order.doNumber}</div>
                      <div className="text-sm text-gray-600">
                        {order.totalWeight}kg • {order.totalQuantity} units • {order.lineItems.length} items
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{order.destination.city}</div>
                    <Badge variant="secondary" className="text-xs">
                      P{order.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clubbed DO Configuration */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Clubbed DO Configuration</Label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  DO Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={clubbedDOData.doNumber}
                  onChange={(e) => handleInputChange("doNumber", e.target.value)}
                  placeholder="Enter DO number"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={clubbedDOData.priority.toString()}
                  onValueChange={(value) => handleInputChange("priority", Number.parseInt(value))}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Loading Point <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={clubbedDOData.loadingPoint}
                  onValueChange={(value) => handleInputChange("loadingPoint", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select loading point" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LP001">Chennai Plant - Gate 1</SelectItem>
                    <SelectItem value="LP002">Mumbai Plant - Gate 2</SelectItem>
                    <SelectItem value="LP003">Delhi Plant - Gate 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  Destination <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={clubbedDOData.destination}
                  onValueChange={(value) => handleInputChange("destination", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bengaluru">Bengaluru</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Planned Dispatch Date</Label>
                <Input
                  type="datetime-local"
                  value={clubbedDOData.plannedDispatchDate}
                  onChange={(e) => handleInputChange("plannedDispatchDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Max Vehicle Age (years)</Label>
                <Input
                  type="number"
                  value={clubbedDOData.maxVehicleAge}
                  onChange={(e) => handleInputChange("maxVehicleAge", e.target.value)}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div>
              <Label>Consolidation Group</Label>
              <Input
                value={clubbedDOData.consolidationGroup}
                onChange={(e) => handleInputChange("consolidationGroup", e.target.value)}
                placeholder="Enter consolidation group name"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={clubbedDOData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any special instructions or notes for the clubbed DO..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              Create Clubbed DO
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
