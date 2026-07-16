import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Truck, AlertCircle, Navigation, Bell, Clock, Search, Plus,
  Sun, Moon, Menu
} from 'lucide-react';
import { AppSidebar } from '../components/AppSidebar';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Light/Dark mode switcher hook
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Real-time clock for system telemetry
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: true }));
  const [systemDate] = useState(new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Logout and the profile capsule now live in the shared AppSidebar.
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const renderContent = () => {
    return (
      <>
        {/* STATS ROW (4 Cards) */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '24px' }}>
          
          {/* Stats Card 1: Active Vehicles */}
          <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--panel-3)', border: '1px solid var(--border-soft)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={18} color="var(--green)" />
              </div>
              <span className="mono-label" style={{ color: 'var(--green)', fontSize: '10px' }}>▲ 12% vs yest</span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="mono-label" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-1)', display: 'block' }}>128</span>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px', display: 'block' }}>Active vehicles</span>
            </div>
          </div>

          {/* Stats Card 2: On-time Rate */}
          <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--panel-3)', border: '1px solid var(--border-soft)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="var(--green)" />
              </div>
              <span className="mono-label" style={{ color: 'var(--green)', fontSize: '10px' }}>▲ 2.1% vs yest</span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="mono-label" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-1)', display: 'block' }}>96%</span>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px', display: 'block' }}>On-time rate</span>
            </div>
          </div>

          {/* Stats Card 3: Km Tracked Today */}
          <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--panel-3)', border: '1px solid var(--border-soft)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navigation size={18} color="var(--green)" />
              </div>
              <span className="mono-label" style={{ color: 'var(--amber)', fontSize: '10px' }}>▼ 4.5% vs yest</span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="mono-label" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-1)', display: 'block' }}>1,840</span>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px', display: 'block' }}>Km tracked today</span>
            </div>
          </div>

          {/* Stats Card 4: Open Alerts */}
          <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--panel-3)', border: '1px solid var(--border-soft)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={18} color="var(--red)" />
              </div>
              <span className="mono-label" style={{ color: 'var(--text-3)', fontSize: '10px' }}>0% delta</span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="mono-label" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--red)', display: 'block' }}>3</span>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px', display: 'block' }}>Open alerts</span>
            </div>
          </div>
        </div>

        {/* ROUTE RAIL - SIGNATURE ELEMENT */}
        <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>Live route rail</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', marginTop: '4px' }}>Corridor NH-8 · Delhi → Jaipur belt</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulsing-dot" />
                <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-2)' }}>On schedule</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--amber)', borderRadius: '50%' }} />
                <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-2)' }}>Delayed</span>
              </div>
            </div>
          </div>

          {/* ROAD BED STRIP */}
          <div className="road-rail-container">
            {/* Checkpoint nodes */}
            <div style={{ position: 'absolute', left: '15%', top: 0, bottom: 0, borderLeft: '1px dashed var(--border-soft)', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '10px', left: '-50px', width: '100px', textAlign: 'center' }}>
                <span className="mono-label" style={{ fontSize: '8px', color: 'var(--text-3)' }}>HUB 01 · DELHI</span>
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '-5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--green)', border: '2px solid var(--panel-3)', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px dashed var(--border-soft)', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '10px', left: '-50px', width: '100px', textAlign: 'center' }}>
                <span className="mono-label" style={{ fontSize: '8px', color: 'var(--text-3)' }}>HUB 02 · GURUGRAM</span>
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '-5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--green)', border: '2px solid var(--panel-3)', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ position: 'absolute', left: '85%', top: 0, bottom: 0, borderLeft: '1px dashed var(--border-soft)', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '10px', left: '-50px', width: '100px', textAlign: 'center' }}>
                <span className="mono-label" style={{ fontSize: '8px', color: 'var(--amber)' }}>HUB 03 · JAIPUR</span>
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '-5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--amber)', border: '2px solid var(--panel-3)', transform: 'translateY(-50%)' }} />
            </div>

            {/* Lane divider */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', borderTop: '2px dashed var(--border-soft)', zIndex: 0 }} />

            {/* Loop animating vehicles */}
            <div className="road-vehicle v1" style={{ top: '22%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                <Truck size={11} color="var(--green)" />
                <span className="mono-label" style={{ fontSize: '8px', color: 'var(--text-1)' }}>ARG-014</span>
              </div>
            </div>

            <div className="road-vehicle v2" style={{ top: '60%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                <Truck size={11} color="var(--amber)" />
                <span className="mono-label" style={{ fontSize: '8px', color: 'var(--text-1)' }}>ARG-092</span>
              </div>
            </div>

            <div className="road-vehicle v3" style={{ top: '38%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                <Truck size={11} color="var(--text-3)" />
                <span className="mono-label" style={{ fontSize: '8px', color: 'var(--text-1)' }}>ARG-101</span>
              </div>
            </div>
          </div>

          {/* TELEMETRY FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-soft)', paddingTop: '12px', marginTop: '12px', fontSize: '11px', color: 'var(--text-2)' }}>
            <div>
              <span className="mono-label" style={{ color: 'var(--green)', marginRight: '6px' }}>Route 14</span>
              <span>is ahead of schedule, arriving Hub 02 in 11 min.</span>
            </div>
            <span className="mono-label" style={{ color: 'var(--text-3)', fontSize: '9px' }}>UPDATED 4s AGO</span>
          </div>
        </div>

        {/* LOWER GRID (Transit Table & Live Feed) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '24px', marginTop: '24px', alignItems: 'start' }}>
          
          {/* FLEET IN TRANSIT TABLE */}
          <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>Fleet in transit</h3>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <th className="mono-label" style={{ color: 'var(--text-3)', padding: '10px 8px 12px 0', fontSize: '9px' }}>VEHICLE</th>
                    <th className="mono-label" style={{ color: 'var(--text-3)', padding: '10px 8px 12px 8px', fontSize: '9px' }}>DRIVER</th>
                    <th className="mono-label" style={{ color: 'var(--text-3)', padding: '10px 8px 12px 8px', fontSize: '9px' }}>ROUTE</th>
                    <th className="mono-label" style={{ color: 'var(--text-3)', padding: '10px 8px 12px 8px', fontSize: '9px' }}>STATUS</th>
                    <th className="mono-label" style={{ color: 'var(--text-3)', padding: '10px 8px 12px 8px', fontSize: '9px', width: '90px' }}>PROGRESS</th>
                    <th className="mono-label" style={{ color: 'var(--text-3)', padding: '10px 0 12px 8px', fontSize: '9px' }}>ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'ARG-014', driver: 'Robert Reynolds', initials: 'RR', route: 'Delhi → Jaipur', status: 'ON TIME', progress: 65, eta: '10:45 AM' },
                    { id: 'ARG-092', driver: 'Sarah Jenkins', initials: 'SJ', route: 'Gurugram → Delhi', status: 'DELAYED', progress: 32, eta: '11:22 AM' },
                    { id: 'ARG-047', driver: 'Michael Chen', initials: 'MC', route: 'Jaipur → Gurugram', status: 'ON TIME', progress: 88, eta: '09:50 AM' },
                    { id: 'ARG-058', driver: 'David Miller', initials: 'DM', route: 'Delhi → Noida', status: 'IDLE', progress: 0, eta: '12:00 PM' },
                    { id: 'ARG-101', driver: 'Amanda Ross', initials: 'AR', route: 'Noida → Gurugram', status: 'ON TIME', progress: 50, eta: '10:15 AM' },
                  ].map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background-color 0.2s' }}>
                      <td className="mono-label" style={{ color: 'var(--green)', padding: '12px 8px 12px 0' }}>{row.id}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-dim), var(--green))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--void)', fontWeight: 700 }}>
                            {row.initials}
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{row.driver}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-2)', padding: '12px 8px' }}>{row.route}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className="mono-label" style={{
                          fontSize: '8px',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          backgroundColor: row.status === 'ON TIME' ? 'var(--green-glow)' : row.status === 'DELAYED' ? 'rgba(232, 163, 61, 0.15)' : 'var(--panel-3)',
                          color: row.status === 'ON TIME' ? 'var(--green)' : row.status === 'DELAYED' ? 'var(--amber)' : 'var(--text-3)',
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--panel-3)', borderRadius: '2px' }}>
                          <div style={{ width: `${row.progress}%`, height: '100%', borderRadius: '2px', backgroundColor: row.status === 'DELAYED' ? 'var(--amber)' : 'var(--green)' }} />
                        </div>
                      </td>
                      <td className="mono-label" style={{ color: 'var(--text-2)', padding: '12px 0 12px 8px', fontSize: '11px' }}>{row.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LIVE EVENT FEED */}
          <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>Live events</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulsing-dot" />
                <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-2)' }}>LIVE STREAMING</span>
              </div>
            </div>

            <div className="feed-list">
              {[
                { type: 'green', desc: 'Route ARG-014 reported ahead of schedule.', relative: 'Just now', context: 'DELHI HUB · CORRIDOR NH-8' },
                { type: 'amber', desc: 'Checkpoint delay for ARG-092 at Gurugram.', relative: '2 min ago', context: 'HUB 02 · GURUGRAM' },
                { type: 'green', desc: 'Delivery completed by driver MC for cargo hub.', relative: '8 min ago', context: 'HUB 03 · JAIPUR' },
                { type: 'grey', desc: 'Vehicle ARG-058 status went idle.', relative: '15 min ago', context: 'DELHI HUB · DEPARTURE YARD' },
                { type: 'grey', desc: 'Driver AR checked in for dispatch duty.', relative: '28 min ago', context: 'SYS CHECKIN' },
              ].map((feed, idx) => (
                <div key={idx} className="feed-item">
                  <div className={`feed-node node-${feed.type}`} />
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.4 }}>
                      {feed.desc}
                    </p>
                    <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-3)', display: 'block', marginTop: '4px' }}>
                      {feed.relative} · {feed.context}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="adm-shell">

      {/* The same rail the Admin suite renders, so the nav never shifts on navigation. */}
      <AppSidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {/* FLUID MAIN CONTENT AREA */}
      <main style={{
        flexGrow: 1,
        minWidth: 0,
        padding: '24px 32px 40px',
        backgroundColor: 'var(--void)',
        minHeight: '100vh',
      }}>
        
        {/* TOPBAR HEADER PANEL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '16px', gap: '16px' }}>
          
          {/* Left search telemetry block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '400px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="adm-icon-btn adm-rail-toggle"
              style={{
                backgroundColor: 'var(--panel-2)',
                border: '1px solid var(--border-soft)',
                borderRadius: '8px',
                color: 'var(--text-1)',
                padding: '8px 12px',
                flexShrink: 0,
              }}
              title="Toggle Menu Panel"
            >
              <Menu size={16} />
            </button>
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex' }}>
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle, route, or driver…"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--panel-2)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '8px',
                  padding: '8px 12px 8px 36px',
                  color: 'var(--text-1)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Right operational live feed controllers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--panel-2)',
              border: '1px solid var(--border-soft)',
              padding: '6px 12px',
              borderRadius: '999px',
            }} className="mobile-hide">
              <span className="pulsing-dot" />
              <span className="mono-label" style={{ fontSize: '9px', color: 'var(--text-1)' }}>LIVE FLEET FEED</span>
            </div>

            {/* Theme Switcher Toggle Button */}
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="icon-btn"
              style={{ border: '1px solid var(--border-soft)', backgroundColor: 'var(--panel)' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} color="var(--green)" /> : <Moon size={16} color="var(--green)" />}
            </button>
            
            <button className="icon-btn" style={{ position: 'relative', border: '1px solid var(--border-soft)', backgroundColor: 'var(--panel)' }} title="System Alerts">
              <span className="dot" style={{ backgroundColor: 'var(--red)', border: '2px solid var(--panel)' }} />
              <Bell size={16} />
            </button>
            
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--panel-3)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontSize: '12px', fontWeight: 600 }}>
              {initials}
            </div>
          </div>
        </div>

        {/* PAGE HEAD HEADINGS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(46, 204, 113, 0.08)',
              border: '1px solid rgba(46, 204, 113, 0.15)',
              padding: '4px 10px',
              borderRadius: '999px',
              marginBottom: '12px',
            }}>
              <span className="pulsing-dot" />
              <span className="mono-label" style={{ color: 'var(--green)', fontSize: '8px' }}>Fleet management system</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>
              Welcome back, {user?.firstName}
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: '13px', marginTop: '6px' }}>
              128 vehicles active · telemetry synced at <span className="mono-label" style={{ fontSize: '10px' }}>{systemTime}</span> on <span className="mono-label" style={{ fontSize: '10px' }}>{systemDate}</span>
            </p>
          </div>
          
          <button style={{
            backgroundColor: 'var(--green)',
            color: 'var(--void)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }} className="btn-primary" title="Dispatch new route">
            <Plus size={16} />
            <span>+ Dispatch new route</span>
          </button>
        </div>

        {/* TAB FEED CONTENT */}
        {renderContent()}

      </main>

      {/* Rail responsiveness now lives in admin.css alongside the shared sidebar. */}
      <style>{`
        @media (max-width: 980px) {
          .mobile-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
