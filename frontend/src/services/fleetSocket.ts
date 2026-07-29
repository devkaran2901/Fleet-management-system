import type { DetailedVehicleTelemetry } from './indiaGeospatialData';

export type SocketStatus = 'connected' | 'connecting' | 'disconnected';

export interface TelemetryListener {
  (updatedVehicles: DetailedVehicleTelemetry[], pingsCount: number): void;
}

class FleetWebSocketService {
  private status: SocketStatus = 'disconnected';
  private listeners: Set<TelemetryListener> = new Set();
  private timer: number | null = null;
  private pingsCount = 14820;
  private vehicles: DetailedVehicleTelemetry[] = [];

  public connect(initialVehicles: DetailedVehicleTelemetry[]): void {
    if (this.status === 'connected') return;

    this.vehicles = initialVehicles;
    this.status = 'connecting';

    // Simulate fast WebSocket connection establish
    setTimeout(() => {
      this.status = 'connected';
      this.startTelemetryLoop();
    }, 400);
  }

  public disconnect(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.status = 'disconnected';
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus(): SocketStatus {
    return this.status;
  }

  private startTelemetryLoop(): void {
    this.timer = window.setInterval(() => {
      if (this.status !== 'connected') return;

      this.pingsCount += Math.floor(1 + Math.random() * 5);

      // Smoothly interpolate positions & heading angles of active in-transit vehicles
      this.vehicles = this.vehicles.map((v) => {
        if (v.status === 'In Transit') {
          // Calculate subtle lat/lng movement along heading
          const headingRad = (v.heading * Math.PI) / 180;
          const speedFactor = (v.speedKmH / 3600) * 0.005; // degree offset simulation

          const deltaLat = Math.cos(headingRad) * speedFactor;
          const deltaLng = Math.sin(headingRad) * speedFactor;

          const newLat = Number((v.lat + deltaLat).toFixed(6));
          const newLng = Number((v.lng + deltaLng).toFixed(6));

          // Slight heading fluctuations for realistic highway curves
          const headingDelta = (Math.random() - 0.5) * 4;
          const newHeading = Math.round((v.heading + headingDelta + 360) % 360);

          // Speed fluctuation
          const speedDelta = Math.floor(Math.random() * 5) - 2;
          const newSpeed = Math.max(35, Math.min(85, v.speedKmH + speedDelta));

          return {
            ...v,
            lat: newLat,
            lng: newLng,
            heading: newHeading,
            speedKmH: newSpeed,
            lastPing: 'just now',
          };
        }
        return v;
      });

      this.notifyListeners();
    }, 2000);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.vehicles], this.pingsCount));
  }
}

export const fleetSocketService = new FleetWebSocketService();
