'use client';

import { useState } from 'react';

export default function WaiterRequestForm() {
  const [table, setTable] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const requestWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: table }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000); // Reset after 3 seconds
        setTable('');
      }
    } catch (error) {
      console.error("Failed to request waiter", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={requestWaiter} className="flex flex-col gap-4 p-4 border rounded-lg bg-white max-w-sm">
      <h3 className="text-lg font-semibold text-gray-800">Need Assistance?</h3>
      <input
        type="number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        placeholder="Enter Table Number"
        required
        className="border p-2 rounded-md"
      />
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? 'Sending...' : success ? 'Staff Notified!' : 'Request Waiter'}
      </button>
    </form>
  );
}