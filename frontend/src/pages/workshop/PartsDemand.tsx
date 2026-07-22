import React, { useEffect, useState } from 'react';
import { PackageCheck, Send } from 'lucide-react';
import { workshopApi } from '../../services/workshopApi';
import type { PartsDemandItem } from '../../services/workshopApi';
import { Panel, Button, Badge, LoadingState, ErrorState, useToast } from '../../components/admin/ui';

export const PartsDemand: React.FC = () => {
  const { notify } = useToast();
  const [demands, setDemands] = useState<PartsDemandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartsDemand = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workshopApi.getPartsDemand();
      setDemands(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch parts demand queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartsDemand();
  }, []);

  const handleRequestDemand = async (item: PartsDemandItem) => {
    try {
      await workshopApi.requestPartDemand(item.id);
      notify('info', `Part ${item.partNumber} requested from central stores for ${item.jobCardId}`);
      fetchPartsDemand();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to request part demand');
    }
  };

  const handleReserveDemand = async (item: PartsDemandItem) => {
    try {
      await workshopApi.reservePart(item.id);
      notify('success', `Part ${item.partNumber} reserved against ${item.jobCardId}`);
      fetchPartsDemand();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to reserve part');
    }
  };

  if (loading) return <LoadingState label="Loading Parts Demand Queue" />;
  if (error) return <ErrorState message={error} onRetry={fetchPartsDemand} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
          Parts Demand Queue
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Issue & reserve parts strictly against Job Cards (BR-MNT-06). Stock inventory management belongs to R-23 Store Keeper.
        </p>
      </div>

      {/* Table */}
      <Panel padded={false}>
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Vehicle #</th>
                <th>Required Part #</th>
                <th>Part Description</th>
                <th>Qty Required</th>
                <th>Qty Available</th>
                <th>Reservation Status</th>
                <th>Demand Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demands.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{item.jobCardId}</td>
                  <td style={{ fontWeight: 600 }}>{item.vehicleNumber}</td>
                  <td style={{ fontFamily: 'monospace' }}>{item.partNumber}</td>
                  <td>{item.partName}</td>
                  <td>{item.quantityRequired}</td>
                  <td>
                    <span style={{ color: item.quantityAvailable >= item.quantityRequired ? 'var(--green)' : '#ef4444', fontWeight: 600 }}>
                      {item.quantityAvailable}
                    </span>
                  </td>
                  <td>
                    <Badge tone={item.reservationStatus === 'Reserved' ? 'green' : 'amber'}>
                      {item.reservationStatus}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={item.demandStatus === 'Fulfilled' ? 'green' : item.demandStatus === 'Requested' ? 'blue' : 'grey'}>
                      {item.demandStatus}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {item.demandStatus === 'Pending' && (
                        <Button variant="subtle" size="sm" icon={<Send size={12} />} onClick={() => handleRequestDemand(item)}>
                          Request Issue
                        </Button>
                      )}
                      {item.reservationStatus !== 'Reserved' && (
                        <Button variant="primary" size="sm" icon={<PackageCheck size={12} />} onClick={() => handleReserveDemand(item)}>
                          Reserve Stock
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
