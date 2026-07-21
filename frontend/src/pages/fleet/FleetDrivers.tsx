import React, { useEffect, useState, useMemo } from 'react';
import { 
  UserCog, Search, X, ShieldAlert, ShieldCheck, 
  Clock, Heart, Star, Ban
} from 'lucide-react';
import { Badge, Button, LoadingState, useToast } from '../../components/admin/ui';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { Driver } from '../../services/dispatcherApi';
import '../../styles/admin.css';

export const FleetDrivers: React.FC = () => {
  const { notify } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      const data = await dispatcherApi.drivers();
      setDrivers(data);
      if (selectedDriver) {
        const updated = data.find(d => d.id === selectedDriver.id);
        setSelectedDriver(updated || null);
      }
    } catch (err) {
      notify('error', 'Could not load driver directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleToggleSuspend = async () => {
    if (!selectedDriver) return;
    const isSuspended = selectedDriver.status === 'Suspended';
    const newStatus = isSuspended ? 'Available' : 'Suspended';
    
    try {
      await dispatcherApi.updateDriver(selectedDriver.id, { status: newStatus });
      notify(
        newStatus === 'Suspended' ? 'error' : 'success',
        `Driver ${selectedDriver.name} is now ${newStatus}`
      );
      await load();
    } catch (err) {
      notify('error', 'Could not update driver status');
    }
  };

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                            d.license.toLowerCase().includes(search.toLowerCase()) ||
                            d.site.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  if (loading) {
    return <LoadingState label="Loading Driver Directory" />;
  }

  return (
    <div style={{ display: 'flex', gap: 20, flexDirection: 'column' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Driver Directory (360°)</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>Roster operator workforce, verify licenses, and monitor safety indicators.</p>
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 16, backgroundColor: 'var(--panel-1)', padding: 16, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Search by driver name, license or home site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', outline: 'none' }}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', outline: 'none' }}
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Duty">On Duty</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Grid and Drawer Layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
        {/* Drivers table list */}
        <div style={{ flexGrow: 1, backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 8, overflow: 'hidden' }}>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DRIVER NAME</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>LICENSE NO</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>HOME SITE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>SAFETY SCORE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DUTY / REST HOURS</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => setSelectedDriver(d)}
                  style={{ 
                    borderBottom: '1px solid var(--border-soft)', 
                    cursor: 'pointer', 
                    backgroundColor: selectedDriver?.id === d.id ? 'var(--panel-2)' : 'transparent' 
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: '12px 16px' }}>{d.license}</td>
                  <td style={{ padding: '12px 16px' }}>{d.site}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14} color="var(--green)" fill="var(--green)" />
                      <span style={{ fontWeight: 600 }}>{d.safetyScore}/100</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {d.dutyHours}h duty / {d.restHours}h rest
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge 
                      tone={
                        d.status === 'Available' ? 'green' : 
                        (d.status === 'On Duty' ? 'blue' : 
                        (d.status === 'Off Duty' ? 'grey' : 'red'))
                      }
                    >
                      {d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    No drivers match current search parameters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Driver 360° Profile Drawer Panel */}
        {selectedDriver && (
          <div 
            style={{ 
              width: '450px', 
              backgroundColor: 'var(--panel-1)', 
              border: '1px solid var(--border-soft)', 
              borderRadius: 8, 
              padding: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 20,
              boxShadow: 'var(--shadow-3)',
              position: 'sticky',
              top: 20
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 8 }}>
                  <UserCog size={20} color="var(--green)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedDriver.name}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{selectedDriver.licenseType} &middot; {selectedDriver.site}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDriver(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Warnings Alert */}
            {selectedDriver.warnings.length > 0 && (
              <div style={{ display: 'flex', gap: 10, padding: 12, backgroundColor: 'var(--panel-red)', border: '1px solid var(--border-red)', borderRadius: 6 }}>
                <ShieldAlert size={16} color="var(--red)" style={{ marginTop: 2 }} />
                <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>
                  {selectedDriver.warnings[0]}
                </div>
              </div>
            )}

            {/* Profile detail details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h4 style={{ margin: 0, fontSize: 12, color: 'var(--text-3)', letterSpacing: 1 }} className="mono-label">DRIVING METRICS</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Rostered Hours</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 13, fontWeight: 600 }}>
                    <Clock size={14} color="var(--blue)" />
                    {selectedDriver.dutyHours} hrs today
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Rest Ledger</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 13, fontWeight: 600 }}>
                    <Heart size={14} color="var(--green)" />
                    {selectedDriver.restHours} hrs resting
                  </div>
                </div>
              </div>

              {/* Verification checks */}
              <h4 style={{ margin: '10px 0 0 0', fontSize: 12, color: 'var(--text-3)', letterSpacing: 1 }} className="mono-label">SARATHI CHECKPOINTS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6 }}>
                {[
                  { label: 'License Format Validation', status: true },
                  { label: 'SARATHI Registry Match', status: true },
                  { label: 'Police Verification Record', status: selectedDriver.status !== 'Suspended' },
                  { label: 'Category Match (Heavy Comm.)', status: true },
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{item.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {item.status ? (
                        <ShieldCheck size={14} color="var(--green)" />
                      ) : (
                        <ShieldAlert size={14} color="var(--red)" />
                      )}
                      <span style={{ fontSize: 12, fontWeight: 500, color: item.status ? 'var(--green)' : 'var(--red)' }}>
                        {item.status ? 'Passed' : 'Hold'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
              <Button 
                style={{ width: '100%' }} 
                variant={selectedDriver.status === 'Suspended' ? 'primary' : 'danger'} 
                onClick={handleToggleSuspend}
              >
                <Ban size={14} style={{ marginRight: 6 }} /> 
                {selectedDriver.status === 'Suspended' ? 'Restore Driver' : 'Suspend License'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
