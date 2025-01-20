export interface LeadType {
  id: number;
  name: string;
}

export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: LeadType;
  leadGenStatus: 'Pending' | 'Processed' | 'Archived';
  message?: string;
  contactName: string;
  contactEmail: string;
}