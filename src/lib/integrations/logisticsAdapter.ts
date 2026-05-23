import { logger } from '../logger';

export interface ShipmentDetails {
  orderId: string;
  recipientName: string;
  address: string;
  city: string;
  zipCode: string;
  weightKg: number;
}

export interface ShipmentDispatchResult {
  waybillNumber: string;
  carrier: string;
  estimatedDeliveryDate: string;
  syncedAt: string;
}

export interface TrackingScan {
  time: string;
  details: string;
}

export interface TrackingStatusResult {
  waybillNumber: string;
  status: string;
  currentLocation: string;
  scans: TrackingScan[];
}

export interface LogisticsAdapter {
  bookShipment(details: ShipmentDetails): Promise<ShipmentDispatchResult>;
  getTrackingStatus(waybillNumber: string): Promise<TrackingStatusResult>;
}

class MockLogisticsAdapter implements LogisticsAdapter {
  async bookShipment(details: ShipmentDetails): Promise<ShipmentDispatchResult> {
    logger.info(`[LogisticsService:Mock] Booking shipment for Order ${details.orderId} via Delhivery...`);

    // Simulate booking shipment via REST API call to logistics carrier
    await new Promise((resolve) => setTimeout(resolve, 600));

    const waybill = `WAYBILL-${Math.floor(100000000 + Math.random() * 900000000)}`;
    logger.info(`[LogisticsService:Mock] Shipment booked successfully. Waybill: ${waybill}`);

    return {
      waybillNumber: waybill,
      carrier: 'DELHIVERY',
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // +4 days
      syncedAt: new Date().toISOString(),
    };
  }

  async getTrackingStatus(waybillNumber: string): Promise<TrackingStatusResult> {
    logger.info(`[LogisticsService:Mock] Querying status for waybill: ${waybillNumber}`);

    return {
      waybillNumber,
      status: 'IN_TRANSIT',
      currentLocation: 'Mumbai Sorting Hub',
      scans: [
        { time: new Date().toISOString(), details: 'Arrived at Mumbai Sorting Hub' },
        { time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), details: 'Shipped from Bangalore Yard' },
      ],
    };
  }
}

export function getLogisticsAdapter(): LogisticsAdapter {
  const provider = process.env.LOGISTICS_PROVIDER || 'mock';

  switch (provider.toLowerCase()) {
    case 'mock':
    default:
      return new MockLogisticsAdapter();
  }
}
