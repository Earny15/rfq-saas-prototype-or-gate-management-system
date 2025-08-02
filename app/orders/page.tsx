"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Bell, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"

interface LineItem {
  id: string
  item: string
  skuCode: string
  quantity: string
  quantityToBeDispatched: string
  taxableAmount: number
  totalAmount: number
}

interface Order {
  id: string
  orderNumber: string
  orderDate: string
  orderFrom: string
  orderWeight: string
  orderValue: string
  tags: string[]
  items: number
  sourceCity: string
  destinationCity: string
  selected?: boolean
  lineItems: LineItem[]
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "PO_12345",
    orderDate: "22 Jun 2025",
    orderFrom: "Steel Coating Industries (SCIND)",
    orderWeight: "2,500 Kg",
    orderValue: "4,85,000 INR",
    tags: ["Outbound"],
    items: 6,
    sourceCity: "Chennai",
    destinationCity: "Bengaluru",
    lineItems: [
      {
        id: "1",
        item: "SC-450 Horizontal lines",
        skuCode: "AM00000060",
        quantity: "10 EA",
        quantityToBeDispatched: "10 EA",
        taxableAmount: 5910,
        totalAmount: 7564.8,
      },
      {
        id: "2",
        item: "SC-Black pattern (Silver accent)",
        skuCode: "AM00000061",
        quantity: "10 EA",
        quantityToBeDispatched: "10 EA",
        taxableAmount: 5910,
        totalAmount: 7564.8,
      },
      {
        id: "3",
        item: "Rizta Body Guard",
        skuCode: "AM00000092",
        quantity: "100 EA",
        quantityToBeDispatched: "100 EA",
        taxableAmount: 210300,
        totalAmount: 269184,
      },
      {
        id: "4",
        item: "RIZTA SEAT COVER GREY AND BLACK",
        skuCode: "AM00000395",
        quantity: "60 EA",
        quantityToBeDispatched: "60 EA",
        taxableAmount: 39660,
        totalAmount: 50764.8,
      },
      {
        id: "5",
        item: "Side Step Assembly",
        skuCode: "AM0011A001MNN",
        quantity: "100 EA",
        quantityToBeDispatched: "100 EA",
        taxableAmount: 124300,
        totalAmount: 159104,
      },
      {
        id: "6",
        item: "TPMS Sensor Assembly V2",
        skuCode: "AM0809E002MNN",
        quantity: "6 EA",
        quantityToBeDispatched: "6 EA",
        taxableAmount: 16506,
        totalAmount: 19477.08,
      },
    ],
  },
  {
    id: "2",
    orderNumber: "PO_12346",
    orderDate: "21 Jun 2025",
    orderFrom: "Premium Coatings Ltd (PCLTD)",
    orderWeight: "1,800 Kg",
    orderValue: "3,25,000 INR",
    tags: ["Inbound"],
    items: 4,
    sourceCity: "Mumbai",
    destinationCity: "Delhi",
    lineItems: [
      {
        id: "1",
        item: "Galvanized Steel Sheets 2mm",
        skuCode: "GS00200001",
        quantity: "50 SHEETS",
        quantityToBeDispatched: "50 SHEETS",
        taxableAmount: 85000,
        totalAmount: 100300,
      },
      {
        id: "2",
        item: "Color Coated Coils - RAL 9005",
        skuCode: "CC09005001",
        quantity: "25 COILS",
        quantityToBeDispatched: "25 COILS",
        taxableAmount: 125000,
        totalAmount: 147500,
      },
      {
        id: "3",
        item: "Zinc Coating Primer",
        skuCode: "ZC00001001",
        quantity: "200 LTRS",
        quantityToBeDispatched: "200 LTRS",
        taxableAmount: 45000,
        totalAmount: 53100,
      },
      {
        id: "4",
        item: "Anti-Corrosion Treatment",
        skuCode: "AC00001001",
        quantity: "100 LTRS",
        quantityToBeDispatched: "100 LTRS",
        taxableAmount: 24000,
        totalAmount: 28320,
      },
    ],
  },
  {
    id: "3",
    orderNumber: "PO_12347",
    orderDate: "20 Jun 2025",
    orderFrom: "Industrial Coatings Corp (ICCORP)",
    orderWeight: "3,200 Kg",
    orderValue: "5,75,000 INR",
    tags: ["Outbound"],
    items: 5,
    sourceCity: "Kolkata",
    destinationCity: "Chennai",
    lineItems: [
      {
        id: "1",
        item: "Pre-painted Steel Coils",
        skuCode: "PP00001001",
        quantity: "30 COILS",
        quantityToBeDispatched: "30 COILS",
        taxableAmount: 180000,
        totalAmount: 212400,
      },
      {
        id: "2",
        item: "Polyester Coating Material",
        skuCode: "PC00001001",
        quantity: "150 KG",
        quantityToBeDispatched: "150 KG",
        taxableAmount: 75000,
        totalAmount: 88500,
      },
      {
        id: "3",
        item: "Steel Base Substrate 1.5mm",
        skuCode: "SB00150001",
        quantity: "100 SHEETS",
        quantityToBeDispatched: "100 SHEETS",
        taxableAmount: 120000,
        totalAmount: 141600,
      },
      {
        id: "4",
        item: "Chromate Conversion Coating",
        skuCode: "CR00001001",
        quantity: "80 LTRS",
        quantityToBeDispatched: "80 LTRS",
        taxableAmount: 32000,
        totalAmount: 37760,
      },
      {
        id: "5",
        item: "Quality Control Test Kit",
        skuCode: "QC00001001",
        quantity: "5 KITS",
        quantityToBeDispatched: "5 KITS",
        taxableAmount: 15000,
        totalAmount: 17700,
      },
    ],
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("All")
  const [lineItemFilters, setLineItemFilters] = useState<Record<string, any>>({})
  const router = useRouter()

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleOrderExpansion = (orderId: string) => {
    if (expandedOrders.includes(orderId)) {
      setExpandedOrders(expandedOrders.filter((id) => id !== orderId))
    } else {
      setExpandedOrders([...expandedOrders, orderId])
    }
  }

  const handleCreateRFQ = () => {
    if (selectedOrders.length > 0) {
      localStorage.setItem("selectedOrders", JSON.stringify(selectedOrders))
      router.push("/rfq?action=create")
    }
  }

  const handleLineItemFilterChange = (orderId: string, column: string, value: string) => {
    setLineItemFilters((prev) => ({
      ...prev,
      [`${orderId}-${column}`]: value,
    }))
  }

  const getFilteredLineItems = (orderId: string, lineItems: LineItem[]) => {
    return lineItems.filter((item) => {
      const itemFilter = lineItemFilters[`${orderId}-item`]
      const skuFilter = lineItemFilters[`${orderId}-sku`]

      if (itemFilter && !item.item.toLowerCase().includes(itemFilter.toLowerCase())) {
        return false
      }
      if (skuFilter && !item.skuCode.toLowerCase().includes(skuFilter.toLowerCase())) {
        return false
      }

      return true
    })
  }

  const tabs = [
    { name: "All", count: 3 },
    { name: "Created", count: 0 },
    { name: "Pending", count: 0 },
    { name: "Ready For Fulfillment", count: 0 },
    { name: "Processing", count: 0 },
    { name: "Completed", count: 1 },
    { name: "Cancelled", count: 0 },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-16">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <h1 className="text-xl font-semibold">Orders</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Branches</span>
                <Select defaultValue="all-branches">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-branches">All Branches (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select defaultValue="po">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="po">PO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 text-gray-400" />
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
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

          {/* Action Bar */}
          {selectedOrders.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">{selectedOrders.length} order(s) selected</span>
                <Button onClick={handleCreateRFQ} className="bg-blue-600 hover:bg-blue-700">
                  Create RFQ
                </Button>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order From</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order Weight</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tags</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Items</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Source City</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Destination City</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={(checked) => handleOrderSelection(order.id, checked as boolean)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleOrderExpansion(order.id)}
                            className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <span>{order.orderNumber}</span>
                            {expandedOrders.includes(order.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.orderDate}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.orderFrom}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.orderWeight}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.orderValue}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {order.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.items}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.sourceCity}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.destinationCity}</td>
                        <td className="px-4 py-4">
                          <Button variant="outline" size="sm">
                            DETAILS
                          </Button>
                        </td>
                      </tr>

                      {/* Accordion Content - Line Items */}
                      {expandedOrders.includes(order.id) && (
                        <tr>
                          <td colSpan={11} className="px-4 py-0">
                            <div className="bg-gray-50 border-t border-gray-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-4">Order Line Items</h4>

                              {/* Line Items Table */}
                              <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left font-medium text-gray-700">Item</th>
                                      <th className="px-3 py-2 text-left font-medium text-gray-700">SKU Code</th>
                                      <th className="px-3 py-2 text-left font-medium text-gray-700">Quantity</th>
                                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                                        Quantity Yet To Be Dispatched
                                      </th>
                                      <th className="px-3 py-2 text-left font-medium text-gray-700">Taxable Amount</th>
                                      <th className="px-3 py-2 text-left font-medium text-gray-700">Total Amount</th>
                                    </tr>
                                    {/* Filter Row */}
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2">
                                        <Input
                                          placeholder="Search..."
                                          className="h-8 text-xs"
                                          value={lineItemFilters[`${order.id}-item`] || ""}
                                          onChange={(e) => handleLineItemFilterChange(order.id, "item", e.target.value)}
                                        />
                                      </th>
                                      <th className="px-3 py-2">
                                        <Input
                                          placeholder="Search..."
                                          className="h-8 text-xs"
                                          value={lineItemFilters[`${order.id}-sku`] || ""}
                                          onChange={(e) => handleLineItemFilterChange(order.id, "sku", e.target.value)}
                                        />
                                      </th>
                                      <th className="px-3 py-2">
                                        <div className="flex space-x-1">
                                          <Input placeholder="Min" className="h-8 text-xs w-16" />
                                          <Input placeholder="Max" className="h-8 text-xs w-16" />
                                        </div>
                                      </th>
                                      <th className="px-3 py-2">
                                        <div className="flex space-x-1">
                                          <Input placeholder="Min" className="h-8 text-xs w-16" />
                                          <Input placeholder="Max" className="h-8 text-xs w-16" />
                                        </div>
                                      </th>
                                      <th className="px-3 py-2">
                                        <div className="flex space-x-1">
                                          <Input placeholder="Min" className="h-8 text-xs w-16" />
                                          <Input placeholder="Max" className="h-8 text-xs w-16" />
                                        </div>
                                      </th>
                                      <th className="px-3 py-2">
                                        <div className="flex space-x-1">
                                          <Input placeholder="Min" className="h-8 text-xs w-16" />
                                          <Input placeholder="Max" className="h-8 text-xs w-16" />
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {getFilteredLineItems(order.id, order.lineItems).map((item) => (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 text-gray-900 font-medium">{item.item}</td>
                                        <td className="px-3 py-3 text-gray-600 font-mono">{item.skuCode}</td>
                                        <td className="px-3 py-3 text-gray-600">{item.quantity}</td>
                                        <td className="px-3 py-3 text-gray-600">{item.quantityToBeDispatched}</td>
                                        <td className="px-3 py-3 text-gray-600">
                                          ₹{item.taxableAmount.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-3 text-gray-900 font-semibold">
                                          ₹{item.totalAmount.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                {getFilteredLineItems(order.id, order.lineItems).length === 0 && (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>No line items match the current filters</p>
                                  </div>
                                )}
                              </div>

                              {/* Summary */}
                              <div className="mt-4 flex justify-end">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="text-sm">
                                    <div className="flex justify-between space-x-8">
                                      <span className="text-gray-600">Total Items:</span>
                                      <span className="font-semibold">{order.lineItems.length}</span>
                                    </div>
                                    <div className="flex justify-between space-x-8">
                                      <span className="text-gray-600">Order Value:</span>
                                      <span className="font-semibold text-blue-600">{order.orderValue}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No more orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
