'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AnalyticsPage() {
  const [lowStock, setLowStock] = useState<any[]>([])
  const [fastMoving, setFastMoving] = useState<any[]>([])
  const [forecast, setForecast] = useState<any>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [lowStockRes, fastMovingRes, productsRes] = await Promise.all([
        api.get('/analytics/low-stock'),
        api.get('/analytics/fast-moving'),
        api.get('/products'),
      ])
      setLowStock(lowStockRes.data)
      setFastMoving(fastMovingRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      console.error('Failed to load analytics', error)
    } finally {
      setLoading(false)
    }
  }

  const loadForecast = async (productId: number) => {
    try {
      setSelectedProductId(productId)
      const response = await api.get(`/analytics/forecast?product_id=${productId}`)
      if (response.data.error) {
        toast({ title: 'Info', description: response.data.error })
        setForecast(null)
      } else {
        setForecast(response.data)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to load forecast', variant: 'destructive' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-primary">Inventory System</h1>
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/products">
                  <Button variant="ghost" className="gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </Button>
                </Link>
                <Link href="/dashboard/inventory">
                  <Button variant="ghost" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Inventory
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="default" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </span>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        ) : (
          <>
            {/* Fast Moving Items Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fast Moving Items</CardTitle>
                <CardDescription>Top 10 best-selling products (Last 30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fastMoving}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_sold" fill="#22c55e" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Items */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-red-600">Low Stock Items</CardTitle>
                <CardDescription>{lowStock.length} products below threshold</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStock.length === 0 ? (
                  <p className="text-muted-foreground">All products are well-stocked!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStock.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-red-50">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-lg font-bold text-red-600">{item.stock} left</span>
                          <span className="text-sm text-muted-foreground">Min: {item.threshold}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demand Forecasting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Demand Forecasting
                </CardTitle>
                <CardDescription>Predict future demand for products (30-day forecast)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Product</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onChange={(e) => loadForecast(parseInt(e.target.value))}
                    value={selectedProductId || ''}
                  >
                    <option value="">Choose a product to forecast</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {forecast && forecast.predicted_demand && (
                  <div>
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Predicted Demand (30 days)</p>
                      <p className="text-3xl font-bold text-blue-600">{forecast.total_predicted} units</p>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecast.predicted_demand}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                          <YAxis label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="quantity" stroke="#3b82f6" strokeWidth={2} name="Predicted Demand" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
