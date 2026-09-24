import { Storage } from './storage';
import { Supplier, SupplierReview } from '../types';
import { firestoreService } from './firestoreService';

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
      logo: supplierData.logo || '🏢',
      country: supplierData.country || 'Uzbekistan (Tashkent Hub)',
      avgDeliveryDays: supplierData.avgDeliveryDays || supplierData.averageDeliveryDays || '1–2 days',
      reliabilityScore: 5.0,
      shippingSpeedScore: 5.0,
      productQualityScore: 5.0,
      reviewCount: 0,
      recommendRate: 100,
      productCount: supplierData.productCount || 0,
    };
    suppliers.push(newSupplier);
    Storage.setSuppliers(suppliers);
    firestoreService.saveSupplier(newSupplier).catch(() => {});
    return newSupplier;
  },

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const suppliers = Storage.getSuppliers();
    const index = suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const updated = { ...suppliers[index], ...updates };
    suppliers[index] = updated;
    Storage.setSuppliers(suppliers);
    firestoreService.saveSupplier(updated).catch(() => {});
    return updated;
  },

  getReviews(supplierId?: string): SupplierReview[] {
    const reviews = Storage.getSupplierReviews();
    if (!supplierId) return reviews;
    return reviews.filter((r) => r.supplierId === supplierId);
  },

  addReview(
    reviewData: Omit<SupplierReview, 'id' | 'createdAt'>
  ): { review: SupplierReview; updatedSupplier: Supplier | null } {
    const reviews = Storage.getSupplierReviews();
    const overall =
      typeof reviewData.overallRating === 'number'
        ? reviewData.overallRating
        : Number(
            ((reviewData.shippingSpeedRating + reviewData.productQualityRating) / 2).toFixed(1)
          );

    const newReview: SupplierReview = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      overallRating: overall,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    const updatedReviews = [newReview, ...reviews];
    Storage.setSupplierReviews(updatedReviews);
    firestoreService.saveSupplierReview(newReview).catch(() => {});

    // Recalculate metrics for target supplier
    const supplierReviews = updatedReviews.filter((r) => r.supplierId === reviewData.supplierId);
    let updatedSupplier: Supplier | null = null;

    if (supplierReviews.length > 0) {
      const totalSpeed = supplierReviews.reduce((sum, r) => sum + r.shippingSpeedRating, 0);
      const totalQuality = supplierReviews.reduce((sum, r) => sum + r.productQualityRating, 0);
      const totalOverall = supplierReviews.reduce((sum, r) => sum + r.overallRating, 0);
      const recommendedCount = supplierReviews.filter((r) => r.recommend).length;

      const avgSpeed = Number((totalSpeed / supplierReviews.length).toFixed(1));
      const avgQuality = Number((totalQuality / supplierReviews.length).toFixed(1));
      const avgReliability = Number((totalOverall / supplierReviews.length).toFixed(1));
      const recommendPercent = Math.round((recommendedCount / supplierReviews.length) * 100);

      updatedSupplier = this.updateSupplier(reviewData.supplierId, {
        shippingSpeedScore: avgSpeed,
        productQualityScore: avgQuality,
        reliabilityScore: avgReliability,
        reviewCount: supplierReviews.length,
        recommendRate: recommendPercent,
      });
    }

    return { review: newReview, updatedSupplier };
  },
};

