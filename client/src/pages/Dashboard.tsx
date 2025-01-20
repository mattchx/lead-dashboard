import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { Lead } from '../types/Lead';
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
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleEdit = (lead: Lead) => {
    setCurrentLead(lead);
    setShowForm(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await fetch(`http://localhost:3002/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowForm(false);
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleExport = useCallback(() => {
    const filteredLeads = leads.filter(lead =>
      (!filterStatus || lead.status === filterStatus) &&
      (!searchQuery ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    const worksheet = XLSX.utils.json_to_sheet(filteredLeads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'leads.xlsx');
  }, [leads, filterStatus, searchQuery]);

  const handleSubmit = async (lead: Lead) => {
    try {
      await fetch(`http://localhost:3002/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(lead)
      });
      setShowForm(false);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
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
          <button
            onClick={handleExport}
            className="export-button"
            title="Export to Excel"
          >
            Export
          </button>
        </div>

        {showForm ? (
          <LeadForm
            initialData={currentLead || undefined}
            leadTypes={[]}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            onDelete={currentLead?.id ? () => handleDelete(currentLead.id) : undefined}
          />
        ) : (
          <LeadTable
            leads={leads}
            onStatusUpdate={handleStatusUpdate}
            onSendEmail={handleSendEmail}
            onEdit={handleEdit}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}