import React, { useRef } from 'react';
import { RestaurantOrder } from '../../types';
import { Printer, Share2, Copy, X, Check, FileText } from 'lucide-react';

interface CafeReceiptModalProps {
  order: RestaurantOrder | null;
  cafeName: string;
  isOpen: boolean;
  onClose: () => void;
  onToast?: (title: string, desc: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const CafeReceiptModal: React.FC<CafeReceiptModalProps> = ({
  order,
  cafeName,
  isOpen,
  onClose,
  onToast,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const generateTextReceipt = (): string => {
    const divider = '================================';
    const subDivider = '--------------------------------';
    let text = `${divider}\n         SELLNEX\n      ${cafeName.toUpperCase()}\n${divider}\n`;
    text += `Buyurtma raqami: #${order.orderNumber}\n`;
    text += `Sana / vaqt: ${formattedDate}\n`;
    text += `Mijoz ismi: ${order.customerName}\n`;
    text += `Telefon raqami: ${order.customerPhone}\n`;
    text += `Yetkazib berish manzili: ${order.deliveryAddress}\n`;
    if (order.deliveryNotes) {
      text += `Izoh: ${order.deliveryNotes}\n`;
    }
    text += `${subDivider}\nMahsulotlar:\n`;

    order.items.forEach((item) => {
      const lineTotal = (item.totalPrice || item.price * item.quantity).toLocaleString();
      text += `${item.name} × ${item.quantity} = ${lineTotal} so'm\n`;
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        text += `  + ${item.selectedAddons.map((a) => a.name).join(', ')}\n`;
      }
    });

    text += `${subDivider}\n`;
    text += `Jami mahsulotlar: ${order.subtotal.toLocaleString()} so'm\n`;
    text += `Yetkazib berish: ${order.deliveryFee > 0 ? `${order.deliveryFee.toLocaleString()} so'm` : 'Bepul'}\n`;
    text += `${divider}\n`;
    text += `UMUMIY SUMMA: ${order.totalAmount.toLocaleString()} so'm\n`;
    text += `To'lov turi: ${order.paymentMethod?.toUpperCase() || 'NAQD'}\n`;
    text += `${divider}\n`;
    text += `Xaridingiz uchun rahmat!\nSellnex Cafe orqali buyurtma qilingan\n`;
    return text;
  };

  const handleCopy = () => {
    const text = generateTextReceipt();
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onToast) {
      onToast('Nusxalandi', 'Chek matni muvaffaqiyatli nusxalandi', 'success');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = generateTextReceipt();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chek #${order.orderNumber} - ${cafeName}`,
          text: text,
        });
        if (onToast) {
          onToast('Ulashildi', 'Chek muvaffaqiyatli ulashildi', 'success');
        }
        return;
      } catch (err) {
        // Fallback to copy
      }
    }
    handleCopy();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="cafe-receipt-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Buyurtma Cheki</h3>
              <p className="text-[11px] text-slate-500">#{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Thermal Paper Receipt Preview */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-100/70 flex justify-center">
          <div
            ref={receiptRef}
            id="printable-receipt"
            className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 w-full max-w-[340px] font-mono text-[13px] text-slate-800 leading-relaxed print:shadow-none print:border-none print:m-0 print:p-0"
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-300">
              <p className="text-base font-black tracking-widest text-slate-900">SELLNEX</p>
              <p className="text-xs font-extrabold uppercase text-amber-800">{cafeName}</p>
              <p className="text-[11px] text-slate-500 font-sans">Rasmiy Café Buyurtma Cheki</p>
            </div>

            {/* Order meta */}
            <div className="py-3 space-y-1 text-[12px] border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyurtma:</span>
                <span className="font-bold text-slate-900">#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sana/vaqt:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mijoz:</span>
                <span className="font-semibold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telefon:</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block">Manzil:</span>
                <span className="font-medium text-slate-800 block text-[11px] leading-snug">
                  {order.deliveryAddress}
                </span>
              </div>
              {order.deliveryNotes && (
                <div className="pt-0.5">
                  <span className="text-slate-500 block">Izoh:</span>
                  <span className="italic text-[11px] text-slate-600">{order.deliveryNotes}</span>
                </div>
              )}
            </div>

            {/* Items table */}
            <div className="py-3 space-y-2 border-b-2 border-dashed border-slate-300">
              <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Mahsulotlar:</p>
              <div className="space-y-1.5">
                {order.items.map((item, idx) => {
                  const linePrice = item.totalPrice || item.price * item.quantity;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-slate-900 font-medium">
                        <span className="pr-2 leading-tight">
                          {item.name}{' '}
                          <span className="text-amber-800 font-bold">× {item.quantity}</span>
                        </span>
                        <span className="shrink-0 font-bold">{linePrice.toLocaleString()} so‘m</span>
                      </div>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <p className="text-[10px] text-slate-500 italic pl-2">
                          + {item.selectedAddons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="py-3 space-y-1.5 text-[12px] border-b-2 border-dashed border-slate-300">
              <div className="flex justify-between text-slate-600">
                <span>Jami mahsulotlar:</span>
                <span className="font-semibold">{order.subtotal.toLocaleString()} so‘m</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Yetkazib berish:</span>
                <span className="font-semibold">
                  {order.deliveryFee > 0 ? `${order.deliveryFee.toLocaleString()} so‘m` : 'Bepul'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-[15px] text-slate-950">
                <span>UMUMIY SUMMA:</span>
                <span className="text-amber-900">{order.totalAmount.toLocaleString()} so‘m</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>To‘lov turi:</span>
                <span className="font-bold uppercase text-slate-700">
                  {order.paymentMethod === 'cash'
                    ? '💵 Naqd pul'
                    : order.paymentMethod === 'click'
                    ? '🔵 Click'
                    : order.paymentMethod === 'payme'
                    ? '🟢 Payme'
                    : 'Karta'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 space-y-1 text-[11px] text-slate-500">
              <p className="font-bold text-slate-800">Xaridingiz uchun rahmat!</p>
              <p className="text-[10px]">Tizim: Sellnex Café</p>
              <div className="pt-2 flex justify-center">
                <div className="w-24 h-5 border-t border-b border-slate-300 flex items-center justify-around">
                  <div className="w-1 h-3 bg-slate-400" />
                  <div className="w-0.5 h-3 bg-slate-400" />
                  <div className="w-1.5 h-3 bg-slate-400" />
                  <div className="w-0.5 h-3 bg-slate-400" />
                  <div className="w-1 h-3 bg-slate-400" />
                  <div className="w-2 h-3 bg-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi' : 'Matnni nusxalash'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Ulashish</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
