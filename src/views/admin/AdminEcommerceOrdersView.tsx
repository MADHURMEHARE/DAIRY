import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Truck, CheckCircle2, Clock, MapPin, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { EcommerceOrder, EcommerceOrderStatus, DeliveryStaff } from '../../types';
import { ApiClient } from '../../api/client';

export const AdminEcommerceOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [staff, setStaff] = useState<DeliveryStaff[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const orderList = await ApiClient.getEcommerceOrders();
      setOrders(orderList);

      // Load staff
      const staffList = [
        { id: 'staff_01', dairyId: 'dairy_shree_01', name: 'Ramesh Kumar', phone: '+91 91234 56789', assignedArea: 'Camp Road & Rajapeth', activeDeliveriesCount: 4, status: 'ACTIVE' as const },
        { id: 'staff_02', dairyId: 'dairy_shree_01', name: 'Ganesh More', phone: '+91 98334 11221', assignedArea: 'Badnera Road & Rathi Nagar', activeDeliveriesCount: 3, status: 'ACTIVE' as const }
      ];
      setStaff(staffList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: EcommerceOrderStatus, staffId?: string) => {
    try {
      const selectedStaff = staff.find((s) => s.id === staffId);
      await ApiClient.updateEcommerceOrderStatus(
        orderId,
        newStatus,
        staffId,
        selectedStaff ? selectedStaff.name : undefined
      );
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchQuery =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchStatus && matchQuery;
  });

  const totalStoreRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081C15] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#1B4332]" /> E-Commerce Orders Management
          </h1>
          <p className="text-xs text-[#52796F] mt-1">
            Fulfill store orders for Paneer, Bilona Ghee, Shrikhand, A2 Milk, and sweets.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F7F9F7] text-[#081C15] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#1B4332]" /> Refresh Orders
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">Total Store Sales</span>
          <p className="text-xl font-bold text-[#1B4332] font-mono mt-1">₹{totalStoreRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">Pending Packing</span>
          <p className="text-xl font-bold text-amber-700 font-mono mt-1">
            {orders.filter((o) => o.status === 'ORDER_PLACED' || o.status === 'PACKING').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">Out For Delivery</span>
          <p className="text-xl font-bold text-purple-700 font-mono mt-1">
            {orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">Delivered Orders</span>
          <p className="text-xl font-bold text-green-700 font-mono mt-1">
            {orders.filter((o) => o.status === 'DELIVERED').length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#52796F]" />
          <input
            type="text"
            placeholder="Search Order #, Customer Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#52796F]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#081C15] px-3 py-2.5 focus:outline-none shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ORDER_PLACED">Order Placed</option>
            <option value="PACKING">Packing</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List Table / Cards */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-[#52796F]">Loading store orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-2">
          <p className="text-sm font-bold text-[#081C15]">No store orders found</p>
          <p className="text-xs text-[#52796F]">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4 hover:border-[#1B4332] transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#081C15]">{order.orderNumber}</span>
                    <span className="text-[10px] font-bold bg-[#D8E2DC] text-[#1B4332] px-2 py-0.5 rounded-full">
                      {order.deliverySlot}
                    </span>
                  </div>
                  <p className="text-xs text-[#52796F] mt-0.5">{order.createdAt}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#081C15] font-mono">₹{order.totalAmount}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : order.status === 'OUT_FOR_DELIVERY'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : order.status === 'PACKING'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Customer Details & Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] text-xs">
                  <div className="font-bold text-[#081C15] flex items-center gap-1.5">
                    👤 {order.customerName}
                    <span className="text-[#52796F] font-normal flex items-center gap-1 ml-2">
                      <Phone className="w-3 h-3" /> {order.customerPhone}
                    </span>
                  </div>
                  <div className="text-[#52796F] flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1B4332] shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                  <div className="text-[#52796F] font-medium pt-1 border-t border-[#E5E7EB]">
                    Payment Mode: <span className="font-bold text-[#081C15]">{order.paymentMethod}</span> ({order.paymentStatus})
                  </div>
                </div>

                <div className="space-y-2 bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] text-xs">
                  <span className="font-bold text-[#081C15] block">Order Contents:</span>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[#081C15]">
                        <span>
                          {item.icon || '🥛'} {item.productName} <span className="text-[#52796F]">x{item.quantity}</span>
                        </span>
                        <span className="font-mono font-bold">₹{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Toolbar to change status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#081C15]">Assign Staff:</span>
                  <select
                    value={order.deliveryStaffId || ''}
                    onChange={(e) => handleUpdateStatus(order.id, order.status, e.target.value)}
                    className="bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#081C15] px-2.5 py-1.5"
                  >
                    <option value="">Unassigned</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.assignedArea})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'ORDER_PLACED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PACKING', order.deliveryStaffId)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                    >
                      Mark Packing 📦
                    </button>
                  )}

                  {order.status === 'PACKING' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY', order.deliveryStaffId)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                    >
                      Dispatch Order 🚚
                    </button>
                  )}

                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED', order.deliveryStaffId)}
                      className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-2xs"
                    >
                      Mark Delivered ✅
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
