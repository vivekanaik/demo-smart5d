import { getSettings } from "@/actions/settings";
import { Settings as SettingsIcon, Save, Key, Wallet, Receipt } from "lucide-react";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Configure global application preferences.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Billing & Tax Settings */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
            <Receipt className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Billing & Taxes</h2>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Global GST Rate (%)
              </label>
              <select className="admin-select w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
            </div>
            <button className="w-full rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 sm:w-auto">
              Save Tax Settings
            </button>
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
            <Wallet className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Payment Details</h2>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                UPI ID (for QR Codes)
              </label>
              <input 
                type="text"
                defaultValue={settings.upiId || ""}
                placeholder="merchant@upi"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <button className="w-full rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 sm:w-auto">
              Save Payment Info
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
            <Key className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Security</h2>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Admin Access PIN / Password
              </label>
              <input 
                type="password"
                placeholder="Enter new password to change"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <button className="w-full rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 sm:w-auto">
              Update Password
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
