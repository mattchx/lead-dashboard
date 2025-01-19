import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="dashboard-container">
      <h1>Lead Dashboard</h1>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      {/* Lead management components will go here */}
    </div>
  );
}