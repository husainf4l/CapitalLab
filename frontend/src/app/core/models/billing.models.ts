export type InvoiceStatus = 'Draft' | 'Issued' | 'PartiallyPaid' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded';
export type InvoiceItemType = 'Test' | 'Package' | 'Service' | 'Other';
export type PaymentMethod = 'Cash' | 'Card' | 'BankTransfer' | 'CliQ' | 'Insurance' | 'Online';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  itemType: InvoiceItemType;
  referenceId?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  testOrderId?: string;
  branchId: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt?: string;
  dueAt?: string;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  patientId: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  patientId: string;
  branchId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateInvoiceRequest {
  patientId: string;
  branchId: string;
  testOrderId?: string;
  currency: string;
  taxAmount: number;
  discountAmount: number;
  dueAt?: string;
  notes?: string;
  items: {
    description: string;
    itemType: InvoiceItemType;
    referenceId?: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
  }[];
}

export interface RecordPaymentRequest {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
  notes?: string;
}
