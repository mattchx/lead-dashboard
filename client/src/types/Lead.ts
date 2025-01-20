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
  lead_gen_status: 'Pending' | 'Processed' | 'Archived';
  message?: string;
  contact_name: string;
  contact_email: string;
}