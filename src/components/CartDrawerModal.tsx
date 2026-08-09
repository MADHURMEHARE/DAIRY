import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Clock, MapPin, Truck } from 'lucide-react';
import { CartItem, Customer } from '../types';
import { ApiClient } from '../api/client';

interface CartDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  customer: Customer;
  onOrderSuccess: (orderId: string) => void;
}

export const CartDrawerModal: React.FC<CartDrawerModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  customer,
  onOrderSuccess,
}) => {
  const [deliverySlot, setDeliverySlot] = useState<string>('Express 60-Min Delivery');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY_UPI' | 'COD'>('RAZORPAY_UPI');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 299 || cart.length === 0 ? 0 : 30;
  const totalAmount = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const orderItems = cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        quantity: c.quantity,
        unitPrice: c.product.price,
        totalPrice: c.product.price * c.quantity,
        unit: c.product.unit,
        icon: c.product.icon,
      }));

      const newOrder = await ApiClient.createEcommerceOrder({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        deliveryAddress: `${customer.address}, Amravati, Maharashtra - ${customer.pincode}`,
        items: orderItems,
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod: paymentMethod === 'RAZORPAY_UPI' ? 'RAZORPAY_UPI' : 'COD',
        paymentStatus: paymentMethod === 'RAZORPAY_UPI' ? 'PAID' : 'PENDING',
        deliverySlot,
      });

      setPlacedOrderNumber(newOrder.orderNumber);
      setOrderPlaced(true);
      onClearCart();
      setTimeout(() => {
        onOrderSuccess(newOrder.id);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-4 flex items-center justify-between border-b border-[#2D6A4F]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D8E2DC]" />
            <h2 className="font-bold text-base">Your Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#D8E2DC] hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen Overlay */}
        {orderPlaced ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-[#F7F9F7]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1B4332] flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#081C15]">Order Confirmed! 🎉</h3>
            <p className="text-sm text-[#52796F]">
              Your order <span className="font-mono font-bold text-[#081C15]">#{placedOrderNumber}</span> has been received and is being prepared fresh.
            </p>
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] w-full text-xs text-left space-y-2 shadow-2xs">
              <div className="flex justify-between">
                <span className="text-[#52796F]">Estimated Slot:</span>
                <span className="font-bold text-[#081C15]">{deliverySlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52796F]">Deliver To:</span>
                <span className="font-bold text-[#081C15] truncate max-w-[180px]">{customer.address}</span>
              </div>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
            <div className="w-20 h-20 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center text-4xl">
              🛒
            </div>
            <h3 className="text-lg font-bold text-[#081C15]">Your store cart is empty</h3>
            <p className="text-xs text-[#52796F] max-w-xs">
              Explore our fresh dairy, paneer, A2 milk, ghee, and sweets catalog to add items!
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-[#1B4332] text-white font-bold rounded-xl text-xs shadow-md"
            >
              Browse Store Products
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <span className="text-xs font-bold text-[#081C15] uppercase tracking-wider">Ordered Items</span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-xl">
                        {item.product.icon || '🥛'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-[#081C15] text-xs leading-snug">{item.product.name}</h4>
                      <p className="text-[11px] text-[#52796F]">
                        ₹{item.product.price} / {item.product.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#E5E7EB] bg-white rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-[#081C15]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[#081C15]">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-[#081C15]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold font-mono text-[#1B4332] w-12 text-right">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Slot Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#081C15] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#1B4332]" /> Select Express Delivery Slot
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'Express 60-Min Delivery', label: '⚡ Express 60-Min Delivery' },
                  { id: 'Tomorrow Morning (6:00 AM - 8:00 AM)', label: '🌅 Tomorrow Morning (06:00 AM - 08:00 AM)' },
                  { id: 'Tomorrow Evening (5:00 PM - 7:00 PM)', label: '🌆 Tomorrow Evening (05:00 PM - 07:00 PM)' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setDeliverySlot(slot.id)}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold border text-left transition-all flex items-center justify-between ${
                      deliverySlot === slot.id
                        ? 'border-[#1B4332] bg-[#D8E2DC] text-[#1B4332] shadow-2xs'
                        : 'border-[#E5E7EB] bg-white text-[#52796F] hover:bg-[#F7F9F7]'
                    }`}
                  >
                    <span>{slot.label}</span>
                    {deliverySlot === slot.id && <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Confirmation */}
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#081C15]">
                <MapPin className="w-3.5 h-3.5 text-[#1B4332]" /> Delivery Address
              </div>
              <p className="text-xs text-[#52796F] pl-5">{customer.address}, Amravati, MH</p>
            </div>

            {/* Payment Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#081C15] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1B4332]" /> Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('RAZORPAY_UPI')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    paymentMethod === 'RAZORPAY_UPI'
                      ? 'border-[#1B4332] bg-[#D8E2DC] text-[#1B4332] shadow-2xs'
                      : 'border-[#E5E7EB] bg-white text-[#52796F] hover:bg-[#F7F9F7]'
                  }`}
                >
                  💳 UPI / Razorpay Instant
                </button>
                <button
                  onClick={() => setPaymentMethod('COD')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    paymentMethod === 'COD'
                      ? 'border-[#1B4332] bg-[#D8E2DC] text-[#1B4332] shadow-2xs'
                      : 'border-[#E5E7EB] bg-white text-[#52796F] hover:bg-[#F7F9F7]'
                  }`}
                >
                  💵 Cash on Delivery
                </button>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-2 text-xs shadow-2xs">
              <div className="flex justify-between text-[#52796F]">
                <span>Items Subtotal</span>
                <span className="font-mono">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#52796F]">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  <span className="font-mono">₹{deliveryFee}</span>
                )}
              </div>
              {subtotal < 299 && subtotal > 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                  💡 Add ₹{299 - subtotal} more for FREE delivery!
                </p>
              )}
              <div className="flex justify-between font-bold text-[#081C15] text-sm border-t border-[#E5E7EB] pt-2">
                <span>Total Payable</span>
                <span className="font-mono text-[#1B4332]">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        {!orderPlaced && cart.length > 0 && (
          <div className="p-4 bg-white border-t border-[#E5E7EB]">
            <button
              onClick={handleCheckout}
              disabled={isPlacingOrder}
              className="w-full py-3.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPlacingOrder ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Confirming Order...
                </>
              ) : (
                <>
                  <span>Place Order (₹{totalAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
