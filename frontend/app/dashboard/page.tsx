'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)
  const [lowStock, setLowStock] = useState<any[]>([])
  const [fastMoving, setFastMoving] = useState<any[]>([])
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [summaryRes, lowStockRes, fastMovingRes, trendRes] = await Promise.all([
        api.get('/analytics/sales-summary'),
        api.get('/analytics/low-stock'),
        api.get('/analytics/fast-moving'),
        api.get('/analytics/revenue-trend?days=30'),
      ])

      setSummary(summaryRes.data)
      setLowStock(lowStockRes.data)
      setFastMoving(fastMovingRes.data)
      setRevenueTrend(trendRes.data)
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
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
                  <Button variant="ghost" className="gap-2">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Products</CardDescription>
              <CardTitle className="text-3xl">{summary?.total_products || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Active inventory items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's Sales</CardDescription>
              <CardTitle className="text-3xl">${summary?.today?.revenue?.toFixed(2) || '0.00'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{summary?.today?.items_sold || 0} items sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Week</CardDescription>
              <CardTitle className="text-3xl">${summary?.week?.revenue?.toFixed(2) || '0.00'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{summary?.week?.items_sold || 0} items sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Stock Value</CardDescription>
              <CardTitle className="text-3xl">${summary?.stock_value?.toFixed(2) || '0.00'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Total inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
            <CardDescription>Daily revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Low Stock Alert</CardTitle>
              <CardDescription>{lowStock.length} items below threshold</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low stock items</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{item.stock} left</p>
                        <p className="text-xs text-muted-foreground">Min: {item.threshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fast Moving Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Fast Moving Items</CardTitle>
              <CardDescription>Top selling products (Last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              {fastMoving.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales data</p>
              ) : (
                <div className="space-y-2">
                  {fastMoving.slice(0, 5).map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{item.total_sold} sold</p>
                        <p className="text-xs text-muted-foreground">{item.avg_per_day}/day</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
