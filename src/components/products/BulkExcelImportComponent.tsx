import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { BulkImportProductRow, BulkImportSummary } from '../../types';
import { firestoreService } from '../../services/firestoreService';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Edit2,
  Trash2,
  RotateCw,
  Boxes,
  ArrowRight,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BulkExcelImportComponentProps {
  onSuccess?: () => void;
}

export const BulkExcelImportComponent: React.FC<BulkExcelImportComponentProps> = ({ onSuccess }) => {
  const { store, currentUser, products, refreshData, showToast, formatMoney, navigateTo } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<BulkImportProductRow[]>([]);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<BulkImportSummary | null>(null);
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'allow'>('skip');

  // Enforce Subscription Limits
  const currentProductCount = products.length;
  const productLimit = currentUser?.productLimit || (currentUser?.plan === 'trial' ? 5 : 50);
  const remainingSlots = Math.max(0, productLimit - currentProductCount);

  // Download Sample Template (both CSV and XLSX supported)
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    const sampleData = [
      {
        'Mahsulot nomi *': 'Smartfon Redmi Note 13',
        'Tavsifi': 'Original 128GB, AMOLED ekran, 108MP kamera va 5000mAh batareya. Toshkent omboridan.',
        'Narxi (so‘m) *': 2250000,
        'Kategoriya': 'Elektronika',
        'Soni (Stock) *': 25,
        'Rasm URL manzili': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
        'Artikul (SKU)': 'REDMI-13-128',
      },
      {
        'Mahsulot nomi *': 'Simsiz Quloqchin TWS Pro 5',
        'Tavsifi': 'Shovqinni bekor qiluvchi mikrofon, 30 soatgacha zaryad saqlaydi, qulay dizayn.',
        'Narxi (so‘m) *': 185000,
        'Kategoriya': 'Aksessuarlar',
        'Soni (Stock) *': 50,
        'Rasm URL manzili': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
        'Artikul (SKU)': 'TWS-PRO-05',
      },
      {
        'Mahsulot nomi *': 'Erkaklar Smart Soati Ultra 2',
        'Tavsifi': 'Suvga chidamli IP68, yurak urishini o‘lchash, qon bosimi va sport rejimlari.',
        'Narxi (so‘m) *': 340000,
        'Kategoriya': 'Smart Gadjetlar',
        'Soni (Stock) *': 15,
        'Rasm URL manzili': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'Artikul (SKU)': 'WATCH-ULTRA-2',
      },
    ];

    if (format === 'csv') {
      const headers = ['Mahsulot nomi *', 'Tavsifi', 'Narxi (so‘m) *', 'Kategoriya', 'Soni (Stock) *', 'Rasm URL manzili', 'Artikul (SKU)'];
      const csvRows = [
        headers.join(','),
        ...sampleData.map((row) =>
          [
            `"${row['Mahsulot nomi *']}"`,
            `"${row['Tavsifi']}"`,
            row['Narxi (so‘m) *'],
            `"${row['Kategoriya']}"`,
            row['Soni (Stock) *'],
            `"${row['Rasm URL manzili']}"`,
            `"${row['Artikul (SKU)']}"`,
          ].join(',')
        ),
      ];
      // UTF-8 BOM for Excel Cyrillic/Uzbek compatibility
      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sellnex_mahsulotlar_shablon.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mahsulotlar');
      XLSX.writeFile(wb, 'sellnex_mahsulotlar_shablon.xlsx');
    }

    showToast('Shablon yuklandi', `${format.toUpperCase()} shablon fayli qurilmangizga saqlandi.`, 'success');
  };

  // Helper to extract fields from row object flexibly regardless of column naming in Uzbek, English, or Russian
  const extractRowFields = (row: any) => {
    const keys = Object.keys(row);

    const findVal = (patterns: string[]) => {
      for (const k of keys) {
        const lower = k.toLowerCase().replace(/[*_\s-]/g, '');
        if (patterns.some((p) => lower.includes(p))) {
          return row[k];
        }
      }
      return undefined;
    };

    const name = String(findVal(['nomi', 'name', 'title', 'mahsulot', 'наименование', 'товар']) || '').trim();
    const description = String(findVal(['tavsif', 'desc', 'description', 'описание', 'haqida']) || '').trim();
    const rawPrice = findVal(['narx', 'price', 'sellingprice', 'qiymat', 'цена', 'стоимость']);
    const category = String(findVal(['kategoriya', 'category', 'cat', 'категория', 'bolim', 'bo‘lim']) || 'Umumiy').trim();
    const rawStock = findVal(['soni', 'stock', 'quantity', 'qty', 'miqdor', 'количество', 'остаток']);
    const imageUrl = String(findVal(['rasm', 'image', 'photo', 'url', 'фото', 'link']) || '').trim();
    const sku = String(findVal(['sku', 'artikul', 'kod', 'артикул', 'code']) || '').trim();

    const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '0').replace(/[^0-9.]/g, '')) || 0;
    const stock = typeof rawStock === 'number' ? rawStock : parseInt(String(rawStock || '1').replace(/[^0-9]/g, ''), 10) || 1;

    return { name, description, price, category, stock, imageUrl, sku };
  };

  // Handle file upload and validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) => uploadedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      showToast('Noto‘g‘ri format', 'Iltimos, faqat .xlsx, .xls yoki .csv fayllarini yuklang.', 'error');
      return;
    }

    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setImportSummary(null);
    setIsProcessingFile(true);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet);

      if (!rawJson || rawJson.length === 0) {
        showToast('Fayl bo‘sh', 'Faylda hech qanday mahsulot ma‘lumoti topilmadi.', 'warning');
        setParsedRows([]);
        return;
      }

      // Existing store products to detect accidental duplicates (Requirement 10)
      const existingSkus = new Set(products.map((p) => (p.sku || '').toLowerCase().trim()).filter(Boolean));
      const existingTitles = new Set(products.map((p) => p.title.toLowerCase().trim()));

      const validated: BulkImportProductRow[] = rawJson.map((item: any, idx: number) => {
        const { name, description, price, category, stock, imageUrl, sku } = extractRowFields(item);
        const errors: string[] = [];

        // Validation rules (Requirement 6, 7)
        if (!name) {
          errors.push('Mahsulot nomi ko‘rsatilmagan.');
        } else if (name.length < 2) {
          errors.push('Mahsulot nomi juda qisqa (kamida 2 ta belgi).');
        }

        if (isNaN(price) || price <= 0) {
          errors.push('Narx 0 dan katta musbat son bo‘lishi kerak.');
        }

        if (isNaN(stock) || stock < 0) {
          errors.push('Mahsulot qoldig‘i (stock) manfiy bo‘lishi mumkin emas.');
        }

        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          errors.push('Rasm URL manzili to‘liq http yoki https bilan boshlanishi kerak.');
        }

        // Duplicate check
        const isDuplicate =
          (sku && existingSkus.has(sku.toLowerCase().trim())) ||
          (name && existingTitles.has(name.toLowerCase().trim()));

        return {
          rowNumber: idx + 1,
          name,
          description: description || 'Sellnex do‘konidagi sifatli mahsulot.',
          price: Math.round(price),
          category: category || 'Umumiy',
          stock: Math.max(0, Math.round(stock)),
          imageUrl,
          sku: sku || `SL-${Math.floor(1000 + Math.random() * 9000)}`,
          isValid: errors.length === 0,
          errors,
          isDuplicate: Boolean(isDuplicate),
        };
      });

      setParsedRows(validated);
      showToast('Fayl o‘qildi', `${validated.length} ta qator aniqlandi. Importdan oldin ko‘rib chiqing.`, 'info');
    } catch (err: any) {
      console.error('File parsing error:', err);
      showToast('Xatolik', 'Faylni o‘qishda xatolik yuz berdi. Fayl buzilmaganligiga ishonch hosil qiling.', 'error');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Row correction/edit
  const handleUpdateRow = (index: number, field: keyof BulkImportProductRow, value: any) => {
    setParsedRows((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      // Re-validate row
      const errors: string[] = [];
      if (!target.name.trim()) errors.push('Mahsulot nomi ko‘rsatilmagan.');
      if (Number(target.price) <= 0) errors.push('Narx 0 dan katta bo‘lishi kerak.');
      if (Number(target.stock) < 0) errors.push('Qoldiq manfiy bo‘lmasligi kerak.');

      target.isValid = errors.length === 0;
      target.errors = errors;
      updated[index] = target;
      return updated;
    });
  };

  const handleDeleteRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, idx) => idx !== index));
    if (editingRowIndex === index) setEditingRowIndex(null);
  };

  // Run the batch import
  const handleExecuteImport = async () => {
    let targetStoreId = store?.id;
    if (!targetStoreId && currentUser?.id) {
      try {
        const autoStore = await firestoreService.createDefaultStoreForUser(currentUser);
        targetStoreId = autoStore?.id;
      } catch (storeErr) {
        console.warn('Auto store creation error in bulk import:', storeErr);
      }
    }

    if (!targetStoreId || !currentUser?.id) {
      showToast('Xatolik', 'Do‘kon yoki foydalanuvchi tizimga kirmagan.', 'error');
      return;
    }

    let rowsToImport = parsedRows.filter((r) => r.isValid);

    if (duplicatePolicy === 'skip') {
      rowsToImport = rowsToImport.filter((r) => !r.isDuplicate);
    }

    if (rowsToImport.length === 0) {
      showToast('Yaroqli mahsulot yo‘q', 'Barcha qatorlarda xatolik bor yoki barchasi dublikat.', 'warning');
      return;
    }

    setIsImporting(true);
    setImportProgress(20);

    try {
      setImportProgress(50);
      const summary = await firestoreService.bulkImportProducts(
        store.id,
        currentUser.id,
        rowsToImport,
        productLimit,
        currentProductCount
      );

      setImportProgress(100);
      setImportSummary(summary);

      await refreshData();

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      showToast(
        'Import yakunlandi!',
        `${summary.importedCount} ta mahsulot muvaffaqiyatli saqlandi.`,
        'success'
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Import execution error:', err);
      showToast('Importda xatolik', err.message || 'Mahsulotlarni saqlashda xatolik yuz berdi.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Limits and Download Sample */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">Excel / CSV Mahsulot Importi</h2>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            Mahsulotlar katalogingizni bitta fayl orqali bir necha soniyada ommaviy yuklang. Narxlar, zaxira va ma‘lumotlar avtomatik tekshiriladi.
          </p>
        </div>

        {/* Download sample buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownloadTemplate('xlsx')}
            className="px-3.5 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.XLSX Shablon</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadTemplate('csv')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.CSV Shablon</span>
          </button>
        </div>
      </div>

      {/* Subscription limits notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Sizning tarifingiz: <strong className="font-extrabold">{currentUser?.plan?.toUpperCase() || 'STARTER'}</strong>. Do‘kondagi mahsulotlar: <strong>{currentProductCount}</strong> / <strong>{productLimit}</strong>. Qo‘shish mumkin bo‘lgan joy: <strong className="text-emerald-700 font-extrabold">{remainingSlots} ta</strong>.
          </span>
        </div>
        {remainingSlots <= 5 && (
          <button
            onClick={() => navigateTo('pricing')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] self-start sm:self-auto shrink-0 transition-colors"
          >
            Tarifni oshirish
          </button>
        )}
      </div>

      {/* Upload Drop Zone */}
      {!parsedRows.length && !importSummary && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-3 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 flex items-center justify-center mx-auto transition-transform shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Excel (.xlsx, .xls) yoki CSV faylni bu yerga tashlang yoki bosing
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Maksimal hajmi: 15MB gacha (500 ta mahsulotgacha bitta faylda)
            </p>
          </div>
        </div>
      )}

      {/* File Parsing Loading */}
      {isProcessingFile && (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3 animate-pulse">
          <RotateCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Fayl o‘qilmoqda va qatorlar tekshirilmoqda...</p>
        </div>
      )}

      {/* Preview Table & Validation Screen */}
      {parsedRows.length > 0 && !importSummary && (
        <div className="space-y-4">
          {/* Action and Summary Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                Fayl: <span className="text-blue-600 font-mono">{fileName}</span> ({parsedRows.length} qator)
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                ✓ {validCount} yaroqli
              </span>
              {invalidCount > 0 && (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
                  ✕ {invalidCount} xatoli
                </span>
              )}
              {duplicateCount > 0 && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                  ⚠ {duplicateCount} dublikat
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setFile(null);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                disabled={isImporting || validCount === 0}
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                {isImporting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Yuklanmoqda ({importProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{validCount} ta Mahsulotni Import Qilish</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3">Holati</th>
                    <th className="py-3 px-3 min-w-[200px]">Nomi</th>
                    <th className="py-3 px-3 min-w-[120px]">Narxi</th>
                    <th className="py-3 px-3 min-w-[110px]">Kategoriya</th>
                    <th className="py-3 px-3 w-20">Soni</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3 text-center w-24">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {parsedRows.map((row, idx) => {
                    const isEditing = editingRowIndex === idx;

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !row.isValid ? 'bg-rose-50/40' : row.isDuplicate ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                          {row.rowNumber}
                        </td>

                        {/* Status / Errors */}
                        <td className="py-2.5 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              To‘g‘ri
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                Xato
                              </span>
                              <div className="text-[10px] text-rose-700">
                                {row.errors.join(', ')}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Title */}
                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded-md"
                            />
                          ) : (
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {row.name || '—'}
                            </span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-2.5 px-3 font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.price}
                              onChange={(e) => handleUpdateRow(idx, 'price', Number(e.target.value))}
                              className="w-24 px-2 py-1 text-xs border rounded-md"
                            />
                          ) : (
                            <span>{formatMoney(row.price)}</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.category}
                              onChange={(e) => handleUpdateRow(idx, 'category', e.target.value)}
                              className="w-24 px-2 py-1 text-xs border rounded-md"
                            />
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] text-slate-600">
                              {row.category}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-2.5 px-3 font-mono text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={row.stock}
                              onChange={(e) => handleUpdateRow(idx, 'stock', Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs border rounded-md text-center"
                            />
                          ) : (
                            <span>{row.stock}</span>
                          )}
                        </td>

                        {/* SKU */}
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {row.sku}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingRowIndex(isEditing ? null : idx)}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                              title="Tahrirlash"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Final Summary Report Screen (Requirement 9) */}
      {importSummary && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Import Muvaffaqiyatli Yakunlandi!</h3>
            <p className="text-xs text-slate-500">
              Mahsulotlar sizning do‘koningiz bilan avtomatik bog‘landi va katalogga qo‘shildi.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Muvaffaqiyatli</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{importSummary.importedCount} ta</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] font-bold text-amber-700 uppercase">O‘tkazib yuborildi</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{importSummary.skippedCount} ta</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-bold text-rose-700 uppercase">Xato / Buzuq</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{importSummary.failedCount} ta</p>
            </div>
          </div>

          {importSummary.errorMessages.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Qaydlar:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                {importSummary.errorMessages.slice(0, 5).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setImportSummary(null);
                setParsedRows([]);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              Yana boshqa fayl yuklash
            </button>
            <button
              type="button"
              onClick={() => navigateTo('products')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Mahsulotlar katalogiga o‘tish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
