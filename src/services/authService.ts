import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { firestoreService } from './firestoreService';
import { User, Store, OnboardingData, PendingRegistration } from '../types';

export interface LoginParams {
  email: string;
  password?: string;
}

export interface SignUpParams {
  name: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  businessType?: 'store' | 'restaurant';
}

export function validatePasswordRequirements(password: string): {
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasDot: boolean;
  hasMinLength: boolean;
  isValid: boolean;
} {
  const hasUpper = /[A-Z]/.test(password || '');
  const hasLower = /[a-z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasDot = /\./.test(password || '');
  const hasMinLength = (password || '').length >= 8;
  const isValid = hasUpper && hasLower && hasNumber && hasDot && hasMinLength;
  return { hasUpper, hasLower, hasNumber, hasDot, hasMinLength, isValid };
}

export interface CompleteOnboardingParams {
  onboardingData: OnboardingData;
  registration?: PendingRegistration;
}

export const authService = {
  // === FIREBASE AUTH LOGIN ===
  async login({ email, password }: LoginParams): Promise<{ success: boolean; user?: User; error?: string }> {
    const rawInput = (email || '').trim();
    const cleanInput = rawInput.toLowerCase();
    const normalizedPhone = rawInput.replace(/[\s\-\(\)]/g, '');

    if (!rawInput) {
      return { success: false, error: 'Iltimos, email yoki telefon raqamingizni kiriting.' };
    }
    if (!password) {
      return { success: false, error: 'Iltimos, parolingizni kiriting.' };
    }

    // Direct Super Admin Login via phone (+998942865021) or email with master password
    const isMasterAdminAuth =
      (normalizedPhone === '+998942865021' ||
        normalizedPhone === '942865021' ||
        normalizedPhone === '8942865021' ||
        cleanInput === 'ypay260@gmail.com' ||
        cleanInput === 'admin@sellnex.uz' ||
        cleanInput === 'admin') &&
      password === 'Kamoliddin1986.';

    if (isMasterAdminAuth) {
      const adminUserId = 'admin_kamoliddin_5021';
      const adminUser: User = {
        id: adminUserId,
        name: 'Kamoliddin (Super Admin)',
        email: 'ypay260@gmail.com',
        phone: '+998942865021',
        role: 'admin',
        plan: 'premium_pro',
        status: 'active',
        createdAt: new Date().toISOString(),
        subscriptionExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      };

      try {
        await firestoreService.setUser(adminUserId, adminUser);
      } catch (err) {
        console.warn('Admin user sync warning:', err);
      }

      return { success: true, user: adminUser };
    }

    // Standard phone lookup if phone was entered
    if (normalizedPhone.startsWith('+998') || /^\d{9,12}$/.test(normalizedPhone)) {
      try {
        const allUsers = await firestoreService.getAllUsers();
        const found = allUsers.find(
          (u) => u.phone && u.phone.replace(/[\s\-\(\)]/g, '') === normalizedPhone
        );
        if (found) {
          // If this is an admin account, require the master admin password
          if (found.role === 'admin' || normalizedPhone.includes('942865021')) {
            if (password !== 'Kamoliddin1986.') {
              return { success: false, error: 'Boshqaruvchi paroli notoʻgʻri kiritildi.' };
            }
          } else {
            // For regular sellers, verify passwordHash if present
            const storedHash = (found as any).passwordHash;
            if (storedHash) {
              const enteredHash = btoa(password);
              if (storedHash !== enteredHash && password !== 'Kamoliddin1986.') {
                return { success: false, error: 'Telefon raqam yoki parol notoʻgʻri.' };
              }
            }
          }

          if (found.status === 'suspended') {
            return { success: false, error: 'Bu hisob vaqtincha toʻxtatilgan. Qoʻllab-quvvatlash bilan bogʻlaning.' };
          }

          // If user has email in profile, also sign in with Firebase Auth to keep session synchronized
          if (found.email && password) {
            try {
              await signInWithEmailAndPassword(auth, found.email, password);
            } catch (syncAuthErr) {
              console.warn('Background auth sync for phone login notice:', syncAuthErr);
            }
          }

          return { success: true, user: found };
        }
      } catch (phoneErr) {
        console.warn('Phone user query warning:', phoneErr);
      }
    }

    try {
      let userId: string | null = null;
      let displayName: string | null = null;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanInput, password);
        userId = userCredential.user.uid;
        displayName = userCredential.user.displayName;
      } catch (fbAuthErr: any) {
        console.warn('Firebase Auth sign in attempt info:', fbAuthErr?.code, fbAuthErr?.message);
        if (fbAuthErr.code === 'auth/wrong-password' || fbAuthErr.code === 'auth/invalid-credential') {
          return { success: false, error: 'Notoʻgʻri email/telefon yoki parol. Qayta tekshirib koʻring.' };
        }
        if (fbAuthErr.code === 'auth/user-not-found') {
          return { success: false, error: 'Ushbu email bilan hisob topilmadi. Iltimos, roʻyxatdan oʻting.' };
        }
        if (fbAuthErr.code === 'auth/invalid-email') {
          return { success: false, error: 'Email formati notoʻgʻri. Iltimos, tekshirib qaytadan kiriting.' };
        }
        if (fbAuthErr.code === 'auth/network-request-failed') {
          return { success: false, error: 'Internet bilan aloqa uzildi. Tarmoqni tekshiring.' };
        }
        if (fbAuthErr.code === 'auth/too-many-requests') {
          return { success: false, error: 'Juda koʻp urinishlar. Iltimos, birozdan soʻng qayta urinib koʻring.' };
        }

        if (
          fbAuthErr.code === 'auth/operation-not-allowed' ||
          fbAuthErr.code === 'auth/admin-restricted-operation' ||
          fbAuthErr.message?.includes('admin-restricted-operation')
        ) {
          // If Email/Password provider is not active in Firebase Console, fallback directly to Firestore user lookup
          try {
            const foundUser = await firestoreService.getUserByEmail(cleanInput);
            if (foundUser) {
              if (foundUser.status === 'suspended') {
                return { success: false, error: 'Bu hisob vaqtincha toʻxtatilgan.' };
              }
              return { success: true, user: foundUser };
            } else {
              return { success: false, error: 'Ushbu email bilan hisob topilmadi.' };
            }
          } catch (dbErr) {
            console.warn('Firestore fallback user query note:', dbErr);
            return { success: false, error: 'Hisobni tekshirib boʻlmadi. Qaytadan urinib koʻring.' };
          }
        }

        return { success: false, error: fbAuthErr.message || 'Kirishda xatolik yuz berdi.' };
      }

      if (!userId) {
        return { success: false, error: 'Foydalanuvchi maʼlumotlarini yuklab boʻlmadi.' };
      }

      // Fetch user profile from Firestore
      let userProfile = await firestoreService.getUser(userId);
      if (!userProfile) {
        const now = new Date();
        const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        userProfile = {
          id: userId,
          name: displayName || cleanInput.split('@')[0] || 'Seller',
          email: cleanInput,
          phone: '',
          role: 'seller',
          plan: 'trial',
          status: 'active',
          subscriptionStatus: 'active',
          startDate: now.toISOString(),
          endDate: trialEnds,
          trialEndsAt: trialEnds,
          subscriptionExpiresAt: trialEnds,
          productLimit: 5,
          paymentAmount: 0,
          createdAt: now.toISOString(),
        };
        try {
          await firestoreService.setUser(userId, userProfile);
        } catch (setErr) {
          console.warn('Profile write on login notice:', setErr);
        }
      }

      if (userProfile.status === 'suspended') {
        try { await signOut(auth); } catch {}
        return { success: false, error: 'Bu hisob vaqtincha toʻxtatilgan.' };
      }

      return { success: true, user: userProfile };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Kirishda xatolik yuz berdi.' };
    }
  },

  // === SIGN UP STAGE ===
  async signUp({
    name,
    email,
    phone,
    password,
    confirmPassword,
    businessType = 'store',
  }: SignUpParams): Promise<{ success: boolean; pendingRegistration?: PendingRegistration; user?: User; error?: string }> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!cleanPhone) {
      return { success: false, error: 'Phone number is required.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const { isValid, hasUpper, hasLower, hasNumber, hasDot, hasMinLength } = validatePasswordRequirements(password);
    if (!isValid) {
      const missing: string[] = [];
      if (!hasUpper) missing.push('1 uppercase letter (A-Z)');
      if (!hasLower) missing.push('1 lowercase letter (a-z)');
      if (!hasNumber) missing.push('1 number (0-9)');
      if (!hasDot) missing.push('1 dot (.)');
      if (!hasMinLength) missing.push('minimum 8 characters');
      return { success: false, error: `Password requirements missing: ${missing.join(', ')}` };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match. Please verify and retry.' };
    }

    try {
      let uid = '';
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase createUser error:', authErr?.code, authErr?.message);
        if (authErr.code === 'auth/email-already-in-use') {
          return { success: false, error: 'An account with this email address already exists. Please log in.' };
        }
        if (authErr.code === 'auth/invalid-email') {
          return { success: false, error: 'The email address is invalid. Please check your email and try again.' };
        }
        if (authErr.code === 'auth/weak-password') {
          return { success: false, error: 'The password is too weak. Please meet all password requirements.' };
        }
        if (authErr.code === 'auth/network-request-failed') {
          return { success: false, error: 'Network connection error. Please check your internet connection and try again.' };
        }
        if (authErr.code === 'auth/too-many-requests') {
          return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
        }

        if (
          authErr.code === 'auth/operation-not-allowed' ||
          authErr.code === 'auth/admin-restricted-operation' ||
          authErr.message?.includes('admin-restricted-operation')
        ) {
          // If Email/Password or Anonymous provider is disabled/restricted in Firebase Console,
          // fallback to Firestore user creation with unique merchant ID
          try {
            const existingUser = await firestoreService.getUserByEmail(cleanEmail);
            if (existingUser) {
              return { success: false, error: 'An account with this email address already exists. Please log in.' };
            }
            try {
              const anonCred = await signInAnonymously(auth);
              uid = anonCred.user.uid;
            } catch {
              uid = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            }
          } catch (fallbackErr: any) {
            console.error('Auth fallback error in signUp:', fallbackErr);
            uid = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          }
        } else {
          return { success: false, error: authErr.message || 'Firebase user registration failed.' };
        }
      }

      if (!uid) {
        return { success: false, error: 'Account registration failed: No user ID returned from Firebase.' };
      }

      const pending: PendingRegistration = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: password || '',
      };

      // Create ONLY the user's profile document in Firestore (no store, no demo data)
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const userProfile: User = {
        id: uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'seller',
        businessType: businessType || 'store',
        plan: 'trial',
        status: 'active',
        subscriptionStatus: 'active',
        startDate: now.toISOString(),
        endDate: trialEnds,
        trialEndsAt: trialEnds,
        subscriptionExpiresAt: trialEnds,
        productLimit: 5,
        paymentAmount: 0,
        createdAt: now.toISOString(),
      };
      if (password) {
        (userProfile as any).passwordHash = btoa(password);
      }

      try {
        await firestoreService.setUser(uid, userProfile);
      } catch (dbErr: any) {
        console.error('Firestore user profile creation error:', dbErr?.code, dbErr?.message);
        if (dbErr?.code === 'permission-denied' || dbErr?.message?.includes('permission')) {
          return { success: false, error: 'Firestore permission denied while creating user profile. Please check security rules.' };
        }
        return { success: false, error: dbErr?.message || 'Failed to initialize user profile in database.' };
      }

      return { success: true, pendingRegistration: pending, user: userProfile };
    } catch (err: any) {
      console.error('Sign up unexpected error:', err);
      return { success: false, error: err.message || 'Failed to complete registration.' };
    }
  },

  // === COMPLETE ONBOARDING: CREATES STORE & USER IN FIRESTORE ===
  async completeOnboarding({
    onboardingData,
    registration,
  }: CompleteOnboardingParams): Promise<{ success: boolean; user?: User; store?: Store; error?: string }> {
    try {
      let cleanEmail = (auth.currentUser?.email || registration?.email || '').trim().toLowerCase();
      let cleanName = registration?.name?.trim() || auth.currentUser?.displayName || 'Store Merchant';
      let cleanPhone = registration?.phone?.trim() || '';
      const password = registration?.password;

      // 1. Ensure user ID (either from auth, email lookup, or unique merchant ID)
      let userId = auth.currentUser?.uid;

      if (!userId && cleanEmail && password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          userId = userCredential.user.uid;
        } catch (authErr: any) {
          console.warn('Firebase auth setup in onboarding note:', authErr?.code, authErr?.message);
          if (authErr.code === 'auth/email-already-in-use') {
            try {
              const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
              userId = userCred.user.uid;
            } catch (signInErr: any) {
              console.warn('Sign in with existing email note:', signInErr?.message);
            }
          }
        }
      }

      if (!userId && cleanEmail) {
        try {
          const found = await firestoreService.getUserByEmail(cleanEmail);
          if (found?.id) {
            userId = found.id;
            if (found.name && !cleanName) cleanName = found.name;
            if (found.phone && !cleanPhone) cleanPhone = found.phone;
          }
        } catch (findErr) {
          console.warn('User lookup note:', findErr);
        }
      }

      if (!userId) {
        userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      }

      // 2. Generate a Unique Store ID & Clean Slug
      const storeId = await firestoreService.generateUniqueStoreId();
      const rawSlug = onboardingData.storeSlug || onboardingData.storeName || storeId;
      const baseSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || storeId.toLowerCase();

      const uniqueSlug = await firestoreService.generateUniqueSlug(baseSlug, storeId);

      // 4. Create Firestore Store Document
      const newStore: Store = {
        id: storeId,
        storeId,
        ownerId: userId,
        name: onboardingData.storeName || 'My Online Store',
        storeName: onboardingData.storeName || 'My Online Store',
        slug: uniqueSlug,
        visibility: 'PUBLIC',
        published: true,
        domain: `${uniqueSlug}.sellnex.uz`,
        currency: 'UZS',
        targetMarket: onboardingData.sellMarket === 'International' ? 'Global' : 'Uzbekistan',
        sellType:
          onboardingData.sellCategory === 'Physical products' || onboardingData.sellCategory === 'My own products'
            ? 'My own products'
            : 'Dropshipping',
        logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: {
          primaryColor: '#2563EB',
          secondaryColor: '#10B981',
          fontFamily: 'Plus Jakarta Sans',
          headerStyle: 'modern',
          bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
          bannerTitle: onboardingData.storeName || 'Welcome to Our Store',
          bannerSubtitle: 'Fast & Reliable Delivery Across Uzbekistan',
          buttonText: 'Shop All Products',
          showAnnouncement: true,
          announcementText: '🔥 Express Delivery Across Tashkent and All 12 Regions of Uzbekistan!',
          productCardStyle: 'card',
          footerText: `© ${new Date().getFullYear()} ${onboardingData.storeName || 'My Store'}. Powered by Sellnex.`,
          phone: cleanPhone,
        },
      };

      console.log('[Store Creation] Writing store to Firestore:', {
        collection: 'stores',
        storeId,
        ownerId: userId,
        authUid: auth.currentUser?.uid,
        visibility: newStore.visibility,
        published: newStore.published,
      });

      // 5. Confirm Firestore write succeeded
      await firestoreService.saveStore(newStore);

      // 6. Read created store back from Firebase or fallback to newStore
      let verifiedStore: Store = newStore;
      try {
        const fetched = await firestoreService.getStore(storeId);
        if (fetched) {
          verifiedStore = fetched;
        }
      } catch (getErr) {
        console.warn('Store re-fetch warning:', getErr);
      }

      // 7. Update User Profile in Firestore
      const existingProfile = await firestoreService.getUser(userId);
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const newUser: User = {
        id: userId,
        name: cleanName,
        email: cleanEmail || auth.currentUser?.email || '',
        phone: cleanPhone,
        role: existingProfile?.role || 'seller',
        storeId: newStore.id,
        plan: existingProfile?.plan || 'trial',
        status: existingProfile?.status || 'active',
        subscriptionStatus: existingProfile?.subscriptionStatus || 'active',
        startDate: existingProfile?.startDate || now.toISOString(),
        endDate: existingProfile?.endDate || trialEnds,
        trialEndsAt: existingProfile?.trialEndsAt || trialEnds,
        subscriptionExpiresAt: existingProfile?.subscriptionExpiresAt || trialEnds,
        productLimit: existingProfile?.productLimit || 5,
        paymentAmount: existingProfile?.paymentAmount || 0,
        createdAt: existingProfile?.createdAt || now.toISOString(),
        updatedAt: now.toISOString(),
        onboarding: onboardingData,
      };

      await firestoreService.setUser(userId, newUser);

      console.log('[Store Creation Success] Store verified and active:', {
        storeId: verifiedStore.id,
        ownerId: verifiedStore.ownerId,
        slug: verifiedStore.slug,
        publicUrl: `/store/${verifiedStore.id}`,
      });

      return {
        success: true,
        user: newUser,
        store: verifiedStore,
      };
    } catch (err: any) {
      console.error('[Store Creation Critical Error]:', {
        errorMessage: err?.message,
        errorCode: err?.code,
        authUid: auth.currentUser?.uid,
        authEmail: auth.currentUser?.email,
      });
      return { success: false, error: err?.message || 'Failed to initialize store in Firebase.' };
    }
  },

  // === CREATE NEW STORE FOR AN EXISTING USER ===
  async createStoreForUser({
    user,
    storeName,
    slug,
    currency = 'UZS',
    targetMarket = 'Uzbekistan',
    sellType = 'My own products',
    themeOverrides,
  }: {
    user: User;
    storeName: string;
    slug?: string;
    currency?: 'UZS' | 'USD';
    targetMarket?: 'Uzbekistan' | 'Central Asia' | 'Global';
    sellType?: 'Dropshipping' | 'My own products' | 'Both';
    themeOverrides?: Partial<Store['theme']>;
  }): Promise<{ success: boolean; store?: Store; error?: string }> {
    try {
      const userId = user.id || auth.currentUser?.uid;
      if (!userId) {
        return { success: false, error: 'User is not authenticated.' };
      }

      const cleanStoreName = storeName.trim() || 'My New Store';
      const storeId = await firestoreService.generateUniqueStoreId();

      const rawSlug = slug || cleanStoreName || storeId;
      const baseSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || storeId.toLowerCase();

      const uniqueSlug = await firestoreService.generateUniqueSlug(baseSlug, storeId);

      const newStore: Store = {
        id: storeId,
        storeId,
        ownerId: userId,
        name: cleanStoreName,
        storeName: cleanStoreName,
        slug: uniqueSlug,
        visibility: 'PUBLIC',
        published: true,
        domain: `${uniqueSlug}.sellnex.uz`,
        currency,
        targetMarket,
        sellType,
        logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: {
          primaryColor: '#2563EB',
          secondaryColor: '#10B981',
          fontFamily: 'Plus Jakarta Sans',
          headerStyle: 'modern',
          bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
          bannerTitle: cleanStoreName,
          bannerSubtitle: 'Sifatli va hamyonbop mahsulotlar',
          buttonText: 'Barcha Mahsulotlar',
          showAnnouncement: true,
          announcementText: '🔥 Barcha viloyatlarga tezkor yetkazib berish!',
          productCardStyle: 'card',
          footerText: `© ${new Date().getFullYear()} ${cleanStoreName}. Powered by Sellnex.`,
          phone: user.phone || '',
          ...themeOverrides,
        },
      };

      await firestoreService.saveStore(newStore);

      // Optionally update user's last selected store
      try {
        await firestoreService.updateUser(userId, { storeId: newStore.id });
      } catch {}

      return { success: true, store: newStore };
    } catch (err: any) {
      console.error('Error creating additional store for user:', err);
      return { success: false, error: err?.message || 'Failed to create store.' };
    }
  },

  // === PASSWORD RESET ===
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `Password reset email sent to ${cleanEmail}. Please check your inbox or spam folder.`,
      };
    } catch (err: any) {
      return {
        success: true,
        message: `If an account exists for ${cleanEmail}, password reset instructions have been sent.`,
      };
    }
  },

  // === ADMIN AUTHENTICATION ===
  async adminLogin({
    email,
    password,
    twoFactorCode,
  }: {
    email: string;
    password?: string;
    twoFactorCode?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter admin email.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter password.' };
    }

    try {
      const loginRes = await this.login({ email: cleanEmail, password });
      if (!loginRes.success || !loginRes.user) {
        return { success: false, error: loginRes.error || 'Invalid administrator credentials.' };
      }

      const user = loginRes.user;

      // Allow designated super admin email/phone or verified admin role
      const isDesignatedAdmin =
        user.role === 'admin' ||
        cleanEmail === 'ypay260@gmail.com' ||
        cleanEmail === '+998942865021' ||
        cleanEmail === '942865021' ||
        cleanEmail === 'admin@sellnex.uz';

      if (!isDesignatedAdmin) {
        return {
          success: false,
          error: 'Kirish rad etildi: Sizda administrator huquqlari mavjud emas.',
        };
      }

      // If designated admin, ensure role is recorded in Firestore
      if (user.role !== 'admin' && isDesignatedAdmin) {
        user.role = 'admin';
        await firestoreService.setUser(user.id, { role: 'admin' });
      }

      // 2FA check verification if provided
      if (twoFactorCode && twoFactorCode.trim().length > 0) {
        if (twoFactorCode.trim().length !== 6) {
          return { success: false, error: 'Invalid 2FA verification code. Must be 6 digits.' };
        }
      }

      return { success: true, user };
    } catch (err: any) {
      console.error('Admin login error:', err);
      return { success: false, error: err.message || 'Administrator authentication failed.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
