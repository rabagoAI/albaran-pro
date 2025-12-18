
export interface Customer {
  id: string;
  name: string;
  address: string;
  taxId: string;
  email: string;
  phone: string;
}

export interface AlbaranItem {
  id: string;
  product: string;
  netWeight: string;
  lot: string;
  quantity: number;
  price: number;
  total: number;
  customFields?: Record<string, string>;
}

export interface CompanyHeader {
  name: string;
  address: string;
  taxId: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface Albaran {
  id: string;
  number: string;
  date: string;
  header: CompanyHeader;
  customer: Customer;
  items: AlbaranItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  hidePrices: boolean;
  extraColumnNames?: string[];
}

export type ViewType = 'new' | 'history' | 'customers' | 'settings';
