import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { AdBanner, AdInquiry, AdChatMessage } from '../types';

const BANNERS_COLLECTION = 'ads_banners';
const INQUIRIES_COLLECTION = 'ad_inquiries';
const LOCAL_BANNERS_KEY = 'sellnex_cached_ads_banners';
const LOCAL_INQUIRIES_KEY = 'sellnex_cached_ad_inquiries';

// High quality initial banners that display immediately
export const INITIAL_BANNERS: AdBanner[] = [
  {
    id: 'banner-gadgets-1',
    title: 'Smart Gadjetlar & Elektronika — Rasmiy Ombor',
    subtitle: 'Toshkent omboridan 24 soatda yetkazib berish. 1 donadan boshlab savdo qiling.',
    badge: 'TREND TOVAR',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1400&auto=format&fit=crop&q=80',
    linkUrl: '/products',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-12-31',
    isActive: true,
    order: 1,
    clickCount: 142,
    createdAt: new Date().toISOString(),
    advertiserName: 'Sellnex Logistics & Warehouse',
  },
  {
    id: 'banner-promo-ads',
    title: 'Mahsulotingiz yoki Do‘koningizni Sellnex’da Reklama Qiling!',
    subtitle: '50,000+ faol tadbirkorlar va xaridorlarga ega auditoriyada o‘z brendingizni e’lon qiling.',
    badge: 'SELLNEX ADS',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&auto=format&fit=crop&q=80',
    linkUrl: '#open-chat',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-12-31',
    isActive: true,
    order: 2,
    clickCount: 285,
    createdAt: new Date().toISOString(),
    advertiserName: 'Sellnex Marketing',
  },
  {
    id: 'banner-payments-safety',
    title: 'Click, Payme & Uzum Bank Orqali Kafolatlangan Savdo',
    subtitle: 'Barcha to‘lovlar to‘g‘ridan-to‘g‘ri hisobingizga tushadi, 0% yashirin to‘lov.',
    badge: 'XAVFSIZ TO‘LOV',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1400&auto=format&fit=crop&q=80',
    linkUrl: '/pricing',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-12-31',
    isActive: true,
    order: 3,
    clickCount: 96,
    createdAt: new Date().toISOString(),
    advertiserName: 'Sellnex Finance',
  },
];

class AdBannerService {
  // Get active and non-expired banners for the slider
  async getActiveBanners(): Promise<AdBanner[]> {
    const today = new Date().toISOString().split('T')[0];

    try {
      if (db) {
        const colRef = collection(db, BANNERS_COLLECTION);
        const q = query(colRef);
        const snap = await getDocs(q);

        if (!snap.empty) {
          const list: AdBanner[] = [];
          snap.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as AdBanner);
          });

          // Filter by active status and expiry date (muddat)
          const activeList = list
            .filter((b) => b.isActive !== false && (!b.endDate || b.endDate >= today))
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          if (activeList.length > 0) {
            localStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(list));
            return activeList;
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch banners from firestore, using local cache:', e);
    }

    // Fallback to local storage or initial banners
    const cached = localStorage.getItem(LOCAL_BANNERS_KEY);
    if (cached) {
      try {
        const parsed: AdBanner[] = JSON.parse(cached);
        const filtered = parsed
          .filter((b) => b.isActive !== false && (!b.endDate || b.endDate >= today))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        if (filtered.length > 0) return filtered;
      } catch {
        // ignore JSON error
      }
    }

    return INITIAL_BANNERS;
  }

  // Admin: Get all banners (including inactive and expired)
  async getAllBanners(): Promise<AdBanner[]> {
    try {
      if (db) {
        const colRef = collection(db, BANNERS_COLLECTION);
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const list: AdBanner[] = [];
          snap.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as AdBanner);
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          localStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(list));
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch all banners:', e);
    }

    const cached = localStorage.getItem(LOCAL_BANNERS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }

    return INITIAL_BANNERS;
  }

  // Save or update banner
  async saveBanner(bannerData: Partial<AdBanner>): Promise<AdBanner> {
    const id = bannerData.id || `banner_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const banner: AdBanner = {
      id,
      title: bannerData.title || 'Yangi Reklama',
      subtitle: bannerData.subtitle || '',
      badge: bannerData.badge || 'REKLAMA',
      imageUrl: bannerData.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&auto=format&fit=crop&q=80',
      linkUrl: bannerData.linkUrl || '#',
      startDate: bannerData.startDate || now.split('T')[0],
      endDate: bannerData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: bannerData.isActive !== false,
      order: bannerData.order ?? 1,
      clickCount: bannerData.clickCount || 0,
      createdAt: bannerData.createdAt || now,
      updatedAt: now,
      advertiserName: bannerData.advertiserName || '',
      advertiserContact: bannerData.advertiserContact || '',
    };

    // Save to Firestore
    try {
      if (db) {
        await setDoc(doc(db, BANNERS_COLLECTION, id), banner, { merge: true });
      }
    } catch (e) {
      console.error('Error saving banner to Firestore:', e);
    }

    // Update local cache
    const current = await this.getAllBanners();
    const idx = current.findIndex((b) => b.id === id);
    if (idx >= 0) {
      current[idx] = banner;
    } else {
      current.push(banner);
    }
    localStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(current));

    return banner;
  }

  // Delete banner
  async deleteBanner(id: string): Promise<void> {
    try {
      if (db) {
        await deleteDoc(doc(db, BANNERS_COLLECTION, id));
      }
    } catch (e) {
      console.error('Error deleting banner from Firestore:', e);
    }

    const current = await this.getAllBanners();
    const updated = current.filter((b) => b.id !== id);
    localStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(updated));
  }

  // Increment click count
  async recordBannerClick(id: string): Promise<void> {
    try {
      const all = await this.getAllBanners();
      const b = all.find((item) => item.id === id);
      if (b) {
        b.clickCount = (b.clickCount || 0) + 1;
        if (db) {
          await updateDoc(doc(db, BANNERS_COLLECTION, id), { clickCount: b.clickCount });
        }
        localStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(all));
      }
    } catch {
      // quiet fail
    }
  }

  // --- AD INQUIRIES & LIVE CHAT WITH ADMINISTRATION ---

  async getInquiries(): Promise<AdInquiry[]> {
    try {
      if (db) {
        const colRef = collection(db, INQUIRIES_COLLECTION);
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const list: AdInquiry[] = [];
          snap.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as AdInquiry);
          });
          list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
          localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(list));
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to load inquiries from Firestore:', e);
    }

    const cached = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return [];
  }

  async getInquiryById(id: string): Promise<AdInquiry | null> {
    try {
      if (db) {
        const snap = await getDoc(doc(db, INQUIRIES_COLLECTION, id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as AdInquiry;
        }
      }
    } catch (e) {
      console.warn('Failed to get inquiry by id:', e);
    }

    const all = await this.getInquiries();
    return all.find((i) => i.id === id) || null;
  }

  // Create new inquiry / start chat
  async createInquiry(data: {
    name: string;
    phone: string;
    category: string;
    message?: string;
  }): Promise<AdInquiry> {
    const id = `inquiry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const messages: AdChatMessage[] = [];
    if (data.message && data.message.trim()) {
      messages.push({
        id: `msg_${Date.now()}_1`,
        sender: 'user',
        senderName: data.name,
        text: data.message.trim(),
        timestamp: now,
      });
    }

    const inquiry: AdInquiry = {
      id,
      name: data.name,
      phone: data.phone,
      category: data.category,
      message: data.message || '',
      status: 'new',
      createdAt: now,
      updatedAt: now,
      messages,
      lastMessage: data.message || 'Yangi reklama so‘rovi',
      unreadAdmin: true,
      unreadUser: false,
    };

    try {
      if (db) {
        await setDoc(doc(db, INQUIRIES_COLLECTION, id), inquiry);
      }
    } catch (e) {
      console.error('Error creating inquiry in Firestore:', e);
    }

    const all = await this.getInquiries();
    all.unshift(inquiry);
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(all));
    localStorage.setItem('sellnex_current_ad_inquiry_id', id);

    return inquiry;
  }

  // Send message in existing chat thread
  async sendMessage(
    inquiryId: string,
    messageData: {
      sender: 'user' | 'admin';
      senderName: string;
      text: string;
    }
  ): Promise<AdInquiry> {
    const inquiry = await this.getInquiryById(inquiryId);
    const now = new Date().toISOString();
    const newMsg: AdChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sender: messageData.sender,
      senderName: messageData.senderName,
      text: messageData.text,
      timestamp: now,
    };

    const updatedInquiry: AdInquiry = inquiry
      ? {
          ...inquiry,
          messages: [...(inquiry.messages || []), newMsg],
          lastMessage: messageData.text,
          updatedAt: now,
          unreadAdmin: messageData.sender === 'user',
          unreadUser: messageData.sender === 'admin',
        }
      : {
          id: inquiryId,
          name: messageData.senderName,
          phone: '',
          category: 'other',
          status: 'in_progress',
          createdAt: now,
          updatedAt: now,
          messages: [newMsg],
          lastMessage: messageData.text,
          unreadAdmin: messageData.sender === 'user',
          unreadUser: messageData.sender === 'admin',
        };

    try {
      if (db) {
        await setDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), updatedInquiry, { merge: true });
      }
    } catch (e) {
      console.error('Error sending chat message in Firestore:', e);
    }

    const all = await this.getInquiries();
    const idx = all.findIndex((i) => i.id === inquiryId);
    if (idx >= 0) {
      all[idx] = updatedInquiry;
    } else {
      all.unshift(updatedInquiry);
    }
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(all));

    return updatedInquiry;
  }

  // Realtime subscription to an inquiry's chat
  subscribeToInquiry(inquiryId: string, onUpdate: (inquiry: AdInquiry) => void): () => void {
    if (!db) {
      return () => {};
    }
    const unsub = onSnapshot(
      doc(db, INQUIRIES_COLLECTION, inquiryId),
      (snap) => {
        if (snap.exists()) {
          const item = { id: snap.id, ...snap.data() } as AdInquiry;
          onUpdate(item);
        }
      },
      (err) => {
        console.warn('Realtime chat subscribe error:', err);
      }
    );
    return unsub;
  }
}

export const adBannerService = new AdBannerService();
