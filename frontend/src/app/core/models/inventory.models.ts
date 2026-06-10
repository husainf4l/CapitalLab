export type InventoryTransactionType = 'StockIn' | 'StockOut' | 'Adjustment' | 'Transfer' | 'Expired' | 'Damaged';
export type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'Approved' | 'Received' | 'Cancelled';

export interface InventoryItem {
  id: string;
  branchId: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  costPrice: number;
  stockValue: number;
  supplierName?: string;
  expiryDate?: string;
  batchNumber?: string;
  isLowStock: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  branchId: string;
  transactionType: InventoryTransactionType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason?: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  branchId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  currency: string;
  orderedAt?: string;
  receivedAt?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface CreateInventoryItemRequest {
  branchId: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  initialStock: number;
  minimumStock: number;
  maximumStock: number;
  costPrice: number;
  supplierName?: string;
  expiryDate?: string;
  batchNumber?: string;
}

export interface StockMovementRequest {
  quantity: number;
  unitCost: number;
  reason?: string;
  referenceNumber?: string;
}

export interface CreatePurchaseOrderRequest {
  branchId: string;
  supplierName: string;
  currency: string;
  notes?: string;
  items: { inventoryItemId: string; quantity: number; unitCost: number }[];
}
