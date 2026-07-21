import React, { useState, useMemo } from 'react';
import { 
  Scale, FileWarning, CheckCircle2, AlertTriangle, 
  Search, MapPin, Eye, FileText, Check, ShieldAlert, HeartHandshake, CreditCard
} from 'lucide-react';
import { Panel, Badge, Button, useToast, Modal } from '../../components/admin/ui';

interface Challan {
  challanNo: string;
  vehicleNo: string;
  date: string;
  time: string;
  amount: number;
  status: 'Open' | 'Paid' | 'Contested' | 'Overdue';
  violationType: string;
  location: string;
  authority: string;
  site: string;
  daysOpen: number;
  daysRemaining: number;
  assignedTo: 'Company' | 'Driver' | 'Vendor';
  policyHint: string;
  evidencePhoto: string;
  evidenceMap: string;
}

const INITIAL_CHALLANS: Challan[] = [
  {
    challanNo: 'CH-99120',
    vehicleNo: 'MH-43-R-8899',
    date: '2026-07-15',
    time: '14:25',
    amount: 2000,
    status: 'Open',
    violationType: 'Overspeeding (NH-48 Corridor)',
    location: 'NH-48 corridor radar, Km 142 near Bawal',
    authority: 'Haryana Traffic Police',
    site: 'Bawal Hub',
    daysOpen: 6,
    daysRemaining: 9,
    assignedTo: 'Driver',
    policyHint: 'Overspeeding violations are attributed directly to the driver score log unless speed governor failure is documented.',
    evidencePhoto: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=300',
    evidenceMap: '12.9716° N, 77.5946° E'
  },
  {
    challanNo: 'CH-99081',
    vehicleNo: 'GJ-01-XX-1122',
    date: '2026-07-12',
    time: '23:10',
    amount: 5000,
    status: 'Contested',
    violationType: 'No Entry Zone Violation',
    location: 'Jaipur city bypass restriction road',
    authority: 'Jaipur RTO',
    site: 'Jaipur Depot',
    daysOpen: 9,
    daysRemaining: 6,
    assignedTo: 'Company',
    policyHint: 'Route deviation dispatch error. Company holds responsibility due to dispatcher route assignment override.',
    evidencePhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300',
    evidenceMap: '26.9124° N, 75.7873° E'
  },
  {
    challanNo: 'CH-98776',
    vehicleNo: 'DL-01-MA-1234',
    date: '2026-07-08',
    time: '08:45',
    amount: 1000,
    status: 'Paid',
    violationType: 'Lane Discipline Violation',
    location: 'Delhi Ring Road CCTV clip #3',
    authority: 'Delhi Traffic Police',
    site: 'Okhla Hub',
    daysOpen: 13,
    daysRemaining: 0,
    assignedTo: 'Driver',
    policyHint: 'Driver bypassed lanes on dedicated bus corridor. Attributed to Driver.',
    evidencePhoto: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300',
    evidenceMap: '28.6139° N, 77.2090° E'
  },
  {
    challanNo: 'CH-97554',
    vehicleNo: 'RJ-14-AB-1234',
    date: '2026-06-20',
    time: '16:15',
    amount: 10000,
    status: 'Overdue',
    violationType: 'Fitness Certificate Expired Operation',
    location: 'Gurugram Sector-15 border checking',
    authority: 'Haryana RTO',
    site: 'Gurugram Depot',
    daysOpen: 31,
    daysRemaining: -16,
    assignedTo: 'Company',
    policyHint: 'Statutory compliance lapse. Vehicle dispatched despite expired fitness certificate. Assigned to Company.',
    evidencePhoto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=300',
    evidenceMap: '28.4595° N, 77.0266° E'
  }
];

export const ChallanWorkbench: React.FC = () => {
  const { notify } = useToast();
  
  const [challans, setChallans] = useState<Challan[]>(INITIAL_CHALLANS);
  const [selectedChallanNo, setSelectedChallanNo] = useState<string>('CH-99120');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');

  // Interactive Action states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contestModalOpen, setContestModalOpen] = useState(false);
  const [contestReason, setContestReason] = useState('');

  const selectedChallan = challans.find(c => c.challanNo === selectedChallanNo) || challans[0];

  // Dashboard calculations
  const stats = useMemo(() => {
    let open = challans.filter(c => c.status === 'Open').length;
    let paid = challans.filter(c => c.status === 'Paid').length;
    let contested = challans.filter(c => c.status === 'Contested').length;
    let overdue = challans.filter(c => c.status === 'Overdue').length;
    return { open, paid, contested, overdue };
  }, [challans]);

  // Apply filters
  const filteredChallans = useMemo(() => {
    return challans.filter(c => {
      const matchesSearch = c.challanNo.toLowerCase().includes(searchQuery.toLowerCase()) || c.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesSite = siteFilter === 'all' || c.site === siteFilter;
      return matchesSearch && matchesStatus && matchesSite;
    });
  }, [challans, searchQuery, statusFilter, siteFilter]);

  const handleAttributionChange = (role: 'Company' | 'Driver' | 'Vendor') => {
    setChallans(challans.map(c => {
      if (c.challanNo === selectedChallan.challanNo) {
        return {
          ...c,
          assignedTo: role,
          policyHint: role === 'Company' ? 
            'Statutory maintenance or fleet assignment failures fall under the corporate liability policies.' : 
            role === 'Driver' ? 
            'Operating violations (speed, lane, signal) fall under direct driver accountability policies.' : 
            'Contractor/Vendor-provided fleet failures are back-charged to third-party providers.'
        };
      }
      return c;
    }));
    notify('info', `Responsibility attribution updated to: ${role}`);
  };

  const handleSimulatePayment = () => {
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    setChallans(challans.map(c => {
      if (c.challanNo === selectedChallan.challanNo) {
        return { ...c, status: 'Paid' };
      }
      return c;
    }));
    notify('success', `Payment of ₹ ${selectedChallan.amount.toLocaleString()} settled for ${selectedChallan.challanNo}`);
    setPaymentModalOpen(false);
  };

  const handleSimulateContest = () => {
    setContestReason('');
    setContestModalOpen(true);
  };

  const handleConfirmContest = () => {
    if (!contestReason.trim()) {
      notify('error', 'Please provide a valid reason for dispute submission.');
      return;
    }
    setChallans(challans.map(c => {
      if (c.challanNo === selectedChallan.challanNo) {
        return { ...c, status: 'Contested' };
      }
      return c;
    }));
    notify('success', `Dispute case for ${selectedChallan.challanNo} submitted successfully to government portal.`);
    setContestModalOpen(false);
  };

  const getStatusTone = (status: string) => {
    if (status === 'Paid') return 'green';
    if (status === 'Contested') return 'blue';
    if (status === 'Overdue') return 'red';
    return 'amber';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Traffic Challan Resolution Workbench</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Monitor traffic violations, assign responsibility logs, and handle digital payment contest cycles.
        </p>
      </div>

      {/* Challan Dashboard KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(232, 163, 61, 0.08)', color: 'var(--amber)' }}>
            <FileWarning size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>OPEN CHALLANS</span>
            <strong style={{ fontSize: 20, color: 'var(--text-1)' }}>{stats.open}</strong>
          </div>
        </div>
        
        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'var(--green-glow)', color: 'var(--green)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>PAID CHALLANS</span>
            <strong style={{ fontSize: 20, color: 'var(--green)' }}>{stats.paid}</strong>
          </div>
        </div>

        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(46, 204, 113, 0.08)', color: 'var(--green)' }}>
            <HeartHandshake size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>CONTEST DISPUTES</span>
            <strong style={{ fontSize: 20, color: 'var(--text-1)' }}>{stats.contested}</strong>
          </div>
        </div>

        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(229, 72, 77, 0.08)', color: 'var(--red)' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>OVERDUE CHALLANS</span>
            <strong style={{ fontSize: 20, color: 'var(--red)' }}>{stats.overdue}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Challans List with Filters */}
        <Panel 
          title="Challan Register"
          padded={false}
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '4px 6px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text-1)', fontSize: 11, borderRadius: 4 }}
              >
                <option value="all">All statuses</option>
                <option value="Open">Open</option>
                <option value="Paid">Paid</option>
                <option value="Contested">Contested</option>
                <option value="Overdue">Overdue</option>
              </select>
              <select 
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                style={{ padding: '4px 6px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text-1)', fontSize: 11, borderRadius: 4 }}
              >
                <option value="all">All Sites</option>
                <option value="Bawal Hub">Bawal Hub</option>
                <option value="Jaipur Depot">Jaipur Depot</option>
                <option value="Okhla Hub">Okhla Hub</option>
                <option value="Gurugram Depot">Gurugram Depot</option>
              </select>
            </div>
          }
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: 24, color: 'var(--text-3)' }} />
            <input 
              type="text" 
              placeholder="Search by challan or vehicle..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="adm-input"
              style={{ width: '100%', paddingLeft: 30, fontSize: 12, height: 32 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 500, overflowY: 'auto' }}>
            {filteredChallans.map((c) => (
              <div
                key={c.challanNo}
                onClick={() => setSelectedChallanNo(c.challanNo)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  backgroundColor: c.challanNo === selectedChallanNo ? 'var(--panel-2)' : 'transparent',
                  borderLeft: c.challanNo === selectedChallanNo ? '3px solid var(--green)' : '3px solid transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{c.challanNo}</span>
                  <strong style={{ fontSize: 13, color: 'var(--text-1)' }}>{c.vehicleNo}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                  <span style={{ color: 'var(--text-2)' }}>{c.violationType}</span>
                  <strong style={{ color: 'var(--text-1)' }}>₹ {c.amount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                  <span>Date: {c.date}</span>
                  <Badge tone={getStatusTone(c.status)}>{c.status}</Badge>
                </div>
              </div>
            ))}
            {filteredChallans.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
                No violations match the search criteria.
              </div>
            )}
          </div>
        </Panel>

        {/* Right Column: Violation details, evidence, responsibility assignment */}
        {selectedChallan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Detail Overview Card */}
            <Panel padded={false}>
              <div style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, var(--panel-2) 0%, var(--panel) 100%)',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>VIOLATION ACCOUNTABILITY LEDGER</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0 0' }}>{selectedChallan.challanNo}</h2>
                  <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                    <span>Vehicle: <strong style={{ color: 'var(--text-2)' }}>{selectedChallan.vehicleNo}</strong></span>
                    <span>•</span>
                    <span>Site: <strong style={{ color: 'var(--text-2)' }}>{selectedChallan.site}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <Badge tone={getStatusTone(selectedChallan.status)}>{selectedChallan.status}</Badge>
                  <strong style={{ fontSize: 18, color: 'var(--text-1)' }}>₹ {selectedChallan.amount.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Visual grid split */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
                  {/* Left panel: Violation Info & Aging */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Panel title="Violation Info">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                        <div>
                          <span style={{ color: 'var(--text-3)', display: 'block', fontSize: 11 }}>VIOLATION TYPE</span>
                          <strong>{selectedChallan.violationType}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-3)', display: 'block', fontSize: 11 }}>LOCATION AUTHORITY</span>
                          <strong style={{ color: 'var(--text-2)' }}>{selectedChallan.authority}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-3)', display: 'block', fontSize: 11 }}>VIOLATION LOCATION</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-2)', fontWeight: 500 }}>
                            <MapPin size={13} color="var(--red)" /> {selectedChallan.location}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <span style={{ color: 'var(--text-3)', display: 'block', fontSize: 11 }}>DATE</span>
                            <strong>{selectedChallan.date}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-3)', display: 'block', fontSize: 11 }}>TIME</span>
                            <strong>{selectedChallan.time}</strong>
                          </div>
                        </div>
                      </div>
                    </Panel>

                    {/* Aging Tracker */}
                    <Panel title="Aging & Settlement Schedule">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span>Days since open:</span>
                          <strong>{selectedChallan.daysOpen} days open</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span>Days to suspension:</span>
                          <strong style={{ color: selectedChallan.daysRemaining <= 0 ? 'var(--red)' : 'var(--text-1)' }}>
                            {selectedChallan.daysRemaining <= 0 ? 'Suspended/Overdue' : `${selectedChallan.daysRemaining} days left`}
                          </strong>
                        </div>

                        {/* Visual timeline bar */}
                        <div style={{ width: '100%', height: 8, backgroundColor: 'var(--border)', borderRadius: 999, overflow: 'hidden', position: 'relative', marginTop: 4 }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              backgroundColor: selectedChallan.status === 'Paid' ? 'var(--green)' : selectedChallan.daysRemaining <= 3 ? 'var(--red)' : 'var(--amber)',
                              width: `${Math.min(100, (selectedChallan.daysOpen / (selectedChallan.daysOpen + Math.max(0, selectedChallan.daysRemaining))) * 100)}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </Panel>
                  </div>

                  {/* Right panel: Visual evidence (photo + map coords) */}
                  <Panel title="Photographic & Geo Evidence" padded={false}>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', height: 200, backgroundColor: 'var(--void)' }}>
                        <img 
                          src={selectedChallan.evidencePhoto} 
                          alt="Speed camera capture" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>CCTV Captured Snap</span>
                          <span style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'var(--font-family-mono)' }}>Geo: {selectedChallan.evidenceMap}</span>
                        </div>
                      </div>

                      <div style={{ 
                        padding: 12, 
                        backgroundColor: 'var(--panel-2)', 
                        borderRadius: 6, 
                        border: '1px solid var(--border-soft)',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FileText size={13} /> Official Violation PDF
                        </span>
                        <Button size="sm" variant="subtle" icon={<Eye size={12} style={{ marginRight: 4 }} />}>
                          View PDF Report
                        </Button>
                      </div>
                    </div>
                  </Panel>
                </div>

                {/* Bottom section: Responsibility attribution and payment actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, borderTop: '1px solid var(--border-soft)', paddingTop: 24 }}>
                  {/* Responsibility Assignment */}
                  <Panel title="Responsibility Attribution" subtitle="Assign who handles challan payment">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['Company', 'Driver', 'Vendor'] as const).map((role) => {
                          const active = selectedChallan.assignedTo === role;
                          return (
                            <button
                              key={role}
                              onClick={() => handleAttributionChange(role)}
                              style={{
                                flex: 1,
                                padding: '10px 8px',
                                border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                                backgroundColor: active ? 'var(--green-glow)' : 'var(--panel-2)',
                                color: active ? 'var(--green)' : 'var(--text-2)',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: 12,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {active && <Check size={12} style={{ marginRight: 4, display: 'inline' }} />}
                              {role}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ 
                        padding: 12, 
                        backgroundColor: 'rgba(46, 204, 113, 0.04)', 
                        borderRadius: 6, 
                        border: '1px solid var(--border-soft)',
                        fontSize: 12
                      }}>
                        <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>POLICY MATCH REFERENCE</span>
                        <span style={{ color: 'var(--text-2)' }}>{selectedChallan.policyHint}</span>
                      </div>
                    </div>
                  </Panel>

                  {/* Actions buttons */}
                  <Panel title="Settlement Actions" subtitle="Initiate payment or file warning disputes">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center' }}>
                      {selectedChallan.status === 'Paid' ? (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          border: '1px solid var(--green)', 
                          backgroundColor: 'var(--green-glow)', 
                          borderRadius: 8,
                          color: 'var(--green)',
                          fontWeight: 700
                        }}>
                          ✓ Challan paid & settled on corporate dashboard.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <Button 
                            variant="primary" 
                            style={{ flex: 1, height: 42 }} 
                            icon={<CreditCard size={15} style={{ marginRight: 6 }} />}
                            onClick={handleSimulatePayment}
                          >
                            Pay Challan (Direct)
                          </Button>
                          <Button 
                            variant="subtle" 
                            style={{ flex: 1, height: 42 }} 
                            icon={<Scale size={15} style={{ marginRight: 6 }} />}
                            onClick={handleSimulateContest}
                            disabled={selectedChallan.status === 'Contested'}
                          >
                            {selectedChallan.status === 'Contested' ? 'Contest Pending' : 'Contest / Dispute'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Panel>
                </div>
              </div>
            </Panel>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            Select a traffic challan violation to resolve.
          </div>
        )}
      </div>

      {/* Direct Payment Simulator Modal */}
      <Modal
        open={paymentModalOpen}
        title="Direct Settlement Payment"
        subtitle={`Release payment transaction for challan: ${selectedChallan?.challanNo}`}
        onClose={() => setPaymentModalOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmPayment}>Authorize Payment</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 14, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-3)' }}>Challan Fine Amount</span>
              <strong>₹ {selectedChallan?.amount.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-3)' }}>RTO Gateway Surcharge</span>
              <strong>₹ 45</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
              <strong>Total Payable Amount</strong>
              <strong style={{ color: 'var(--green)', fontSize: 15 }}>₹ {((selectedChallan?.amount ?? 0) + 45).toLocaleString()}</strong>
            </div>
          </div>

          <div>
            <span className="mono-label" style={{ fontSize: 10, display: 'block', marginBottom: 6 }}>PAYMENT ACCOUNT GATEWAY</span>
            <select className="adm-input" style={{ width: '100%', fontSize: 12 }}>
              <option>ArgoLogics Corporate Operations A/C - State Bank of India</option>
              <option>ArgoLogics Escrow Contingency Ledger - ICICI Bank</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Contest Dispute Form Modal */}
      <Modal
        open={contestModalOpen}
        title="Dispute Challan File Form"
        subtitle={`Generate formal appeal record for challan: ${selectedChallan?.challanNo}`}
        onClose={() => setContestModalOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setContestModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmContest}>Submit Appeal</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, backgroundColor: 'rgba(46, 204, 113, 0.05)', padding: 12, borderRadius: 6, border: '1px solid rgba(46, 204, 113, 0.15)', fontSize: 12 }}>
            <ShieldAlert size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ color: 'var(--text-2)' }}>
              Dispute requests compile GPS path telematics logs and speed calibrations automatically, routing them directly to the traffic tribunal portal.
            </span>
          </div>

          <div>
            <span className="mono-label" style={{ fontSize: 10, display: 'block', marginBottom: 6 }}>REASON FOR CONTEST APPEAL (REQUIRED)</span>
            <textarea 
              placeholder="Explain why this challan is contested (e.g. speed sensor calibration date expired, GPS shows vehicle was inside Depot)..." 
              value={contestReason}
              onChange={(e) => setContestReason(e.target.value)}
              className="adm-input"
              style={{ width: '100%', height: 100, resize: 'none', padding: '8px 12px', fontSize: 12 }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
