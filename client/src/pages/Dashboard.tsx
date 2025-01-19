import { useState, useEffect } from 'react';
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
  const [showForm, setShowForm] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);

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
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleCreate = () => {
    setCurrentLead(null);
    setShowForm(true);
  };

  const handleEdit = (lead: Lead) => {
    setCurrentLead(lead);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3002/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
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
          <button onClick={handleCreate} className="create-button">
            Add New Lead
          </button>
        </div>

        {showForm ? (
          <LeadForm
            initialData={currentLead || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <LeadTable
            leads={leads}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}