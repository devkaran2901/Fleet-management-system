import React, { useState } from 'react';
import { Fuel, Plus, Search, MapPin, Droplets } from 'lucide-react';
import { Button, Panel, Badge, Modal, Input, Field } from '../../components/admin/ui';
import type { FuelStation } from '../../services/adminApi';

const INITIAL_STATIONS: FuelStation[] = [
  {
    id: 'fs-1',
    code: 'FS-DEL-01',
    name: 'Delhi Depot IOCL Station',
    location: 'Delhi Depot Gate 3, Transport Nagar',
    owner: 'Indian Oil Corporation Ltd',
    tankCapacityLiters: 50000,
    currentStockLiters: 34200,
    dieselPrice: 89.62,
    petrolPrice: 94.72,
    status: 'Active',
    contactPerson: 'Harish Chandra',
    phone: '+91 98102 34567',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fs-2',
    code: 'FS-MUM-02',
    name: 'Bhiwandi HPCL Fleet Terminal',
    location: 'NH-160, Bhiwandi, Maharashtra',
    owner: 'Hindustan Petroleum Ltd',
    tankCapacityLiters: 60000,
    currentStockLiters: 9800,
    dieselPrice: 92.15,
    petrolPrice: 104.21,
    status: 'Low Stock',
    contactPerson: 'Ramesh Sawant',
    phone: '+91 98201 87654',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fs-3',
    code: 'FS-BLR-03',
    name: 'Nelamangala BPCL Station',
    location: 'Tumkur Road, Nelamangala, Bengaluru',
    owner: 'Bharat Petroleum Ltd',
    tankCapacityLiters: 45000,
    currentStockLiters: 28500,
    dieselPrice: 87.80,
    petrolPrice: 102.86,
    status: 'Active',
    contactPerson: 'Srinivas Murthy',
    phone: '+91 99002 11223',
    updatedAt: new Date().toISOString(),
  },
];

export const FuelStations: React.FC = () => {
  const [stations, setStations] = useState<FuelStation[]>(INITIAL_STATIONS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [topUpLiters, setTopUpLiters] = useState('10000');

  // New Station form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    owner: 'IOCL',
    tankCapacityLiters: 50000,
    dieselPrice: 89.5,
    contactPerson: '',
    phone: '',
  });

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newStation: FuelStation = {
      id: `fs-${Date.now()}`,
      code: formData.code || `FS-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      location: formData.location,
      owner: formData.owner,
      tankCapacityLiters: Number(formData.tankCapacityLiters),
      currentStockLiters: Number(formData.tankCapacityLiters),
      dieselPrice: Number(formData.dieselPrice),
      petrolPrice: Number(formData.dieselPrice) + 5,
      status: 'Active',
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      updatedAt: new Date().toISOString(),
    };
    setStations([newStation, ...stations]);
    setModalOpen(false);
  };

  const handleStockTopUp = () => {
    if (!selectedStation) return;
    const added = Number(topUpLiters) || 0;
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === selectedStation.id) {
          const newQty = Math.min(s.tankCapacityLiters, s.currentStockLiters + added);
          return {
            ...s,
            currentStockLiters: newQty,
            status: newQty > s.tankCapacityLiters * 0.25 ? 'Active' : 'Low Stock',
          };
        }
        return s;
      })
    );
    setStockModalOpen(false);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Master Data / M-04</span>
          <h1 className="adm-page-title">
            <Fuel size={22} color="var(--green)" /> Fuel Stations Master
          </h1>
          <p className="adm-page-sub">
            Fueling terminal master, underground tank capacities, real-time stock levels, and price lists.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          Add Fuel Station
        </Button>
      </div>

      <Panel title="Fuel Terminals & Tanks">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search fuel station code, name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--panel-2)',
                color: 'var(--text-1)',
              }}
            />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Station Code & Name</th>
                <th>Location & Owner</th>
                <th>Tank Inventory</th>
                <th>Diesel Rate</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((st) => {
                const stockPercent = Math.round((st.currentStockLiters / st.tankCapacityLiters) * 100);
                return (
                  <tr key={st.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{st.name}</div>
                      <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                        {st.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <MapPin size={12} color="var(--text-3)" /> {st.location}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{st.owner}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Droplets size={14} color={stockPercent < 25 ? '#ef4444' : 'var(--green)'} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>
                            {st.currentStockLiters.toLocaleString('en-IN')} / {st.tankCapacityLiters.toLocaleString('en-IN')} L
                          </div>
                          <div
                            style={{
                              width: 100,
                              height: 4,
                              backgroundColor: 'var(--border-soft)',
                              borderRadius: 2,
                              overflow: 'hidden',
                              marginTop: 2,
                            }}
                          >
                            <div
                              style={{
                                width: `${stockPercent}%`,
                                height: '100%',
                                backgroundColor: stockPercent < 25 ? '#ef4444' : 'var(--green)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>₹{st.dieselPrice}/L</div>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Petrol: ₹{st.petrolPrice}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{st.contactPerson}</div>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{st.phone}</span>
                    </td>
                    <td>
                      <Badge tone={st.status === 'Active' ? 'green' : 'amber'}>{st.status}</Badge>
                    </td>
                    <td>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setSelectedStation(st);
                          setStockModalOpen(true);
                        }}
                      >
                        Refill Tank
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* New Station Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register New Fuel Station">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Station Name">
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </Field>
          <Field label="Station Code">
            <Input value={formData.code} placeholder="e.g. FS-DEL-04" onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
          </Field>
          <Field label="Location Address">
            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </Field>
          <Field label="Tank Capacity (Liters)">
            <Input type="number" value={formData.tankCapacityLiters} onChange={(e) => setFormData({ ...formData, tankCapacityLiters: Number(e.target.value) })} required />
          </Field>
          <Field label="Diesel Price (per Liter)">
            <Input type="number" step="0.01" value={formData.dieselPrice} onChange={(e) => setFormData({ ...formData, dieselPrice: Number(e.target.value) })} required />
          </Field>
          <Field label="Contact Person Name">
            <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} required />
          </Field>
          <Field label="Phone Number">
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Station</Button>
          </div>
        </form>
      </Modal>

      {/* Stock Refill Modal */}
      <Modal open={stockModalOpen} onClose={() => setStockModalOpen(false)} title={`Refill Tank - ${selectedStation?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>
            Current Stock: <strong>{selectedStation?.currentStockLiters.toLocaleString('en-IN')} L</strong> / {selectedStation?.tankCapacityLiters.toLocaleString('en-IN')} L
          </p>

          <Field label="Refill Quantity (Liters)">
            <Input
              type="number"
              value={topUpLiters}
              onChange={(e) => setTopUpLiters(e.target.value)}
            />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" onClick={() => setStockModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleStockTopUp}>Confirm Refill</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
