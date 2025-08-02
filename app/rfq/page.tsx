"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MoreVertical, MapPin, Calendar, Plus, RefreshCw } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import RFQDrawer from "@/components/rfq-drawer"
import Sidebar from "@/components/sidebar"

interface RFQ {
  id: string
  rfqNumber: string
  status: "live" | "closed" | "cancelled"
  origin: {
    city: string
    details: string
  }
  destination: {
    city: string
    details: string
  }
  distance: string
  transporterName: string
  placeByDate: string
  quotes: {
    count: number
    bestPrice: string
    bestOf: number
    units: string
  }
  units: string
  weight: string
  isLegRFQ?: boolean
  legName?: string
  shipmentId?: string
  selectedLSPs?: string[]
}

const mockRFQs: RFQ[] = [
  {
    id: "1",
    rfqNumber: "RFQ-I-AAA-1162",
    status: "live",
    origin: {
      city: "YES SOLUTION...",
      details: "GHAZIABA... (144004)",
    },
    destination: {
      city: "GLOBAL INDIA...",
      details: "AHMEDABA... (380006)",
    },
    distance: "1710 KM",
    transporterName: "Sales Demo",
    placeByDate: "22/07/2025 11:59 AM",
    quotes: {
      count: 2,
      bestPrice: "Rs. 50000",
      bestOf: 1,
      units: "units",
    },
    units: "2 Tons",
    weight: "2 Tons",
  },
  {
    id: "2",
    rfqNumber: "RFQ-I-AAA-1161",
    status: "live",
    origin: {
      city: "GLOBAL INDIA...",
      details: "AHMEDABA... (380006)",
    },
    destination: {
      city: "YES SOLUTION...",
      details: "GHAZIABA... (144004)",
    },
    distance: "1706 KM",
    transporterName: "Sales Demo",
    placeByDate: "22/07/2025 11:59 AM",
    quotes: {
      count: 4,
      bestPrice: "Rs. 16000",
      bestOf: 2,
      units: "units",
    },
    units: "4 Tons",
    weight: "4 Tons",
  },
]

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>(mockRFQs)
  const [activeTab, setActiveTab] = useState("LIVE")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setIsDrawerOpen(true)
    }
  }, [searchParams])

  const handleCreateRFQ = (rfqData: any) => {
    // Handle regular RFQ creation
    if (rfqData.action === "shipment" && rfqData.legs) {
      // Create shipment and generate leg RFQs
      const legRFQs: RFQ[] = []

      Object.entries(rfqData.legs).forEach(([legId, legData]: [string, any]) => {
        if (legData.isRFQ && legData.rfqData) {
          const legRFQ: RFQ = {
            id: `leg-${Date.now()}-${legId}`,
            rfqNumber: `RFQ-LEG-${1163 + rfqs.length + legRFQs.length}`,
            status: "live",
            origin: {
              city: rfqData.source || "Origin",
              details: "Leg specific origin",
            },
            destination: {
              city: rfqData.destination || "Destination",
              details: "Leg specific destination",
            },
            distance: "N/A",
            transporterName: "Multiple LSPs",
            placeByDate: legData.rfqData.endTime,
            quotes: {
              count: 0,
              bestPrice: "Rs. 0",
              bestOf: 0,
              units: "service",
            },
            units: "Service",
            weight: "N/A",
            isLegRFQ: true,
            legName: legId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            shipmentId: rfqData.bookingNumber,
            selectedLSPs: legData.rfqData.selectedLSPs,
          }
          legRFQs.push(legRFQ)
        }
      })

      setRfqs([...legRFQs, ...rfqs])
      setIsDrawerOpen(false)

      // Show success message
      if (legRFQs.length > 0) {
        alert(`Shipment created successfully! ${legRFQs.length} leg RFQ(s) have been generated.`)
      }
    } else {
      // Handle regular RFQ creation
      const newRFQ: RFQ = {
        id: Date.now().toString(),
        rfqNumber: `RFQ-I-AAA-${1163 + rfqs.length}`,
        status: "live",
        origin: {
          city: rfqData.origin || "New Origin",
          details: "Details...",
        },
        destination: {
          city: rfqData.destination || "New Destination",
          details: "Details...",
        },
        distance: "1500 KM",
        transporterName: rfqData.transporterName || "Sales Demo",
        placeByDate: new Date().toLocaleDateString(),
        quotes: {
          count: 0,
          bestPrice: "Rs. 0",
          bestOf: 0,
          units: "units",
        },
        units: rfqData.weight || "1 Ton",
        weight: rfqData.weight || "1 Ton",
      }

      setRfqs([newRFQ, ...rfqs])
      setIsDrawerOpen(false)
    }
  }

  const handlePurchaseOrder = (rfqId: string) => {
    // Store RFQ reference for EXIM shipment creation
    localStorage.setItem("rfqReference", rfqId)
    router.push("/exim?action=create")
  }

  const tabs = [
    { name: "LIVE", count: rfqs.filter((r) => r.status === "live").length },
    { name: "CLOSED", count: 603 },
    { name: "CANCELLED", count: 560 },
  ]

  const filteredRFQs = rfqs.filter((rfq) => {
    if (activeTab === "LIVE") return rfq.status === "live"
    if (activeTab === "CLOSED") return rfq.status === "closed"
    if (activeTab === "CANCELLED") return rfq.status === "cancelled"
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
              <h1 className="text-xl font-semibold">RFQ</h1>
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
              <Search className="h-5 w-5 text-gray-400" />
              <Button onClick={() => setIsDrawerOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                ADD
              </Button>
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">50+</div>
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm">UID | NEWEST</span>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">CREATED ON - ALL</span>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 bg-transparent">
                RESET
              </Button>
              <RefreshCw className="h-4 w-4 text-gray-400" />
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                1
              </div>
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

          {/* RFQ List */}
          <div className="space-y-4">
            {filteredRFQs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{rfq.rfqNumber}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      RFQ Manually Approved
                    </Badge>
                    {rfq.isLegRFQ && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Leg RFQ: {rfq.legName}
                      </Badge>
                    )}
                    {rfq.shipmentId && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Shipment: {rfq.shipmentId}
                      </Badge>
                    )}
                  </div>
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Route Information */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2"></div>
                      <MapPin className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{rfq.origin.city}</div>
                      <div className="text-gray-500">{rfq.origin.details}</div>
                      <div className="text-center text-gray-400 my-1">{rfq.distance}</div>
                      <div className="font-medium">{rfq.destination.city}</div>
                      <div className="text-gray-500">{rfq.destination.details}</div>
                    </div>
                  </div>

                  {/* Transporter Details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Transporter Name:</span>
                      <span className="text-sm font-medium">{rfq.transporterName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Place By Date:</span>
                      <span className="text-sm font-medium">{rfq.placeByDate}</span>
                    </div>
                    {rfq.selectedLSPs && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">LSPs:</span>
                        <span className="text-sm font-medium">{rfq.selectedLSPs.length} selected</span>
                      </div>
                    )}
                  </div>

                  {/* Quote Information */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Quotes ({rfq.quotes.count} {rfq.quotes.units}):
                      </span>
                      <span className="text-sm font-medium">
                        {rfq.quotes.bestPrice} Best Of {rfq.quotes.bestOf}
                      </span>
                      <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                        View More
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Units:</span>
                      <span className="text-sm font-medium">{rfq.units}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                      <Button variant="outline" size="sm">
                        Indent Details
                      </Button>
                      <Button variant="outline" size="sm">
                        VIEW
                      </Button>
                      <Button
                        onClick={() => handlePurchaseOrder(rfq.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        PURCHASE ORDER
                      </Button>
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <RFQDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSubmit={handleCreateRFQ} />
      </div>
    </div>
  )
}
