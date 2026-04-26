import { useState } from 'react';
import { useInventory } from '../context/inventory-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Download, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export default function InventoryReport() {
  const { inventoryItems, salesRecords } = useInventory();
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'adequate'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'threshold'>('name');
  
  const filteredItems = inventoryItems
    .filter(item => {
      // Apply search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (filterStatus === 'low') {
        return item.currentStock <= item.threshold;
      } else if (filterStatus === 'adequate') {
        return item.currentStock > item.threshold;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return b.currentStock - a.currentStock;
        case 'threshold':
          return (a.currentStock / a.threshold) - (b.currentStock / b.threshold);
        default:
          return 0;
      }
    });
  
  const totalStockValue = inventoryItems.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockCount = inventoryItems.filter(item => item.currentStock <= item.threshold).length;
  const adequateStockCount = inventoryItems.length - lowStockCount;
  
  const exportDetailedReport = () => {
    // Create detailed CSV report
    const headers = [
      'Item Name',
      'Current Stock',
      'Unit',
      'Threshold',
      'Status',
      'Stock Percentage',
      'Last Updated',
    ];
    
    const rows = filteredItems.map(item => [
      item.name,
      item.currentStock.toString(),
      item.unit,
      item.threshold.toString(),
      item.currentStock <= item.threshold ? 'Low Stock' : 'Adequate',
      `${((item.currentStock / item.threshold) * 100).toFixed(1)}%`,
      new Date(item.lastUpdated).toLocaleString(),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Inventory report exported successfully');
  };
  
  const exportSummaryReport = () => {
    const summary = [
      'Inventory Summary Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Overall Statistics:',
      `Total Items: ${inventoryItems.length}`,
      `Items with Adequate Stock: ${adequateStockCount}`,
      `Items with Low Stock: ${lowStockCount}`,
      `Total Stock Units: ${totalStockValue.toFixed(2)}`,
      '',
      'Low Stock Items:',
      ...inventoryItems
        .filter(item => item.currentStock <= item.threshold)
        .map(item => `- ${item.name}: ${item.currentStock} ${item.unit} (Threshold: ${item.threshold} ${item.unit})`),
    ].join('\n');
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Summary report exported successfully');
  };
  
  return (
    <div className="p-8">
      <Toaster />
      
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Inventory Reports</h1>
        <p className="text-gray-600">Generate and export comprehensive inventory reports</p>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{inventoryItems.length}</div>
            <p className="text-xs text-gray-500 mt-1">In inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Adequate Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">{adequateStockCount}</div>
            <p className="text-xs text-gray-500 mt-1">Above threshold</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-gray-500 mt-1">Below threshold</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Stock Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{totalStockValue.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">Combined units</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Detailed Report</CardTitle>
            <CardDescription>
              Export a comprehensive CSV report with all inventory details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportDetailedReport} className="w-full">
              <Download className="size-4 mr-2" />
              Export Detailed CSV Report
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Summary Report</CardTitle>
            <CardDescription>
              Export a text summary with key inventory statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportSummaryReport} variant="outline" className="w-full">
              <FileText className="size-4 mr-2" />
              Export Summary Report
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
          <CardDescription>
            Filter and view detailed inventory information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Items</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="low">Low Stock Only</SelectItem>
                  <SelectItem value="adequate">Adequate Stock Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="stock">Stock Level (High-Low)</SelectItem>
                  <SelectItem value="threshold">Threshold % (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="size-4" />
            <span>
              Showing {filteredItems.length} of {inventoryItems.length} items
            </span>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Item Name</th>
                  <th className="text-left py-3 px-4">Current Stock</th>
                  <th className="text-left py-3 px-4">Threshold</th>
                  <th className="text-left py-3 px-4">Stock %</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No items match your filters
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const isLowStock = item.currentStock <= item.threshold;
                    const stockPercentage = (item.currentStock / item.threshold) * 100;
                    
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          {item.threshold} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  isLowStock ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, stockPercentage)}%` }}
                              />
                            </div>
                            <span className="text-sm">{stockPercentage.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              isLowStock
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {isLowStock ? 'Low Stock' : 'Adequate'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Sales Activity Summary */}
      {salesRecords.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Sales Activity</CardTitle>
            <CardDescription>
              Sales records processed: {salesRecords.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {salesRecords.slice(-10).reverse().map(record => (
                <div key={record.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="font-medium">{record.itemName}</span>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Qty: {record.quantity}</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {salesRecords.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  Showing last 10 of {salesRecords.length} sales records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
