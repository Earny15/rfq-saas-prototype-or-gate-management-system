"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  X, 
  Truck, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Scale,
  ShieldCheck,
  FileText,
  Loader2
} from "lucide-react"

interface GateEntry {
  id: string
  vehicleNumber: string
  status: string
  driver: {
    name: string
    verified: boolean
    number: string
    licenseNumber?: string
    saarathiVerified?: boolean
  }
  transporter: string
  loadNumber: string
  tripUID: string
  placeByDate: string
  route: {
    origin: string
    destination: string
    originCode: string
    destinationCode: string
  }
  tags: string[]
  gateInTime?: string
  gateOutTime?: string
  tareWeight?: number
  grossWeight?: number
  assignedDock?: string
  gatePassNumber?: string
  loadingIncharge?: string
  loadingStartTime?: string
  loadingEndTime?: string
}

interface LoadingChecklistItem {
  id: string
  category: string
  item: string
  completed: boolean
  required: boolean
}

interface DockLoadingDrawerProps {
  isOpen: boolean
  onClose: () => void
  vehicle: GateEntry | null
  onLoadingComplete: (vehicle: GateEntry, completedChecklist: LoadingChecklistItem[]) => void
  initialChecklist?: LoadingChecklistItem[]
}

const steelManufacturingChecklist: LoadingChecklistItem[] = [
  // Safety Checks
  { id: "safety-1", category: "Safety", item: "PPE verification - Hard hat, safety shoes, reflective vest", completed: false, required: true },
  { id: "safety-2", category: "Safety", item: "Emergency stop systems check", completed: false, required: true },
  { id: "safety-3", category: "Safety", item: "Fire safety equipment inspection", completed: false, required: true },
  { id: "safety-4", category: "Safety", item: "Crane operator certification verification", completed: false, required: true },
  
  // Vehicle Inspection
  { id: "vehicle-1", category: "Vehicle", item: "Truck bed/trailer condition inspection", completed: false, required: true },
  { id: "vehicle-2", category: "Vehicle", item: "Vehicle structural integrity check", completed: false, required: true },
  { id: "vehicle-3", category: "Vehicle", item: "Tie-down points and securing equipment check", completed: false, required: true },
  { id: "vehicle-4", category: "Vehicle", item: "Weight distribution capability verification", completed: false, required: false },
  
  // Material Preparation
  { id: "material-1", category: "Material", item: "Steel product quality verification", completed: false, required: true },
  { id: "material-2", category: "Material", item: "Material grade and specification confirmation", completed: false, required: true },
  { id: "material-3", category: "Material", item: "Quantity count verification", completed: false, required: true },
  { id: "material-4", category: "Material", item: "Surface treatment/coating inspection", completed: false, required: false },
  
  // Loading Equipment
  { id: "equipment-1", category: "Equipment", item: "Crane/lifting equipment safety check", completed: false, required: true },
  { id: "equipment-2", category: "Equipment", item: "Lifting capacity vs load weight verification", completed: false, required: true },
  { id: "equipment-3", category: "Equipment", item: "Sling/rigging equipment inspection", completed: false, required: true },
  { id: "equipment-4", category: "Equipment", item: "Forklift operational check (if applicable)", completed: false, required: false },
  
  // Documentation
  { id: "doc-1", category: "Documentation", item: "Bill of lading verification", completed: false, required: true },
  { id: "doc-2", category: "Documentation", item: "Material test certificates check", completed: false, required: true },
  { id: "doc-3", category: "Documentation", item: "Loading instructions review", completed: false, required: true },
  { id: "doc-4", category: "Documentation", item: "Transport permit verification", completed: false, required: false },
  
  // Final Checks
  { id: "final-1", category: "Final", item: "Load securing and tie-down completion", completed: false, required: true },
  { id: "final-2", category: "Final", item: "Load distribution and balance check", completed: false, required: true },
  { id: "final-3", category: "Final", item: "Vehicle weight limit compliance", completed: false, required: true },
  { id: "final-4", category: "Final", item: "Final visual inspection of loaded vehicle", completed: false, required: true }
]

export default function DockLoadingDrawer({ 
  isOpen, 
  onClose, 
  vehicle, 
  onLoadingComplete,
  initialChecklist 
}: DockLoadingDrawerProps) {
  const [checklist, setChecklist] = useState<LoadingChecklistItem[]>(steelManufacturingChecklist)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialChecklist) {
        // Use provided checklist (for completed vehicles)
        setChecklist(initialChecklist)
      } else {
        // Reset checklist when drawer opens for new vehicles
        setChecklist(steelManufacturingChecklist.map(item => ({ ...item, completed: false })))
      }
    }
  }, [isOpen, initialChecklist])

  const handleChecklistChange = (itemId: string, completed: boolean) => {
    // Don't allow changes if viewing a completed checklist
    if (initialChecklist) return
    
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed } : item
    ))
  }

  const getCompletionStats = () => {
    const required = checklist.filter(item => item.required)
    const requiredCompleted = required.filter(item => item.completed)
    const optional = checklist.filter(item => !item.required)
    const optionalCompleted = optional.filter(item => item.completed)
    
    return {
      required: { total: required.length, completed: requiredCompleted.length },
      optional: { total: optional.length, completed: optionalCompleted.length },
      overall: { total: checklist.length, completed: checklist.filter(item => item.completed).length }
    }
  }

  const canFinishLoading = () => {
    const stats = getCompletionStats()
    return stats.required.completed === stats.required.total
  }

  const handleFinishLoading = () => {
    if (!vehicle || !canFinishLoading()) return
    
    setIsCompleting(true)
    
    setTimeout(() => {
      const updatedVehicle: GateEntry = {
        ...vehicle,
        status: "loading",
        loadingEndTime: new Date().toISOString()
      }
      onLoadingComplete(updatedVehicle, checklist)
      setIsCompleting(false)
      onClose()
    }, 2000)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Safety": return <ShieldCheck className="h-4 w-4 text-red-600" />
      case "Vehicle": return <Truck className="h-4 w-4 text-blue-600" />
      case "Material": return <Scale className="h-4 w-4 text-green-600" />
      case "Equipment": return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "Documentation": return <FileText className="h-4 w-4 text-purple-600" />
      case "Final": return <CheckCircle className="h-4 w-4 text-indigo-600" />
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const stats = getCompletionStats()
  const progressPercentage = stats.overall.total > 0 ? (stats.overall.completed / stats.overall.total) * 100 : 0

  if (!vehicle) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[700px] sm:w-[900px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">
              {initialChecklist ? "Completed Loading Checklist" : "Dock Loading Operations"}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Vehicle at {vehicle.assignedDock}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Vehicle Number:</span>
                  <div className="font-medium text-lg">{vehicle.vehicleNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Driver:</span>
                  <div className="font-medium">{vehicle.driver.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Loading Incharge:</span>
                  <div className="font-medium">{vehicle.loadingIncharge}</div>
                </div>
                <div>
                  <span className="text-gray-600">Load Number:</span>
                  <div className="font-medium">{vehicle.loadNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Transporter:</span>
                  <div className="font-medium">{vehicle.transporter}</div>
                </div>
                <div>
                  <span className="text-gray-600">Loading Started:</span>
                  <div className="font-medium">
                    {vehicle.loadingStartTime ? new Date(vehicle.loadingStartTime).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Loading Progress</span>
                <Badge className={canFinishLoading() ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  {stats.required.completed}/{stats.required.total} Required Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{stats.overall.completed}/{stats.overall.total} items</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="font-medium text-red-800">Required Items</div>
                    <div className="text-red-700">{stats.required.completed}/{stats.required.total}</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="font-medium text-blue-800">Optional Items</div>
                    <div className="text-blue-700">{stats.optional.completed}/{stats.optional.total}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steel Manufacturing Loading Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Steel Manufacturing Loading Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Safety', 'Vehicle', 'Material', 'Equipment', 'Documentation', 'Final'].map(category => {
                  const categoryItems = checklist.filter(item => item.category === category)
                  const categoryCompleted = categoryItems.filter(item => item.completed).length
                  
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category)}
                        <h4 className="font-medium text-lg">{category} Checks</h4>
                        <Badge variant="outline" className="text-xs">
                          {categoryCompleted}/{categoryItems.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 ml-6">
                        {categoryItems.map(item => (
                          <div key={item.id} className="flex items-start space-x-3 p-2 rounded border hover:bg-gray-50">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                              className="mt-0.5"
                              disabled={!!initialChecklist}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {item.item}
                                </span>
                                {item.required && (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Finish Loading Button / Completed Status */}
          {initialChecklist ? (
            <Card className="border-blue-300 bg-blue-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-blue-800">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-medium text-lg">Loading Checklist Completed</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    This vehicle has completed all loading procedures. Checklist is view-only.
                  </div>
                  <Button 
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    CLOSE
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={canFinishLoading() ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}>
              <CardContent className="p-6">
                {canFinishLoading() ? (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-green-800">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-medium text-lg">All Required Checks Complete!</span>
                    </div>
                    <Button 
                      onClick={handleFinishLoading}
                      disabled={isCompleting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Finishing Loading...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          FINISH LOADING
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-yellow-800">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="font-medium text-lg">Complete Required Checks to Finish Loading</span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      {stats.required.total - stats.required.completed} required items remaining
                    </div>
                    <Button disabled className="w-full" size="lg">
                      FINISH LOADING (Disabled)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}