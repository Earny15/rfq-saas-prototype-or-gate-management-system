"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  X, 
  Calendar, 
  FileText, 
  Truck, 
  Camera, 
  Clock, 
  CreditCard, 
  MapPin, 
  Scale, 
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
  ChevronDown,
  ChevronRight
} from "lucide-react"

interface GateEntry {
  id: string
  vehicleNumber: string
  status: "not-started" | "gate-in" | "gate-pass-generated" | "tare-weight-captured" | "loading-in-dock" | "loading" | "gross-weight-captured" | "gate-out" | "completed" | "rejected" | "cancelled"
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

interface GateManagementDrawerProps {
  isOpen: boolean
  onClose: () => void
  entry: GateEntry | null
  onUpdate: (entry: GateEntry) => void
  actionType?: "start-process" | "generate-gate-pass" | "capture-tare-weight" | "loading" | "capture-gross-weight" | "gate-out" | "view-details"
}

export default function GateManagementDrawer({ 
  isOpen, 
  onClose, 
  entry, 
  onUpdate, 
  actionType = "start-process" 
}: GateManagementDrawerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scannedPlate, setScannedPlate] = useState("")
  const [gateInTime, setGateInTime] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [driverVerified, setDriverVerified] = useState(false)
  const [assignedDock, setAssignedDock] = useState("")
  const [tareWeight, setTareWeight] = useState<number | null>(null)
  const [grossWeight, setGrossWeight] = useState<number | null>(null)
  const [loadingIncharge, setLoadingIncharge] = useState("")
  const [loadingItems, setLoadingItems] = useState("")
  const [isWeighingInProgress, setIsWeighingInProgress] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<string[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (entry) {
      // Only set existing data, don't pre-populate vehicle number for new scans
      if (entry.vehicleNumber && entry.status !== "not-started") {
        setVehicleNumber(entry.vehicleNumber)
        setScannedPlate(entry.vehicleNumber)
      }
      setGateInTime(entry.gateInTime || "")
      setLicenseNumber(entry.driver.licenseNumber || "")
      setDriverVerified(entry.driver.saarathiVerified || false)
      setAssignedDock(entry.assignedDock || "")
      setTareWeight(entry.tareWeight || null)
      setGrossWeight(entry.grossWeight || null)
      setLoadingIncharge(entry.loadingIncharge || "")
    }
  }, [entry])
  
  // Reset processing states when drawer closes/opens
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
      setIsScanning(false)
      setIsWeighingInProgress(false)
    } else if (isOpen && actionType === "start-process" && !scannedPlate) {
      // Auto-start camera scanning when gate-in drawer opens
      startPlateScanning()
    }
  }, [isOpen, actionType])

  // Initialize camera for vehicle number scanning
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Ensure video plays
        videoRef.current.play().catch(error => {
          console.log("Video play failed:", error)
        })
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      // Fallback for demo purposes - show a placeholder
      if (videoRef.current) {
        videoRef.current.style.backgroundColor = '#1a1a1a'
      }
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Start plate scanning
  const startPlateScanning = () => {
    setIsScanning(true)
    initializeCamera()
    
    // Simulate plate detection after 4 seconds with beep
    setTimeout(() => {
      const mockPlateNumber = "KA01AB" + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      
      // Play beep sound for successful reading
      const beep = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz beep
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }
      
      // Play beep sound
      try {
        beep()
      } catch (error) {
        console.log("Audio not supported:", error)
      }
      
      setScannedPlate(mockPlateNumber)
      setVehicleNumber(mockPlateNumber)
      setIsScanning(false)
      stopCamera() // Stop camera after successful scan
    }, 4000) // Extended to 4 seconds
  }

  // Mark Gate In (separate action)
  const markGateIn = () => {
    if (scannedPlate || vehicleNumber) {
      const currentTime = new Date().toISOString()
      setGateInTime(currentTime)
      
      // Complete the gate-in process
      if (entry) {
        const updatedEntry: GateEntry = {
          ...entry,
          status: "gate-in",
          vehicleNumber: scannedPlate || vehicleNumber,
          gateInTime: currentTime,
          driver: {
            ...entry.driver,
            verified: true
          }
        }
        onUpdate(updatedEntry)
        onClose()
      }
    }
  }

  // Verify driver license with Saarathi
  const verifyDriverLicense = async () => {
    if (!licenseNumber) return
    
    setIsProcessing(true)
    
    // Simulate Saarathi API call
    setTimeout(() => {
      setDriverVerified(true)
      setIsProcessing(false)
    }, 2000)
  }

  // Generate gate pass with auto dock assignment
  const findAvailableDock = () => {
    try {
      const gateEntriesData = localStorage.getItem('gateEntries')
      if (gateEntriesData) {
        const gateEntries: GateEntry[] = JSON.parse(gateEntriesData)
        
        // Find vehicles currently occupying docks (loading-in-dock, loading, or not yet completed)
        const occupiedDocks = gateEntries
          .filter(entry => 
            entry.assignedDock && 
            (entry.status === "loading-in-dock" || entry.status === "loading")
          )
          .map(entry => entry.assignedDock)
        
        console.log('Occupied docks:', occupiedDocks)
        
        // Find available docks
        const allDocks = ["Dock 1", "Dock 2", "Dock 3", "Dock 4", "Dock 5"]
        const availableDocks = allDocks.filter(dock => !occupiedDocks.includes(dock))
        
        console.log('Available docks:', availableDocks)
        
        // Return first available dock, or fallback to random if all occupied
        return availableDocks.length > 0 
          ? availableDocks[0] 
          : allDocks[Math.floor(Math.random() * allDocks.length)]
      }
    } catch (error) {
      console.error('Error finding available dock:', error)
    }
    
    // Fallback to random dock
    const allDocks = ["Dock 1", "Dock 2", "Dock 3", "Dock 4", "Dock 5"]
    return allDocks[Math.floor(Math.random() * allDocks.length)]
  }

  const generateGatePass = () => {
    setIsProcessing(true)
    
    // Auto-assign available dock
    const assignedDock = findAvailableDock()
    
    setTimeout(() => {
      setAssignedDock(assignedDock)
      setIsProcessing(false)
      
      // Update entry status and close drawer
      if (entry) {
        const updatedEntry: GateEntry = {
          ...entry,
          status: "gate-pass-generated",
          vehicleNumber: vehicleNumber,
          gateInTime: gateInTime,
          driver: {
            ...entry.driver,
            licenseNumber: licenseNumber,
            saarathiVerified: driverVerified
          },
          assignedDock: assignedDock,
          gatePassNumber: `GP-${Date.now()}`
        }
        onUpdate(updatedEntry)
        onClose()
      }
    }, 2000)
  }

  // Capture tare weight
  const captureTareWeight = () => {
    setIsWeighingInProgress(true)
    
    // Play beep sound for successful weighing
    const beep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz beep
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
    
    // Simulate weighbridge reading for exactly 4 seconds
    setTimeout(() => {
      const weight = 15000 // 15 tons as requested
      
      // Play beep sound
      try {
        beep()
      } catch (error) {
        console.log("Audio not supported:", error)
      }
      
      setTareWeight(weight)
      setIsWeighingInProgress(false)
      
      // Update entry and close drawer after showing success for 2 seconds
      setTimeout(() => {
        if (entry) {
          const updatedEntry: GateEntry = {
            ...entry,
            status: "tare-weight-captured",
            tareWeight: weight
          }
          onUpdate(updatedEntry)
          onClose()
        }
      }, 2000)
    }, 4000)
  }

  // Start loading process
  const startLoading = () => {
    if (!loadingIncharge) return
    
    setIsProcessing(true)
    
    setTimeout(() => {
      const startTime = new Date().toISOString()
      // Auto-assign dock if not already assigned (use smart assignment)
      const dock = entry?.assignedDock || findAvailableDock()
      setIsProcessing(false)
      
      // Update entry and close drawer - set status to loading-in-dock
      if (entry) {
        const updatedEntry: GateEntry = {
          ...entry,
          status: "loading-in-dock",
          loadingIncharge: loadingIncharge,
          loadingStartTime: startTime,
          assignedDock: dock
        }
        onUpdate(updatedEntry)
        onClose()
      }
    }, 1000)
  }

  // Capture gross weight
  const captureGrossWeight = () => {
    // Check if vehicle is still in loading-in-dock status (checklist not completed)
    if (entry?.status === "loading-in-dock") {
      alert("Please complete the loading checklist at the dock before capturing gross weight.")
      return
    }
    
    setIsWeighingInProgress(true)
    
    // Play beep sound for successful weighing
    const beep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz beep
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
    
    // Simulate weighbridge reading for exactly 4 seconds
    setTimeout(() => {
      const weight = (tareWeight || 15000) + Math.floor(Math.random() * 10000) + 10000 // Add 10-20 tons to tare
      
      // Play beep sound
      try {
        beep()
      } catch (error) {
        console.log("Audio not supported:", error)
      }
      
      setGrossWeight(weight)
      setIsWeighingInProgress(false)
      
      // Update entry and close drawer after showing success for 2 seconds
      setTimeout(() => {
        if (entry) {
          const updatedEntry: GateEntry = {
            ...entry,
            status: "gross-weight-captured",
            grossWeight: weight
          }
          onUpdate(updatedEntry)
          onClose()
        }
      }, 2000)
    }, 4000)
  }

  // Perform gate out
  const performGateOut = () => {
    const gateOutTime = new Date().toISOString()
    
    if (entry) {
      const updatedEntry: GateEntry = {
        ...entry,
        status: "completed",
        gateOutTime: gateOutTime
      }
      onUpdate(updatedEntry)
      onClose()
    }
  }

  // Download gate pass
  const downloadGatePass = () => {
    const gatePassData = {
      gatePassNumber: entry?.gatePassNumber,
      vehicleNumber: vehicleNumber,
      driverName: entry?.driver.name,
      transporterName: entry?.transporter,
      assignedDock: assignedDock,
      gateInTime: gateInTime,
      loadNumber: entry?.loadNumber
    }
    
    const blob = new Blob([JSON.stringify(gatePassData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gate-pass-${vehicleNumber}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Complete the start process
  const completeStartProcess = () => {
    const finalVehicleNumber = scannedPlate || vehicleNumber
    if (entry && finalVehicleNumber && gateInTime && driverVerified) {
      const updatedEntry: GateEntry = {
        ...entry,
        status: "gate-in",
        vehicleNumber: finalVehicleNumber,
        gateInTime: gateInTime,
        driver: {
          ...entry.driver,
          licenseNumber: licenseNumber,
          saarathiVerified: driverVerified,
          verified: true
        }
      }
      onUpdate(updatedEntry)
      onClose()
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const getDrawerTitle = () => {
    switch (actionType) {
      case "start-process": return "Start Gate Process"
      case "generate-gate-pass": return "Generate Gate Pass"
      case "capture-tare-weight": return "Capture Tare Weight"
      case "loading": return "Loading Process"
      case "capture-gross-weight": return "Capture Gross Weight"
      case "gate-out": return "Gate Out Process"
      case "view-details": return "Process Details"
      default: return "Gate Management"
    }
  }

  const toggleAccordion = (processId: string) => {
    setOpenAccordions(prev => 
      prev.includes(processId) 
        ? prev.filter(id => id !== processId)
        : [...prev, processId]
    )
  }

  if (!entry) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">{getDrawerTitle()}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Vehicle and Entry Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Vehicle Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Load Number:</span>
                  <div className="font-medium">{entry.loadNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Trip UID:</span>
                  <div className="font-medium">{entry.tripUID}</div>
                </div>
                <div>
                  <span className="text-gray-600">Driver:</span>
                  <div className="font-medium">{entry.driver.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Transporter:</span>
                  <div className="font-medium">{entry.transporter}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action-specific content */}
          {actionType === "start-process" && (
            <div className="space-y-6">
              {/* Camera Vehicle Number Scanning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Vehicle Number Plate Scanning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!scannedPlate ? (
                    <>
                      <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        {isScanning && (
                          <div className="absolute inset-0 bg-yellow-500/10 border-2 border-yellow-400 animate-pulse">
                            <div className="absolute top-4 left-4 right-4">
                              <div className="bg-yellow-600/90 text-white px-3 py-2 rounded text-sm text-center">
                                📷 LIVE CAMERA FEED - Scanning in progress...
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-black/70 text-white px-3 py-2 rounded text-xs text-center">
                                Please ensure truck number plate is clearly visible
                              </div>
                            </div>
                            {/* Scanning overlay effect */}
                            <div className="absolute inset-x-0 top-1/2 h-1 bg-yellow-400 opacity-70 animate-pulse"></div>
                          </div>
                        )}
                        {!isScanning && (
                          <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                            <div className="bg-gray-700 text-white px-4 py-2 rounded text-sm">
                              📷 Starting camera feed...
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className={`${isScanning ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3 text-center`}>
                        <div className={`text-sm ${isScanning ? 'text-yellow-800' : 'text-gray-800'}`}>
                          {isScanning ? (
                            <>
                              <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                              📷 Scanning for truck number...
                              <div className={`text-xs ${isScanning ? 'text-yellow-600' : 'text-gray-600'} mt-1`}>
                                Live camera feed active - No truck number detected yet
                              </div>
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 inline mr-2" />
                              Starting live camera feed...
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Manual entry option as backup */}
                      <div className="border-t pt-4">
                        <div className="text-center mb-2">
                          <span className="text-sm text-gray-500">If camera fails, enter manually:</span>
                        </div>
                        <div className="space-y-2">
                          <Input
                            id="manual-vehicle"
                            value={vehicleNumber}
                            onChange={(e) => {
                              const value = e.target.value
                              setVehicleNumber(value)
                              setScannedPlate(value)
                              if (isScanning) {
                                setIsScanning(false)
                                stopCamera()
                              }
                            }}
                            placeholder="e.g., KA01AB1234"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {/* Replace camera feed with success display */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 aspect-video flex flex-col items-center justify-center text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                        <div className="text-lg font-semibold text-green-800 mb-2">
                          ✅ Truck Number Successfully Captured
                        </div>
                        <div className="text-3xl font-bold text-green-900 mb-2">
                          {scannedPlate}
                        </div>
                        <div className="text-sm text-green-700">
                          🔊 Beep played - Camera scan complete
                        </div>
                      </div>
                      
                      {!gateInTime ? (
                        <div className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                            <div className="font-medium text-yellow-800">Ready to Mark Gate-In</div>
                            <div className="text-sm text-yellow-700 mt-1">Vehicle number captured. Click below to mark gate-in time.</div>
                          </div>
                          
                          <Button 
                            onClick={markGateIn}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="lg"
                          >
                            <Clock className="h-5 w-5 mr-2" />
                            MARK GATE IN
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="font-medium text-green-800">Gate-In Complete!</div>
                          <div className="text-sm text-green-700 mt-1">
                            Gate-In Time: {new Date(gateInTime).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {actionType === "generate-gate-pass" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Gate Pass Generation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show completed first step */}
                {entry.gateInTime && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Previous Step Completed ✓</span>
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Vehicle scanned, gate-in time captured, driver verified
                    </div>
                  </div>
                )}
                
                {!assignedDock ? (
                  <Button onClick={generateGatePass} disabled={isProcessing} className="w-full">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Gate Pass & Assigning Dock...
                      </>
                    ) : (
                      'Generate Gate Pass'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800 mb-3">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Gate Pass Generated Successfully!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                        <div><span className="font-medium">Gate Pass Number:</span> {entry.gatePassNumber}</div>
                        <div><span className="font-medium">Assigned Dock:</span> {assignedDock}</div>
                        <div><span className="font-medium">Vehicle Number:</span> {vehicleNumber}</div>
                        <div><span className="font-medium">Driver:</span> {entry.driver.name}</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-800 mb-2">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Dock Assignment Based on Availability
                      </div>
                      <div className="text-sm text-blue-700">
                        Vehicle has been automatically assigned to {assignedDock} based on current availability and vehicle type.
                      </div>
                    </div>
                    
                    <Button onClick={downloadGatePass} className="w-full bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Gate Pass PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {actionType === "capture-tare-weight" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5" />
                  <span>Tare Weight Capture</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!tareWeight ? (
                  <div className="space-y-4">
                    {!isWeighingInProgress ? (
                      <>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="text-gray-800 font-medium">
                            Ready to capture tare weight
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            Click below to start weighbridge reading
                          </div>
                        </div>
                        
                        <Button onClick={captureTareWeight} className="w-full bg-blue-600 hover:bg-blue-700">
                          <Scale className="h-4 w-4 mr-2" />
                          START TARE WEIGHT CAPTURE
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {/* Weighbridge simulation UI - Yellow theme during loading */}
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 aspect-video flex flex-col items-center justify-center text-center">
                          <Scale className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />
                          <div className="text-lg font-semibold text-yellow-800 mb-2">
                            ⚖️ Weighbridge Active
                          </div>
                          <div className="text-sm text-yellow-700 mb-4">
                            Reading tare weight from weighbridge...
                          </div>
                          <div className="w-full max-w-xs">
                            <Progress value={75} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="text-yellow-800 font-medium mb-2">
                            🏗️ Hardware Integration: Weighbridge Active (WB001)
                          </div>
                          <div className="text-sm text-yellow-700 mb-2">
                            <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                            Vehicle positioned on weighbridge - Stabilizing weight readings...
                          </div>
                          <div className="text-xs text-yellow-600">
                            Please wait for stable measurement from load cells
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Success display - Green theme */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 aspect-video flex flex-col items-center justify-center text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                      <div className="text-lg font-semibold text-green-800 mb-2">
                        ✅ Tare Weight Successfully Captured
                      </div>
                      <div className="text-3xl font-bold text-green-900 mb-2">
                        {(tareWeight / 1000).toFixed(1)} Tons
                      </div>
                      <div className="text-sm text-green-700">
                        🔊 Beep played - Weighbridge reading complete
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {actionType === "loading" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Capture Loading Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="incharge">Loading Incharge Name *</Label>
                  <Input
                    id="incharge"
                    value={loadingIncharge}
                    onChange={(e) => setLoadingIncharge(e.target.value)}
                    placeholder="Enter loading incharge name"
                    required
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    Auto-Assigned Details
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <span className="font-medium">Dock:</span> {entry.assignedDock}
                    </div>
                    <div>
                      <span className="font-medium">Tare Weight:</span> {entry.tareWeight?.toLocaleString()} kg
                    </div>
                    <div>
                      <span className="font-medium">Loading Start Time:</span> {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="items">Loading Items (Optional)</Label>
                  <Textarea
                    id="items"
                    value={loadingItems}
                    onChange={(e) => setLoadingItems(e.target.value)}
                    placeholder="Enter items being loaded"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={startLoading} 
                  disabled={isProcessing || !loadingIncharge}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Capturing Loading Info...
                    </>
                  ) : (
                    'Capture Loading Information'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {actionType === "capture-gross-weight" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5" />
                  <span>Gross Weight Capture</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-slate-700 mb-2">
                    Previous Measurements
                  </div>
                  <div className="text-sm text-slate-600">
                    Tare Weight: {entry.tareWeight ? `${(entry.tareWeight / 1000).toFixed(1)} Tons` : 'N/A'}
                  </div>
                </div>
                
                {!grossWeight ? (
                  <div className="space-y-4">
                    {!isWeighingInProgress ? (
                      <>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="text-gray-800 font-medium">
                            Ready to capture loaded vehicle weight
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            Click below to start weighbridge reading for gross weight
                          </div>
                        </div>
                        
                        <Button onClick={captureGrossWeight} className="w-full bg-blue-600 hover:bg-blue-700">
                          <Scale className="h-4 w-4 mr-2" />
                          START GROSS WEIGHT CAPTURE
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {/* Weighbridge simulation UI - Yellow theme during loading */}
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 aspect-video flex flex-col items-center justify-center text-center">
                          <Scale className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />
                          <div className="text-lg font-semibold text-yellow-800 mb-2">
                            ⚖️ Weighbridge Active
                          </div>
                          <div className="text-sm text-yellow-700 mb-4">
                            Reading gross weight from weighbridge...
                          </div>
                          <div className="w-full max-w-xs">
                            <Progress value={85} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="text-yellow-800 font-medium mb-2">
                            🏗️ Hardware Integration: Weighbridge Active (WB001)
                          </div>
                          <div className="text-sm text-yellow-700 mb-2">
                            <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                            Loaded vehicle positioned on weighbridge - Capturing gross weight...
                          </div>
                          <div className="text-xs text-yellow-600">
                            Reading final weight including cargo load
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Success display - Green theme */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 aspect-video flex flex-col items-center justify-center text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                      <div className="text-lg font-semibold text-green-800 mb-2">
                        ✅ Gross Weight Successfully Captured
                      </div>
                      <div className="text-3xl font-bold text-green-900 mb-2">
                        {(grossWeight / 1000).toFixed(1)} Tons
                      </div>
                      <div className="text-sm text-green-700">
                        🔊 Beep played - Weighbridge reading complete
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-800 mb-2">
                        Weight Calculation Summary
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                          <span className="font-medium">Gross Weight:</span> {(grossWeight / 1000).toFixed(1)} Tons
                        </div>
                        <div>
                          <span className="font-medium">Tare Weight:</span> {entry.tareWeight ? `${(entry.tareWeight / 1000).toFixed(1)} Tons` : 'N/A'}
                        </div>
                        <div className="col-span-2 pt-2 border-t border-blue-200">
                          <span className="font-medium">Net Cargo Weight:</span>{' '}
                          <span className="text-lg font-bold text-blue-900">
                            {entry.tareWeight ? `${((grossWeight - entry.tareWeight) / 1000).toFixed(1)} Tons` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {actionType === "gate-out" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Capture Gate Out Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-800 mb-3">
                    Process Summary - All Steps Completed ✓
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                    <div><span className="font-medium">Gate-In:</span> {entry.gateInTime ? new Date(entry.gateInTime).toLocaleTimeString() : 'N/A'}</div>
                    <div><span className="font-medium">Dock:</span> {entry.assignedDock || 'N/A'}</div>
                    <div><span className="font-medium">Tare Weight:</span> {entry.tareWeight?.toLocaleString() || 'N/A'} kg</div>
                    <div><span className="font-medium">Gross Weight:</span> {entry.grossWeight?.toLocaleString() || 'N/A'} kg</div>
                    <div><span className="font-medium">Loading Incharge:</span> {entry.loadingIncharge || 'N/A'}</div>
                    <div><span className="font-medium">Net Weight:</span> {entry.grossWeight && entry.tareWeight ? (entry.grossWeight - entry.tareWeight).toLocaleString() : 'N/A'} kg</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    Ready for Gate Out
                  </div>
                  <div className="text-sm text-blue-700">
                    Gate Out Time: {new Date().toLocaleString()}
                  </div>
                </div>
                
                <Button onClick={performGateOut} className="w-full bg-green-600 hover:bg-green-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Capture Gate Out Time & Complete Process
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Process Details View */}
          {actionType === "view-details" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">All Processes Completed Successfully</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Vehicle has completed the full gate management workflow
                </div>
              </div>

              {/* Process Accordions */}
              <div className="space-y-3">
                {/* Gate In Process */}
                <Collapsible open={openAccordions.includes("gate-in")} onOpenChange={() => toggleAccordion("gate-in")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium">Gate In Process</div>
                          <div className="text-sm text-gray-600">Vehicle entry and identification</div>
                        </div>
                      </div>
                      {openAccordions.includes("gate-in") ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Vehicle Number:</span>
                            <div className="text-gray-900">{entry.vehicleNumber}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Gate-In Time:</span>
                            <div className="text-gray-900">
                              {entry.gateInTime ? new Date(entry.gateInTime).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Driver Name:</span>
                            <div className="text-gray-900">{entry.driver.name}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Driver License:</span>
                            <div className="text-gray-900">{entry.driver.licenseNumber || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
                          ✅ Vehicle scanned, gate-in time captured, driver verified
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                {/* Tare Weight Process */}
                <Collapsible open={openAccordions.includes("tare-weight")} onOpenChange={() => toggleAccordion("tare-weight")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Scale className="h-5 w-5 text-yellow-600" />
                        <div className="text-left">
                          <div className="font-medium">Tare Weight Capture</div>
                          <div className="text-sm text-gray-600">Empty vehicle weight measurement</div>
                        </div>
                      </div>
                      {openAccordions.includes("tare-weight") ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Tare Weight:</span>
                            <div className="text-gray-900 text-lg font-semibold">
                              {entry.tareWeight ? `${(entry.tareWeight / 1000).toFixed(1)} Tons` : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Weighbridge:</span>
                            <div className="text-gray-900">WB001</div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-700">
                          ⚖️ Weight captured from electronic weighbridge system
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                {/* Loading Process */}
                <Collapsible open={openAccordions.includes("loading")} onOpenChange={() => toggleAccordion("loading")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-orange-600" />
                        <div className="text-left">
                          <div className="font-medium">Loading Process</div>
                          <div className="text-sm text-gray-600">Cargo loading information</div>
                        </div>
                      </div>
                      {openAccordions.includes("loading") ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Loading Incharge:</span>
                            <div className="text-gray-900">{entry.loadingIncharge || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Assigned Dock:</span>
                            <div className="text-gray-900">{entry.assignedDock || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Loading Start:</span>
                            <div className="text-gray-900">
                              {entry.loadingStartTime ? new Date(entry.loadingStartTime).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Loading End:</span>
                            <div className="text-gray-900">
                              {entry.loadingEndTime ? new Date(entry.loadingEndTime).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-700">
                          🚛 Cargo loaded and secured at designated dock
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                {/* Gross Weight Process */}
                <Collapsible open={openAccordions.includes("gross-weight")} onOpenChange={() => toggleAccordion("gross-weight")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Scale className="h-5 w-5 text-purple-600" />
                        <div className="text-left">
                          <div className="font-medium">Gross Weight Capture</div>
                          <div className="text-sm text-gray-600">Loaded vehicle weight measurement</div>
                        </div>
                      </div>
                      {openAccordions.includes("gross-weight") ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Gross Weight:</span>
                            <div className="text-gray-900 text-lg font-semibold">
                              {entry.grossWeight ? `${(entry.grossWeight / 1000).toFixed(1)} Tons` : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Net Weight:</span>
                            <div className="text-gray-900 text-lg font-semibold">
                              {entry.grossWeight && entry.tareWeight ? 
                                `${((entry.grossWeight - entry.tareWeight) / 1000).toFixed(1)} Tons` : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs text-purple-700">
                          ⚖️ Final weight captured with loaded cargo
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                {/* Gate Out Process */}
                <Collapsible open={openAccordions.includes("gate-out")} onOpenChange={() => toggleAccordion("gate-out")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-red-600" />
                        <div className="text-left">
                          <div className="font-medium">Gate Out Process</div>
                          <div className="text-sm text-gray-600">Vehicle exit and completion</div>
                        </div>
                      </div>
                      {openAccordions.includes("gate-out") ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Gate-Out Time:</span>
                            <div className="text-gray-900">
                              {entry.gateOutTime ? new Date(entry.gateOutTime).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Total Duration:</span>
                            <div className="text-gray-900">
                              {entry.gateInTime && entry.gateOutTime ? 
                                `${Math.round((new Date(entry.gateOutTime).getTime() - new Date(entry.gateInTime).getTime()) / (1000 * 60))} minutes` : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                          🏁 Vehicle successfully completed all processes and exited
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Summary Card */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Process Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Total Time:</span>
                      <div className="text-gray-900 font-semibold">
                        {entry.gateInTime && entry.gateOutTime ? 
                          `${Math.round((new Date(entry.gateOutTime).getTime() - new Date(entry.gateInTime).getTime()) / (1000 * 60))} minutes` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Net Cargo Weight:</span>
                      <div className="text-gray-900 font-semibold">
                        {entry.grossWeight && entry.tareWeight ? 
                          `${((entry.grossWeight - entry.tareWeight) / 1000).toFixed(1)} Tons` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Gate Pass Number:</span>
                      <div className="text-gray-900 font-semibold">{entry.gatePassNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="text-green-600 font-semibold">✅ COMPLETED</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}