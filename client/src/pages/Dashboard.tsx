import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Lead Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="lead-management">
        <h2>Lead Management</h2>
        <table className="lead-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Lead rows will go here */}
          </tbody>
        </table>
      </div>
    </div>
  );
}