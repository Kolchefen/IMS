import { useState } from 'react';
import { useInventory } from '../context/inventory-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, TrendingDown, Upload, Package } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export default function Dashboard() {
  const { inventoryItems, csvFormats, ingredientMappings, processSalesData } = useInventory();
  const [uploading, setUploading] = useState(false);
  
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.threshold);
  const totalItems = inventoryItems.length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.currentStock, 0);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const format = csvFormats[0]; // Use first format for now
          if (!format) {
            toast.error('No CSV format configured. Please configure a CSV format first.');
            setUploading(false);
            return;
          }
          
          const salesRecords = results.data
            .filter((row: any) => row[format.columns.itemName] && row[format.columns.quantity])
            .map((row: any, index: number) => ({
              id: `sale-${Date.now()}-${index}`,
              itemName: row[format.columns.itemName],
              quantity: parseFloat(row[format.columns.quantity]) || 0,
              date: row[format.columns.date] || new Date().toISOString(),
            }));
          
          if (salesRecords.length === 0) {
            toast.error('No valid sales records found in CSV file.');
            setUploading(false);
            return;
          }
          
          processSalesData(salesRecords);
          toast.success(`Successfully processed ${salesRecords.length} sales records!`);
        } catch (error) {
          toast.error('Error processing CSV file. Please check the format.');
          console.error(error);
        } finally {
          setUploading(false);
          event.target.value = '';
        }
      },
      error: (error) => {
        toast.error('Error reading CSV file.');
        console.error(error);
        setUploading(false);
      },
    });
  };
  
  return (
    <div className="p-8">
      <Toaster />
      
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory management system</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Items</CardTitle>
            <Package className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalItems}</div>
            <p className="text-xs text-gray-500 mt-1">Unique inventory items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Low Stock Items</CardTitle>
            <AlertCircle className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-500">{lowStockItems.length}</div>
            <p className="text-xs text-gray-500 mt-1">Below threshold level</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Stock Units</CardTitle>
            <TrendingDown className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalValue.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">Combined units</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Item Mappings</CardTitle>
            <Package className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{ingredientMappings.length}</div>
            <p className="text-xs text-gray-500 mt-1">Configured mappings</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Sales Data</CardTitle>
            <CardDescription>
              Import CSV files to automatically update inventory based on sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="mb-4 text-gray-600">
                Upload a CSV file containing sales data
              </p>
              <label>
                <Button disabled={uploading}>
                  {uploading ? 'Processing...' : 'Select CSV File'}
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>
              Items that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                All items are adequately stocked!
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-900">{item.name}</p>
                      <p className="text-sm text-orange-700">
                        Stock: {item.currentStock} {item.unit} / Threshold: {item.threshold} {item.unit}
                      </p>
                    </div>
                    <AlertCircle className="size-5 text-orange-500" />
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    And {lowStockItems.length - 5} more items...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory Status</CardTitle>
          <CardDescription>
            Overview of all inventory items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Item Name</th>
                  <th className="text-left py-3 px-4">Current Stock</th>
                  <th className="text-left py-3 px-4">Threshold</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.slice(0, 8).map(item => {
                  const isLowStock = item.currentStock <= item.threshold;
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.currentStock} {item.unit}</td>
                      <td className="py-3 px-4">{item.threshold} {item.unit}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          isLowStock 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}