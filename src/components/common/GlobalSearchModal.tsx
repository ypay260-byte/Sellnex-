import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Package, ShoppingBag, Users, Store as StoreIcon, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, orders, customers, store, navigateTo, formatMoney } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredProducts = q
    ? products.filter((p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : products.slice(0, 3);

  const filteredOrders = q
    ? orders.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q))
    : orders.slice(0, 3);

  const filteredCustomers = q
    ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q)))
    : customers.slice(0, 2);

  const handleSelect = (route: string, params?: Record<string, string>) => {
    setIsSearchOpen(false);
    setQuery('');
    navigateTo(route, params);
  };

  return (
    <div id="global-search-modal" className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="global-search-input"
            autoFocus
            type="text"
            placeholder="Search products, orders, customers, SKUs, or phone numbers... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-base text-slate-800 placeholder-slate-400 bg-transparent border-none outline-hidden"
          />
          {query && (
            <button
              id="clear-search-query"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-mono">ESC</span>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Quick Stores */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Stores</p>
            <button
              id="search-result-store"
              onClick={() => handleSelect('store-builder')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <StoreIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{store.name}</p>
                  <p className="text-xs text-slate-500">{store.domain} • {store.targetMarket}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
            </button>
          </div>

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Products ({filteredProducts.length})</p>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    id={`search-prod-${p.id}`}
                    onClick={() => handleSelect('products')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.title} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-slate-500">
                          SKU: {p.sku} • Cost: {formatMoney(p.supplierCost)} • Price: <span className="font-semibold text-slate-700">{formatMoney(p.sellingPrice)}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +{formatMoney(p.calculatedProfit)} profit
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {filteredOrders.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Orders ({filteredOrders.length})</p>
              <div className="space-y-1">
                {filteredOrders.map((o) => (
                  <button
                    key={o.id}
                    id={`search-order-${o.id}`}
                    onClick={() => handleSelect('orders')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono text-xs font-bold">
                        #
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{o.orderNumber} • {o.customerName}</p>
                        <p className="text-xs text-slate-500">{o.customerPhone} • {o.paymentMethod} • {formatMoney(o.totalAmount)}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                      {o.orderStatus}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Customers</p>
              <div className="space-y-1">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    id={`search-cust-${c.id}`}
                    onClick={() => handleSelect('customers')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.phone} • {c.city}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{c.ordersCount} orders ({formatMoney(c.totalSpent)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length === 0 && filteredOrders.length === 0 && (
            <div className="py-10 text-center text-slate-500">
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by product name, SKU, customer name or phone number.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[11px]">⌘K</kbd>
            <span>anywhere to search</span>
          </div>
          <button
            id="footer-import-quick"
            onClick={() => handleSelect('import-product')}
            className="text-blue-600 font-medium hover:underline"
          >
            + Import Product from URL
          </button>
        </div>
      </motion.div>
    </div>
  );
};
