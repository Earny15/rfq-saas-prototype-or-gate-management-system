"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, RefreshCw, Plus, MapPin, Ship } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Sidebar from "@/components/sidebar"

interface Shipment {
  id: string
  shipmentId: string
  status: "created" | "in-progress" | "completed" | "cancelled"
  origin: {
    city: string
    port: string
    details: string
  }
  destination: {
    city: string
    port: string
    details: string
  }
  bol: string
  billTo: string
  rfqReference?: string
}

const mockShipments: Shipment[] = [
  {
    id: "1",
    shipmentId: "EXI-AMN-0218",
    status: "in-progress",
    origin: {
      city: "Chennai",
      port: "Ennore, Kamarajar Port",
      details: "Vallur Post, Chennai, India, 600120",
    },
    destination: {
      city: "Rotterdam",
      port: "Port of Rotterdam",
      details: "Wilhelminakade, Rotterdam, Netherlands, 3072 AP",
    },
    bol: "N/A",
    billTo: "Royal Enfield Europe B.V",
  },
  {
    id: "2",
    shipmentId: "EXI-AMN-0212",
    status: "in-progress",
    origin: {
      city: "Chennai",
      port: "Kattupalli Port",
      details: "Kattupalli, Chennai, India, 601206",
    },
    destination: {
      city: "Ashdod",
      port: "Port of Ashdod",
      details: "Ashdod Port, Ashdod, Israel, 7710001",
    },
    bol: "N/A",
    billTo: "David lubinski Ltd",
  },
  {
    id: "3",
    shipmentId: "EXI-AMN-0211",
    status: "in-progress",
    origin: {
      city: "Chennai",
      port: "Kattupalli Port",
      details: "Kattupalli, Chennai, India, 601206",
    },
    destination: {
      city: "Phnom Penh",
      port: "Phnom Penh International Airport",
      details: "Russian Federation Boulevard, Phnom Penh, Cambodia",
    },
    bol: "N/A",
    billTo: "TF Motors(Cambodia) co. Ltd",
  },
]

export default function EximPage() {
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments)
  const [activeTab, setActiveTab] = useState("IN PROGRESS")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      // Get RFQ reference from localStorage
      const rfqReference = localStorage.getItem("rfqReference")
      if (rfqReference) {
        createShipmentFromRFQ(rfqReference)
      }
    }
  }, [searchParams])

  const createShipmentFromRFQ = (rfqId: string) => {
    const newShipment: Shipment = {
      id: Date.now().toString(),
      shipmentId: `EXI-AMN-${String(219 + shipments.length).padStart(4, "0")}`,
      status: "created",
      origin: {
        city: "Chennai",
        port: "Ennore, Kamarajar Port",
        details: "Vallur Post, Chennai, India, 600120",
      },
      destination: {
        city: "New Destination",
        port: "New Port",
        details: "Port details...",
      },
      bol: "N/A",
      billTo: "New Customer",
      rfqReference: rfqId,
    }

    setShipments([newShipment, ...shipments])
    // Clear the RFQ reference
    localStorage.removeItem("rfqReference")

    // Show success message or redirect
    alert(`Shipment ${newShipment.shipmentId} created successfully from RFQ reference!`)
  }

  const tabs = [
    { name: "CREATED", count: 1 },
    { name: "IN PROGRESS", count: 172 },
    { name: "COMPLETED", count: 52 },
    { name: "CANCELLED", count: 2 },
  ]

  const filteredShipments = shipments.filter((shipment) => {
    if (activeTab === "CREATED") return shipment.status === "created"
    if (activeTab === "IN PROGRESS") return shipment.status === "in-progress"
    if (activeTab === "COMPLETED") return shipment.status === "completed"
    if (activeTab === "CANCELLED") return shipment.status === "cancelled"
    return true
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      created: { label: "CIF", variant: "secondary" as const },
      "in-progress": { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "secondary" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    }

    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-16">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Exim</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Branch</span>
                <Select defaultValue="all-branches">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-branches">All Branches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                <Ship className="h-4 w-4 mr-2" />
                EXPORT
              </Button>
              <Button variant="outline">IMPORT</Button>
              <Button variant="outline">
                <Ship className="h-4 w-4 mr-2" />
                BOOKING
              </Button>
              <Search className="h-5 w-5 text-gray-400" />
              <Button className="bg-blue-600 hover:bg-blue-700">ADD BOOKING</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">ADD SHIPMENT</Button>
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                3
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm">STARTED AT | NEWEST</span>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
              <Plus className="h-4 w-4 text-gray-400" />
              <span className="text-sm">ADD FILTER</span>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 bg-transparent">
                RESET
              </Button>
              <RefreshCw className="h-4 w-4 text-gray-400" />
              <Filter className="h-4 w-4 text-gray-400" />
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

          {/* Shipments List */}
          <div className="space-y-4">
            {filteredShipments.map((shipment) => (
              <div key={shipment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Ship className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Shipment ID : {shipment.shipmentId}</h3>
                    <Badge {...getStatusBadge(shipment.status)}>{getStatusBadge(shipment.status).label}</Badge>
                    {shipment.rfqReference && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        From RFQ: {shipment.rfqReference}
                      </Badge>
                    )}
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">VIEW DETAILS</Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Origin */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-600">{shipment.origin.city}</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-5">
                      <div className="font-medium">{shipment.origin.port}</div>
                      <div>{shipment.origin.details}</div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600">{shipment.destination.city}</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-5">
                      <div className="font-medium">{shipment.destination.port}</div>
                      <div>{shipment.destination.details}</div>
                    </div>
                  </div>

                  {/* BOL */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">BOL :</div>
                    <div className="font-medium">{shipment.bol}</div>
                  </div>

                  {/* Bill To */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Bill To :</div>
                    <div className="font-medium">{shipment.billTo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
