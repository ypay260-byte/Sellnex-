import { Storage } from './storage';
import { Product } from '../types';

export interface ImportedProductDraft {
  title: string;
  description: string;
  category: string;
  images: string[];
  supplier: 'Amazon' | 'Alibaba' | 'Uzum Market' | 'Custom Supplier';
  supplierUrl: string;
  supplierCost: number; // in UZS
  shippingCost: number; // in UZS
  variants: { id: string; name: string; options: string[] }[];
  suggestedOldPrice?: number;
  stock: number;
}

// Database of realistic product categories & images for accurate URL parsing
const KNOWN_CATEGORIES = [
  {
    keywords: ['telefon', 'smartfon', 'phone', 'xiaomi', 'redmi', 'samsung', 'iphone', 'honor', 'poco', 'smartphone'],
    title: 'Smartfon 6.7" AMOLED 128GB / 8GB RAM Dual SIM',
    description: 'Yuqori sifatli 120Hz AMOLED ekran, 50MP AI kamera, 5000mAh batareya va 33W tezkor quvvatlash adapteri bilan jihozlangan kuchli smartfon. 1 yil rasmiy kafolat bilan.',
    category: 'Smartfonlar va Telefonlar',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 1450000,
    shippingCost: 20000,
    suggestedOldPrice: 1950000,
    variants: [
      { id: 'v1', name: 'Xotira', options: ['128GB / 6GB', '256GB / 8GB'] },
      { id: 'v2', name: 'Rang', options: ['Midnight Black', 'Ocean Blue', 'Aurora Green'] },
    ],
  },
  {
    keywords: ['naushnik', 'earphone', 'headphone', 'airpod', 'buds', 'tws', 'bluetooth', 'pro', 'audio'],
    title: 'Simsiz Bluetooth TWS Naushnik ANC Shovqin Soʻndiruvchi',
    description: 'Aktiv shovqinni soʻndirish (ANC), 36 soatgacha zaryad bilan ishlash, chuqur Bass va tiniq HD mikrofon bilan taʼminlangan qulay simsiz naushnik.',
    category: 'Audio va Naushniklar',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 120000,
    shippingCost: 15000,
    suggestedOldPrice: 240000,
    variants: [
      { id: 'v1', name: 'Rang', options: ['Oq (White)', 'Qora (Matte Black)'] },
    ],
  },
  {
    keywords: ['soat', 'watch', 'smartwatch', 'smart-watch', 'ultra', 'fitness', 'fit'],
    title: 'Smart Watch Ultra 2 Amoled Suvga Chidamli Aqlli Soat',
    description: 'Yurak urishi, qon bosimi, sport rejimlari, Bluetooth qoʻngʻiroq va NFC funksiyalari bilan taʼminlangan eng soʻnggi avlod titan korpusli aqlli soat.',
    category: 'Aksessuarlar va Aqlli Soatlar',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 175000,
    shippingCost: 15000,
    suggestedOldPrice: 320000,
    variants: [
      { id: 'v1', name: 'Kamar rangi', options: ['Toʻq sariq (Orange)', 'Qora (Black)', 'Kumush (Silver)'] },
    ],
  },
  {
    keywords: ['krossovka', 'poyabzal', 'sneaker', 'shoe', 'nike', 'adidas', 'shoes', 'running'],
    title: 'Erkaklar va Ayollar uchun Yengil Sport Krossovka',
    description: 'Nafas oluvchi toʻrli mato, yengil amortizatsiyali taglik va zamonaviy dizaynga ega kundalik va sport poyabzali.',
    category: 'Kiyim va Poyabzal',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 140000,
    shippingCost: 18000,
    suggestedOldPrice: 280000,
    variants: [
      { id: 'v1', name: 'Oʻlcham (Size)', options: ['40', '41', '42', '43', '44'] },
      { id: 'v2', name: 'Rang', options: ['Qora / Qizil', 'Oq / Kulrang'] },
    ],
  },
  {
    keywords: ['sumka', 'ryukzak', 'bag', 'backpack', 'portfel', 'leather', 'charm'],
    title: 'Suv Oʻtkazmaydigan Zamonaviy Shaxsiy Ryukzak / Sumka',
    description: 'Noutbuk boʻlimi (15.6 dyuymgacha), USB zaryad porti, oʻgʻirlikka qarshi yashirin choʻntaklar va chidamli Oxford matoli ryukzak.',
    category: 'Sumkalar va Chamadonlar',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 98000,
    shippingCost: 15000,
    suggestedOldPrice: 195000,
    variants: [
      { id: 'v1', name: 'Rang', options: ['Klassik Qora', 'Toʻq Koʻk', 'Kulrang'] },
    ],
  },
  {
    keywords: ['parfyum', 'atir', 'duxi', 'perfume', 'fragrance', 'cologne'],
    title: 'Premium Arabian Oud & Vanilla Parfyum Suvi 100ml',
    description: 'Uzoq muddat (48 soatgacha) saqlanib turuvchi, shleyfli va boy yogʻoch-vanil notalari bilan boyitilgan hashamatli xushboʻy atir.',
    category: 'Goʻzallik va Parfyumeriya',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 85000,
    shippingCost: 15000,
    suggestedOldPrice: 180000,
    variants: [
      { id: 'v1', name: 'Hajm', options: ['50 ml', '100 ml'] },
    ],
  },
  {
    keywords: ['powerbank', 'poverbank', 'zaryadka', 'quvvatlagich', 'charger', 'akkumulyator', 'battery'],
    title: 'Tezkor Quvvatlovchi Power Bank 20000mAh 22.5W Fast Charge',
    description: 'Bir vaqtning oʻzida 3 tagacha qurilmani tez quvvatlash, raqamli LED displey, Type-C va Lightning portlar bilan himoyalangan tashqi akkumulyator.',
    category: 'Aksessuarlar va Quvvatlagichlar',
    images: [
      'https://images.unsplash.com/photo-1609592426867-0870d04c45e8?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 115000,
    shippingCost: 15000,
    suggestedOldPrice: 220000,
    variants: [
      { id: 'v1', name: 'Rang', options: ['Qora', 'Oq'] },
    ],
  },
  {
    keywords: ['kurtka', 'kiyim', 'futbolka', 'hudiy', 'hoodie', 'jacket', 'tshirt', 'sviter'],
    title: 'Premium Paxtali Oversize Qishki Hudiy / Sviter',
    description: '100% tabiiy 3 ipli paxta matodan tayyorlangan, ichi yumshoq issiq qoplamali, shaklini yoʻqotmaydigan qulay oversize kiyim.',
    category: 'Kiyim va Moda',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 135000,
    shippingCost: 15000,
    suggestedOldPrice: 260000,
    variants: [
      { id: 'v1', name: 'Oʻlcham', options: ['M', 'L', 'XL', 'XXL'] },
      { id: 'v2', name: 'Rang', options: ['Qora', 'Bej (Krem)', 'Toʻq Yashil'] },
    ],
  },
  {
    keywords: ['diffuzer', 'namlagich', 'humidifier', 'aroma', 'lampa', 'chiroq', 'decor'],
    title: 'Ultrasonik Olovli Aroma Havoni Namlagich Diffuzer LED',
    description: 'Xonani xushboʻylashtiruvchi va havoni namlovchi olov effektli zamonaviy LED diffuzer. Shovqinsiz ishlaydi va suv tugaganda avtomatik oʻchadi.',
    category: 'Uy va Maishiy Texnika',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 95000,
    shippingCost: 15000,
    suggestedOldPrice: 190000,
    variants: [
      { id: 'v1', name: 'Korpus', options: ['Mat Qora', 'Yumshoq Oq'] },
    ],
  },
  {
    keywords: ['holder', 'avto', 'mashina', 'car', 'avtomobil', 'magnit'],
    title: 'Avtomobil uchun Magnitli Telefon Tutgich 360°',
    description: 'Kuchli 6x N52 neodim magnitlari, 360 gradus aylanuvchi metall korpusli avtomobil havo panjarasiga oʻrnatiladigan qulay tutgich.',
    category: 'Avto Jihozlar',
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
    ],
    supplierCost: 45000,
    shippingCost: 15000,
    suggestedOldPrice: 110000,
    variants: [
      { id: 'v1', name: 'Rang', options: ['Mat Qora', 'Metall Kulrang'] },
    ],
  },
];

export const productService = {
  getProducts(): Product[] {
    return Storage.getProducts();
  },

  getProductById(id: string): Product | undefined {
    return Storage.getProducts().find((p) => p.id === id);
  },

  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'salesCount'>): Product {
    const products = Storage.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      salesCount: 0,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    Storage.setProducts(products);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = Storage.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated = { ...products[index], ...updates };
    products[index] = updated;
    Storage.setProducts(products);
    return updated;
  },

  deleteProduct(id: string): boolean {
    const products = Storage.getProducts().filter((p) => p.id !== id);
    Storage.setProducts(products);
    return true;
  },

  duplicateProduct(id: string): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;

    const copy: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      title: `${product.title} (Copy)`,
      sku: `${product.sku}-CPY`,
      status: 'Draft',
      salesCount: 0,
      createdAt: new Date().toISOString(),
    };

    const products = Storage.getProducts();
    products.unshift(copy);
    Storage.setProducts(products);
    return copy;
  },

  togglePublish(id: string): { success: boolean; product?: Product } {
    const product = this.getProductById(id);
    if (!product) return { success: false };

    const newStatus = product.status === 'Published' ? 'Draft' : 'Published';
    const updated = this.updateProduct(id, { status: newStatus });
    return { success: true, product: updated || undefined };
  },

  /**
   * Intelligently parses and extracts product details from any supplier link
   */
  async simulateUrlImport(url: string, supplierHint?: string): Promise<ImportedProductDraft> {
    await new Promise((r) => setTimeout(r, 900));

    const cleanUrl = url.trim();
    const lowerUrl = cleanUrl.toLowerCase();

    // Determine supplier source
    let detectedSupplier: 'Amazon' | 'Alibaba' | 'Uzum Market' | 'Custom Supplier' = 'Custom Supplier';
    if (lowerUrl.includes('uzum') || supplierHint === 'Uzum Market') {
      detectedSupplier = 'Uzum Market';
    } else if (lowerUrl.includes('alibaba') || lowerUrl.includes('aliexpress') || supplierHint === 'Alibaba') {
      detectedSupplier = 'Alibaba';
    } else if (lowerUrl.includes('amazon') || supplierHint === 'Amazon') {
      detectedSupplier = 'Amazon';
    }

    // Extract textual slug from URL if available
    // e.g. https://uzum.uz/ru/product/smartfon-xiaomi-redmi-13c-23032 -> smartfon xiaomi redmi 13c
    let urlSlug = '';
    try {
      const urlObj = new URL(cleanUrl);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1] || '';
      urlSlug = decodeURIComponent(lastSegment)
        .replace(/[-_]+/g, ' ')
        .replace(/\.html?$/i, '')
        .replace(/[0-9]+/g, '')
        .trim();
    } catch {
      urlSlug = lowerUrl;
    }

    // Match keywords with our catalog
    const matchedCategory = KNOWN_CATEGORIES.find((cat) =>
      cat.keywords.some((kw) => lowerUrl.includes(kw) || urlSlug.toLowerCase().includes(kw))
    );

    // If a keyword matched, construct tailored item
    if (matchedCategory) {
      let customTitle = matchedCategory.title;
      if (urlSlug.length > 4 && !/^[0-9\s]+$/.test(urlSlug)) {
        // Capitalize words from slug
        customTitle = urlSlug
          .split(' ')
          .filter((w) => w.length > 1)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      return {
        title: customTitle,
        description: matchedCategory.description,
        category: matchedCategory.category,
        images: matchedCategory.images,
        supplier: detectedSupplier,
        supplierUrl: cleanUrl,
        supplierCost: matchedCategory.supplierCost,
        shippingCost: detectedSupplier === 'Uzum Market' ? 15000 : matchedCategory.shippingCost,
        suggestedOldPrice: matchedCategory.suggestedOldPrice,
        stock: 50,
        variants: matchedCategory.variants,
      };
    }

    // Specific fallback per supplier if no specific category was found in URL
    if (detectedSupplier === 'Uzum Market') {
      // If it's an Uzum link with just ID like /product/23032
      return {
        title: 'Uzum Market Mahsuloti #' + (cleanUrl.match(/\d+/)?.[0] || '23032'),
        description: 'Uzum Market yetkazib beruvchisidan toʻgʻridan-toʻgʻri import qilingan original mahsulot. 1 kunlik tezkor yetkazib berish xizmati mavjud.',
        category: 'Elektronika va Aksessuarlar',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        ],
        supplier: 'Uzum Market',
        supplierUrl: cleanUrl,
        supplierCost: 85000,
        shippingCost: 15000,
        suggestedOldPrice: 170000,
        stock: 60,
        variants: [
          { id: 'v1', name: 'Tanlov / Variant', options: ['Standart', 'Premium'] },
        ],
      };
    }

    if (detectedSupplier === 'Alibaba') {
      return {
        title: 'Wholesale High Quality Trending Item',
        description: 'Direct wholesale verified supplier item with certified factory quality testing and bulk order pricing.',
        category: 'Electronics & Gadgets',
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
        ],
        supplier: 'Alibaba',
        supplierUrl: cleanUrl,
        supplierCost: 95000,
        shippingCost: 25000,
        suggestedOldPrice: 220000,
        stock: 100,
        variants: [
          { id: 'v1', name: 'Type', options: ['Model A', 'Model B Pro'] },
        ],
      };
    }

    // Default fallback
    return {
      title: 'Imported Supplier Product',
      description: 'High quality supplier product with fast fulfillment and guaranteed delivery across all regions.',
      category: 'General Merchandise',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      supplier: 'Custom Supplier',
      supplierUrl: cleanUrl,
      supplierCost: 110000,
      shippingCost: 20000,
      suggestedOldPrice: 240000,
      stock: 45,
      variants: [
        { id: 'v1', name: 'Variant', options: ['Standard'] },
      ],
    };
  },
};
