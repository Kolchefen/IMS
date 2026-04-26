import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchInventoryData, saveInventoryData } from './inventory-api';

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


export function InventoryProvider({ children }: { children: ReactNode }) {
  const [csvFormats, setCSVFormats] = useState<CSVFormat[]>([]);
  const [ingredientMappings, setIngredientMappings] = useState<IngredientMapping[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from backend on mount
  useEffect(() => {
    fetchInventoryData()
      .then(data => {
        setCSVFormats(data.csvFormats || []);
        setIngredientMappings(data.ingredientMappings || []);
        setInventoryItems(data.inventoryItems || []);
        setSalesRecords(data.salesRecords || []);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load data from backend.');
        setLoading(false);
      });
  }, []);

  // Save all data to backend
  const persist = (next: Partial<{
    csvFormats: CSVFormat[];
    ingredientMappings: IngredientMapping[];
    inventoryItems: InventoryItem[];
    salesRecords: SalesRecord[];
  }>) => {
    const data = {
      csvFormats: next.csvFormats ?? csvFormats,
      ingredientMappings: next.ingredientMappings ?? ingredientMappings,
      inventoryItems: next.inventoryItems ?? inventoryItems,
      salesRecords: next.salesRecords ?? salesRecords,
    };
    saveInventoryData(data).catch(() => {
      setError('Failed to save data to backend.');
    });
  };
  // CSV Format management
  const addCSVFormat = (format: CSVFormat) => {
    const updated = [...csvFormats, format];
    setCSVFormats(updated);
    persist({ csvFormats: updated });
  };

  const updateCSVFormat = (id: string, format: CSVFormat) => {
    const updated = csvFormats.map(f => f.id === id ? format : f);
    setCSVFormats(updated);
    persist({ csvFormats: updated });
  };

  const deleteCSVFormat = (id: string) => {
    const updated = csvFormats.filter(f => f.id !== id);
    setCSVFormats(updated);
    persist({ csvFormats: updated });
  };

  // Ingredient Mapping management
  const addIngredientMapping = (mapping: IngredientMapping) => {
    const updated = [...ingredientMappings, mapping];
    setIngredientMappings(updated);
    persist({ ingredientMappings: updated });
  };

  const updateIngredientMapping = (saleItem: string, mapping: IngredientMapping) => {
    const updated = ingredientMappings.map(m => m.saleItem === saleItem ? mapping : m);
    setIngredientMappings(updated);
    persist({ ingredientMappings: updated });
  };

  const deleteIngredientMapping = (saleItem: string) => {
    const updated = ingredientMappings.filter(m => m.saleItem !== saleItem);
    setIngredientMappings(updated);
    persist({ ingredientMappings: updated });
  };

  // Inventory Item management
  const addInventoryItem = (item: InventoryItem) => {
    const updated = [...inventoryItems, item];
    setInventoryItems(updated);
    persist({ inventoryItems: updated });
  };

  const updateInventoryItem = (id: string, item: InventoryItem) => {
    const updated = inventoryItems.map(i => i.id === id ? item : i);
    setInventoryItems(updated);
    persist({ inventoryItems: updated });
  };

  const deleteInventoryItem = (id: string) => {
    const updated = inventoryItems.filter(i => i.id !== id);
    setInventoryItems(updated);
    persist({ inventoryItems: updated });
  };

  // Sales Records management
  const addSalesRecords = (records: SalesRecord[]) => {
    const updated = [...salesRecords, ...records];
    setSalesRecords(updated);
    persist({ salesRecords: updated });
  };

  const clearSalesRecords = () => {
    setSalesRecords([]);
    persist({ salesRecords: [] });
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
    const updatedSales = [...salesRecords, ...records];
    setSalesRecords(updatedSales);
    persist({ inventoryItems: updatedInventory, salesRecords: updatedSales });
  };

  if (loading) return <div>Loading inventory data...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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
