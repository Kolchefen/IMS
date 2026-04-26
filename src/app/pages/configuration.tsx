import { useState } from 'react';
import { useInventory } from '../context/inventory-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export default function Configuration() {
  const {
    csvFormats,
    addCSVFormat,
    updateCSVFormat,
    deleteCSVFormat,
    ingredientMappings,
    addIngredientMapping,
    updateIngredientMapping,
    deleteIngredientMapping,
    inventoryItems,
    updateInventoryItem,
  } = useInventory();

  const [csvDialogOpen, setCSVDialogOpen] = useState(false);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [editingCSV, setEditingCSV] = useState<any>(null);
  const [editingMapping, setEditingMapping] = useState<any>(null);

  // CSV Format Form
  const [csvFormName, setCSVFormName] = useState('');
  const [csvItemCol, setCSVItemCol] = useState('');
  const [csvQuantityCol, setCSVQuantityCol] = useState('');
  const [csvDateCol, setCSVDateCol] = useState('');

  // Mapping Form
  const [mappingSaleItem, setMappingSaleItem] = useState('');
  const [mappingIngredients, setMappingIngredients] = useState<any[]>([]);

  const handleSaveCSVFormat = () => {
    if (!csvFormName || !csvItemCol || !csvQuantityCol) {
      toast.error('Please fill in all required fields');
      return;
    }

    const format = {
      id: editingCSV?.id || `csv-${Date.now()}`,
      name: csvFormName,
      columns: {
        itemName: csvItemCol,
        quantity: csvQuantityCol,
        date: csvDateCol,
      },
    };

    if (editingCSV) {
      updateCSVFormat(editingCSV.id, format);
      toast.success('CSV format updated successfully');
    } else {
      addCSVFormat(format);
      toast.success('CSV format added successfully');
    }

    resetCSVForm();
    setCSVDialogOpen(false);
  };

  const handleEditCSVFormat = (format: any) => {
    setEditingCSV(format);
    setCSVFormName(format.name);
    setCSVItemCol(format.columns.itemName);
    setCSVQuantityCol(format.columns.quantity);
    setCSVDateCol(format.columns.date || '');
    setCSVDialogOpen(true);
  };

  const resetCSVForm = () => {
    setEditingCSV(null);
    setCSVFormName('');
    setCSVItemCol('');
    setCSVQuantityCol('');
    setCSVDateCol('');
  };

  const handleSaveMapping = () => {
    if (!mappingSaleItem || mappingIngredients.length === 0) {
      toast.error('Please add at least one ingredient mapping');
      return;
    }

    const mapping = {
      saleItem: mappingSaleItem,
      ingredients: mappingIngredients,
    };

    if (editingMapping) {
      updateIngredientMapping(editingMapping.saleItem, mapping);
      toast.success('Ingredient mapping updated successfully');
    } else {
      addIngredientMapping(mapping);
      toast.success('Ingredient mapping added successfully');
    }

    resetMappingForm();
    setMappingDialogOpen(false);
  };

  const handleEditMapping = (mapping: any) => {
    setEditingMapping(mapping);
    setMappingSaleItem(mapping.saleItem);
    setMappingIngredients([...mapping.ingredients]);
    setMappingDialogOpen(true);
  };

  const resetMappingForm = () => {
    setEditingMapping(null);
    setMappingSaleItem('');
    setMappingIngredients([]);
  };

  const addIngredientToMapping = () => {
    setMappingIngredients([
      ...mappingIngredients,
      { ingredientName: '', quantityUsed: 0, unit: '' },
    ]);
  };

  const updateMappingIngredient = (index: number, field: string, value: any) => {
    const updated = [...mappingIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setMappingIngredients(updated);
  };

  const removeMappingIngredient = (index: number) => {
    setMappingIngredients(mappingIngredients.filter((_, i) => i !== index));
  };

  const handleUpdateThreshold = (itemId: string, newThreshold: number) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      updateInventoryItem(itemId, { ...item, threshold: newThreshold });
      toast.success(`Threshold updated for ${item.name}`);
    }
  };

  return (
    <div className="p-8">
      <Toaster />
      
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Configuration</h1>
        <p className="text-gray-600">Manage CSV formats, ingredient mappings, and stock thresholds</p>
      </div>

      <Tabs defaultValue="csv" className="space-y-6">
        <TabsList>
          <TabsTrigger value="csv">CSV Formats</TabsTrigger>
          <TabsTrigger value="mappings">Ingredient Mappings</TabsTrigger>
          <TabsTrigger value="thresholds">Stock Thresholds</TabsTrigger>
        </TabsList>

        {/* CSV Formats Tab */}
        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CSV Format Configuration</CardTitle>
                  <CardDescription>
                    Define the expected format of your sales CSV files
                  </CardDescription>
                </div>
                <Dialog open={csvDialogOpen} onOpenChange={(open) => {
                  setCSVDialogOpen(open);
                  if (!open) resetCSVForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Add Format
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCSV ? 'Edit' : 'Add'} CSV Format</DialogTitle>
                      <DialogDescription>
                        Define the column names in your CSV file
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="format-name">Format Name *</Label>
                        <Input
                          id="format-name"
                          value={csvFormName}
                          onChange={(e) => setCSVFormName(e.target.value)}
                          placeholder="e.g., Standard Format"
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-col">Item Name Column *</Label>
                        <Input
                          id="item-col"
                          value={csvItemCol}
                          onChange={(e) => setCSVItemCol(e.target.value)}
                          placeholder="e.g., Item or Product"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity-col">Quantity Column *</Label>
                        <Input
                          id="quantity-col"
                          value={csvQuantityCol}
                          onChange={(e) => setCSVQuantityCol(e.target.value)}
                          placeholder="e.g., Quantity or Qty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date-col">Date Column (Optional)</Label>
                        <Input
                          id="date-col"
                          value={csvDateCol}
                          onChange={(e) => setCSVDateCol(e.target.value)}
                          placeholder="e.g., Date or SaleDate"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setCSVDialogOpen(false);
                        resetCSVForm();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveCSVFormat}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {csvFormats.map(format => (
                  <div key={format.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{format.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Item: <span className="font-mono">{format.columns.itemName}</span></p>
                        <p>Quantity: <span className="font-mono">{format.columns.quantity}</span></p>
                        {format.columns.date && (
                          <p>Date: <span className="font-mono">{format.columns.date}</span></p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCSVFormat(format)}>
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteCSVFormat(format.id);
                          toast.success('CSV format deleted');
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingredient Mappings Tab */}
        <TabsContent value="mappings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ingredient Mapping Configuration</CardTitle>
                  <CardDescription>
                    Map sale items to the ingredients they consume
                  </CardDescription>
                </div>
                <Dialog open={mappingDialogOpen} onOpenChange={(open) => {
                  setMappingDialogOpen(open);
                  if (!open) resetMappingForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Add Mapping
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingMapping ? 'Edit' : 'Add'} Ingredient Mapping</DialogTitle>
                      <DialogDescription>
                        Define which ingredients are used when a sale item is sold
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="sale-item">Sale Item Name *</Label>
                        <Input
                          id="sale-item"
                          value={mappingSaleItem}
                          onChange={(e) => setMappingSaleItem(e.target.value)}
                          placeholder="e.g., Chocolate Cake"
                          disabled={!!editingMapping}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Ingredients *</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addIngredientToMapping}>
                            <Plus className="size-4 mr-2" />
                            Add Ingredient
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {mappingIngredients.map((ingredient, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Label className="text-xs">Ingredient</Label>
                                <Input
                                  value={ingredient.ingredientName}
                                  onChange={(e) => updateMappingIngredient(index, 'ingredientName', e.target.value)}
                                  placeholder="e.g., Flour"
                                />
                              </div>
                              <div className="w-32">
                                <Label className="text-xs">Quantity</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={ingredient.quantityUsed}
                                  onChange={(e) => updateMappingIngredient(index, 'quantityUsed', parseFloat(e.target.value))}
                                  placeholder="0.5"
                                />
                              </div>
                              <div className="w-24">
                                <Label className="text-xs">Unit</Label>
                                <Input
                                  value={ingredient.unit}
                                  onChange={(e) => updateMappingIngredient(index, 'unit', e.target.value)}
                                  placeholder="kg"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMappingIngredient(index)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ))}

                          {mappingIngredients.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No ingredients added yet. Click "Add Ingredient" to start.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setMappingDialogOpen(false);
                        resetMappingForm();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveMapping}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredientMappings.map(mapping => (
                  <div key={mapping.saleItem} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium">{mapping.saleItem}</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditMapping(mapping)}>
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            deleteIngredientMapping(mapping.saleItem);
                            toast.success('Ingredient mapping deleted');
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {mapping.ingredients.map((ingredient, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          • {ingredient.ingredientName}: {ingredient.quantityUsed} {ingredient.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Thresholds Tab */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>Stock Threshold Configuration</CardTitle>
              <CardDescription>
                Set minimum stock levels for inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Current Stock: {item.currentStock} {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`threshold-${item.id}`} className="text-sm whitespace-nowrap">
                        Threshold:
                      </Label>
                      <Input
                        id={`threshold-${item.id}`}
                        type="number"
                        className="w-24"
                        value={item.threshold}
                        onChange={(e) => handleUpdateThreshold(item.id, parseFloat(e.target.value))}
                      />
                      <span className="text-sm text-gray-600">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}