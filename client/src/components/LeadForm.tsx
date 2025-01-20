import { useState } from 'react';
import { Lead } from '../types/Lead';

interface LeadFormProps {
  initialData?: Lead;
  leadTypes: { id: number; name: string }[];
  onSubmit: (lead: Lead) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function LeadForm({ initialData, leadTypes, onSubmit, onCancel, onDelete }: LeadFormProps) {
  const [formData, setFormData] = useState<Lead>(initialData || {
    name: '',
    email: '',
    phone: '',
    status: 'New',
    notes: '',
    type: leadTypes[0] ? { id: leadTypes[0].id, name: leadTypes[0].name } : undefined,
    lead_gen_status: 'Pending',
    message: '',
    contact_name: 'New Contact',
    contact_email: 'contact@example.com'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="lead-form">
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="form-group">
        <label>Contact Name</label>
        <input
          type="text"
          name="contact_name"
          value={formData.contact_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Contact Email</label>
        <input
          type="email"
          name="contact_email"
          value={formData.contact_email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Lead Type</label>
        <select
          name="type"
          value={formData.type?.id || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            type: {
              id: parseInt(e.target.value),
              name: e.target.selectedOptions[0].text
            }
          }))}
          required
          disabled={leadTypes.length === 0}
        >
          {leadTypes.length > 0 ? (
            leadTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No lead types available
            </option>
          )}
        </select>
      </div>

      <div className="form-group">
        <label>Lead Gen Status</label>
        <select
          name="lead_gen_status"
          value={formData.lead_gen_status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="Processed">Processed</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <div className="left-actions">
          <button type="submit" className="save-button">Save</button>
          <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
        {initialData && onDelete && (
          <div className="right-actions">
            <button
              type="button"
              className="delete-button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this lead?')) {
                  onDelete();
                }
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </form>
  );
}