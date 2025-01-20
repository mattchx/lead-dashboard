import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadType } from '../types/Lead';
import LeadTable from '../components/LeadTable';
import LeadForm from '../components/LeadForm';

interface DashboardProps {
  onLogout: () => void;
}

import './Dashboard.css';

export default function Dashboard({ onLogout }: DashboardProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadTypes, setLeadTypes] = useState<LeadType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeadTypes = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/lead-types', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError("Response is not JSON");
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new TypeError("Expected array of lead types");
      }
      setLeadTypes(data);
    } catch (error) {
      console.error('Error fetching lead types:', error);
    }
  };

  useEffect(() => {
    fetchLeadTypes();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/leads', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        console.error('Invalid leads data format:', data);
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleCreate = () => {
    setCurrentLead(null);
    setShowForm(true);
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await fetch(`http://localhost:3002/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleSendEmail = async (lead: Lead) => {
    try {
      await fetch('http://localhost:3002/api/leads/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(lead)
      });
      // Optionally show success message
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSubmit = async (lead: Lead) => {
    try {
      const method = lead.id ? 'PUT' : 'POST';
      const url = lead.id
        ? `http://localhost:3002/api/leads/${lead.id}`
        : 'http://localhost:3002/api/leads';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(lead)
      });

      setShowForm(false);
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Lead Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="lead-management">
        <div className="lead-actions">
          <div className="filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
            
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button onClick={handleCreate} className="create-button">
            Add New Lead
          </button>
        </div>

        {showForm ? (
          <LeadForm
            initialData={currentLead || undefined}
            leadTypes={leadTypes}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <LeadTable
            leads={leads}
            onStatusUpdate={handleStatusUpdate}
            onSendEmail={handleSendEmail}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}