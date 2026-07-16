import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Truck, Map, Settings, LogOut, Package,
  Activity, AlertCircle, CheckCircle2, Navigation
} from 'lucide-react';

const AdminView: React.FC = () => (
  <>
    <div className="stats-grid">
      {[
        { label: 'Total Users', value: '24', icon: <Users size={22} color="#6366f1" />, color: 'rgba(99,102,241,0.1)' },
        { label: 'Active Vehicles', value: '12', icon: <Truck size={22} color="#a855f7" />, color: 'rgba(168,85,247,0.1)' },
        { label: 'Active Routes', value: '8', icon: <Navigation size={22} color="#06b6d4" />, color: 'rgba(6,182,212,0.1)' },
        { label: 'Deliveries Today', value: '47', icon: <Package size={22} color="#10b981" />, color: 'rgba(16,185,129,0.1)' },
      ].map((stat) => (
        <div key={stat.label} className="stat-card glass-card">
          <div className="stat-info">
            <h3>{stat.label}</h3>
            <p>{stat.value}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: stat.color }}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>

    <div className="glass-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>User Management</h2>
      <div className="table-container">
        <table className="fms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'System Administrator', email: 'admin@fms.com', role: 'ADMIN', active: true },
              { name: 'John Dispatcher', email: 'dispatch@fms.com', role: 'DISPATCHER', active: true },
              { name: 'Jane Driver', email: 'driver@fms.com', role: 'DRIVER', active: true },
            ].map((u) => (
              <tr key={u.email}>
                <td>{u.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : u.role === 'DISPATCHER' ? 'badge-secondary' : 'badge-accent'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className="badge badge-success">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

const DispatcherView: React.FC = () => (
  <>
    <div className="stats-grid">
      {[
        { label: 'Pending Routes', value: '5', icon: <Map size={22} color="#6366f1" />, color: 'rgba(99,102,241,0.1)' },
        { label: 'Active Drivers', value: '9', icon: <Activity size={22} color="#a855f7" />, color: 'rgba(168,85,247,0.1)' },
        { label: 'Completed Today', value: '23', icon: <CheckCircle2 size={22} color="#10b981" />, color: 'rgba(16,185,129,0.1)' },
        { label: 'Alerts', value: '2', icon: <AlertCircle size={22} color="#f59e0b" />, color: 'rgba(245,158,11,0.1)' },
      ].map((stat) => (
        <div key={stat.label} className="stat-card glass-card">
          <div className="stat-info">
            <h3>{stat.label}</h3>
            <p>{stat.value}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: stat.color }}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>

    <div className="glass-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Dispatch Queue</h2>
      <div className="table-container">
        <table className="fms-table">
          <thead>
            <tr>
              <th>Route ID</th>
              <th>Driver</th>
              <th>Destination</th>
              <th>ETA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'RT-001', driver: 'Mike Johnson', dest: 'Warehouse A', eta: '10:45 AM', status: 'In Transit' },
              { id: 'RT-002', driver: 'Sarah Lee', dest: 'Hub Central', eta: '11:30 AM', status: 'Loading' },
              { id: 'RT-003', driver: 'Dave Kim', dest: 'Depot South', eta: '12:15 PM', status: 'Pending' },
            ].map((r) => (
              <tr key={r.id}>
                <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{r.id}</td>
                <td>{r.driver}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.dest}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.eta}</td>
                <td><span className="badge badge-primary">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

const DriverView: React.FC = () => (
  <>
    <div className="stats-grid">
      {[
        { label: 'My Active Jobs', value: '2', icon: <Truck size={22} color="#6366f1" />, color: 'rgba(99,102,241,0.1)' },
        { label: 'Completed Today', value: '5', icon: <CheckCircle2 size={22} color="#10b981" />, color: 'rgba(16,185,129,0.1)' },
        { label: 'Distance Today', value: '142 km', icon: <Navigation size={22} color="#a855f7" />, color: 'rgba(168,85,247,0.1)' },
        { label: 'Alerts', value: '0', icon: <AlertCircle size={22} color="#06b6d4" />, color: 'rgba(6,182,212,0.1)' },
      ].map((stat) => (
        <div key={stat.label} className="stat-card glass-card">
          <div className="stat-info">
            <h3>{stat.label}</h3>
            <p>{stat.value}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: stat.color }}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>

    <div className="glass-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>My Assigned Routes</h2>
      <div className="table-container">
        <table className="fms-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Pickup</th>
              <th>Drop-off</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'JB-201', pickup: 'Main Depot', dropoff: 'Client A', time: '09:00 AM', status: 'Completed' },
              { id: 'JB-202', pickup: 'Warehouse B', dropoff: 'Client C', time: '01:00 PM', status: 'In Progress' },
            ].map((j) => (
              <tr key={j.id}>
                <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{j.id}</td>
                <td>{j.pickup}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{j.dropoff}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{j.time}</td>
                <td>
                  <span className={`badge ${j.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                    {j.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.roles?.[0] || 'USER';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const renderView = () => {
    if (user?.roles.includes('ADMIN')) return <AdminView />;
    if (user?.roles.includes('DISPATCHER')) return <DispatcherView />;
    return <DriverView />;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">⚡ FMS</div>
        <ul className="sidebar-menu">
          <li className="sidebar-item active">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </li>
          {user?.roles.includes('ADMIN') && (
            <li className="sidebar-item">
              <Users size={18} />
              <span>Users</span>
            </li>
          )}
          <li className="sidebar-item">
            <Truck size={18} />
            <span>Vehicles</span>
          </li>
          <li className="sidebar-item">
            <Map size={18} />
            <span>Routes</span>
          </li>
          <li className="sidebar-item">
            <Package size={18} />
            <span>Jobs</span>
          </li>
          <li className="sidebar-item">
            <Settings size={18} />
            <span>Settings</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-item" style={{ display: 'flex', marginBottom: '8px' }}>
            <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '12px' }}>{initials}</div>
            <div style={{ marginLeft: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{roleLabel}</div>
            </div>
          </Link>
          <button onClick={handleLogout} className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="header-bar">
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700 }}>
              Welcome back, {user?.firstName} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="user-profile-badge">
            <div className="avatar-circle">{initials}</div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{roleLabel}</span>
          </div>
        </div>

        {renderView()}
      </main>
    </div>
  );
};
