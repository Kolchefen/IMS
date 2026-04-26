import { useState } from 'react';
import { useInventory } from '../context/inventory-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Minus, Edit2, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export default function ManualUpdate() {
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Add/Edit form states
  const [itemName, setItemName] = useState('');
  const [itemStock, setItemStock] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemThreshold, setItemThreshold] = useState('');
  
  // Adjustment states
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  
  const resetForm = () => {
    setItemName('');
    setItemStock('');
    setItemUnit('');
    setItemThreshold('');
  };
  
  const handleAddItem = () => {
    if (!itemName || !itemStock || !itemUnit || !itemThreshold) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const newItem = {
      id: `item-${Date.now()}`,
      name: itemName,
      currentStock: parseFloat(itemStock),
      unit: itemUnit,
      threshold: parseFloat(itemThreshold),
      lastUpdated: new Date().toISOString(),
    };
    
    addInventoryItem(newItem);
    toast.success(`${itemName} added successfully`);
    resetForm();
    setAddDialogOpen(false);
  };
  
  const handleEditItem = () => {
    if (!selectedItem || !itemName || !itemStock || !itemUnit || !itemThreshold) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const updatedItem = {
      ...selectedItem,
      name: itemName,
      currentStock: parseFloat(itemStock),
      unit: itemUnit,
      threshold: parseFloat(itemThreshold),
      lastUpdated: new Date().toISOString(),
    };
    
    updateInventoryItem(selectedItem.id, updatedItem);
    toast.success(`${itemName} updated successfully`);
    resetForm();
    setEditDialogOpen(false);
    setSelectedItem(null);
  };
  
  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setItemName(item.name);
    setItemStock(item.currentStock.toString());
    setItemUnit(item.unit);
    setItemThreshold(item.threshold.toString());
    setEditDialogOpen(true);
  };
  
  const openAdjustDialog = (item: any) => {
    setSelectedItem(item);
    setAdjustmentAmount('');
    setAdjustmentType('add');
    setAdjustDialogOpen(true);
  };
  
  const handleAdjustStock = () => {
    if (!selectedItem || !adjustmentAmount) {
      toast.error('Please enter an adjustment amount');
      return;
    }
    
    const amount = parseFloat(adjustmentAmount);
    const newStock = adjustmentType === 'add' 
      ? selectedItem.currentStock + amount 
      : Math.max(0, selectedItem.currentStock - amount);
    
    const updatedItem = {
      ...selectedItem,
      currentStock: newStock,
      lastUpdated: new Date().toISOString(),
    };
    
    updateInventoryItem(selectedItem.id, updatedItem);
    toast.success(`Stock ${adjustmentType === 'add' ? 'increased' : 'decreased'} for ${selectedItem.name}`);
    setAdjustDialogOpen(false);
    setSelectedItem(null);
    setAdjustmentAmount('');
  };
  
  const handleDeleteItem = (item: any) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      deleteInventoryItem(item.id);
      toast.success(`${item.name} deleted successfully`);
    }
  };
  
  return (
    <div className="p-8">
      <Toaster />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Manual Inventory Update</h1>
          <p className="text-gray-600">Add, edit, or adjust inventory items manually</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Create a new item in your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="add-name">Item Name *</Label>
                <Input
                  id="add-name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Flour"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-stock">Initial Stock *</Label>
                  <Input
                    id="add-stock"
                    type="number"
                    step="0.01"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="add-unit">Unit *</Label>
                  <Input
                    id="add-unit"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    placeholder="kg, L, units"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="add-threshold">Threshold Level *</Label>
                <Input
                  id="add-threshold"
                  type="number"
                  step="0.01"
                  value={itemThreshold}
                  onChange={(e) => setItemThreshold(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setAddDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          resetForm();
          setSelectedItem(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update item details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-stock">Current Stock *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  step="0.01"
                  value={itemStock}
                  onChange={(e) => setItemStock(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit *</Label>
                <Input
                  id="edit-unit"
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-threshold">Threshold Level *</Label>
              <Input
                id="edit-threshold"
                type="number"
                step="0.01"
                value={itemThreshold}
                onChange={(e) => setItemThreshold(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              resetForm();
              setSelectedItem(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={(open) => {
        setAdjustDialogOpen(open);
        if (!open) {
          setSelectedItem(null);
          setAdjustmentAmount('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              {selectedItem && `Current stock: ${selectedItem.currentStock} ${selectedItem.unit}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Adjustment Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={adjustmentType === 'add' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType('add')}
                  className="flex-1"
                >
                  <Plus className="size-4 mr-2" />
                  Add Stock
                </Button>
                <Button
                  variant={adjustmentType === 'subtract' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType('subtract')}
                  className="flex-1"
                >
                  <Minus className="size-4 mr-2" />
                  Remove Stock
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="adjustment-amount">Amount *</Label>
              <Input
                id="adjustment-amount"
                type="number"
                step="0.01"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAdjustDialogOpen(false);
              setSelectedItem(null);
              setAdjustmentAmount('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleAdjustStock}>Apply Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>
            All inventory items with quick action buttons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No inventory items yet</p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="size-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {inventoryItems.map(item => {
                const isLowStock = item.currentStock <= item.threshold;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isLowStock ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{item.name}</h3>
                        {isLowStock && (
                          <span className="px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded-full">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Stock: <span className="font-medium">{item.currentStock} {item.unit}</span>
                        {' '} • Threshold: {item.threshold} {item.unit}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Last updated: {new Date(item.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAdjustDialog(item)}
                      >
                        <Plus className="size-4 mr-1" />
                        Adjust
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
