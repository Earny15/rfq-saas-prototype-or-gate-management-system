"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Calendar, Plus } from "lucide-react"

interface RFQDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

type ActionType = "shipment" | "booking" | null

interface LegAssignment {
  provider?: string
  contract?: string
  isRFQ?: boolean
  rfqData?: {
    selectedLSPs: string[]
    startTime: string
    endTime: string
  }
}

export default function RFQDrawer({ isOpen, onClose, onSubmit }: RFQDrawerProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null)
  const [formData, setFormData] = useState({
    branch: "Oragadam Plant 2020",
    consignor: "",
    source: "",
    consignee: "",
    destination: "",
    billTo: "",
    shipmentType: "",
    modeOfTransport: "",
    typeOfLoad: "",
    incoterm: "",
    bookingNumber: "",
    originPort: "",
    actualDeparture: "",
    destinationPort: "",
    actualArrival: "",
  })

  const [currentStep, setCurrentStep] = useState<"action" | "form" | "legs">("action")
  const [legAssignments, setLegAssignments] = useState<Record<string, LegAssignment>>({})
  const [showRFQForm, setShowRFQForm] = useState<string | null>(null)

  const getLegsForIncoterm = (incoterm: string) => {
    const legMappings = {
      ddp: [
        { id: "container-stuffing", name: "Container Stuffing", type: "service" },
        { id: "fumigation", name: "Fumigation", type: "cha" },
        { id: "origin-customs", name: "Origin Customs Clearance", type: "cha" },
        { id: "ocean-voyage", name: "Ocean Voyage", type: "service" },
        { id: "destination-customs", name: "Destination Customs Clearance", type: "cha" },
        { id: "inland-transport", name: "Inland Transportation", type: "cha" },
      ],
      fob: [
        { id: "container-stuffing", name: "Container Stuffing", type: "service" },
        { id: "origin-customs", name: "Origin Customs Clearance", type: "cha" },
      ],
      cif: [
        { id: "container-stuffing", name: "Container Stuffing", type: "service" },
        { id: "origin-customs", name: "Origin Customs Clearance", type: "cha" },
        { id: "ocean-voyage", name: "Ocean Voyage", type: "service" },
      ],
    }
    return legMappings[incoterm.toLowerCase()] || []
  }

  const availableLSPs = {
    service: [
      { id: "royal-enfield", name: "Royal Enfield" },
      { id: "dsv-air-sea", name: "DSV AIR & SEA PVT LTD" },
      { id: "maersk", name: "Maersk Line" },
      { id: "msc", name: "MSC" },
      { id: "hapag-lloyd", name: "Hapag-Lloyd" },
      { id: "cosco", name: "COSCO Shipping" },
    ],
    cha: [
      { id: "cha1", name: "CHA Partner 1" },
      { id: "cha2", name: "CHA Partner 2" },
      { id: "cha3", name: "CHA Partner 3" },
      { id: "cha4", name: "Global Customs Solutions" },
      { id: "cha5", name: "Express Clearance Services" },
      { id: "cha6", name: "Prime Logistics CHA" },
    ],
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    setSelectedAction(null)
    setCurrentStep("action")
    setFormData({
      branch: "Oragadam Plant 2020",
      consignor: "",
      source: "",
      consignee: "",
      destination: "",
      billTo: "",
      shipmentType: "",
      modeOfTransport: "",
      typeOfLoad: "",
      incoterm: "",
      bookingNumber: "",
      originPort: "",
      actualDeparture: "",
      destinationPort: "",
      actualArrival: "",
    })
    setLegAssignments({})
    setShowRFQForm(null)
    onClose()
  }

  const renderActionSelection = () => (
    <div className="space-y-6 py-6">
      <div className="space-y-4">
        <Label className="text-lg font-semibold">What would you like to create?</Label>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 text-left justify-start hover:bg-blue-50 hover:border-blue-300 bg-transparent"
            onClick={() => {
              setSelectedAction("shipment")
              setCurrentStep("form")
            }}
          >
            Create Shipment
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-left justify-start hover:bg-blue-50 hover:border-blue-300 bg-transparent"
            onClick={() => {
              setSelectedAction("booking")
              setCurrentStep("form")
            }}
          >
            Create Booking
          </Button>
        </div>
      </div>
    </div>
  )

  const isFormValid = () => {
    return (
      formData.consignor &&
      formData.source &&
      formData.consignee &&
      formData.destination &&
      formData.billTo &&
      formData.shipmentType &&
      formData.modeOfTransport &&
      formData.typeOfLoad &&
      formData.incoterm &&
      formData.bookingNumber &&
      formData.originPort &&
      formData.destinationPort
    )
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      setCurrentStep("legs")
    } else {
      alert("Please fill in all required fields")
    }
  }

  const renderShipmentForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-6 py-6">
      {/* Branch */}
      <div className="space-y-2">
        <Label htmlFor="branch">
          Branch <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Oragadam Plant 2020">Oragadam Plant 2020</SelectItem>
            <SelectItem value="Chennai Plant">Chennai Plant</SelectItem>
            <SelectItem value="Mumbai Plant">Mumbai Plant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Consignor & Consignee Details */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Consignor & Consignee Details</Label>

        <div className="space-y-3">
          <div>
            <Label htmlFor="consignor">
              Consignor <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.consignor} onValueChange={(value) => handleInputChange("consignor", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Consignor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consignor1">ABC Logistics Ltd</SelectItem>
                <SelectItem value="consignor2">XYZ Trading Co</SelectItem>
                <SelectItem value="consignor3">Global Exports Inc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">
              Source <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="consignee">
              Consignee <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.consignee} onValueChange={(value) => handleInputChange("consignee", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Consignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consignee1">Royal Enfield Europe B.V</SelectItem>
                <SelectItem value="consignee2">David lubinski Ltd</SelectItem>
                <SelectItem value="consignee3">TF Motors(Cambodia) co. Ltd</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="destination">
              Destination <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.destination} onValueChange={(value) => handleInputChange("destination", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rotterdam">Rotterdam</SelectItem>
                <SelectItem value="ashdod">Ashdod</SelectItem>
                <SelectItem value="phnom-penh">Phnom Penh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bill To Details */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Bill To Details</Label>
        <div>
          <Label htmlFor="billTo">
            Select Bill To <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.billTo} onValueChange={(value) => handleInputChange("billTo", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Bill To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="royal-enfield">Royal Enfield Europe B.V</SelectItem>
              <SelectItem value="david-lubinski">David lubinski Ltd</SelectItem>
              <SelectItem value="tf-motors">TF Motors(Cambodia) co. Ltd</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Shipment Details</Label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="shipmentType">
              Shipment Type <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.shipmentType} onValueChange={(value) => handleInputChange("shipmentType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="domestic">Domestic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modeOfTransport">
              Mode Of Transport <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.modeOfTransport}
              onValueChange={(value) => handleInputChange("modeOfTransport", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sea">Sea</SelectItem>
                <SelectItem value="air">Air</SelectItem>
                <SelectItem value="road">Road</SelectItem>
                <SelectItem value="rail">Rail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="typeOfLoad">
              Type of Load <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.typeOfLoad} onValueChange={(value) => handleInputChange("typeOfLoad", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Load Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fcl">FCL (Full Container Load)</SelectItem>
                <SelectItem value="lcl">LCL (Less Container Load)</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="incoterm">
              Incoterm <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.incoterm} onValueChange={(value) => handleInputChange("incoterm", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Incoterm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ddp">DDP</SelectItem>
                <SelectItem value="fob">FOB</SelectItem>
                <SelectItem value="cif">CIF</SelectItem>
                <SelectItem value="exw">EXW</SelectItem>
                <SelectItem value="dap">DAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="bookingNumber">
            Booking Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bookingNumber"
            value={formData.bookingNumber}
            onChange={(e) => handleInputChange("bookingNumber", e.target.value)}
            placeholder="Enter booking number"
          />
        </div>

        <div>
          <Label htmlFor="originPort">
            Origin Port <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.originPort} onValueChange={(value) => handleInputChange("originPort", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Origin Port" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chennai-port">Chennai Port</SelectItem>
              <SelectItem value="mumbai-port">Mumbai Port</SelectItem>
              <SelectItem value="kolkata-port">Kolkata Port</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="actualDeparture">Actual Time of Departure</Label>
          <div className="relative">
            <Input
              id="actualDeparture"
              type="datetime-local"
              value={formData.actualDeparture}
              onChange={(e) => handleInputChange("actualDeparture", e.target.value)}
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <Label htmlFor="destinationPort">
            Destination Port <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.destinationPort}
            onValueChange={(value) => handleInputChange("destinationPort", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Destination Port" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rotterdam-port">Port of Rotterdam</SelectItem>
              <SelectItem value="ashdod-port">Port of Ashdod</SelectItem>
              <SelectItem value="phnom-penh-airport">Phnom Penh International Airport</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="actualArrival">Actual Time of Arrival</Label>
          <div className="relative">
            <Input
              id="actualArrival"
              type="datetime-local"
              value={formData.actualArrival}
              onChange={(e) => handleInputChange("actualArrival", e.target.value)}
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!isFormValid()}>
        NEXT
      </Button>
    </form>
  )

  const renderBookingForm = () => (
    <div className="space-y-6 py-6">
      <div className="text-center text-gray-500">
        <p>Booking creation form will be implemented here.</p>
        <Button onClick={() => setSelectedAction(null)} variant="outline" className="mt-4">
          Back to Selection
        </Button>
      </div>
    </div>
  )

  const handleRFQSubmit = (legId: string) => {
    const assignment = legAssignments[legId]
    if (assignment?.rfqData?.selectedLSPs.length && assignment?.rfqData?.startTime && assignment?.rfqData?.endTime) {
      setLegAssignments((prev) => ({
        ...prev,
        [legId]: {
          ...prev[legId],
          isRFQ: true,
        },
      }))
      setShowRFQForm(null)
    } else {
      alert("Please select LSPs and provide start/end times for the RFQ")
    }
  }

  const renderRFQForm = (legId: string, legName: string, legType: string) => {
    const assignment = legAssignments[legId] || {}
    const rfqData = assignment.rfqData || { selectedLSPs: [], startTime: "", endTime: "" }

    // Set default times if not set
    const now = new Date()
    const defaultStartTime = rfqData.startTime || new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) // 1 hour from now
    const defaultEndTime =
      rfqData.endTime || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // 7 days from now

    return (
      <div className="mt-4 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <Plus className="h-3 w-3 text-white" />
            </div>
            <h4 className="font-medium text-orange-800">Create RFQ: {legName}</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRFQForm(null)}
            className="text-orange-600 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-orange-800 mb-3 block">Select LSPs for RFQ</Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {availableLSPs[legType].map((lsp) => (
                <div key={lsp.id} className="flex items-center space-x-3 p-2 bg-white rounded border hover:bg-gray-50">
                  <Checkbox
                    id={`${legId}-${lsp.id}`}
                    checked={rfqData.selectedLSPs.includes(lsp.id)}
                    onCheckedChange={(checked) => {
                      const newSelectedLSPs = checked
                        ? [...rfqData.selectedLSPs, lsp.id]
                        : rfqData.selectedLSPs.filter((id) => id !== lsp.id)

                      setLegAssignments((prev) => ({
                        ...prev,
                        [legId]: {
                          ...prev[legId],
                          rfqData: {
                            ...rfqData,
                            selectedLSPs: newSelectedLSPs,
                          },
                        },
                      }))
                    }}
                  />
                  <Label htmlFor={`${legId}-${lsp.id}`} className="text-sm font-medium cursor-pointer flex-1">
                    {lsp.name}
                  </Label>
                </div>
              ))}
            </div>
            {rfqData.selectedLSPs.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">Please select at least one LSP</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-orange-800 mb-2 block">RFQ Start Time</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={rfqData.startTime || defaultStartTime}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setLegAssignments((prev) => ({
                      ...prev,
                      [legId]: {
                        ...prev[legId],
                        rfqData: {
                          ...rfqData,
                          startTime: e.target.value,
                        },
                      },
                    }))
                  }
                  className="text-sm"
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-orange-800 mb-2 block">RFQ End Time</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={rfqData.endTime || defaultEndTime}
                  min={rfqData.startTime || defaultStartTime}
                  onChange={(e) =>
                    setLegAssignments((prev) => ({
                      ...prev,
                      [legId]: {
                        ...prev[legId],
                        rfqData: {
                          ...rfqData,
                          endTime: e.target.value,
                        },
                      },
                    }))
                  }
                  className="text-sm"
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-orange-200">
            <div className="text-xs text-orange-700">
              <div className="font-medium mb-1">RFQ Summary:</div>
              <div>• {rfqData.selectedLSPs.length} LSPs selected</div>
              <div>
                • Duration:{" "}
                {rfqData.startTime && rfqData.endTime
                  ? Math.ceil(
                      (new Date(rfqData.endTime).getTime() - new Date(rfqData.startTime).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : 0}{" "}
                days
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => handleRFQSubmit(legId)}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={rfqData.selectedLSPs.length === 0 || !rfqData.startTime || !rfqData.endTime}
            >
              CREATE RFQ
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRFQForm(null)}
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const areAllLegsAssigned = () => {
    const legs = getLegsForIncoterm(formData.incoterm)
    return legs.every((leg) => {
      const assignment = legAssignments[leg.id]
      if (assignment?.isRFQ) return true
      if (leg.type === "service") {
        return assignment?.provider
      } else {
        return assignment?.provider && assignment?.contract
      }
    })
  }

  const handleFinalSubmit = () => {
    onSubmit({
      action: selectedAction,
      ...formData,
      legs: legAssignments,
    })
    handleClose()
  }

  const renderLegsScreen = () => {
    const legs = getLegsForIncoterm(formData.incoterm)

    return (
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Leg Details</h3>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
            Incoterm: {formData.incoterm.toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          {legs.map((leg, index) => {
            const assignment = legAssignments[leg.id]
            const isRFQActive = showRFQForm === leg.id

            return (
              <div key={leg.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{leg.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{leg.type} Provider</p>
                    </div>
                  </div>
                  {assignment?.isRFQ && (
                    <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium border border-orange-200">
                      RFQ Active
                    </div>
                  )}
                </div>

                {assignment?.isRFQ ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800">RFQ Created Successfully</p>
                        <p className="text-xs text-orange-600 mt-1">
                          {assignment.rfqData?.selectedLSPs.length} LSPs selected
                        </p>
                        <div className="mt-2 text-xs text-orange-600">
                          <div>Start: {new Date(assignment.rfqData?.startTime || "").toLocaleString()}</div>
                          <div>End: {new Date(assignment.rfqData?.endTime || "").toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leg.type === "service" ? (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Service Provider</Label>
                        <Select
                          value={assignment?.provider || ""}
                          onValueChange={(value) =>
                            setLegAssignments((prev) => ({
                              ...prev,
                              [leg.id]: { ...prev[leg.id], provider: value },
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Service Provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLSPs.service.map((lsp) => (
                              <SelectItem key={lsp.id} value={lsp.id}>
                                {lsp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">CHA Partner</Label>
                          <Select
                            value={assignment?.provider || ""}
                            onValueChange={(value) =>
                              setLegAssignments((prev) => ({
                                ...prev,
                                [leg.id]: { ...prev[leg.id], provider: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select CHA" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLSPs.cha.map((lsp) => (
                                <SelectItem key={lsp.id} value={lsp.id}>
                                  {lsp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Contract</Label>
                          <Select
                            value={assignment?.contract || ""}
                            onValueChange={(value) =>
                              setLegAssignments((prev) => ({
                                ...prev,
                                [leg.id]: { ...prev[leg.id], contract: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Contract" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contract1">Contract A - Standard Rate</SelectItem>
                              <SelectItem value="contract2">Contract B - Premium Service</SelectItem>
                              <SelectItem value="contract3">Contract C - Express Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <span className="text-xs font-medium px-2">OR</span>
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowRFQForm(leg.id)}
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create RFQ for this Leg
                    </Button>

                    {isRFQActive && renderRFQForm(leg.id, leg.name, leg.type)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t pt-4">
          <Button
            onClick={handleFinalSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
            disabled={!areAllLegsAssigned()}
          >
            CREATE SHIPMENT
          </Button>
          {!areAllLegsAssigned() && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Please assign all legs or create RFQs before proceeding
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:w-96 sm:max-w-96 overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {selectedAction === "shipment"
                ? "Add Shipment"
                : selectedAction === "booking"
                  ? "Add Booking"
                  : "Create New"}
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {currentStep === "action" && renderActionSelection()}
        {currentStep === "form" && selectedAction === "shipment" && renderShipmentForm()}
        {currentStep === "form" && selectedAction === "booking" && renderBookingForm()}
        {currentStep === "legs" && renderLegsScreen()}

        {(currentStep === "form" || currentStep === "legs") && (
          <div className="border-t pt-4 mt-4">
            <Button
              onClick={() => setCurrentStep(currentStep === "legs" ? "form" : "action")}
              variant="outline"
              className="w-full"
            >
              {currentStep === "legs" ? "Back to Form" : "Back to Selection"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
