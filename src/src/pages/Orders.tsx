import { useState, useEffect } from 'react';
import { subscribeOrders, updateOrderStatus } from '../firebase';
import { Search, ChevronRight, X, User, MapPin, Phone, Mail, Package, CreditCard, Tag, Calendar, Truck, CheckCircle2, Clock, FileText, ShoppingBag } from 'lucide-react';

function money(v: number) { return '₹' + v.toLocaleString('en-IN'); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

const statusConfig: Record<string, { color: string; bgColor: string; icon: any }> = {
  pending: { color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', icon: Clock },
  confirmed: { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: CheckCircle2 },
  processing: { color: 'text-teal-700', bgColor: 'bg-teal-50 border-teal-200', icon: Package },
  shipped: { color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', icon: Truck },
  delivered: { color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => subscribeOrders(setOrders), []);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (o.orderId?.toLowerCase().includes(s) || o.customer?.name?.toLowerCase().includes(s) || o.customer?.phone?.includes(s));
  });

  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const statusColors: any = { pending: 'amber', confirmed: 'blue', processing: 'teal', shipped: 'indigo', delivered: 'emerald' };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Orders ({orders.length})</h1>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm outline-none bg-slate-50 border border-slate-200 text-slate-800" />
        </div>
        {statuses.map(st => (<button key={st} onClick={() => setFilter(st)} className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === st ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{st} {st === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === st).length})`}</button>))}
      </div>

      <div className="space-y-2">
        {filtered.map(o => (
          <button key={o.id} onClick={() => setSel(o)} className="w-full rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-slate-900">#{o.orderId || o.id.slice(-8).toUpperCase()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold bg-${statusColors[o.status] || 'slate'}-100 text-${statusColors[o.status] || 'slate'}-700`}>{o.status}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{o.customer?.name} · {money(o.totalAmount)} · {fmtDate(o.createdAt)}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-center py-12 text-sm text-slate-400">No orders found</p>}
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSel(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">#{sel.orderId || sel.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSel(null)} className="h-9 w-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status and Timeline */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Order Status</h3>
                  </div>
                  <div className={`px-4 py-3 rounded-lg font-bold capitalize border ${statusConfig[sel.status]?.bgColor} ${statusConfig[sel.status]?.color} flex items-center gap-2 justify-center`}>
                    {statusConfig[sel.status]?.icon && <statusConfig.status.icon className="h-5 w-5" />}
                    <span className="text-base">{sel.status}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Order Timeline</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Placed on:</span>
                      <span className="font-semibold text-slate-900">{fmtDate(sel.createdAt)}</span>
                    </div>
                    {sel.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Delivered on:</span>
                        <span className="font-semibold text-emerald-700">{fmtDate(sel.deliveredAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Customer Details</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Name</p>
                      <p className="text-sm font-semibold text-slate-900">{sel.customer?.name}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Phone</p>
                        <p className="text-sm font-medium text-slate-900">{sel.customer?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-slate-900">{sel.customer?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Delivery Address</p>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {sel.customer?.address}<br />
                        {sel.customer?.city}, {sel.customer?.state}<br />
                        PIN: {sel.customer?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Order Items</h3>
                </div>
                <div className="space-y-3">
                  {sel.items?.map((it: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{it.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Quantity: {it.qty} × ₹{it.price}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-900">₹{it.price * it.qty}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Payment Summary</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {sel.mrpTotal && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">MRP Total</span>
                      <span className="font-medium text-slate-900">₹{sel.mrpTotal}</span>
                    </div>
                  )}
                  {sel.productDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Product Discount</span>
                      <span className="font-medium text-emerald-600">-₹{sel.productDiscount}</span>
                    </div>
                  )}
                  {sel.couponCode && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-slate-600">Coupon ({sel.couponCode})</span>
                      </div>
                      <span className="font-medium text-emerald-600">-₹{sel.couponDiscount}</span>
                    </div>
                  )}
                  {sel.giftCardCode && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-slate-600">Gift Card ({sel.giftCardCode})</span>
                      </div>
                      <span className="font-medium text-emerald-600">-₹{sel.giftCardUsed}</span>
                    </div>
                  )}
                  {sel.transactionId && sel.transactionId !== 'GIFTCARD' && (
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-600">Transaction ID</span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">{sel.transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-slate-300">
                    <span className="font-bold text-slate-900 text-base">Total Paid</span>
                    <span className="font-bold text-emerald-600 text-lg">₹{sel.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Update Order Status</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(st => (
                    <button key={st} onClick={() => { updateOrderStatus(sel.id, st); setSel({ ...sel, status: st }); }} disabled={sel.status === st} className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${sel.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}>{st}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
