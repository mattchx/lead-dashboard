export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}