import React, { useState, useEffect } from 'react';
import { Plus, Package, Edit, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Product } from '../../types';
import { ApiClient } from '../../api/client';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'MILK' as 'MILK' | 'DAIRY_PRODUCT',
    price: '60',
    unit: 'L' as 'L' | 'Kg' | 'Pack',
    stock: '200',
    description: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const list = await ApiClient.getProducts();
      setProducts(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    try {
      await ApiClient.createProduct({
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        unit: formData.unit,
        stock: Number(formData.stock),
        description: formData.description
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        category: 'MILK',
        price: '60',
        unit: 'L',
        stock: '200',
        description: ''
      });
      loadProducts();
    } catch (e) {
      alert('Failed to add product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Products Catalog</h1>
          <p className="text-xs text-[#52796F] mt-1">Manage dairy items, prices per Litre/Kg, and available stock.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 bg-[#F7F9F7] rounded-xl">{prod.icon || '🥛'}</span>
                  <div>
                    <h3 className="font-bold text-[#081C15] text-base">{prod.name}</h3>
                    <span className="text-[11px] font-semibold text-[#52796F] uppercase tracking-wider">
                      {prod.category}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-lg text-[#081C15] font-mono">
                  ₹{prod.price} <span className="text-xs font-medium text-[#52796F]">/{prod.unit}</span>
                </span>
              </div>

              <p className="text-xs text-[#52796F] mt-3 line-clamp-2">{prod.description}</p>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1 text-[#52796F]">
                <Package className="w-3.5 h-3.5 text-[#52796F]" /> Stock: {prod.stock} {prod.unit}
              </div>

              <span className="bg-[#D8E2DC] text-[#1B4332] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                {prod.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-md overflow-hidden">
            <div className="bg-[#1B4332] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Dairy Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#D8E2DC] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-medium text-[#081C15]">
              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malai Paneer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none"
                  >
                    <option value="L">Litres (L)</option>
                    <option value="Kg">Kilograms (Kg)</option>
                    <option value="Pack">Packets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Fresh homemade paneer made daily..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#E5E7EB] hover:bg-[#F7F9F7] font-semibold rounded-xl text-xs text-[#52796F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
