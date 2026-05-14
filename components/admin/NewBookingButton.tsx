"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewBookingModal } from "./NewBookingModal";

type Table = {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
};

export function NewBookingButton({ tables }: { tables: Table[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-yellow-500 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        New Booking
      </button>

      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tables={tables}
      />
    </>
  );
}
