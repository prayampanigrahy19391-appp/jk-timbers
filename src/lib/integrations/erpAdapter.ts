import { logger } from '../logger';

export interface ErpOrderSyncResult {
  erpOrderId: string;
  syncedAt: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  error?: string;
}

export interface ErpStockSyncResult {
  sku: string;
  previousStock: number;
  newStock: number;
  syncedAt: string;
}

export interface ErpAdapter {
  syncOrder(orderId: string, orderData: Record<string, unknown>): Promise<ErpOrderSyncResult>;
  syncStockLevels(): Promise<ErpStockSyncResult[]>;
}

// Concrete Mock SAP/ERPNext Adapter
class MockErpAdapter implements ErpAdapter {
  async syncOrder(orderId: string, orderData: Record<string, unknown>): Promise<ErpOrderSyncResult> {
    logger.info(`[ERPIntegration:Mock] Syncing Order ${orderId} to ERP system...`, {
      payloadKeysCount: Object.keys(orderData).length,
    });

    // Simulate RPC payload delivery to SAP/Oracle endpoints
    await new Promise((resolve) => setTimeout(resolve, 800));

    logger.info(`[ERPIntegration:Mock] Order ${orderId} successfully synced to ERP.`);
    return {
      erpOrderId: `ERP-ORD-${orderId.substring(0, 8).toUpperCase()}`,
      syncedAt: new Date().toISOString(),
      status: 'SUCCESS',
    };
  }

  async syncStockLevels(): Promise<ErpStockSyncResult[]> {
    logger.info('[ERPIntegration:Mock] Fetching stock reconciliations from ERP...');

    // Simulate inventory fetch RPC from central warehouse database
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        sku: 'JK-TEAK-WOOD',
        previousStock: 45,
        newStock: 50, // restocked at central ERP
        syncedAt: new Date().toISOString(),
      },
    ];
  }
}

// Factory to resolve adapter depending on configure setting
export function getErpAdapter(): ErpAdapter {
  const provider = process.env.ERP_PROVIDER || 'mock';

  switch (provider.toLowerCase()) {
    case 'mock':
    default:
      return new MockErpAdapter();
  }
}
