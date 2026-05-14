import React from "react";
import { notFound } from "next/navigation";
import { getOrderDetails } from "@/actions/orders";
import { getSettings } from "@/actions/settings";
import { ThemeProvider } from "@/components/ThemeProvider";

export default async function BillPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  const orderId = params.orderId;

  const order = await getOrderDetails(orderId);
  if (!order) {
    notFound();
  }

  const settings = await getSettings();
  const cgstRate = settings?.cgstRate ?? 2.5;
  const sgstRate = settings?.sgstRate ?? 2.5;
  const upiId = settings?.upiId;
  const qrCodeUrl = settings?.qrCodeUrl;
  
  // Recalculate subtotal from items to accurately display tax
  const calculatedSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cgstAmount = parseFloat((calculatedSubtotal * (cgstRate / 100)).toFixed(2));
  const sgstAmount = parseFloat((calculatedSubtotal * (sgstRate / 100)).toFixed(2));
  const gstAmount = Math.round(cgstAmount + sgstAmount);
  const grandTotal = calculatedSubtotal + gstAmount;

  // Ensure total is correctly displayed
  const displayTotal = order.total > 0 ? order.total : grandTotal;

  // UPI deep link
  const upiUrl = upiId ? `upi://pay?pa=${upiId}&pn=Restaurant&am=${displayTotal}&cu=INR` : "#";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white flex justify-center py-10 px-4">
        <div className="w-full max-w-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          <div className="text-center mb-8 pb-6 border-b border-black/10 dark:border-white/10">
            <h1 className="uppercase tracking-[0.3em] text-lg sm:text-xl font-bold text-gold">The Obsidian Palace</h1>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50 mt-2">Digital Bill / Invoice</p>
          </div>

          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Order ID</p>
              <p className="text-sm font-bold">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Table</p>
              <p className="text-lg font-serif text-gold font-bold">{order.tableNumber}</p>
            </div>
          </div>

          {order.guestName && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Guest</p>
              <p className="text-sm font-semibold">{order.guestName}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-[10px] text-black/50 dark:text-white/50">{item.quantity} x ₹{item.price}</p>
                </div>
                <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-2 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-black/60 dark:text-white/60">Subtotal</span>
              <span>₹{calculatedSubtotal}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-black/60 dark:text-white/60">CGST ({cgstRate}%)</span>
              <span>₹{cgstAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-black/60 dark:text-white/60">SGST ({sgstRate}%)</span>
              <span>₹{sgstAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm uppercase tracking-widest font-bold">Total</span>
              <span className="text-2xl font-serif text-gold font-bold">₹{displayTotal}</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="border border-gold/30 bg-gold/5 rounded-xl p-5 text-center">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gold mb-4">Complete Payment</h3>
            
            {qrCodeUrl && (
              <div className="flex justify-center mb-4">
                <div className="bg-white p-2 rounded-xl">
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-40 h-40 object-cover" />
                </div>
              </div>
            )}
            
            {upiId ? (
              <>
                <p className="text-xs text-black/60 dark:text-white/60 mb-4">UPI: {upiId}</p>
                <a 
                  href={upiUrl}
                  className="block w-full bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all shadow-md text-center"
                >
                  Pay via UPI App
                </a>
              </>
            ) : (
              <p className="text-xs text-black/50 dark:text-white/50 italic">Please pay at the counter.</p>
            )}
          </div>
          
        </div>
      </div>
    </ThemeProvider>
  );
}
