import React, { useState } from 'react';
import { User, Store, DynamicPlan, PlanType } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Search,
  Filter,
  Shield,
  Crown,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Lock,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react';

interface AdminUsersTabProps {
  users: User[];
  stores: Store[];
  plans: DynamicPlan[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  stores,
  plans,
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'trial' | 'starter' | 'pro' | 'business' | 'premium'>('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<'all' | 'store' | 'restaurant'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Store lookup map
  const storeMap = new Map<string, Store>();
  stores.forEach((s) => {
    storeMap.set(s.ownerId, s);
    if (s.id) storeMap.set(s.id, s);
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term)) ||
      u.id.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    // Business type filter
    if (businessTypeFilter === 'restaurant' && u.businessType !== 'restaurant') return false;
    if (businessTypeFilter === 'store' && u.businessType === 'restaurant') return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return u.status === 'active';
    if (statusFilter === 'suspended') return u.status === 'suspended';
    if (statusFilter === 'trial') return u.plan === 'trial' || u.plan === 'free';
    if (statusFilter === 'starter') return u.plan === 'starter';
    if (statusFilter === 'pro') return u.plan === 'pro';
    if (statusFilter === 'business') return u.plan === 'business';
    if (statusFilter === 'premium') return u.plan === 'premium' || u.plan === 'premium_pro';
    return true;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'user',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Action performed by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Failed to record audit log:', err);
    }
  };

  // Plan change action
  const handleUpdatePlan = async (newPlan: PlanType) => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const oldPlan = selectedUser.plan;
      const productLimit =
        newPlan === 'premium' || newPlan === 'premium_pro'
          ? 110
          : newPlan === 'business'
          ? 50
          : newPlan === 'pro'
          ? 20
          : 5;
      const isSub = newPlan !== 'trial' && newPlan !== 'free';
      const durationDays = newPlan === 'starter' ? 90 : 30;
      const newExpiry = isSub ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : selectedUser.subscriptionExpiresAt;

      await firestoreService.updateUser(selectedUser.id, {
        plan: newPlan,
        status: 'active',
        subscriptionStatus: isSub ? 'active' : 'trial',
        productLimit,
        subscriptionExpiresAt: newExpiry,
      });
      await recordAudit('change_plan', selectedUser.id, { plan: oldPlan }, { plan: newPlan });
      showToast('Plan Yangilandi', `Foydalanuvchi tarifi ${newPlan.toUpperCase()} ga o'zgartirildi (Limit: ${productLimit} ta)`, 'success');
      setSelectedUser({
        ...selectedUser,
        plan: newPlan,
        status: 'active',
        productLimit,
        subscriptionExpiresAt: newExpiry,
      });
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Extend Subscription
  const handleExtendSubscription = async (days: number) => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const currentExpiry = selectedUser.subscriptionExpiresAt
        ? new Date(selectedUser.subscriptionExpiresAt).getTime()
        : Date.now();
      const newExpiry = new Date(Math.max(Date.now(), currentExpiry) + days * 24 * 60 * 60 * 1000).toISOString();

      await firestoreService.updateUser(selectedUser.id, {
        subscriptionExpiresAt: newExpiry,
        status: 'active',
      });

      await recordAudit('extend_subscription', selectedUser.id, { expiresAt: selectedUser.subscriptionExpiresAt }, { expiresAt: newExpiry, addedDays: days });
      showToast('Subscription Extended', `Added +${days} days to ${selectedUser.email}`, 'success');
      setSelectedUser({ ...selectedUser, subscriptionExpiresAt: newExpiry, status: 'active' });
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Extend Trial
  const handleExtendTrial = async (days: number) => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const currentTrialEnd = selectedUser.trialEndsAt
        ? new Date(selectedUser.trialEndsAt).getTime()
        : Date.now();
      const newTrialEnd = new Date(Math.max(Date.now(), currentTrialEnd) + days * 24 * 60 * 60 * 1000).toISOString();

      await firestoreService.updateUser(selectedUser.id, {
        trialEndsAt: newTrialEnd,
        plan: 'trial',
        status: 'active',
      });

      await recordAudit('extend_trial', selectedUser.id, { trialEndsAt: selectedUser.trialEndsAt }, { trialEndsAt: newTrialEnd, addedDays: days });
      showToast('Trial Extended', `Added +${days} days trial to ${selectedUser.email}`, 'success');
      setSelectedUser({ ...selectedUser, trialEndsAt: newTrialEnd, plan: 'trial', status: 'active' });
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Suspend / Unban
  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const nextStatus = selectedUser.status === 'suspended' ? 'active' : 'suspended';
      await firestoreService.updateUser(selectedUser.id, { status: nextStatus });
      await recordAudit('toggle_user_status', selectedUser.id, { status: selectedUser.status }, { status: nextStatus });
      showToast('Status Changed', `User status is now ${nextStatus}`, 'success');
      setSelectedUser({ ...selectedUser, status: nextStatus });
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch Business Type (Store vs Restaurant)
  const handleUpdateBusinessType = async (newType: 'store' | 'restaurant') => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      await firestoreService.updateUser(selectedUser.id, { businessType: newType });
      await recordAudit('change_business_type', selectedUser.id, { businessType: selectedUser.businessType }, { businessType: newType });
      showToast('Biznes turi o‘zgartirildi', `Foydalanuvchi rejimi: ${newType === 'restaurant' ? 'Restoran / Kafe' : 'Online do‘kon'}`, 'success');
      setSelectedUser({ ...selectedUser, businessType: newType });
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add Admin Note
  const handleAddAdminNote = async () => {
    if (!selectedUser || !adminNoteText.trim()) return;
    setIsProcessing(true);
    try {
      const existingNotes = (selectedUser as any).adminNotes || [];
      const updatedNotes = [
        ...existingNotes,
        {
          id: `note_${Date.now()}`,
          author: adminEmail,
          text: adminNoteText.trim(),
          createdAt: new Date().toISOString(),
        },
      ];

      await firestoreService.updateUser(selectedUser.id, { adminNotes: updatedNotes } as any);
      await recordAudit('add_admin_note', selectedUser.id, null, { note: adminNoteText.trim() });
      showToast('Admin Note Saved', 'Note appended to user audit record', 'success');
      setSelectedUser({ ...selectedUser, adminNotes: updatedNotes } as any);
      setAdminNoteText('');
      await onRefresh();
    } catch (err: any) {
      showToast('Failed to save note', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      await firestoreService.deleteUser(selectedUser.id);
      await recordAudit('delete_user', selectedUser.id, { email: selectedUser.email }, null);
      showToast('User Deleted', `Account ${selectedUser.email} permanently removed`, 'info');
      setSelectedUser(null);
      setShowDeleteConfirm(false);
      await onRefresh();
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ism, email, telefon yoki UID bo'yicha qidiruv..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {/* Business Type Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setBusinessTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                businessTypeFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => setBusinessTypeFilter('store')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                businessTypeFilter === 'store'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛍️ Do‘kon
            </button>
            <button
              onClick={() => setBusinessTypeFilter('restaurant')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                businessTypeFilter === 'restaurant'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🍽️ Restoran
            </button>
          </div>

          {(
            [
              { id: 'all', label: 'Barchasi' },
              { id: 'active', label: 'Faol' },
              { id: 'suspended', label: 'Bloklangan' },
              { id: 'trial', label: 'Trial' },
              { id: 'starter', label: 'Starter' },
              { id: 'pro', label: 'PRO' },
              { id: 'business', label: 'Business' },
              { id: 'premium', label: 'Premium' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => onRefresh()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-auto cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Foydalanuvchi & UID</th>
                <th className="py-3.5 px-4 font-semibold">Biznes Turi</th>
                <th className="py-3.5 px-4 font-semibold">Aloqa</th>
                <th className="py-3.5 px-4 font-semibold">Do'koni / Restorani</th>
                <th className="py-3.5 px-4 font-semibold">Tarif & Holat</th>
                <th className="py-3.5 px-4 font-semibold">Ro'yxatdan o'tgan</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Filtr bo'yicha foydalanuvchi topilmadi.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userStore = storeMap.get(user.id) || (user.storeId ? storeMap.get(user.storeId) : undefined);
                  const isRestaurant = user.businessType === 'restaurant';
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span>{user.name || 'Foydalanuvchi'}</span>
                              {user.role === 'admin' && (
                                <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-mono uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">{user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isRestaurant ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            🍽️ Restoran
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                            🛍️ Do‘kon
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="text-slate-200 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="text-slate-400 text-[11px] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {userStore ? (
                          <div className="text-slate-200 font-medium truncate max-w-[140px]">
                            {userStore.name}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            {isRestaurant ? 'Restoran menyusi' : 'Do\'kon ochilmagan'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              user.plan === 'premium' || user.plan === 'premium_pro'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : user.plan === 'business'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : user.plan === 'pro'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : user.plan === 'starter'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {user.plan === 'trial' ? 'FREE TRIAL' : (user.plan?.toUpperCase() || 'FREE TRIAL')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.status === 'suspended'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {user.status === 'suspended' ? 'Bloklangan' : 'Faol'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Boshqarish</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-bold flex items-center justify-center text-sm">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedUser.name || 'Foydalanuvchi'}</span>
                    {selectedUser.role === 'admin' && (
                      <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono">
                        ADMIN
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowDeleteConfirm(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Manzil</span>
                <span className="text-white font-medium break-all">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Telefon</span>
                <span className="text-white font-medium">{selectedUser.phone || 'Kiritilmagan'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Joriy Tarifi</span>
                <span className="text-rose-400 font-bold uppercase">{selectedUser.plan || 'Free'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Hisob Holati</span>
                <span className={`font-bold uppercase ${selectedUser.status === 'suspended' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedUser.status === 'suspended' ? 'Bloklangan' : 'Faol'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Qo'shilgan Sana</span>
                <span className="text-white font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Obuna Tugash Sanasi</span>
                <span className="text-amber-400 font-medium">
                  {selectedUser.subscriptionExpiresAt ? new Date(selectedUser.subscriptionExpiresAt).toLocaleDateString() : 'Faol obuna yo\'q'}
                </span>
              </div>
            </div>

            {/* Action Group 1: Plan Modifier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Tarifni o'zgartirish</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['trial', 'starter', 'pro', 'business', 'premium'] as const).map((p) => (
                  <button
                    key={p}
                    disabled={isProcessing}
                    onClick={() => handleUpdatePlan(p)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer truncate ${
                      selectedUser.plan === p
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {p === 'trial'
                      ? 'TRIAL (5)'
                      : p === 'starter'
                      ? 'STARTER (5/3oy)'
                      : p === 'pro'
                      ? 'PRO (20/1oy)'
                      : p === 'business'
                      ? 'BIZ (50/1oy)'
                      : 'PREMIUM (110)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Group: Business Type Modifier (Store vs Restaurant) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏪 Biznes Turi (Rejim)</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedUser.businessType === 'restaurant' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-blue-950 text-blue-300 border border-blue-800'}`}>
                  {selectedUser.businessType === 'restaurant' ? '🍽️ Restoran / Kafe' : '🛍️ Online do‘kon'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleUpdateBusinessType('store')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    selectedUser.businessType !== 'restaurant'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🛍️ Online do‘kon</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleUpdateBusinessType('restaurant')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    selectedUser.businessType === 'restaurant'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🍽️ Restoran / Kafe</span>
                </button>
              </div>
            </div>

            {/* Action Group 2: Extend Subscription & Trial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Obuna muddatini uzaytirish</span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleExtendSubscription(30)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    +30 Kun
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleExtendSubscription(90)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    +90 Kun
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleExtendSubscription(365)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    +1 Yil
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bepul sinovni uzaytirish</span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleExtendTrial(3)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    +3 Kun
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleExtendTrial(7)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    +7 Kun
                  </button>
                </div>
              </div>
            </div>

            {/* Action Group 3: Admin Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin xavfsizlik qaydlari</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  placeholder="Tekshiruv tafsilotlari yoki maxsus eslatma yozing..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-500"
                />
                <button
                  disabled={isProcessing || !adminNoteText.trim()}
                  onClick={handleAddAdminNote}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  Saqlash
                </button>
              </div>

              {/* Display existing notes if any */}
              {((selectedUser as any).adminNotes || []).length > 0 && (
                <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
                  {((selectedUser as any).adminNotes || []).map((n: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>{n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <div>{n.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Group 4: Account Security & Deletion */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                disabled={isProcessing}
                onClick={handleToggleSuspend}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedUser.status === 'suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {selectedUser.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                <span>{selectedUser.status === 'suspended' ? 'Blokdan chiqarish' : 'Hisobni bloklash'}</span>
              </button>

              {!showDeleteConfirm ? (
                <button
                  disabled={isProcessing}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Foydalanuvchini o'chirish</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-bold">Rostdan ham o'chirilsinmi?</span>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Ha, O'chirish
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
