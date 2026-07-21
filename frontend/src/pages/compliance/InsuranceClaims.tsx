import React, { useState } from 'react';
import { 
  Shield, ShieldAlert, BadgePercent, Activity, 
  Clock, User, CheckCircle, Calendar, Lock, Unlock, DollarSign
} from 'lucide-react';
import { Panel, Badge, Button, useToast } from '../../components/admin/ui';

// Policy Type definitions
interface InsurancePolicy {
  policyNo: string;
  vehicleNo: string;
  provider: string;
  expiryDate: string;
  premium: number;
  coverageLimit: number;
  ownDamageCover: number;
  period: string;
  pendingEndorsements: {
    title: string;
    requestDate: string;
    status: 'Pending Approval' | 'Under Review' | 'Delayed';
    lagDays: number;
  }[];
}

// Claim Type definitions
interface Claim {
  claimNo: string;
  vehicleNo: string;
  incidentDate: string;
  amount: number;
  status: 'Reported' | 'Survey Assigned' | 'Survey Complete' | 'Approval' | 'Settlement';
  surveyor: string;
  surveyDate: string;
  surveyReport: string;
  daysOpen: number;
  targetResolutionDays: number;
  approvedAmount: number;
  paidAmount: number;
  settlementDate: string;
}

const INITIAL_POLICIES: InsurancePolicy[] = [
  {
    policyNo: 'POL-ICICI-8812',
    vehicleNo: 'MH-43-R-8899',
    provider: 'ICICI Lombard General',
    expiryDate: '2027-07-20',
    premium: 45000,
    coverageLimit: 5000000,
    ownDamageCover: 1450000,
    period: '2026-07-21 to 2027-07-20',
    pendingEndorsements: [
      { title: 'Add anti-tamper GPS tracker discount', requestDate: '2026-07-15', status: 'Delayed', lagDays: 6 }
    ]
  },
  {
    policyNo: 'POL-TATA-7741',
    vehicleNo: 'GJ-01-XX-1122',
    provider: 'Tata AIG Insurance',
    expiryDate: '2026-11-15',
    premium: 38000,
    coverageLimit: 4000000,
    ownDamageCover: 1100000,
    period: '2025-11-16 to 2026-11-15',
    pendingEndorsements: [
      { title: 'CNG Kit endorsement policy inclusion', requestDate: '2026-07-19', status: 'Pending Approval', lagDays: 2 }
    ]
  },
  {
    policyNo: 'POL-HDFC-9901',
    vehicleNo: 'DL-01-MA-1234',
    provider: 'HDFC Ergo General',
    expiryDate: '2026-08-30',
    premium: 52000,
    coverageLimit: 6000000,
    ownDamageCover: 1800000,
    period: '2025-08-31 to 2026-08-30',
    pendingEndorsements: []
  }
];

const INITIAL_CLAIMS: Claim[] = [
  {
    claimNo: 'CLM-00912',
    vehicleNo: 'MH-43-R-8899',
    incidentDate: '2026-07-10',
    amount: 125000,
    status: 'Survey Complete',
    surveyor: 'Rajesh G., TechSurveyor India',
    surveyDate: '2026-07-14',
    surveyReport: 'Front collision damage matching telemetry impact vector. Estimation verified.',
    daysOpen: 11,
    targetResolutionDays: 15,
    approvedAmount: 115000,
    paidAmount: 0,
    settlementDate: ''
  },
  {
    claimNo: 'CLM-00908',
    vehicleNo: 'GJ-01-XX-1122',
    incidentDate: '2026-07-02',
    amount: 45000,
    status: 'Settlement',
    surveyor: 'Amit Verma, Shield Surveyors',
    surveyDate: '2026-07-06',
    surveyReport: 'Rear bumper scratch and panel dent due to minor loading zone bump. Approved.',
    daysOpen: 19,
    targetResolutionDays: 15,
    approvedAmount: 42000,
    paidAmount: 42000,
    settlementDate: '2026-07-18'
  },
  {
    claimNo: 'CLM-00901',
    vehicleNo: 'DL-01-MA-1234',
    incidentDate: '2026-07-18',
    amount: 320000,
    status: 'Survey Assigned',
    surveyor: 'Vikram S., Delhi Survey Agency',
    surveyDate: '2026-07-22 (Scheduled)',
    surveyReport: 'Awaiting inspection report. Repair bay holds active.',
    daysOpen: 3,
    targetResolutionDays: 15,
    approvedAmount: 0,
    paidAmount: 0,
    settlementDate: ''
  }
];

export const InsuranceClaims: React.FC = () => {
  const { notify } = useToast();
  
  const [activeTab, setActiveTab] = useState<'insurance' | 'claims'>('insurance');
  const policies = INITIAL_POLICIES;
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);

  // Selection states
  const [selectedPolicyNo, setSelectedPolicyNo] = useState<string>('POL-ICICI-8812');
  const [selectedClaimNo, setSelectedClaimNo] = useState<string>('CLM-00912');

  const selectedPolicy = policies.find(p => p.policyNo === selectedPolicyNo) || policies[0];
  const selectedClaim = claims.find(c => c.claimNo === selectedClaimNo) || claims[0];

  const handleSimulateSurveyorGateApproval = () => {
    setClaims(claims.map(c => {
      if (c.claimNo === selectedClaim.claimNo) {
        return {
          ...c,
          status: 'Approval',
          surveyReport: `${c.surveyReport} APPROVED BY SURVEYOR HUB AUDIT.`
        };
      }
      return c;
    }));
    notify('success', `Surveyor Gate unlocked for claim ${selectedClaim.claimNo}. Routed to Approval state.`);
  };

  const handleClaimNextMilestone = () => {
    const statusFlow: Claim['status'][] = ['Reported', 'Survey Assigned', 'Survey Complete', 'Approval', 'Settlement'];
    const currentIdx = statusFlow.indexOf(selectedClaim.status);
    if (currentIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIdx + 1];
      setClaims(claims.map(c => {
        if (c.claimNo === selectedClaim.claimNo) {
          const paidAmt = nextStatus === 'Settlement' ? c.approvedAmount : c.paidAmount;
          const setDate = nextStatus === 'Settlement' ? new Date().toISOString().slice(0, 10) : c.settlementDate;
          return {
            ...c,
            status: nextStatus,
            paidAmount: paidAmt,
            settlementDate: setDate
          };
        }
        return c;
      }));
      notify('success', `Claim milestone escalated to: ${nextStatus}`);
    }
  };

  const getClaimStatusTone = (status: string) => {
    if (status === 'Settlement') return 'green';
    if (status === 'Approval') return 'blue';
    if (status === 'Survey Complete') return 'green';
    return 'amber';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Insurance & Claims Control Tower</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Monitor fleet insurance schedules, audit pending endorsements, and track claims timelines.
        </p>
      </div>

      {/* Workspace Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-soft)', paddingBottom: 1 }}>
        <button 
          onClick={() => setActiveTab('insurance')}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'insurance' ? '2px solid var(--green)' : 'none',
            color: activeTab === 'insurance' ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === 'insurance' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Policies Schedule ({policies.length})
        </button>
        <button 
          onClick={() => setActiveTab('claims')}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'claims' ? '2px solid var(--green)' : 'none',
            color: activeTab === 'claims' ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === 'claims' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Claims 360° Workbench ({claims.length})
        </button>
      </div>

      {/* TAB CONTENT: INSURANCE MANAGEMENT */}
      {activeTab === 'insurance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Insurance Dashboard KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'var(--green-glow)', color: 'var(--green)' }}>
                <Shield size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>ACTIVE POLICIES</span>
                <strong style={{ fontSize: 20 }}>3</strong>
              </div>
            </div>
            
            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(232, 163, 61, 0.08)', color: 'var(--amber)' }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>EXPIRING IN 30D</span>
                <strong style={{ fontSize: 20, color: 'var(--amber)' }}>1</strong>
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(229, 72, 77, 0.08)', color: 'var(--red)' }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>EXPIRED POLICIES</span>
                <strong style={{ fontSize: 20, color: 'var(--red)' }}>0</strong>
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'var(--green-glow)', color: 'var(--green)' }}>
                <BadgePercent size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>TOTAL PREMIUM VALUE</span>
                <strong style={{ fontSize: 20 }}>₹ 1,35,000</strong>
              </div>
            </div>
          </div>

          {/* Policy Split Pane */}
          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Left list */}
            <Panel title="Fleet Policy Grid" padded={false}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {policies.map(p => (
                  <div
                    key={p.policyNo}
                    onClick={() => setSelectedPolicyNo(p.policyNo)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-soft)',
                      cursor: 'pointer',
                      backgroundColor: p.policyNo === selectedPolicyNo ? 'var(--panel-2)' : 'transparent',
                      borderLeft: p.policyNo === selectedPolicyNo ? '3px solid var(--green)' : '3px solid transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: 'var(--text-3)' }}>{p.policyNo}</strong>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{p.vehicleNo}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>{p.provider}</span>
                      <strong style={{ color: 'var(--text-1)' }}>₹ {p.premium.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                      <span>Expires: {p.expiryDate}</span>
                      {p.pendingEndorsements.length > 0 && <Badge tone="amber">Endorsement Lag</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Right details details panel */}
            {selectedPolicy ? (
              <Panel title={`Policy details: ${selectedPolicy.policyNo}`} subtitle={`Active coverage schedule linked to ${selectedPolicy.vehicleNo}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>INSURANCE PROVIDER</span>
                      <strong style={{ fontSize: 14, display: 'block', marginTop: 4 }}>{selectedPolicy.provider}</strong>
                    </div>
                    <div style={{ padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>POLICY EXPENDITURE PERIOD</span>
                      <strong style={{ fontSize: 12, display: 'block', marginTop: 6, color: 'var(--text-2)' }}>{selectedPolicy.period}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>OWN DAMAGE ESTIMATION COVER</span>
                      <strong style={{ fontSize: 16, display: 'block', marginTop: 4, color: 'var(--green)' }}>₹ {selectedPolicy.ownDamageCover.toLocaleString()}</strong>
                    </div>
                    <div style={{ padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>THIRD PARTY LIABILITY CAP</span>
                      <strong style={{ fontSize: 16, display: 'block', marginTop: 4 }}>₹ {selectedPolicy.coverageLimit.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Endorsement list with "Lag Flags" */}
                  <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldAlert size={14} color="var(--amber)" /> Pending Endorsement Lag Monitor
                    </h4>
                    
                    {selectedPolicy.pendingEndorsements.length === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--text-3)', backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, display: 'block' }}>
                        ✓ All endorsements matched. No pending lags.
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {selectedPolicy.pendingEndorsements.map((e, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              padding: 12, 
                              backgroundColor: 'rgba(232, 163, 61, 0.04)', 
                              borderRadius: 6, 
                              border: '1px solid rgba(232, 163, 61, 0.2)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: 13, display: 'block' }}>{e.title}</strong>
                              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Requested: {e.requestDate}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Badge tone={e.status === 'Delayed' ? 'red' : 'amber'}>{e.status}</Badge>
                              <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, display: 'block', marginTop: 4 }}>
                                ⚠️ Lag delay: {e.lagDays} Days (SLA: 48h)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CLAIMS MANAGEMENT */}
      {activeTab === 'claims' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Claims Dashboard KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(232, 163, 61, 0.08)', color: 'var(--amber)' }}>
                <Clock size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>OPEN CLAIMS</span>
                <strong style={{ fontSize: 20 }}>2</strong>
              </div>
            </div>
            
            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(232, 163, 61, 0.08)', color: 'var(--amber)' }}>
                <Activity size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>UNDER SURVEY</span>
                <strong style={{ fontSize: 20, color: 'var(--amber)' }}>1</strong>
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'var(--green-glow)', color: 'var(--green)' }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>APPROVED CLAIMS</span>
                <strong style={{ fontSize: 20, color: 'var(--green)' }}>1</strong>
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'var(--green-glow)', color: 'var(--green)' }}>
                <DollarSign size={20} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>TOTAL DISBURSED</span>
                <strong style={{ fontSize: 20 }}>₹ 42,000</strong>
              </div>
            </div>
          </div>

          {/* Claims Split Pane */}
          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
            
            {/* Left Claims List */}
            <Panel title="Active Claims Ledger" padded={false}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {claims.map(c => (
                  <div
                    key={c.claimNo}
                    onClick={() => setSelectedClaimNo(c.claimNo)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-soft)',
                      cursor: 'pointer',
                      backgroundColor: c.claimNo === selectedClaimNo ? 'var(--panel-2)' : 'transparent',
                      borderLeft: c.claimNo === selectedClaimNo ? '3px solid var(--green)' : '3px solid transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: 'var(--text-3)' }}>{c.claimNo}</strong>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{c.vehicleNo}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>Incident: {c.incidentDate}</span>
                      <strong style={{ color: 'var(--text-1)' }}>₹ {c.amount.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                      <span>SLA Days: {c.daysOpen} / {c.targetResolutionDays}</span>
                      <Badge tone={getClaimStatusTone(c.status)}>{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Right: Claim 360° details */}
            {selectedClaim ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Milestone Stepper */}
                <Panel title={`Claim 360° Timeline: ${selectedClaim.claimNo}`}>
                  {/* Horizontal milestone bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '10px 0 20px 0' }}>
                    <div style={{ position: 'absolute', top: 22, left: '5%', right: '5%', height: 2, backgroundColor: 'var(--border-soft)', zIndex: 1 }} />
                    
                    {/* Fill timeline highlight */}
                    {(() => {
                      const stages = ['Reported', 'Survey Assigned', 'Survey Complete', 'Approval', 'Settlement'];
                      const currentIdx = stages.indexOf(selectedClaim.status);
                      const fillPct = (currentIdx / (stages.length - 1)) * 90;
                      return (
                        <div style={{ position: 'absolute', top: 22, left: '5%', width: `${fillPct}%`, height: 2, backgroundColor: 'var(--green)', zIndex: 1 }} />
                      );
                    })()}

                    {/* Step Nodes */}
                    {['Reported', 'Survey Assigned', 'Survey Complete', 'Approval', 'Settlement'].map((stage, idx) => {
                      const stages = ['Reported', 'Survey Assigned', 'Survey Complete', 'Approval', 'Settlement'];
                      const currentIdx = stages.indexOf(selectedClaim.status);
                      const isCompleted = idx < currentIdx;
                      const isActive = idx === currentIdx;

                      return (
                        <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '18%', cursor: 'pointer' }} onClick={handleClaimNextMilestone}>
                          <div style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: isActive ? 'var(--green)' : isCompleted ? 'var(--green-dim)' : 'var(--panel-3)',
                            border: `2px solid ${isActive ? 'var(--text-1)' : isCompleted ? 'var(--green)' : 'var(--border)'}`,
                            color: isCompleted || isActive ? 'var(--void)' : 'var(--text-3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: isActive ? 700 : 500, 
                            color: isActive ? 'var(--text-1)' : 'var(--text-3)',
                            marginTop: 6,
                            textAlign: 'center'
                          }}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* SLA Tracker details */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    backgroundColor: 'var(--panel-2)', 
                    padding: 12, 
                    borderRadius: 6, 
                    border: '1px solid var(--border-soft)',
                    marginTop: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="var(--amber)" />
                      <span style={{ fontSize: 12 }}>
                        SLA Timer Status: <strong>{selectedClaim.daysOpen} days open</strong> of {selectedClaim.targetResolutionDays} target days limit.
                      </span>
                    </div>
                    <Badge tone={selectedClaim.daysOpen <= selectedClaim.targetResolutionDays ? 'green' : 'red'}>
                      {selectedClaim.daysOpen <= selectedClaim.targetResolutionDays ? 'ON TRACK SLA' : 'BREACH SLA'}
                    </Badge>
                  </div>
                </Panel>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Surveyor Status and Locks */}
                  <Panel 
                    title="Surveyor Inspection Gate"
                    actions={
                      selectedClaim.status === 'Survey Assigned' ? (
                        <Button size="sm" variant="primary" icon={<Unlock size={12} style={{ marginRight: 4 }} />} onClick={handleSimulateSurveyorGateApproval}>
                          Surveyor Approve
                        </Button>
                      ) : null
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={15} style={{ color: 'var(--text-3)' }} />
                        <span style={{ fontSize: 13 }}>Inspector: <strong>{selectedClaim.surveyor}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={15} style={{ color: 'var(--text-3)' }} />
                        <span style={{ fontSize: 13 }}>Inspection Date: <strong>{selectedClaim.surveyDate}</strong></span>
                      </div>

                      <div style={{ 
                        padding: 12, 
                        backgroundColor: 'var(--panel-2)', 
                        borderRadius: 6, 
                        border: '1px solid var(--border-soft)',
                        fontSize: 12
                      }}>
                        <span className="mono-label" style={{ fontSize: 8, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>SURVEY INSPECTION FINDINGS</span>
                        <span style={{ color: 'var(--text-2)' }}>{selectedClaim.surveyReport}</span>
                      </div>

                      {/* Repairs lock status gate */}
                      <div style={{
                        padding: 12,
                        borderRadius: 6,
                        backgroundColor: selectedClaim.status === 'Survey Assigned' ? 'rgba(229, 72, 77, 0.04)' : 'var(--green-glow)',
                        border: `1px solid ${selectedClaim.status === 'Survey Assigned' ? 'rgba(229, 72, 77, 0.15)' : 'rgba(46, 204, 113, 0.15)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {selectedClaim.status === 'Survey Assigned' ? (
                            <>
                              <Lock size={14} color="var(--red)" /> Repair authorization locked.
                            </>
                          ) : (
                            <>
                              <Unlock size={14} color="var(--green)" /> Repairs authorized.
                            </>
                          )}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>SURVEYOR-GATE LOG</span>
                      </div>
                    </div>
                  </Panel>

                  {/* Settlement calculations */}
                  <Panel title="Settlement Ledger">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-3)' }}>Claimed Amount</span>
                        <strong>₹ {selectedClaim.amount.toLocaleString()}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-3)' }}>Approved Amount (RTO/TPA)</span>
                        <strong style={{ color: 'var(--green)' }}>₹ {selectedClaim.approvedAmount.toLocaleString()}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-3)' }}>Paid/Disbursed Amount</span>
                        <strong style={{ color: selectedClaim.paidAmount > 0 ? 'var(--green)' : 'var(--amber)' }}>
                          ₹ {selectedClaim.paidAmount.toLocaleString()}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-soft)', paddingTop: 10, fontSize: 12, color: 'var(--text-3)' }}>
                        <span>Settlement Clearance Date:</span>
                        <strong>{selectedClaim.settlementDate || 'Pending Settlement'}</strong>
                      </div>

                      {selectedClaim.status === 'Approval' && (
                        <Button variant="primary" style={{ marginTop: 6 }} onClick={handleClaimNextMilestone}>
                          Disburse Settlement Fund
                        </Button>
                      )}
                    </div>
                  </Panel>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
