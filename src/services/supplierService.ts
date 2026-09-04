import { Storage } from './storage';
import { Supplier } from '../types';

export const supplierService = {
  getSuppliers(): Supplier[] {
    return Storage.getSuppliers();
  },

  addCustomSupplier(supplierData: Omit<Supplier, 'id' | 'type'>): Supplier {
    const suppliers = Storage.getSuppliers();
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      type: 'Custom Supplier',
      status: 'Connected',
    };
    suppliers.push(newSupplier);
    Storage.setSuppliers(suppliers);
    return newSupplier;
  },

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const suppliers = Storage.getSuppliers();
    const index = suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const updated = { ...suppliers[index], ...updates };
    suppliers[index] = updated;
    Storage.setSuppliers(suppliers);
    return updated;
  },
};
