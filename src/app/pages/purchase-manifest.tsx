import { useState } from 'react';
import { useInventory } from '../context/inventory-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { ShoppingCart, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export default function PurchaseManifest() {
  const { inventoryItems } = useInventory();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Get items that are at or below threshold
  const itemsToPurchase = inventoryItems.filter(item => item.currentStock <= item.threshold);
  
  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };
  
  const toggleAll = () => {
    if (selectedItems.size === itemsToPurchase.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(itemsToPurchase.map(item => item.id)));
    }
  };
  
  const calculateNeededAmount = (item: any) => {
    // Calculate amount needed to reach threshold + 50% buffer
    const targetStock = item.threshold * 1.5;
    const needed = Math.max(0, targetStock - item.currentStock);
    return Math.ceil(needed);
  };
  
  const exportToCSV = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to export');
      return;
    }
    
    const selectedData = itemsToPurchase.filter(item => selectedItems.has(item.id));
    
    // Create CSV content
    const headers = ['Item Name', 'Current Stock', 'Threshold', 'Amount to Order', 'Unit'];
    const rows = selectedData.map(item => [
      item.name,
      item.currentStock.toString(),
      item.threshold.toString(),
      calculateNeededAmount(item).toString(),
      item.unit,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-manifest-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Purchase manifest exported successfully');
  };
  
  const exportToPDF = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to export');
      return;
    }
    
    toast.info('PDF export would be implemented with a PDF library like jsPDF');
  };
  
  const totalItemsNeeded = selectedItems.size;
  const totalCost = itemsToPurchase
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + calculateNeededAmount(item), 0);
  
  return (
    <div className="p-8">
      <Toaster />
      
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Purchase Manifest</h1>
        <p className="text-gray-600">Generate purchase orders for items below threshold</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Items Below Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{itemsToPurchase.length}</div>
            <p className="text-xs text-gray-500 mt-1">Need restocking</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Selected for Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-blue-600">{totalItemsNeeded}</div>
            <p className="text-xs text-gray-500 mt-1">Items in manifest</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Units to Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{totalCost}</div>
            <p className="text-xs text-gray-500 mt-1">Combined units</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Purchase List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Items to Purchase</CardTitle>
              <CardDescription>
                Select items to include in your purchase manifest
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV} disabled={selectedItems.size === 0}>
                <Download className="size-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF} disabled={selectedItems.size === 0}>
                <Download className="size-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {itemsToPurchase.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">All items are adequately stocked!</p>
              <p className="text-sm text-gray-500">
                No items are currently below their threshold levels
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 pb-4 border-b flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.size === itemsToPurchase.length && itemsToPurchase.length > 0}
                  onCheckedChange={toggleAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({itemsToPurchase.length} items)
                </label>
              </div>
              
              <div className="space-y-3">
                {itemsToPurchase.map(item => {
                  const neededAmount = calculateNeededAmount(item);
                  const isSelected = selectedItems.has(item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <label
                          htmlFor={`item-${item.id}`}
                          className="font-medium cursor-pointer block"
                        >
                          {item.name}
                        </label>
                        
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Current Stock</p>
                            <p className="font-medium text-orange-600">
                              {item.currentStock} {item.unit}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-500">Threshold</p>
                            <p className="font-medium">
                              {item.threshold} {item.unit}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-500">Target Stock</p>
                            <p className="font-medium text-green-600">
                              {Math.ceil(item.threshold * 1.5)} {item.unit}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-500">Amount to Order</p>
                            <p className="font-medium text-blue-600">
                              {neededAmount} {item.unit}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                          <AlertCircle className="size-3" />
                          <span>
                            {((item.currentStock / item.threshold) * 100).toFixed(0)}% of threshold level
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Summary Footer */}
      {itemsToPurchase.length > 0 && selectedItems.size > 0 && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Purchase Summary</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {totalItemsNeeded} items selected • {totalCost} total units to order
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedItems(new Set())}>
                  Clear Selection
                </Button>
                <Button onClick={exportToCSV}>
                  <Download className="size-4 mr-2" />
                  Export Manifest
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
