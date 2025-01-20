import { useCallback } from 'react';
import { Lead } from '../types/Lead';
import * as XLSX from 'xlsx';
import './LeadTable.css';

interface LeadTableProps {
  leads: Lead[];
  onStatusUpdate: (id: number, newStatus: string) => void;
  onSendEmail: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  filterStatus?: string;
  searchQuery?: string;
}

export default function LeadTable({ leads, onStatusUpdate, onSendEmail, onEdit, filterStatus, searchQuery }: LeadTableProps) {
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'leads.xlsx');
  }, [leads]);
  return (
    <div className="table-container">
      <table className="lead-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Contact Name</th>
          <th>Contact Email</th>
          <th>Type</th>
          <th>Status</th>
          <th>Lead Gen Status</th>
          <th>Actions</th>
          <th>
            <button
              onClick={handleExport}
              className="export-button"
              title="Export to Excel"
            >
              Export
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {leads
          .filter(lead =>
            (!filterStatus || lead.status === filterStatus) &&
            (!searchQuery ||
              lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              lead.phone.includes(searchQuery) ||
              lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
          .map((lead) => (
          <tr key={lead.id}>
            <td>{lead.name}</td>
            <td>{lead.email}</td>
            <td>{lead.phone}</td>
            <td>{lead.contact_name}</td>
            <td>{lead.contact_email}</td>
            <td>{lead.type?.name || 'No Type'}</td>
            <td>{lead.status}</td>
            <td>
              <select
                value={lead.lead_gen_status}
                onChange={(e) => onStatusUpdate(lead.id!, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Processed">Processed</option>
                <option value="Archived">Archived</option>
              </select>
            </td>
            <td>
              <div className="actions-container">
                <button
                  onClick={() => onEdit(lead)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => onSendEmail(lead)}
                  disabled={lead.lead_gen_status !== 'Processed'}
                  className="email-button"
                >
                  Send Email
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}