'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Filter, Calendar, Clock, Truck, TrendingUp, AlertCircle } from 'lucide-react'
import Sidebar from '@/components/sidebar'

interface VehicleAssignment {
  id: string
  sno: number
  vehicleNo: string
  transporterName: string
  driverName: string
  driverPhone: string
  turnAroundTime: string
  currentStatus: 'Ongoing' | 'Completed' | 'Pending' | 'Delayed'
  loadNumber: string
  location: string
  waitingTime?: string
}

interface DockData {
  id: number
  name: string
  vehicles: VehicleAssignment[]
}

export default function DockManagement() {
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [activeDock, setActiveDock] = useState('dock1')
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleAssignment | null>(null)

  // Sample data matching the design
  const dockData: DockData[] = [
    {
      id: 1,
      name: 'DOCK 1',
      vehicles: [
        {
          id: '1',
          sno: 1,
          vehicleNo: 'SKQ 12356JL',
          transporterName: 'Kapoor Transport',
          driverName: 'Ravi',
          driverPhone: '9988776655',
          turnAroundTime: '08:00 - 10:00',
          currentStatus: 'Ongoing',
          loadNumber: 'TN01B1234',
          location: 'Bangalore, 560001',
          waitingTime: '09h 15m'
        },
        {
          id: '2',
          sno: 2,
          vehicleNo: 'SKQ 12789JL',
          transporterName: 'Premium Transport',
          driverName: 'Sita',
          driverPhone: '9988776644',
          turnAroundTime: '06:00 - 08:00',
          currentStatus: 'Ongoing',
          loadNumber: 'TN01B1234',
          location: 'Delhi, 560001',
          waitingTime: '09h 15m'
        },
        {
          id: '3',
          sno: 3,
          vehicleNo: 'SKQ 12789JL',
          transporterName: 'Automobile Transport',
          driverName: 'Amit',
          driverPhone: '9988776633',
          turnAroundTime: '12:00 - 14:00',
          currentStatus: 'Ongoing',
          loadNumber: 'TN01B1234',
          location: 'Bangalore, 560001',
          waitingTime: '09h 15m'
        },
        {
          id: '4',
          sno: 4,
          vehicleNo: 'SKQ 12789JL',
          transporterName: 'Mountain logistic',
          driverName: 'Vishnu',
          driverPhone: '9988776655',
          turnAroundTime: '10:00 - 12:00',
          currentStatus: 'Ongoing',
          loadNumber: 'TN01B1234',
          location: 'Delhi, 560001',
          waitingTime: '09h 15m'
        }
      ]
    },
    {
      id: 2,
      name: 'DOCK 2',
      vehicles: []
    },
    {
      id: 3,
      name: 'DOCK 3',
      vehicles: []
    },
    {
      id: 4,
      name: 'DOCK 4',
      vehicles: []
    },
    {
      id: 5,
      name: 'DOCK 5',
      vehicles: []
    }
  ]

  const statsData = {
    totalVehiclesLoaded: 2,
    vehiclesCrossedSLA: 2,
    currentlyLoading: 4,
    avgLoadingTime: '09h 15m'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Ongoing': { color: 'bg-orange-100 text-orange-600 border-orange-200', text: 'Ongoing' },
      'Completed': { color: 'bg-green-100 text-green-600 border-green-200', text: 'Completed' },
      'Pending': { color: 'bg-yellow-100 text-yellow-600 border-yellow-200', text: 'Pending' },
      'Delayed': { color: 'bg-red-100 text-red-600 border-red-200', text: 'Delayed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
    
    return (
      <Badge variant="outline" className={`${config.color} border rounded-full px-3 py-1`}>
        {config.text}
      </Badge>
    )
  }

  const currentDockData = dockData.find(dock => dock.name.toLowerCase().replace(' ', '') === activeDock)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-16">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded"></div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dock Management</h1>
              </div>
              
              <div className="flex items-center space-x-3 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
                <span className="text-sm font-medium text-slate-600">Branch</span>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-44 border-slate-300 bg-white shadow-sm">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                <Filter className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                <Settings className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-6 py-6 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Stats Overview</h2>
            <Select defaultValue="today">
              <SelectTrigger className="w-36 border-slate-300 bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Total Vehicles Loaded</span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{statsData.totalVehiclesLoaded}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-gradient-to-br from-white to-orange-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Vehicles Crossed SLA</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-slate-900">{statsData.vehiclesCrossedSLA}</span>
                      <Button variant="link" className="text-xs text-blue-600 p-0 h-auto font-medium hover:text-blue-700">
                        View More
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-gradient-to-br from-white to-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Currently Loading</span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{statsData.currentlyLoading}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-gradient-to-br from-white to-purple-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Avg. Loading Time</span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{statsData.avgLoadingTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dock Tabs and Table */}
        <div className="flex-1 px-6 py-6 bg-white/95 backdrop-blur-sm border-t border-slate-200/50">
          <Tabs value={activeDock} onValueChange={setActiveDock} className="h-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-auto grid-cols-5 bg-slate-100 p-1 rounded-xl">
                {dockData.map((dock) => (
                  <TabsTrigger 
                    key={dock.name.toLowerCase().replace(' ', '')} 
                    value={dock.name.toLowerCase().replace(' ', '')}
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium transition-all duration-200"
                  >
                    {dock.name}
                    {dock.name === 'DOCK 1' && <Settings className="h-3 w-3 ml-1" />}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
                <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  16 Mar 2025
                </Button>
              </div>
            </div>

            {dockData.map((dock) => (
              <TabsContent 
                key={dock.name.toLowerCase().replace(' ', '')} 
                value={dock.name.toLowerCase().replace(' ', '')}
                className="h-full"
              >
                <div className="border border-slate-200 rounded-xl shadow-sm bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 bg-slate-50/50">
                        <TableHead className="w-16 font-semibold text-slate-700">S.no.</TableHead>
                        <TableHead className="font-semibold text-slate-700">Vehicle No.</TableHead>
                        <TableHead className="font-semibold text-slate-700">Transporter Name</TableHead>
                        <TableHead className="font-semibold text-slate-700">Driver Details</TableHead>
                        <TableHead className="font-semibold text-slate-700">Turn Around Time</TableHead>
                        <TableHead className="font-semibold text-slate-700">Current Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dock.vehicles.length > 0 ? (
                        dock.vehicles.map((vehicle, index) => (
                          <TableRow 
                            key={vehicle.id}
                            className="cursor-pointer hover:bg-slate-50/80 transition-colors duration-200 border-b border-slate-100 last:border-b-0"
                            onClick={() => setSelectedVehicle(vehicle)}
                          >
                            <TableCell className="font-medium text-slate-700">{vehicle.sno}.</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Truck className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-slate-900">{vehicle.vehicleNo}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700 font-medium">{vehicle.transporterName}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-slate-900">{vehicle.driverName}</div>
                                <div className="text-sm text-slate-500">({vehicle.driverPhone})</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-purple-100 rounded">
                                  <Clock className="h-3 w-3 text-purple-600" />
                                </div>
                                <span className="text-slate-700 font-medium">{vehicle.turnAroundTime}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(vehicle.currentStatus)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                            <div className="flex flex-col items-center space-y-2">
                              <Truck className="h-8 w-8 text-slate-300" />
                              <span className="font-medium">No vehicles assigned to this dock</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Vehicle Details */}
      <div className="w-80 bg-white/95 backdrop-blur-sm border-l border-slate-200/50 shadow-xl relative z-10">
        <div className="p-6 space-y-4">
          {selectedVehicle ? (
            <>
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-slate-900">{selectedVehicle.loadNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm bg-orange-50 px-3 py-1 rounded-full">
                    <Clock className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-700 font-medium">Waiting: {selectedVehicle.waitingTime}</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <span className="text-lg">👤</span>
                    <span className="font-medium text-slate-900">{selectedVehicle.driverName}</span>
                    <span className="text-lg">📞</span>
                    <span className="text-slate-600">{selectedVehicle.driverPhone}</span>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <span className="text-lg">📍</span>
                    <div>
                      <div className="font-medium text-green-900">National Logistics Pvt Ltd</div>
                      <div className="text-green-700">{selectedVehicle.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <span className="text-lg">📍</span>
                    <div>
                      <div className="font-medium text-red-900">National Logistics Pvt Ltd</div>
                      <div className="text-red-700">Delhi, 560001</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 flex space-x-3">
                  <Button variant="outline" className="flex-1 text-xs font-medium border-slate-300 hover:bg-slate-50">
                    VIEW DETAILS
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium shadow-md">
                    ALLOCATE
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="flex flex-col items-center space-y-3">
                <Truck className="h-12 w-12 text-slate-300" />
                <span className="font-medium">Select a vehicle from the table to view details</span>
              </div>
            </div>
          )}
          
          {/* Additional vehicle entries as shown in design */}
          {currentDockData?.vehicles.slice(1).map((vehicle) => (
            <div key={`sidebar-${vehicle.id}`} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-slate-900">{vehicle.loadNumber}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm bg-orange-50 px-3 py-1 rounded-full">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-orange-700 font-medium">Waiting: {vehicle.waitingTime}</span>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                  <span className="text-lg">👤</span>
                  <span className="font-medium text-slate-900">{vehicle.driverName}</span>
                  <span className="text-lg">📞</span>
                  <span className="text-slate-600">{vehicle.driverPhone}</span>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="font-medium text-green-900">National Logistics Pvt Ltd</div>
                    <div className="text-green-700">{vehicle.location}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="font-medium text-red-900">National Logistics Pvt Ltd</div>
                    <div className="text-red-700">Delhi, 560001</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex space-x-3">
                <Button variant="outline" className="flex-1 text-xs font-medium border-slate-300 hover:bg-slate-50">
                  VIEW DETAILS
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium shadow-md">
                  ALLOCATE
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}