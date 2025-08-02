"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Camera, 
  Check, 
  Clock, 
  Truck, 
  User, 
  CreditCard, 
  MapPin, 
  Scale, 
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
  FileText
} from "lucide-react"

interface GateProcessStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  description: string
}

interface VehicleData {
  plateNumber: string
  confidence: number
  timestamp: string
}

interface DriverData {
  name: string
  licenseNumber: string
  phone: string
  verified: boolean
  saarathiStatus: 'pending' | 'verified' | 'invalid'
}

interface DockAssignment {
  dockId: string
  dockName: string
  estimatedTime: string
}

interface WeightData {
  tareWeight: number
  timestamp: string
  bridgeId: string
}

interface LoadingData {
  inchargeName: string
  startTime: string
  dockAssignment: DockAssignment
  loadingItems: string[]
}

export default function GateProcessWorkflow({ 
  isOpen, 
  onClose, 
  entryId 
}: { 
  isOpen: boolean
  onClose: () => void
  entryId: string
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [driverData, setDriverData] = useState<DriverData | null>(null)
  const [dockAssignment, setDockAssignment] = useState<DockAssignment | null>(null)
  const [weightData, setWeightData] = useState<WeightData | null>(null)
  const [loadingData, setLoadingData] = useState<LoadingData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [gateInTime, setGateInTime] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)

  const steps: GateProcessStep[] = [
    {
      id: 'camera-scan',
      title: 'Vehicle Number Plate Scanning',
      status: vehicleData ? 'completed' : currentStep === 0 ? 'in-progress' : 'pending',
      description: 'Camera reading vehicle number plate automatically'
    },
    {
      id: 'gate-in',
      title: 'Gate-In Time Capture',
      status: gateInTime ? 'completed' : currentStep === 1 ? 'in-progress' : 'pending',
      description: 'Recording vehicle entry time'
    },
    {
      id: 'license-verify',
      title: 'Driver License Verification',
      status: driverData?.saarathiStatus === 'verified' ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
      description: 'Verifying driver license with Saarathi database'
    },
    {
      id: 'gate-pass',
      title: 'Gate Pass Generation',
      status: dockAssignment ? 'completed' : currentStep === 3 ? 'in-progress' : 'pending',
      description: 'Generating gate pass with dock assignment'
    },
    {
      id: 'tare-weight',
      title: 'Tare Weight Capture',
      status: weightData ? 'completed' : currentStep === 4 ? 'in-progress' : 'pending',
      description: 'Capturing vehicle weight through weighbridge'
    },
    {
      id: 'loading-info',
      title: 'Loading Information',
      status: loadingData ? 'completed' : currentStep === 5 ? 'in-progress' : 'pending',
      description: 'Recording loading details and assignment'
    }
  ]

  // Simulate camera initialization
  useEffect(() => {
    if (isOpen && currentStep === 0) {
      initializeCamera()
    }
  }, [isOpen, currentStep])

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const startPlateScanning = () => {
    setIsScanning(true)
    setIsProcessing(true)
    
    // Simulate plate detection
    setTimeout(() => {
      const mockPlateData: VehicleData = {
        plateNumber: "KA01AB1234",
        confidence: 98.5,
        timestamp: new Date().toISOString()
      }
      setVehicleData(mockPlateData)
      setIsScanning(false)
      setIsProcessing(false)
      
      // Auto-capture gate-in time
      setTimeout(() => {
        setGateInTime(new Date().toISOString())
        setCurrentStep(2)
      }, 1000)
    }, 3000)
  }

  const verifyDriverLicense = async (licenseNumber: string) => {
    setIsProcessing(true)
    
    // Simulate Saarathi API call
    setTimeout(() => {
      const mockDriverData: DriverData = {
        name: "Rajesh Kumar",
        licenseNumber: licenseNumber,
        phone: "9876543210",
        verified: true,
        saarathiStatus: 'verified'
      }
      setDriverData(mockDriverData)
      setIsProcessing(false)
      setCurrentStep(3)
    }, 2000)
  }

  const generateGatePass = async () => {
    setIsProcessing(true)
    
    // Auto-assign available dock
    const availableDocks = [
      { dockId: "D001", dockName: "Dock 1", estimatedTime: "30 mins" },
      { dockId: "D002", dockName: "Dock 3", estimatedTime: "45 mins" },
      { dockId: "D003", dockName: "Dock 5", estimatedTime: "1 hour" }
    ]
    
    setTimeout(() => {
      const assignedDock = availableDocks[0] // Auto-assign first available
      setDockAssignment(assignedDock)
      setIsProcessing(false)
      setCurrentStep(4)
    }, 1500)
  }

  const captureWeight = () => {
    setIsProcessing(true)
    
    // Simulate weighbridge reading
    setTimeout(() => {
      const mockWeightData: WeightData = {
        tareWeight: 12500, // kg
        timestamp: new Date().toISOString(),
        bridgeId: "WB001"
      }
      setWeightData(mockWeightData)
      setIsProcessing(false)
      setCurrentStep(5)
    }, 4000)
  }

  const recordLoadingInfo = (data: Partial<LoadingData>) => {
    const loadingInfo: LoadingData = {
      inchargeName: data.inchargeName || "",
      startTime: new Date().toISOString(),
      dockAssignment: dockAssignment!,
      loadingItems: data.loadingItems || []
    }
    setLoadingData(loadingInfo)
    // Process complete
  }

  const downloadGatePass = () => {
    // Generate and download PDF gate pass
    const gatePassData = {
      vehicleNumber: vehicleData?.plateNumber,
      driverName: driverData?.name,
      dockAssignment: dockAssignment?.dockName,
      gateInTime: gateInTime,
      tareWeight: weightData?.tareWeight
    }
    
    // Mock PDF generation
    const blob = new Blob([JSON.stringify(gatePassData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gate-pass-${vehicleData?.plateNumber}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStepIcon = (step: GateProcessStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Process Steps */}
          <div className="w-80 bg-slate-50 border-r border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Gate Process</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900">{step.title}</span>
                      {step.status === 'completed' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Progress: {steps.filter(s => s.status === 'completed').length} / {steps.length}
              </div>
              <Progress 
                value={(steps.filter(s => s.status === 'completed').length / steps.length) * 100} 
                className="h-2"
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Step 1: Camera Scanning */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Vehicle Number Plate Scanning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-black rounded-lg p-4 aspect-video relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover rounded"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded animate-pulse">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                            Scanning plate...
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {vehicleData ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Vehicle Number Detected</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-green-900">
                        {vehicleData.plateNumber}
                      </div>
                      <div className="text-sm text-green-700">
                        Confidence: {vehicleData.confidence}% | Time: {new Date(vehicleData.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={startPlateScanning} 
                      disabled={isScanning}
                      className="w-full"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Plate Scanning
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: License Verification */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Driver License Verification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gateInTime && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">Gate-In Time Recorded</span>
                      </div>
                      <div className="text-lg font-semibold text-blue-900 mt-1">
                        {new Date(gateInTime).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {!driverData ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="license">Driver License Number</Label>
                        <Input 
                          id="license" 
                          placeholder="Enter license number"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              verifyDriverLicense(e.currentTarget.value)
                            }
                          }}
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          const input = document.getElementById('license') as HTMLInputElement
                          verifyDriverLicense(input.value)
                        }}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying with Saarathi...
                          </>
                        ) : (
                          'Verify License'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800 mb-3">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Driver Verified</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <div className="font-medium">{driverData.name}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">License:</span>
                          <div className="font-medium">{driverData.licenseNumber}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <div className="font-medium">{driverData.phone}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Gate Pass Generation */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Gate Pass Generation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!dockAssignment ? (
                    <div className="text-center">
                      <Button onClick={generateGatePass} disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Assigning Dock...
                          </>
                        ) : (
                          'Generate Gate Pass'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-blue-800 mb-3">
                          <MapPin className="h-5 w-5" />
                          <span className="font-medium">Dock Assigned</span>
                        </div>
                        <div className="text-xl font-bold text-blue-900">
                          {dockAssignment.dockName}
                        </div>
                        <div className="text-sm text-blue-700">
                          Estimated Time: {dockAssignment.estimatedTime}
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-white">
                        <h3 className="font-medium mb-3">Gate Pass Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Vehicle:</span>
                            <div className="font-medium">{vehicleData?.plateNumber}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Driver:</span>
                            <div className="font-medium">{driverData?.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Dock:</span>
                            <div className="font-medium">{dockAssignment.dockName}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Gate-In:</span>
                            <div className="font-medium">{new Date(gateInTime).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <Button onClick={downloadGatePass} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Gate Pass PDF
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Tare Weight Capture */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Scale className="h-5 w-5" />
                    <span>Tare Weight Capture</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!weightData ? (
                    <div className="text-center space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-yellow-800 font-medium">
                          Please position vehicle on weighbridge
                        </div>
                        <div className="text-sm text-yellow-700 mt-1">
                          Weight will be captured automatically when stable
                        </div>
                      </div>
                      
                      <Button onClick={captureWeight} disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Capturing Weight...
                          </>
                        ) : (
                          'Start Weight Capture'
                        )}
                      </Button>
                      
                      {isProcessing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-blue-800 font-medium mb-2">
                            Weighbridge Status: Active
                          </div>
                          <div className="text-sm text-blue-700">
                            Bridge ID: WB001 | Stabilizing readings...
                          </div>
                          <Progress value={65} className="mt-2" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800 mb-3">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Weight Captured</span>
                      </div>
                      <div className="text-3xl font-bold text-green-900">
                        {weightData.tareWeight.toLocaleString()} kg
                      </div>
                      <div className="text-sm text-green-700">
                        Bridge: {weightData.bridgeId} | Time: {new Date(weightData.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Loading Information */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Loading Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!loadingData ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="incharge">Loading Incharge Name</Label>
                        <Input id="incharge" placeholder="Enter incharge name" />
                      </div>
                      
                      <div>
                        <Label htmlFor="items">Loading Items</Label>
                        <Textarea 
                          id="items" 
                          placeholder="Enter items to be loaded"
                          rows={3}
                        />
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-slate-700 mb-2">
                          Auto-Assigned Details
                        </div>
                        <div className="text-sm text-slate-600">
                          Dock: {dockAssignment?.dockName}<br/>
                          Start Time: {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          const incharge = (document.getElementById('incharge') as HTMLInputElement).value
                          const items = (document.getElementById('items') as HTMLTextAreaElement).value.split('\n')
                          recordLoadingInfo({ inchargeName: incharge, loadingItems: items })
                        }}
                        className="w-full"
                      >
                        Complete Process
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800 mb-3">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Loading Process Initiated</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Incharge:</span>
                          <div className="font-medium">{loadingData.inchargeName}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Start Time:</span>
                          <div className="font-medium">{new Date(loadingData.startTime).toLocaleTimeString()}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button onClick={onClose} className="w-full">
                          Close & Continue to Loading
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}