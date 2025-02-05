import { Lead } from '../types/Lead';
import { useState } from 'react';
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
  const [confirmEmailLead, setConfirmEmailLead] = useState<Lead | null>(null);

  const handleSendEmail = (lead: Lead) => {
    setConfirmEmailLead(lead);
  };

  const handleConfirmEmail = () => {
    if (confirmEmailLead) {
      onSendEmail(confirmEmailLead);
      setConfirmEmailLead(null);
    }
  };

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
                      onClick={() => handleSendEmail(lead)}
                      // disabled={lead.lead_gen_status !== 'Processed'} TODO: remove or update lead gen status
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

      {confirmEmailLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Send Email</h3>
            <p>Are you sure you want to send an email to {confirmEmailLead.contact_name || 'the contact'}?</p>
            <div className="modal-actions">
              <button onClick={handleConfirmEmail} className="confirm-button">
                Send Email
              </button>
              <button onClick={() => setConfirmEmailLead(null)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}