import { Lead } from '../types/Lead';

interface LeadTableProps {
  leads: Lead[];
  onStatusUpdate: (id: number, newStatus: string) => void;
  onSendEmail: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  filterStatus?: string;
  searchQuery?: string;
}

export default function LeadTable({ leads, onStatusUpdate, onSendEmail, onEdit, filterStatus, searchQuery }: LeadTableProps) {
  return (
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
              lead.phone.includes(searchQuery)
            )
          )
          .map((lead) => (
          <tr key={lead.id}>
            <td>{lead.name}</td>
            <td>{lead.email}</td>
            <td>{lead.phone}</td>
            <td>{lead.contactName}</td>
            <td>{lead.contactEmail}</td>
            <td>{lead.type?.name || 'No Type'}</td>
            <td>{lead.status}</td>
            <td>
              <select
                value={lead.leadGenStatus}
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
                  disabled={lead.leadGenStatus !== 'Processed'}
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
  );
}