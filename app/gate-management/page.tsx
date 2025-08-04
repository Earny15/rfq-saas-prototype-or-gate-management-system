"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Truck, MapPin, FileText, Plus, Scale } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/sidebar"
import GateManagementDrawer from "@/components/gate-management-drawer"

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

const mockGateEntries: GateEntry[] = [
  {
    id: "1",
    vehicleNumber: "NL01AF6722",
    status: "not-started",
    driver: {
      name: "VINOD",
      verified: false,
      number: "7983164736",
    },
    transporter: "Automobile Carriers",
    loadNumber: "H-ABE-A4172",
    tripUID: "A-T-CLF-8896",
    placeByDate: "03/08/2025 11:59 PM",
    route: {
      origin: "Chennai",
      destination: "New Delhi",
      originCode: "600001",
      destinationCode: "110001",
    },
    tags: ["SCOPS", "Outbound"],
  },
  {
    id: "2",
    vehicleNumber: "KA01AR1506",
    status: "gate-in",
    driver: {
      name: "DHIRAJ",
      verified: true,
      number: "7033607303",
      licenseNumber: "DL123456789",
      saarathiVerified: true
    },
    transporter: "TCI Supply Chain Solutions",
    loadNumber: "H-ABE-A4171",
    tripUID: "A-T-CQX-1625",
    placeByDate: "03/08/2025 11:59 PM",
    route: {
      origin: "Mumbai",
      destination: "Gurgaon",
      originCode: "400001",
      destinationCode: "122001",
    },
    tags: ["SCOPS", "Outbound"],
    gateInTime: new Date().toISOString(),
  },
  {
    id: "3",
    vehicleNumber: "NL01N9021",
    status: "gate-pass-generated",
    driver: {
      name: "Sachin",
      verified: true,
      number: "8279847503",
      licenseNumber: "DL987654321",
      saarathiVerified: true
    },
    transporter: "Automobile Carriers",
    loadNumber: "H-ABE-A4169",
    tripUID: "A-T-CLF-8895",
    placeByDate: "03/08/2025 11:59 PM",
    route: {
      origin: "Tamil Nadu",
      destination: "Daboda",
      originCode: "635114",
      destinationCode: "122506",
    },
    tags: ["SCOPS", "Outbound"],
    gateInTime: new Date(Date.now() - 3600000).toISOString(),
    assignedDock: "Dock 3",
    gatePassNumber: "GP-1234567890"
  },
  {
    id: "4",
    vehicleNumber: "KA09D5822",
    status: "tare-weight-captured",
    driver: {
      name: "Panalal",
      verified: true,
      number: "6901764105",
      licenseNumber: "DL555666777",
      saarathiVerified: true
    },
    transporter: "Dhivyasree Transport",
    loadNumber: "H-ABE-A4170",
    tripUID: "A-T-BPL-5603",
    placeByDate: "03/08/2025 11:59 PM",
    route: {
      origin: "Tamil Nadu",
      destination: "Tamil Nadu",
      originCode: "635114",
      destinationCode: "635114",
    },
    tags: ["SCOPS", "Outbound"],
    gateInTime: new Date(Date.now() - 7200000).toISOString(),
    assignedDock: "Dock 1",
    gatePassNumber: "GP-9876543210",
    tareWeight: 12500
  },
  {
    id: "5",
    vehicleNumber: "KA51AL3295",
    status: "completed",
    driver: {
      name: "Rajesh",
      verified: true,
      number: "9876543210",
      licenseNumber: "DL111222333",
      saarathiVerified: true
    },
    transporter: "Express Logistics",
    loadNumber: "H-ABE-A4168",
    tripUID: "A-T-EXP-7890",
    placeByDate: "03/08/2025 11:59 PM",
    route: {
      origin: "Tamil Nadu",
      destination: "Kerala",
      originCode: "635114",
      destinationCode: "682001",
    },
    tags: ["SCOPS", "Outbound"],
    gateInTime: new Date(Date.now() - 86400000).toISOString(),
    gateOutTime: new Date(Date.now() - 43200000).toISOString(),
    assignedDock: "Dock 2",
    gatePassNumber: "GP-5555666777",
    tareWeight: 11800,
    grossWeight: 23400,
    loadingIncharge: "Ram Kumar",
    loadingStartTime: new Date(Date.now() - 82800000).toISOString(),
    loadingEndTime: new Date(Date.now() - 50400000).toISOString()
  },
]

export default function GateManagementPage() {
  const [gateEntries, setGateEntries] = useState<GateEntry[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gateEntries')
        if (saved) {
          const loadedEntries = JSON.parse(saved)
          // Fix any entries with invalid dock assignments (dock numbers > 5)
          const fixedEntries = loadedEntries.map((entry: GateEntry) => {
            if (entry.assignedDock) {
              const dockNumber = parseInt(entry.assignedDock.replace('Dock ', ''))
              if (dockNumber > 5 || isNaN(dockNumber)) {
                // Reassign to a valid dock (1-5)
                const validDock = `Dock ${Math.floor(Math.random() * 5) + 1}`
                console.log(`Fixed invalid dock assignment: ${entry.assignedDock} → ${validDock} for vehicle ${entry.vehicleNumber}`)
                return { ...entry, assignedDock: validDock }
              }
            }
            return entry
          })
          
          
          return fixedEntries
        }
        return mockGateEntries
      } catch (error) {
        console.error('Error loading gate entries:', error)
        return mockGateEntries
      }
    }
    return mockGateEntries
  })
  const [activeTab, setActiveTab] = useState("All")
  const [selectedEntry, setSelectedEntry] = useState<GateEntry | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [actionType, setActionType] = useState<"start-process" | "generate-gate-pass" | "capture-tare-weight" | "loading" | "capture-gross-weight" | "gate-out" | "view-details">("start-process")
  const [dateFilter, setDateFilter] = useState("CREATED ON - LAST 30 DAYS")
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false)
  const [newVehicleData, setNewVehicleData] = useState({
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    transporter: "",
    origin: "",
    destination: ""
  })

  // Function to create a fresh test vehicle
  const createFreshTestVehicle = () => {
    const vehicleNumber = `FRESH${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
    const driverNames = ["Rajesh Kumar", "Priya Singh", "Amit Patel", "Sunita Sharma", "Vikram Gupta"]
    const transporters = ["Test Transport Ltd", "Demo Logistics", "Sample Carriers", "Trial Freight", "Fresh Transport"]
    
    return {
      id: `fresh-${Date.now()}`,
      vehicleNumber: vehicleNumber,
      status: "not-started" as const,
      driver: {
        name: driverNames[Math.floor(Math.random() * driverNames.length)],
        verified: false,
        number: `9${Math.floor(Math.random() * 900000000) + 100000000}`
      },
      transporter: transporters[Math.floor(Math.random() * transporters.length)],
      loadNumber: `H-FRESH-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      tripUID: `T-FRESH-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      placeByDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + " 11:59 PM",
      route: {
        origin: "Delhi",
        destination: "Mumbai", 
        originCode: "110001",
        destinationCode: "400001"
      },
      tags: ["Fresh", "Ready", "Outbound"]
    }
  }

  // Function to reset localStorage and use fresh mock data
  const resetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gateEntries')
      // Always include one fresh test vehicle for immediate testing
      const freshVehicle = createFreshTestVehicle()
      const resetEntries = [freshVehicle, ...mockGateEntries]
      setGateEntries(resetEntries)
      alert(`Data reset! Fresh test vehicle ${freshVehicle.vehicleNumber} added for testing.`)
    }
  }

  // Function to add new vehicle
  const addNewVehicle = () => {
    if (!newVehicleData.vehicleNumber || !newVehicleData.driverName || !newVehicleData.driverPhone) {
      alert('Please fill in all required fields (Vehicle Number, Driver Name, Driver Phone)')
      return
    }

    const newEntry: GateEntry = {
      id: `new-${Date.now()}`,
      vehicleNumber: newVehicleData.vehicleNumber.toUpperCase(),
      status: "not-started",
      driver: {
        name: newVehicleData.driverName,
        verified: false,
        number: newVehicleData.driverPhone
      },
      transporter: newVehicleData.transporter || "Transport Co.",
      loadNumber: `H-NEW-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      tripUID: `T-NEW-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      placeByDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + " 11:59 PM",
      route: {
        origin: newVehicleData.origin || "Delhi",
        destination: newVehicleData.destination || "Mumbai",
        originCode: "110001",
        destinationCode: "400001"
      },
      tags: ["New", "Outbound"]
    }

    setGateEntries(prev => [newEntry, ...prev])
    setNewVehicleData({
      vehicleNumber: "",
      driverName: "",
      driverPhone: "",
      transporter: "",
      origin: "",
      destination: ""
    })
    setIsAddVehicleOpen(false)
    alert(`New vehicle ${newEntry.vehicleNumber} added successfully!`)
  }

  // Function to quickly add test vehicle
  const addQuickTestVehicle = () => {
    const vehicleNumber = `TEST${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
    const driverNames = ["Arjun Singh", "Priya Sharma", "Vikram Patel", "Sunita Gupta", "Ravi Kumar"]
    const transporters = ["Express Logistics", "Fast Transport", "Reliable Carriers", "Speed Logistics", "Quick Freight"]
    const cities = [
      {name: "Chennai", code: "600001"}, 
      {name: "Bangalore", code: "560001"}, 
      {name: "Hyderabad", code: "500001"},
      {name: "Pune", code: "411001"},
      {name: "Ahmedabad", code: "380001"}
    ]

    const origin = cities[Math.floor(Math.random() * cities.length)]
    const destination = cities[Math.floor(Math.random() * cities.length)]

    const newEntry: GateEntry = {
      id: `quick-${Date.now()}`,
      vehicleNumber: vehicleNumber,
      status: "not-started",
      driver: {
        name: driverNames[Math.floor(Math.random() * driverNames.length)],
        verified: false,
        number: `9${Math.floor(Math.random() * 900000000) + 100000000}`
      },
      transporter: transporters[Math.floor(Math.random() * transporters.length)],
      loadNumber: `H-QUICK-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      tripUID: `T-QUICK-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      placeByDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + " 11:59 PM",
      route: {
        origin: origin.name,
        destination: destination.name,
        originCode: origin.code,
        destinationCode: destination.code
      },
      tags: ["Quick", "Test", "Outbound"]
    }

    setGateEntries(prev => [newEntry, ...prev])
    alert(`Quick test vehicle ${newEntry.vehicleNumber} added!`)
  }

  // Save to localStorage whenever gateEntries changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gateEntries', JSON.stringify(gateEntries))
        
        // Only log when there are vehicles with loading status
        const loadingVehicles = gateEntries.filter(e => e.status === "loading-in-dock" || e.status === "loading")
        if (loadingVehicles.length > 0) {
          console.log('Gate Management - Vehicles in loading status:', loadingVehicles.map(v => ({
            id: v.id,
            vehicleNumber: v.vehicleNumber,
            status: v.status,
            assignedDock: v.assignedDock
          })))
        }
      } catch (error) {
        console.error('Error saving gate entries:', error)
      }
    }
  }, [gateEntries])

  // Listen for updates from dock management (polling approach)
  useEffect(() => {
    const pollForUpdates = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('gateEntries')
          if (saved) {
            const loadedEntries = JSON.parse(saved)
            // Only update if there's actually a difference to avoid infinite loops
            const currentSerialized = JSON.stringify(gateEntries)
            const savedSerialized = JSON.stringify(loadedEntries)
            if (currentSerialized !== savedSerialized) {
              setGateEntries(loadedEntries)
            }
          }
        } catch (error) {
          console.error('Error loading gate entries updates:', error)
        }
      }
    }

    const interval = setInterval(pollForUpdates, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [gateEntries])

  const handleEntryClick = (entry: GateEntry) => {
    setSelectedEntry(entry)
    setIsDrawerOpen(true)
  }

  const handleActionClick = (entry: GateEntry, action: typeof actionType) => {
    setSelectedEntry(entry)
    setActionType(action)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedEntry(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "not-started": { label: "NOT STARTED", className: "bg-gray-100 text-gray-700" },
      "gate-in": { label: "GATE IN", className: "bg-blue-100 text-blue-700" },
      "gate-pass-generated": { label: "GATE PASS GENERATED", className: "bg-green-100 text-green-700" },
      "tare-weight-captured": { label: "TARE WEIGHT CAPTURED", className: "bg-yellow-100 text-yellow-700" },
      "loading-in-dock": { label: "LOADING IN DOCK", className: "bg-orange-100 text-orange-700" },
      "loading": { label: "LOADING", className: "bg-orange-100 text-orange-700" },
      "gross-weight-captured": { label: "GROSS WEIGHT CAPTURED", className: "bg-purple-100 text-purple-700" },
      "gate-out": { label: "GATE OUT", className: "bg-indigo-100 text-indigo-700" },
      "completed": { label: "COMPLETED", className: "bg-green-100 text-green-700" },
      "rejected": { label: "REJECTED", className: "bg-red-100 text-red-700" },
      "cancelled": { label: "CANCELLED", className: "bg-gray-100 text-gray-700" },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["not-started"]
  }

  const getActionButtons = (entry: GateEntry) => {
    switch (entry.status) {
      case "not-started":
        return (
          <Button
            onClick={() => handleActionClick(entry, "start-process")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
          >
            GATE IN
          </Button>
        )
      case "gate-in":
        return (
          <Button
            onClick={() => handleActionClick(entry, "capture-tare-weight")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
          >
            CAPTURE TARE WEIGHT
          </Button>
        )
      case "gate-pass-generated":
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs px-2 py-1 h-7"
              onClick={() => handleActionClick(entry, "capture-tare-weight")}
            >
              <Scale className="h-3 w-3 mr-1" />
              CAPTURE TARE WEIGHT
            </Button>
          </div>
        )
      case "tare-weight-captured":
        return (
          <Button
            onClick={() => handleActionClick(entry, "loading")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
          >
            CAPTURE LOADING INFO
          </Button>
        )
      case "loading-in-dock":
        return (
          <div className="flex items-center space-x-2">
            <Link href="/dock-management">
              <Badge className="bg-orange-100 text-orange-700 text-xs hover:bg-orange-200 cursor-pointer transition-colors">
                Loading in {entry.assignedDock} →
              </Badge>
            </Link>
            <span className="text-xs text-gray-500">Click to view in dock management</span>
          </div>
        )
      case "loading":
        return (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleActionClick(entry, "capture-gross-weight")}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-8"
            >
              CAPTURE GROSS WEIGHT
            </Button>
            <Badge className="bg-green-100 text-green-700 text-xs">
              Loading Complete
            </Badge>
          </div>
        )
      case "gross-weight-captured":
        return (
          <Button
            onClick={() => handleActionClick(entry, "gate-out")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
          >
            CAPTURE GATE OUT
          </Button>
        )
      case "gate-out":
        return (
          <Button
            onClick={() => handleActionClick(entry, "gate-out")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
          >
            COMPLETE GATE OUT
          </Button>
        )
      case "completed":
        return (
          <Button
            onClick={() => handleActionClick(entry, "view-details")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
          >
            DETAILS
          </Button>
        )
      case "rejected":
      case "cancelled":
        return (
          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7 bg-transparent">
            <FileText className="h-3 w-3 mr-1" />
            DOCUMENTS
          </Button>
        )
      default:
        return (
          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7 bg-transparent">
            <FileText className="h-3 w-3 mr-1" />
            DOCUMENTS
          </Button>
        )
    }
  }

  // Define which statuses belong to each stage
  const createdStatuses = ["not-started"]
  const inProgressStatuses = ["gate-in", "gate-pass-generated", "tare-weight-captured", "loading-in-dock", "loading", "gross-weight-captured", "gate-out"]
  const completedStatuses = ["completed"]
  const rejectedStatuses = ["rejected"]
  const cancelledStatuses = ["cancelled"]
  const actionDueStatuses = ["not-started", "gate-in", "gate-pass-generated", "tare-weight-captured", "loading", "gross-weight-captured", "gate-out"]

  const tabs = [
    { name: "All", count: gateEntries.length },
    { name: "Created", count: gateEntries.filter((e) => createdStatuses.includes(e.status)).length },
    { name: "In Progress", count: gateEntries.filter((e) => inProgressStatuses.includes(e.status)).length },
    { name: "Completed", count: gateEntries.filter((e) => completedStatuses.includes(e.status)).length },
    { name: "Rejected", count: gateEntries.filter((e) => rejectedStatuses.includes(e.status)).length },
    { name: "Cancelled", count: gateEntries.filter((e) => cancelledStatuses.includes(e.status)).length },
    {
      name: "Action Due",
      count: gateEntries.filter((e) => actionDueStatuses.includes(e.status)).length,
    },
  ]

  const filteredEntries = gateEntries.filter((entry) => {
    if (activeTab === "All") return true
    if (activeTab === "Created") return createdStatuses.includes(entry.status)
    if (activeTab === "In Progress") return inProgressStatuses.includes(entry.status)
    if (activeTab === "Completed") return completedStatuses.includes(entry.status)
    if (activeTab === "Rejected") return rejectedStatuses.includes(entry.status)
    if (activeTab === "Cancelled") return cancelledStatuses.includes(entry.status)
    if (activeTab === "Action Due") return actionDueStatuses.includes(entry.status)
    return true
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-16">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Gate Management</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Branch</span>
                <Select defaultValue="all-branches">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-branches">All Branches</SelectItem>
                    <SelectItem value="chennai">Chennai Branch</SelectItem>
                    <SelectItem value="mumbai">Mumbai Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    ADD VEHICLE
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="vehicleNumber" className="text-right">
                        Vehicle No.*
                      </Label>
                      <Input
                        id="vehicleNumber"
                        value={newVehicleData.vehicleNumber}
                        onChange={(e) => setNewVehicleData(prev => ({...prev, vehicleNumber: e.target.value}))}
                        className="col-span-3"
                        placeholder="e.g., KA01AB1234"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="driverName" className="text-right">
                        Driver Name*
                      </Label>
                      <Input
                        id="driverName"
                        value={newVehicleData.driverName}
                        onChange={(e) => setNewVehicleData(prev => ({...prev, driverName: e.target.value}))}
                        className="col-span-3"
                        placeholder="e.g., Rajesh Kumar"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="driverPhone" className="text-right">
                        Driver Phone*
                      </Label>
                      <Input
                        id="driverPhone"
                        value={newVehicleData.driverPhone}
                        onChange={(e) => setNewVehicleData(prev => ({...prev, driverPhone: e.target.value}))}
                        className="col-span-3"
                        placeholder="e.g., 9876543210"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="transporter" className="text-right">
                        Transporter
                      </Label>
                      <Input
                        id="transporter"
                        value={newVehicleData.transporter}
                        onChange={(e) => setNewVehicleData(prev => ({...prev, transporter: e.target.value}))}
                        className="col-span-3"
                        placeholder="e.g., ABC Transport Ltd"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="origin" className="text-right">
                        Origin
                      </Label>
                      <Input
                        id="origin"
                        value={newVehicleData.origin}
                        onChange={(e) => setNewVehicleData(prev => ({...prev, origin: e.target.value}))}
                        className="col-span-3"
                        placeholder="e.g., Delhi"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="destination" className="text-right">
                        Destination
                      </Label>
                      <Input
                        id="destination"
                        value={newVehicleData.destination}
                        onChange={(e) => setNewVehicleData(prev => ({...prev, destination: e.target.value}))}
                        className="col-span-3"
                        placeholder="e.g., Mumbai"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addNewVehicle} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Add Vehicle
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                onClick={addQuickTestVehicle}
                variant="outline" 
                className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                QUICK ADD
              </Button>
              <Button 
                onClick={resetData}
                variant="outline" 
                className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                RESET DATA
              </Button>
              <Search className="h-5 w-5 text-gray-400" />
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                2
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
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

          {/* Date Filter */}
          <div className="mb-6">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREATED ON - LAST 30 DAYS">CREATED ON - LAST 30 DAYS</SelectItem>
                <SelectItem value="CREATED ON - LAST 7 DAYS">CREATED ON - LAST 7 DAYS</SelectItem>
                <SelectItem value="CREATED ON - TODAY">CREATED ON - TODAY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verify Details Button */}
          <div className="mb-4">
            <Button variant="outline" className="text-blue-600 border-blue-200 bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              VERIFY DETAILS
            </Button>
          </div>

          {/* Gate Entries List */}
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{entry.vehicleNumber}</h3>
                    </div>
                    <div className="flex space-x-2">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Tags
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`text-xs font-medium ${getStatusBadge(entry.status).className}`}>
                      {getStatusBadge(entry.status).label}
                    </Badge>
                    {getActionButtons(entry)}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Driver Information */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Driver:</div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{entry.driver.name}</span>
                      {entry.driver.verified && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Driver Number:</div>
                    <div className="font-medium text-gray-900">{entry.driver.number}</div>
                  </div>

                  {/* Transporter Information */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Transporter:</div>
                    <div className="font-medium text-gray-900">{entry.transporter}</div>
                    <div className="text-sm text-gray-600">Trip UID:</div>
                    <div className="font-medium text-gray-900">{entry.tripUID}</div>
                  </div>

                  {/* Load Information */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Load No.:</div>
                    <div className="font-medium text-gray-900">{entry.loadNumber}</div>
                    <div className="text-sm text-gray-600">Place By Date:</div>
                    <div className="font-medium text-gray-900">{entry.placeByDate}</div>
                  </div>

                  {/* Route Information */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                      <MapPin className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{entry.route.origin}</div>
                        <div className="text-sm text-gray-600">{entry.route.originCode}</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="font-medium text-gray-900">{entry.route.destination}</div>
                        <div className="text-sm text-gray-600">{entry.route.destinationCode}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verify Details Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="text-blue-600 border-blue-200 bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    VERIFIED DETAILS
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No gate entries found for the selected filter</p>
            </div>
          )}
        </div>

        <GateManagementDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          entry={selectedEntry}
          actionType={actionType}
          onUpdate={(updatedEntry) => {
            setGateEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
          }}
        />

      </div>
    </div>
  )
}
