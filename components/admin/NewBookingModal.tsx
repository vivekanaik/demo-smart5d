"use client";

import { useState } from "react";
import { X, Calendar as CalendarIcon, Clock, Users, User, Phone, Check } from "lucide-react";
import { createReservation } from "@/actions/tables";
import { useAdminLanguage } from "./AdminLanguageProvider";

type Table = {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
};

export function NewBookingModal({
  isOpen,
  onClose,
  tables,
}: {
  isOpen: boolean;
  onClose: () => void;
  tables: Table[];
}) {
  const { t } = useAdminLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    tableId: tables.length > 0 ? tables[0].id : 0,
    guestsCount: 2,
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const reservationTime = new Date(`${formData.date}T${formData.time}:00`);
      
      await createReservation({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        tableId: Number(formData.tableId),
        reservationTime,
        guestsCount: Number(formData.guestsCount),
      });
      
      onClose();
      // Reset form
      setFormData({
        ...formData,
        customerName: "",
        customerPhone: "",
      });
    } catch (error) {
      console.error("Failed to create reservation", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/60">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("New Booking")}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("Customer Name")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("Phone Number")}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("Date")}
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("Time")}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("Guests")}
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={isNaN(formData.guestsCount) ? "" : formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value, 10) })}
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("Table")}
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      Table {t.tableNumber} ({t.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-400 disabled:opacity-70"
            >
              {isSubmitting ? (
                t("Saving...")
              ) : (
                <>
                  <Check className="h-4 w-4" /> {t("Confirm Booking")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
