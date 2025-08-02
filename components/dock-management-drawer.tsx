"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calendar, FileText, Truck, MapPin, Activity, Clock, AlertCircle } from "lucide-react"

interface DockEntry {
  id: number
  name: string
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  location: string
  capacity: number
  currentVehicle?: string
  assignedDriver?: string
  transporter?: string
  loadNumber?: string
  estimatedDuration?: number
  scheduledTime?: string
  actualStartTime?: string
  actualEndTime?: string
  lastActivity?: string
  notes?: string
  maintenanceLog?: Array<{
    date: string
    type: string
    description: string
    technician: string
  }>
}

interface DockManagementDrawerProps {
  isOpen: boolean
  onClose: () => void
  dock: DockEntry | null
  onUpdate: (dock: DockEntry) => void
}

export default function DockManagementDrawer({ isOpen, onClose, dock, onUpdate }: DockManagementDrawerProps) {
  const [selectedAction, setSelectedAction] = useState("")
  const [formData, setFormData] = useState({
    status: "",
    vehicleNumber: "",
    driverName: "",
    transporter: "",
    loadNumber: "",
    estimatedDuration: "",
    scheduledTime: "",
    notes: "",
    maintenanceType: "",
    maintenanceDescription: "",
    technician: ""
  })

  useEffect(() => {
    if (dock) {
      setFormData({
        status: dock.status,
        vehicleNumber: dock.currentVehicle || "",
        driverName: dock.assignedDriver || "",
        transporter: dock.transporter || "",
        loadNumber: dock.loadNumber || "",
        estimatedDuration: dock.estimatedDuration?.toString() || "",
        scheduledTime: dock.scheduledTime || "",
        notes: dock.notes || "",
        maintenanceType: "",
        maintenanceDescription: "",
        technician: ""
      })
    }
  }, [dock])

  const handleSave = () => {
    if (!dock) return

    const updatedDock: DockEntry = {
      ...dock,
      status: formData.status as DockEntry['status'],
      currentVehicle: formData.vehicleNumber || undefined,
      assignedDriver: formData.driverName || undefined,
      transporter: formData.transporter || undefined,
      loadNumber: formData.loadNumber || undefined,
      estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : undefined,
      scheduledTime: formData.scheduledTime || undefined,
      notes: formData.notes || undefined,
      lastActivity: new Date().toISOString()
    }

    // Add maintenance log entry if maintenance data is provided
    if (formData.maintenanceType && formData.maintenanceDescription) {
      const maintenanceEntry = {
        date: new Date().toISOString(),
        type: formData.maintenanceType,
        description: formData.maintenanceDescription,
        technician: formData.technician
      }
      
      updatedDock.maintenanceLog = [...(dock.maintenanceLog || []), maintenanceEntry]
    }

    onUpdate(updatedDock)
    onClose()
  }

  const getStatusColor = (status: DockEntry['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'occupied': return 'bg-red-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'reserved': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: DockEntry['status']) => {
    switch (status) {
      case 'available': return <Activity className="h-4 w-4" />
      case 'occupied': return <AlertCircle className="h-4 w-4" />
      case 'maintenance': return <Clock className="h-4 w-4" />
      case 'reserved': return <MapPin className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (!dock) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">{dock.name} Details</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Current Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Status
                <Badge variant="secondary" className={`${getStatusColor(dock.status)} text-white`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(dock.status)}
                    {dock.status}
                  </span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <div className="font-medium">{dock.location}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span>
                  <div className="font-medium">{dock.capacity} tons</div>
                </div>
                {dock.currentVehicle && (
                  <div>
                    <span className="text-muted-foreground">Current Vehicle:</span>
                    <div className="font-medium">{dock.currentVehicle}</div>
                  </div>
                )}
                {dock.lastActivity && (
                  <div>
                    <span className="text-muted-foreground">Last Activity:</span>
                    <div className="font-medium">{new Date(dock.lastActivity).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Action</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assign">Assign Vehicle</SelectItem>
                <SelectItem value="release">Release Dock</SelectItem>
                <SelectItem value="maintenance">Schedule Maintenance</SelectItem>
                <SelectItem value="reserve">Reserve Dock</SelectItem>
                <SelectItem value="update">Update Information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Form Based on Action */}
          {selectedAction && (
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{selectedAction} {dock.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Update */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Assignment Fields */}
                {(selectedAction === "assign" || selectedAction === "update") && formData.status === "occupied" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                      <Input
                        id="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                        placeholder="e.g., TRK-1001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverName">Driver Name</Label>
                      <Input
                        id="driverName"
                        value={formData.driverName}
                        onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                        placeholder="Driver name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transporter">Transporter</Label>
                      <Input
                        id="transporter"
                        value={formData.transporter}
                        onChange={(e) => setFormData(prev => ({ ...prev, transporter: e.target.value }))}
                        placeholder="Transporter company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loadNumber">Load Number</Label>
                      <Input
                        id="loadNumber"
                        value={formData.loadNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, loadNumber: e.target.value }))}
                        placeholder="Load reference number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                        placeholder="Expected duration"
                      />
                    </div>
                  </>
                )}

                {/* Maintenance Fields */}
                {(selectedAction === "maintenance" || formData.status === "maintenance") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceType">Maintenance Type</Label>
                      <Select value={formData.maintenanceType} onValueChange={(value) => setFormData(prev => ({ ...prev, maintenanceType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select maintenance type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine Inspection</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="upgrade">Equipment Upgrade</SelectItem>
                          <SelectItem value="safety">Safety Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceDescription">Description</Label>
                      <Textarea
                        id="maintenanceDescription"
                        value={formData.maintenanceDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, maintenanceDescription: e.target.value }))}
                        placeholder="Describe the maintenance work"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technician">Technician</Label>
                      <Input
                        id="technician"
                        value={formData.technician}
                        onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                        placeholder="Assigned technician"
                      />
                    </div>
                  </>
                )}

                {/* Scheduling */}
                {(selectedAction === "reserve" || selectedAction === "assign") && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or comments"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance History */}
          {dock.maintenanceLog && dock.maintenanceLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dock.maintenanceLog.map((log, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{log.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                      <p className="text-xs text-muted-foreground">Technician: {log.technician}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}