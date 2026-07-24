import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initialTrips } from './driverDataStore';
import type { DriverTrip, TripState } from './driverDataStore';
import {
  ArrowLeft,
  Route,
  Truck,
  User,
  Building,
  MapPin,
  Clock,
  FileText,
  Download,
  Eye,
  Play,
} from 'lucide-react';

export const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<DriverTrip>(() => {
    const found = initialTrips.find((t) => t.id === id || t.tripNumber === id);
    return found || initialTrips[0];
  });

  const advanceTripState = () => {
    const stageFlow: TripState[] = [
      'Assigned',
      'Reported',
      'Started',
      'Pickup Reached',
      'Loaded',
      'In Transit',
      'Delivery Reached',
      'POD Submitted',
      'Closed',
    ];

    const currentIndex = stageFlow.indexOf(trip.status);
    if (currentIndex >= 0 && currentIndex < stageFlow.length - 1) {
      const nextState = stageFlow[currentIndex + 1];

      setTrip((prev) => {
        const nowFormatted = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const updatedTimeline = prev.timeline.map((step) => {
          if (step.stage === nextState) {
            return {
              ...step,
              completed: true,
              timestamp: `${nowFormatted} IST`,
              location: 'Live GPS Location Captured',
            };
          }
          return step;
        });

        return {
          ...prev,
          status: nextState,
          podStatus: nextState === 'POD Submitted' || nextState === 'Closed' ? 'Submitted' : prev.podStatus,
          timeline: updatedTimeline,
        };
      });

      if (nextState === 'POD Submitted') {
        navigate('/driver/epod');
      } else {
        alert(`Trip state updated to: ${nextState}`);
      }
    }
  };

  const getNextActionLabel = () => {
    switch (trip.status) {
      case 'Assigned':
        return 'Report Duty at Gate';
      case 'Reported':
        return 'Start Trip';
      case 'Started':
        return 'Arrived Pickup';
      case 'Pickup Reached':
        return 'Loading Completed';
      case 'Loaded':
        return 'Start Journey';
      case 'In Transit':
        return 'Arrived Destination';
      case 'Delivery Reached':
        return 'Submit POD';
      case 'POD Submitted':
        return 'Close Trip';
      case 'Closed':
        return 'Trip Completed & Closed';
      default:
        return 'Advance Trip Stage';
    }
  };

  return (
    <div>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => navigate('/driver/trips')}
          className="driver-btn-secondary"
          style={{ padding: '8px 12px' }}
        >
          <ArrowLeft size={16} /> Back to Trips
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>
            Trip Details: {trip.tripNumber}
          </h1>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Customer: {trip.customer}</span>
        </div>
      </div>

      {/* Banner */}
      <div className="driver-card" style={{ background: 'var(--panel-2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className={`driver-status-pill ${trip.status === 'Closed' ? 'completed' : 'in-transit'}`}>
                {trip.status}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>ETA: {trip.eta}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{trip.route}</div>
          </div>

          {trip.status !== 'Closed' && (
            <button
              onClick={advanceTripState}
              className="driver-btn-primary"
              style={{
                fontSize: 14,
                padding: '12px 20px',
                boxShadow: '0 4px 16px var(--green-glow)',
              }}
            >
              <Play size={18} /> {getNextActionLabel()}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Info Card */}
        <div className="driver-card">
          <div className="driver-card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText color="#3B82F6" size={18} /> TRIP INFORMATION
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Route size={14} /> Trip Number
              </span>
              <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{trip.tripNumber}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building size={14} /> Customer Name
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{trip.customer}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={14} /> Assigned Vehicle
              </span>
              <span style={{ fontWeight: 700, color: 'var(--green)', fontFamily: 'monospace' }}>{trip.vehicle}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Assigned Driver
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{trip.driver}</span>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>PICKUP LOCATION</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} color="var(--green)" /> {trip.pickupLocation}
              </div>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>DELIVERY LOCATION</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} color="var(--amber)" /> {trip.deliveryLocation}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="driver-card">
          <div className="driver-card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock color="var(--green)" size={18} /> 9-STAGE EXECUTION TIMELINE
            </span>
          </div>

          <div className="driver-timeline">
            {trip.timeline.map((step, idx) => {
              const isCurrent = step.stage === trip.status;
              const isDone = step.completed;

              return (
                <div
                  key={step.stage}
                  className={`driver-timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="driver-timeline-dot" />
                  <div style={{ flex: 1, paddingBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                          color: isCurrent ? 'var(--amber)' : isDone ? 'var(--text-1)' : 'var(--text-2)',
                          fontSize: 13,
                        }}
                      >
                        {idx + 1}. {step.stage}
                      </span>
                      {step.timestamp && (
                        <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'monospace' }}>
                          {step.timestamp}
                        </span>
                      )}
                    </div>
                    {step.location && (
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{step.location}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="driver-card">
        <div className="driver-card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText color="var(--amber)" size={18} /> TRIP ATTACHMENTS & DIGITAL DOCUMENTS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {trip.attachments.lr && (
            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>LORRY RECEIPT (LR)</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{trip.attachments.lr}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <button className="driver-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, flex: 1 }} onClick={() => alert(`Opening ${trip.attachments.lr}`)}>
                  <Eye size={12} /> View
                </button>
                <button className="driver-btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => alert(`Downloading ${trip.attachments.lr}`)}>
                  <Download size={12} />
                </button>
              </div>
            </div>
          )}

          {trip.attachments.ewb && (
            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>E-WAY BILL (EWB)</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{trip.attachments.ewb}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <button className="driver-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, flex: 1 }} onClick={() => alert(`Opening ${trip.attachments.ewb}`)}>
                  <Eye size={12} /> View
                </button>
                <button className="driver-btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => alert(`Downloading ${trip.attachments.ewb}`)}>
                  <Download size={12} />
                </button>
              </div>
            </div>
          )}

          {trip.attachments.invoice && (
            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>CARGO INVOICE</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{trip.attachments.invoice}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <button className="driver-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, flex: 1 }} onClick={() => alert(`Opening ${trip.attachments.invoice}`)}>
                  <Eye size={12} /> View
                </button>
                <button className="driver-btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => alert(`Downloading ${trip.attachments.invoice}`)}>
                  <Download size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
