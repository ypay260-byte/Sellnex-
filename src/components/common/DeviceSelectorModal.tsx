import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { paynetService } from '../../services/paynetService';
import { Smartphone, Laptop, Check, X, Sparkles, ArrowRight } from 'lucide-react';

interface DeviceSelectorModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const DeviceSelectorModal: React.FC<DeviceSelectorModalProps> = ({ forceOpen, onClose }) => {
  const { currentUser, setCurrentUser, store, showToast, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<'phone' | 'computer'>('phone');

  // Manual trigger from TopBar or other components
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
      if (forceOpen && currentUser?.deviceType) {
        setSelectedType(currentUser.deviceType === 'computer' ? 'computer' : 'phone');
      }
    }
  }, [forceOpen, currentUser?.deviceType]);

  // Initial check on mount: check if device preference is already saved in currentUser, backend, or storage
  useEffect(() => {
    // If modal is explicitly forced open, do not auto-dismiss
    if (forceOpen) return;

    const checkDevicePreference = async () => {
      const userId = currentUser?.id || 'guest';
      const storedKey = `sellnex_user_device_${userId}`;
      const cachedDevice = localStorage.getItem(storedKey);

      // 1. If currentUser already has deviceType in user state
      if (currentUser?.deviceType) {
        setSelectedType(currentUser.deviceType === 'computer' ? 'computer' : 'phone');
        return;
      }

      // 2. If cached in local storage for this user
      if (cachedDevice === 'phone' || cachedDevice === 'computer') {
        setSelectedType(cachedDevice);
        if (currentUser && !currentUser.deviceType) {
          setCurrentUser({ ...currentUser, deviceType: cachedDevice });
        }
        return;
      }

      // 3. Check backend API for saved preference
      if (currentUser?.id) {
        try {
          const backendDevice = await paynetService.getDevicePreference(currentUser.id);
          if (backendDevice === 'phone' || backendDevice === 'computer') {
            setSelectedType(backendDevice);
            localStorage.setItem(storedKey, backendDevice);
            setCurrentUser({ ...currentUser, deviceType: backendDevice });
            return;
          }
        } catch {
          // fallback
        }
      }

      // 4. If never selected before, auto-detect default and open modal once
      const isMobile =
        typeof window !== 'undefined' &&
        (window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

      const detected = isMobile ? 'phone' : 'computer';
      setSelectedType(detected);

      // Only open if user has never selected a device type
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);

      return () => clearTimeout(timer);
    };

    checkDevicePreference();
  }, [currentUser?.id, currentUser?.deviceType, forceOpen]);

  const handleContinue = async () => {
    setIsSaving(true);
    const userId = currentUser?.id || 'guest';
    const storeId = store?.id || (currentUser?.storeId || '');
    const storedKey = `sellnex_user_device_${userId}`;

    try {
      // 1. Save to Backend API (P1 requirement)
      if (currentUser?.id) {
        await paynetService.saveDevicePreference(currentUser.id, selectedType);
      }

      // 2. Save to Firebase Firestore User profile
      if (currentUser?.id) {
        await firestoreService.updateUser(currentUser.id, {
          deviceType: selectedType,
        });
      }

      // 3. Save Device Log in Firestore
      await firestoreService.saveDeviceLog({
        deviceType: selectedType === 'phone' ? 'Telefon' : 'Kompyuter',
        date: new Date().toISOString().split('T')[0],
        userId,
        storeId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      });

      // 4. Update local state & permanent cache
      localStorage.setItem(storedKey, selectedType);
      localStorage.setItem('sellnex_device_mode', selectedType);

      if (currentUser) {
        setCurrentUser({ ...currentUser, deviceType: selectedType });
      }

      showToast(
        'Qurilma saqlandi',
        `Sizning qurilmangiz: ${selectedType === 'phone' ? '📱 Telefon' : '💻 Kompyuter'} sifatida saqlandi va keyingi kirishlarda avtomatik qo‘llanadi`,
        'success'
      );
    } catch (err) {
      console.warn('Error recording device:', err);
    } finally {
      setIsSaving(false);
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="device-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-modal-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white text-center relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('device_modal_badge', 'QURILMA SOZLAMASI')}</span>
          </div>

          <h3 id="device-modal-title" className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug">
            {t('device_modal_title', 'Qaysi qurilmadan foydalanmoqdasiz?')}
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xs mx-auto">
            {t('device_modal_subtitle', 'Bir marta tanlang, tizim ushbu sozlamani profilingizda eslab qoladi')}
          </p>
        </div>

        {/* Device Options */}
        <div className="p-6 space-y-3 bg-slate-50/50">
          {/* Phone Option */}
          <button
            type="button"
            id="btn-select-phone"
            disabled={isSaving}
            onClick={() => setSelectedType('phone')}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group text-left cursor-pointer ${
              selectedType === 'phone'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/10'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  selectedType === 'phone'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}
              >
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    {t('device_phone_title', '📱 Telefon')}
                  </span>
                  {selectedType === 'phone' && (
                    <span className="text-[10px] uppercase font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {t('device_selected_badge', 'Tanlandi')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {t('device_phone_desc', 'Mobil brauzer yoki ilova orqali')}
                </span>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedType === 'phone'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 group-hover:border-blue-400'
              }`}
            >
              {selectedType === 'phone' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          {/* Computer / Desktop Option */}
          <button
            type="button"
            id="btn-select-computer"
            disabled={isSaving}
            onClick={() => setSelectedType('computer')}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group text-left cursor-pointer ${
              selectedType === 'computer'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/10'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  selectedType === 'computer'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}
              >
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    {t('device_computer_title', '💻 Kompyuter')}
                  </span>
                  {selectedType === 'computer' && (
                    <span className="text-[10px] uppercase font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {t('device_selected_badge', 'Tanlandi')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {t('device_computer_desc', 'Noutbuk yoki ish stoli kompyuteri')}
                </span>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedType === 'computer'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 group-hover:border-blue-400'
              }`}
            >
              {selectedType === 'computer' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              id="btn-device-continue"
              type="button"
              disabled={isSaving}
              onClick={handleContinue}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('device_continue_btn', 'DA’VOM ETISH')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            {t('device_modal_footer', 'Tanlovingiz profilingizda saqlanadi. Istalgan vaqt yuqori paneldagi tugma orqali o‘zgartirishingiz mumkin.')}
          </p>
        </div>
      </div>
    </div>
  );
};
