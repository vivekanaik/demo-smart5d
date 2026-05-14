"use client";

import React, { useState } from "react";
import { Wallet, Receipt, Save, CheckCircle2, AlertCircle, X } from "lucide-react";
import { updateGstRate, updateGstRates, updateBillingSettings, updatePassword } from "@/actions/settings";

export function AdminSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [cgstRate, setCgstRate] = useState<number>(initialSettings?.cgstRate || 0);
  const [sgstRate, setSgstRate] = useState<number>(initialSettings?.sgstRate || 0);
  const [upiId, setUpiId] = useState(initialSettings?.upiId || "");
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(initialSettings?.qrCodeUrl || null);
  const [isSavingTax, setIsSavingTax] = useState(false);
  const [isSavingBilling, setIsSavingBilling] = useState(false);

  // Custom Modal State
  const [modalMessage, setModalMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const showModal = (title: string, message: string, type: 'success' | 'error') => {
    setModalMessage({ title, message, type });
  };

  const handleTaxSubmit = async () => {
    setIsSavingTax(true);
    const totalGst = cgstRate + sgstRate;
    await updateGstRates(totalGst, cgstRate, sgstRate);
    setIsSavingTax(false);
    showModal("Success", "Tax settings updated successfully.", "success");
  };

  const handleBillingSubmit = async () => {
    setIsSavingBilling(true);
    await updateBillingSettings(upiId, qrCodeBase64);
    setIsSavingBilling(false);
    showModal("Success", "Payment Information updated successfully.", "success");
  };



  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) { // 1 MB limit
        showModal("Error", "Image is too large! Please upload an image smaller than 1MB.", "error");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Billing & Tax Settings */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50">
          <Receipt className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Billing & Taxes</h2>
        </div>
        <div className="space-y-5 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">CGST Rate (%)</label>
              <select
                value={cgstRate}
                onChange={(e) => setCgstRate(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 focus:border-yellow-500 focus:outline-none sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value={0}>0%</option>
                <option value={2.5}>2.5%</option>
                <option value={6}>6%</option>
                <option value={9}>9%</option>
                <option value={14}>14%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">SGST Rate (%)</label>
              <select
                value={sgstRate}
                onChange={(e) => setSgstRate(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 focus:border-yellow-500 focus:outline-none sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value={0}>0%</option>
                <option value={2.5}>2.5%</option>
                <option value={6}>6%</option>
                <option value={9}>9%</option>
                <option value={14}>14%</option>
              </select>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 px-3 py-2 max-w-sm">
            <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
              On a ₹1,000 bill: CGST {cgstRate}% = ₹{(1000 * cgstRate / 100).toFixed(2)}&nbsp;|&nbsp;SGST {sgstRate}% = ₹{(1000 * sgstRate / 100).toFixed(2)}&nbsp;|&nbsp;<strong>Total = ₹{(1000 * (cgstRate + sgstRate) / 100).toFixed(2)}</strong>
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">These rates apply to all orders on the Billing system. Typically CGST = SGST for intra-state sales.</p>

          <button
            onClick={handleTaxSubmit}
            disabled={isSavingTax}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-md bg-yellow-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
          >
            {isSavingTax ? "Saving..." : "Save Tax Settings"}
          </button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50">
          <Wallet className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Digital Payment Options</h2>
        </div>
        <div className="space-y-6 p-4 sm:p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Store UPI ID
            </label>
            <input 
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. merchant@upi"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Payment QR Code Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {qrCodeBase64 ? (
                <div className="w-32 h-32 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm">
                  <img src={qrCodeBase64} alt="QR Code" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-400 shrink-0">
                  <Wallet className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-xs">No QR</span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-2">Upload your store's UPI QR code. Customers will scan this to pay their digital bill.</p>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-zinc-100 border border-zinc-300 rounded-md font-semibold text-xs text-zinc-700 uppercase tracking-widest shadow-sm hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-25 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700">
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
                {qrCodeBase64 && (
                  <button 
                    onClick={() => setQrCodeBase64(null)} 
                    className="ml-2 text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={handleBillingSubmit}
            disabled={isSavingBilling}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-md bg-yellow-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
          >
            {isSavingBilling ? "Saving..." : "Save Payment Details"}
          </button>
        </div>
      </div>



      {/* Custom Modal */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              modalMessage.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
            }`}>
              {modalMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {modalMessage.title}
            </h3>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              {modalMessage.message}
            </p>
            
            <button
              onClick={() => setModalMessage(null)}
              className="w-full py-2.5 px-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
