import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, FileText, Truck, User, ArrowRight } from 'lucide-react';
import { dispatcherApi } from '../services/dispatcherApi';

interface PaletteItem {
  id: string;
  category: 'Commands' | 'Trips' | 'Vehicles' | 'Drivers' | 'Customers';
  title: string;
  subtitle?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<PaletteItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load searchable data from backend for search results
  useEffect(() => {
    if (!open) return;
    const fetchSearchData = async () => {
      try {
        const [trips, vehicles, drivers, requests] = await Promise.all([
          dispatcherApi.trips().catch(() => []),
          dispatcherApi.vehicles().catch(() => []),
          dispatcherApi.drivers().catch(() => []),
          dispatcherApi.requests().catch(() => []),
        ]);

        const list: PaletteItem[] = [
          // Commands
          { id: 'cmd-board', category: 'Commands', title: 'Go to Dispatch Board', subtitle: 'Navigate to overview board', action: () => navigate('/dispatcher/dashboard') },
          { id: 'cmd-reqs', category: 'Commands', title: 'Go to Transport Requests', subtitle: 'Navigate to requests ledger', action: () => navigate('/dispatcher/requests') },
          { id: 'cmd-trips', category: 'Commands', title: 'Go to Trip Management', subtitle: 'Navigate to runs ledger', action: () => navigate('/dispatcher/trips') },
          { id: 'cmd-drivers', category: 'Commands', title: 'Go to Drivers Roster', subtitle: 'Navigate to driver roster list', action: () => navigate('/dispatcher/drivers') },
          { id: 'cmd-vehicles', category: 'Commands', title: 'Go to Vehicles Fleet', subtitle: 'Navigate to vehicle asset master', action: () => navigate('/dispatcher/vehicles') },
          { id: 'cmd-gate', category: 'Commands', title: 'Go to Gate Queue', subtitle: 'Navigate to security gate queue console', action: () => navigate('/dispatcher/gate-queue') },
          { id: 'cmd-exceptions', category: 'Commands', title: 'Go to Exception Center', subtitle: 'Navigate to telematics alert center', action: () => navigate('/dispatcher/exceptions') },
          { id: 'cmd-reports', category: 'Commands', title: 'Go to Operations Reports', subtitle: 'Navigate to analytics and compliance metrics', action: () => navigate('/dispatcher/reports') },
        ];

        // Trips
        trips.forEach((t) => {
          list.push({
            id: `trip-${t.id}`,
            category: 'Trips',
            title: t.tripId,
            subtitle: `${t.routeName} · ${t.status}`,
            action: () => navigate('/dispatcher/trips'),
          });
        });

        // Vehicles
        vehicles.forEach((v) => {
          list.push({
            id: `vehicle-${v.id}`,
            category: 'Vehicles',
            title: v.vehicleNumber,
            subtitle: `${v.class} · Status: ${v.status} · Fuel: ${v.fuel}%`,
            action: () => navigate('/dispatcher/vehicles'),
          });
        });

        // Drivers
        drivers.forEach((d) => {
          list.push({
            id: `driver-${d.id}`,
            category: 'Drivers',
            title: d.name,
            subtitle: `License: ${d.licenseType} · Safety: ${d.safetyScore}/100`,
            action: () => navigate('/dispatcher/drivers'),
          });
        });

        // Customers
        const customers = Array.from(new Set(requests.map((r) => r.customer)));
        customers.forEach((c) => {
          list.push({
            id: `customer-${c}`,
            category: 'Customers',
            title: c,
            subtitle: 'Active customer account',
            action: () => navigate('/dispatcher/requests'),
          });
        });

        setItems(list);
      } catch (err) {
        console.error('Palette indexing failed', err);
      }
    };
    void fetchSearchData();
  }, [open, navigate]);

  // Handle Ctrl+K shortcut key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filtering
  const filtered = useMemo(() => {
    if (!query) return items.filter((item) => item.category === 'Commands');
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setOpen(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 100,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 550,
          maxHeight: 400,
          backgroundColor: '#1b1d24',
          border: '1px solid var(--border-soft)',
          borderRadius: 8,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <Search size={16} color="var(--text-3)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search trips, vehicles, drivers, or commands (Esc to close)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flexGrow: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-1)',
              fontSize: 13,
            }}
          />
        </div>

        {/* Results list */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
              No matches found for "{query}"
            </div>
          ) : (
            <div>
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isFirstOfCategory = idx === 0 || filtered[idx - 1].category !== item.category;

                return (
                  <div key={item.id}>
                    {isFirstOfCategory && (
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: 'var(--green)',
                          textTransform: 'uppercase',
                          padding: '6px 12px 4px',
                          letterSpacing: '0.05em',
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.category}
                      </div>
                    )}
                    <div
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--panel-2)' : 'transparent',
                        transition: 'background-color 0.1s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.category === 'Commands' ? (
                          <Terminal size={14} color="var(--text-3)" />
                        ) : item.category === 'Trips' ? (
                          <FileText size={14} color="var(--text-3)" />
                        ) : item.category === 'Vehicles' ? (
                          <Truck size={14} color="var(--text-3)" />
                        ) : (
                          <User size={14} color="var(--text-3)" />
                        )}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{item.title}</div>
                          {item.subtitle && (
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{item.subtitle}</div>
                          )}
                        </div>
                      </div>
                      {isSelected && <ArrowRight size={12} color="var(--green)" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#15171e',
            borderTop: '1px solid var(--border-soft)',
            fontSize: 9,
            color: 'var(--text-3)',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
          }}
        >
          <span>Use ↑↓ arrows to navigate, Enter to select</span>
          <span>Ctrl + K to toggle</span>
        </div>
      </div>
    </div>
  );
};
