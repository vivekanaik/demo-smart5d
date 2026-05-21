import type { EntityTable } from 'dexie';

export interface LocalMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  categoryId: string;
  imageUrl: string | null;
  isVegetarian: boolean;
  status: string;
}

export interface LocalCategory {
  id: string;
  name: string;
}

export interface PendingOrder {
  localId?: number;
  orderData: any;
  status: 'pending' | 'syncing' | 'failed';
  createdAt: string;
  error?: string;
}

let dbInstance: any = null;

export const getDb = async () => {
  if (typeof window === 'undefined') return null;
  
  if (!dbInstance) {
    const { default: Dexie } = await import('dexie');
    
    dbInstance = new Dexie('Smart5DLocalDB') as any;

    dbInstance.version(1).stores({
      menuItems: 'id, categoryId, status',
      categories: 'id',
      activeOrders: 'id, status, createdAt',
      pendingOrders: '++localId, status, createdAt'
    });

    dbInstance.version(2).stores({
      menuItems: 'id, categoryId, status',
      categories: 'id',
      activeOrders: 'id, status, createdAt',
      pendingOrders: '++localId, status, createdAt'
    });

    dbInstance.version(3).stores({
      menuItems: 'id, categoryId, status',
      categories: 'id',
      activeOrders: 'id, status, createdAt',
      pendingOrders: '++localId, status, createdAt',
      tables: 'id, tableNumber, status'
    });

    dbInstance.version(4).stores({
      menuItems: 'id, categoryId, status',
      categories: 'id',
      activeOrders: 'id, status, createdAt',
      pendingOrders: '++localId, status, createdAt',
      tables: 'id, tableNumber, status',
      reservations: 'id, tableId, reservationTime',
      pendingReservations: '++localId, status, createdAt'
    }).upgrade(() => {
      // Handle migrations cleanly
    });
  }
  return dbInstance;
};
