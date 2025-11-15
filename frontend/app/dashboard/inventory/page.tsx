'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import { format } from 'date-fns'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [actionType, setActionType] = useState<'purchase' | 'sale'>('purchase')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsRes, logsRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory/logs?limit=50'),
      ])
      setProducts(productsRes.data)
      setLogs(logsRes.data)
    } catch (error) {
      console.error('Failed to load inventory data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (actionType === 'purchase') {
        await api.post('/inventory/purchase', {
          product_id: parseInt(selectedProduct),
          quantity: parseInt(quantity),
        })
        toast({ title: 'Success', description: 'Purchase logged successfully' })
      } else {
        await api.post('/inventory/sale', {
          product_id: parseInt(selectedProduct),
          quantity: parseInt(quantity),
        })
        toast({ title: 'Success', description: 'Sale logged successfully' })
      }
      setShowDialog(false)
      setSelectedProduct('')
      setQuantity('')
      loadData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.detail || 'Failed to log transaction', variant: 'destructive' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : `Product #${productId}`
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
                  <Button variant="default" className="gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Button onClick={() => {
            setActionType('purchase')
            setShowDialog(true)
          }} className="gap-2 h-24 text-lg">
            <Plus className="h-6 w-6" />
            Log Purchase
          </Button>
          <Button onClick={() => {
            setActionType('sale')
            setShowDialog(true)
          }} className="gap-2 h-24 text-lg">
            <Minus className="h-6 w-6" />
            Log Sale
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{getProductName(log.product_id)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.change_type === 'purchase' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.change_type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{log.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log {actionType === 'purchase' ? 'Purchase' : 'Sale'}</DialogTitle>
            <DialogDescription>
              Record a new {actionType} transaction
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="product">Product</Label>
              <select
                id="product"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Log {actionType === 'purchase' ? 'Purchase' : 'Sale'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
