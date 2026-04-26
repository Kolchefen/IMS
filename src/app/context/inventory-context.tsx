import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface CSVFormat {
  id: string;
  name: string;
  columns: {
    itemName: string;
    quantity: string;
    date?: string;
  };
}

export interface IngredientMapping {
  saleItem: string;
  ingredients: {
    ingredientName: string;
    quantityUsed: number;
    unit: string;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  threshold: number;
  lastUpdated: string;
}

export interface SalesRecord {
  id: string;
  itemName: string;
  quantity: number;
  date: string;
}

interface InventoryContextType {
  // CSV Formats
  csvFormats: CSVFormat[];
  addCSVFormat: (format: CSVFormat) => void;
  updateCSVFormat: (id: string, format: CSVFormat) => void;
  deleteCSVFormat: (id: string) => void;
  
  // Ingredient Mappings
  ingredientMappings: IngredientMapping[];
  addIngredientMapping: (mapping: IngredientMapping) => void;
  updateIngredientMapping: (saleItem: string, mapping: IngredientMapping) => void;
  deleteIngredientMapping: (saleItem: string) => void;
  
  // Inventory Items
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  
  // Sales Records
  salesRecords: SalesRecord[];
  addSalesRecords: (records: SalesRecord[]) => void;
  clearSalesRecords: () => void;
  
  // Process sales to update inventory
  processSalesData: (records: SalesRecord[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Sample data
const sampleCSVFormats: CSVFormat[] = [
  {
    id: '1',
    name: 'Standard Format',
    columns: {
      itemName: 'Item',
      quantity: 'Quantity',
      date: 'Date',
    },
  },
];

const sampleInventoryItems: InventoryItem[] = [
  { id: '1', name: 'Flour', currentStock: 50, unit: 'kg', threshold: 20, lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Sugar', currentStock: 30, unit: 'kg', threshold: 15, lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Milk', currentStock: 40, unit: 'L', threshold: 25, lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Eggs', currentStock: 200, unit: 'units', threshold: 100, lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Butter', currentStock: 15, unit: 'kg', threshold: 10, lastUpdated: new Date().toISOString() },
];

const sampleIngredientMappings: IngredientMapping[] = [
  {
    saleItem: 'Chocolate Cake',
    ingredients: [
      { ingredientName: 'Flour', quantityUsed: 0.5, unit: 'kg' },
      { ingredientName: 'Sugar', quantityUsed: 0.3, unit: 'kg' },
      { ingredientName: 'Eggs', quantityUsed: 4, unit: 'units' },
      { ingredientName: 'Butter', quantityUsed: 0.2, unit: 'kg' },
    ],
  },
  {
    saleItem: 'Vanilla Cake',
    ingredients: [
      { ingredientName: 'Flour', quantityUsed: 0.4, unit: 'kg' },
      { ingredientName: 'Sugar', quantityUsed: 0.25, unit: 'kg' },
      { ingredientName: 'Milk', quantityUsed: 0.5, unit: 'L' },
      { ingredientName: 'Eggs', quantityUsed: 3, unit: 'units' },
    ],
  },
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [csvFormats, setCSVFormats] = useState<CSVFormat[]>(sampleCSVFormats);
  const [ingredientMappings, setIngredientMappings] = useState<IngredientMapping[]>(sampleIngredientMappings);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(sampleInventoryItems);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);

  // CSV Format management
  const addCSVFormat = (format: CSVFormat) => {
    setCSVFormats([...csvFormats, format]);
  };

  const updateCSVFormat = (id: string, format: CSVFormat) => {
    setCSVFormats(csvFormats.map(f => f.id === id ? format : f));
  };

  const deleteCSVFormat = (id: string) => {
    setCSVFormats(csvFormats.filter(f => f.id !== id));
  };

  // Ingredient Mapping management
  const addIngredientMapping = (mapping: IngredientMapping) => {
    setIngredientMappings([...ingredientMappings, mapping]);
  };

  const updateIngredientMapping = (saleItem: string, mapping: IngredientMapping) => {
    setIngredientMappings(ingredientMappings.map(m => m.saleItem === saleItem ? mapping : m));
  };

  const deleteIngredientMapping = (saleItem: string) => {
    setIngredientMappings(ingredientMappings.filter(m => m.saleItem !== saleItem));
  };

  // Inventory Item management
  const addInventoryItem = (item: InventoryItem) => {
    setInventoryItems([...inventoryItems, item]);
  };

  const updateInventoryItem = (id: string, item: InventoryItem) => {
    setInventoryItems(inventoryItems.map(i => i.id === id ? item : i));
  };

  const deleteInventoryItem = (id: string) => {
    setInventoryItems(inventoryItems.filter(i => i.id !== id));
  };

  // Sales Records management
  const addSalesRecords = (records: SalesRecord[]) => {
    setSalesRecords([...salesRecords, ...records]);
  };

  const clearSalesRecords = () => {
    setSalesRecords([]);
  };

  // Process sales data to update inventory
  const processSalesData = (records: SalesRecord[]) => {
    const updatedInventory = [...inventoryItems];
    
    records.forEach(sale => {
      const mapping = ingredientMappings.find(m => m.saleItem === sale.itemName);
      
      if (mapping) {
        mapping.ingredients.forEach(ingredient => {
          const inventoryItem = updatedInventory.find(i => i.name === ingredient.ingredientName);
          
          if (inventoryItem) {
            const totalUsed = ingredient.quantityUsed * sale.quantity;
            inventoryItem.currentStock = Math.max(0, inventoryItem.currentStock - totalUsed);
            inventoryItem.lastUpdated = new Date().toISOString();
          }
        });
      }
    });
    
    setInventoryItems(updatedInventory);
    addSalesRecords(records);
  };

  return (
    <InventoryContext.Provider
      value={{
        csvFormats,
        addCSVFormat,
        updateCSVFormat,
        deleteCSVFormat,
        ingredientMappings,
        addIngredientMapping,
        updateIngredientMapping,
        deleteIngredientMapping,
        inventoryItems,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        salesRecords,
        addSalesRecords,
        clearSalesRecords,
        processSalesData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
