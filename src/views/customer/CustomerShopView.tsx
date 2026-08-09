import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Star, Plus, Minus, Check, Flame, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { Product, CartItem, Customer } from '../../types';
import { ApiClient } from '../../api/client';
import { CartDrawerModal } from '../../components/CartDrawerModal';

interface CustomerShopViewProps {
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onNavigateToOrders: () => void;
}

export const CustomerShopView: React.FC<CustomerShopViewProps> = ({
  cart,
  onAddToCart,
  onUpdateQuantity,
  onClearCart,
  onNavigateToOrders,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'RATING'>('POPULAR');

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      const prods = await ApiClient.getProducts();
      setProducts(prods);

      const custData = await ApiClient.getCustomerDetails('cust_rahul_01');
      setCustomer(custData.customer);
    } catch (e) {
      console.error('Error loading shop products:', e);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Items', icon: '🛒' },
    { id: 'MILK', label: 'Fresh Milk', icon: '🥛' },
    { id: 'CURD_PANEER', label: 'Curd & Paneer', icon: '🧀' },
    { id: 'GHEE_BUTTER', label: 'Ghee & Butter', icon: '🧈' },
    { id: 'SWEETS_DESSERTS', label: 'Sweets & Desserts', icon: '🍨' },
    { id: 'BEVERAGES', label: 'Flavored Milk', icon: '🍼' },
    { id: 'BAKERY_SNACKS', label: 'Bakery', icon: '🍞' },
  ];

  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return a.price - b.price;
      if (sortBy === 'PRICE_HIGH') return b.price - a.price;
      if (sortBy === 'RATING') return (b.rating || 0) - (a.rating || 0);
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getItemQuantityInCart = (productId: string) => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Banner */}
      <div className="bg-[#1B4332] text-white p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 text-8xl opacity-10 pointer-events-none">
          🛍️
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2D6A4F] text-[#D8E2DC] text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Express 60-Min Farm Fresh Delivery
        </div>
        <h1 className="text-xl sm:text-2xl font-bold leading-tight">
          Dairy & Artisanal Store 🥛
        </h1>
        <p className="text-xs text-[#D8E2DC]">
          Order unadulterated milk, Bilona Ghee, fresh Malai Paneer, Shrikhand & sweets directly from Anandwan Milk Dairy.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#52796F]" />
          <input
            type="text"
            placeholder="Search Paneer, Ghee, A2 Milk, Shrikhand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#52796F]" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#081C15] px-3 py-2.5 focus:outline-none shadow-2xs"
          >
            <option value="POPULAR">Most Popular</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
            <option value="RATING">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              selectedCategory === cat.id
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                : 'bg-white text-[#52796F] border-[#E5E7EB] hover:bg-[#F7F9F7]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.map((product) => {
          const qtyInCart = getItemQuantityInCart(product.id);
          const discountPercent = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : null;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow relative"
            >
              {/* Product Badge */}
              {product.badge && (
                <span className="absolute top-2.5 left-2.5 z-10 bg-[#1B4332] text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                  {product.badge}
                </span>
              )}

              {/* Product Image */}
              <div className="relative h-36 bg-[#F7F9F7] overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {product.icon || '🥛'}
                  </div>
                )}
                {product.rating && (
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-[#081C15] font-bold text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs border border-[#E5E7EB]">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{product.rating}</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-[#081C15] text-sm leading-snug">{product.name}</h3>
                    <span className="text-[10px] font-bold text-[#52796F] bg-[#F7F9F7] px-1.5 py-0.5 rounded border border-[#E5E7EB] whitespace-nowrap">
                      {product.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#52796F] line-clamp-2 mt-1 leading-normal">
                    {product.description}
                  </p>
                </div>

                {/* Price and Cart Action */}
                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono font-bold text-[#1B4332] text-base">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="font-mono text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    {discountPercent && (
                      <span className="text-[10px] font-bold text-emerald-700">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {qtyInCart > 0 ? (
                    <div className="flex items-center border border-[#1B4332] bg-[#F7F9F7] rounded-xl p-0.5 shadow-2xs">
                      <button
                        onClick={() => onUpdateQuantity(product.id, qtyInCart - 1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center text-[#1B4332] font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-[#081C15] font-mono">{qtyInCart}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, qtyInCart + 1)}
                        className="w-7 h-7 rounded-lg bg-[#1B4332] hover:bg-[#143326] flex items-center justify-center text-white font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="px-3.5 py-2 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Indicator Bar */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-40">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full bg-[#1B4332] hover:bg-[#143326] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-[#2D6A4F] animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-white font-bold text-sm relative">
                🛒
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartTotalItems}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-[#D8E2DC] uppercase font-bold tracking-wider block">Cart Total</span>
                <span className="font-bold font-mono text-base text-white">₹{cartSubtotal}</span>
              </div>
            </div>

            <span className="text-xs font-bold bg-[#D8E2DC] text-[#1B4332] px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-2xs">
              Checkout Cart →
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {customer && (
        <CartDrawerModal
          isOpen={showCartDrawer}
          onClose={() => setShowCartDrawer(false)}
          cart={cart}
          onUpdateQuantity={onUpdateQuantity}
          onClearCart={onClearCart}
          customer={customer}
          onOrderSuccess={(orderId) => {
            setShowCartDrawer(false);
            onNavigateToOrders();
          }}
        />
      )}
    </div>
  );
};
