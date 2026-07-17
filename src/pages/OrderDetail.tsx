import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Order, ORDER_STATUSES, STATUS_COLORS } from '../store/mockData';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSListRow, IOSBadge, IOSButton, IOSInput, IOSSheet, IOSTextArea } from '../components/IOSComponents';
import { Check, Truck, Package, Clock, Copy, ExternalLink, ChevronRight } from 'lucide-react';

const statusTimeline = [
  { key: 'pending', icon: <Clock size={14} />, label: 'Pending' },
  { key: 'placed', icon: <Check size={14} />, label: 'Placed' },
  { key: 'confirmed', icon: <Check size={14} />, label: 'Confirmed' },
  { key: 'processing', icon: <Package size={14} />, label: 'Processing' },
  { key: 'shipped', icon: <Truck size={14} />, label: 'Shipped' },
  { key: 'delivered', icon: <Check size={14} />, label: 'Delivered' },
];

const getStatusIndex = (status: string) => {
  if (status === 'cancelled') return -1;
  if (status.startsWith('replacement')) return 6;
  return statusTimeline.findIndex(s => s.key === status);
};

const OrderDetail: React.FC<{ order: Order; onBack: () => void }> = ({ order: initialOrder, onBack }) => {
  const { orders, users, updateOrderFields, showToast } = useData();
  const order = orders.find(o => o.docId === initialOrder.docId) || initialOrder;
  const matchedUser = users.find((u) => u.id === order.userId);
  const customerName = order.userName || order.address?.name || matchedUser?.name || matchedUser?.email || '—';
  const customerEmail = order.userEmail || matchedUser?.email || '—';

  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [showShipSheet, setShowShipSheet] = useState(false);
  const [showRefundSheet, setShowRefundSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cancel form
  const [cancelRemark, setCancelRemark] = useState(order.cancelRemark || '');
  const [cancelRefundTxn, setCancelRefundTxn] = useState(order.refundTxnId || '');

  // Ship form
  const [trackingLink, setTrackingLink] = useState(order.trackingLink || '');

  // Refund form (for adding refund to already-cancelled order)
  const [refundTxnId, setRefundTxnId] = useState(order.refundTxnId || '');

  const currentIdx = getStatusIndex(order.status);

  const handleStatusSelect = (newStatus: string) => {
    if (newStatus === 'cancelled') {
      // Show cancel sheet with remark + refund fields
      setCancelRemark(order.cancelRemark || '');
      setCancelRefundTxn(order.refundTxnId || '');
      setShowStatusSheet(false);
      setShowCancelSheet(true);
    } else if (newStatus === 'shipped') {
      // Show shipping sheet with tracking link
      setTrackingLink(order.trackingLink || '');
      setShowStatusSheet(false);
      setShowShipSheet(true);
    } else {
      // Direct status update
      updateStatus(newStatus);
    }
  };

  const updateStatus = async (newStatus: string, extraFields?: Record<string, any>) => {
    setSaving(true);
    await updateOrderFields(order.userId, order.docId, {
      status: newStatus,
      ...extraFields,
    });
    setSaving(false);
    setShowStatusSheet(false);
  };

  const saveCancellation = async () => {
    setSaving(true);
    await updateOrderFields(order.userId, order.docId, {
      status: 'cancelled',
      cancelRemark: cancelRemark,
      cancelledAt: new Date(),
      ...(cancelRefundTxn ? { refundTxnId: cancelRefundTxn, refundDate: new Date() } : {}),
    });
    setSaving(false);
    setShowCancelSheet(false);
  };

  const saveShipping = async () => {
    setSaving(true);
    const fields: Record<string, any> = { trackingLink };
    // Only set status to shipped if not already shipped/delivered
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      fields.status = 'shipped';
    }
    await updateOrderFields(order.userId, order.docId, fields);
    setSaving(false);
    setShowShipSheet(false);
  };

  const saveRefund = async () => {
    setSaving(true);
    await updateOrderFields(order.userId, order.docId, {
      refundTxnId: refundTxnId,
      refundDate: new Date(),
    });
    setSaving(false);
    setShowRefundSheet(false);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied`)).catch(() => showToast('Copy failed'));
  };

  const isSafeUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch { return false; }
  };

  const openTrackingLink = () => {
    if (order.trackingLink && isSafeUrl(order.trackingLink)) {
      window.open(order.trackingLink, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Invalid tracking URL');
    }
  };

  const fmtDate = (d: Date | string | null | undefined) => {
    if (!d) return '—';
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fmtDateTime = (d: Date | string | null | undefined) => {
    if (!d) return '—';
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      + ', ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const addressParts = [
    order.address?.line1, order.address?.line2,
    [order.address?.city, order.address?.state].filter(Boolean).join(', '),
    order.address?.pincode,
  ].filter(Boolean);

  // Build payment rows
  const paymentRows: { label: string; value: string; copyable?: boolean; onClick?: () => void }[] = [];
  paymentRows.push({
    label: 'UTR Number', value: order.utrNumber || '—',
    copyable: !!order.utrNumber,
    onClick: order.utrNumber ? () => copyText(order.utrNumber, 'UTR') : undefined,
  });
  if (order.refundTxnId) {
    paymentRows.push({
      label: 'Refund Txn', value: order.refundTxnId,
      copyable: true,
      onClick: () => copyText(order.refundTxnId, 'Refund ID'),
    });
  }
  if (order.refundDate) {
    paymentRows.push({ label: 'Refund Date', value: fmtDateTime(order.refundDate) });
  }
  if (order.status === 'cancelled' && !order.refundTxnId) {
    paymentRows.push({ label: 'Add Refund Info', value: '', onClick: () => { setRefundTxnId(''); setShowRefundSheet(true); } });
  }

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title={order.id || 'Order'} leftAction={{ label: 'Back', onClick: onBack }} />
      <div className="pb-[90px]">

        {/* Status Badge */}
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-[5px]">
            <IOSBadge label={order.status} color={STATUS_COLORS[order.status] || '#8e8e93'} />
            {order.status === 'cancelled' && order.refundTxnId && (
              <IOSBadge label="refunded" color={STATUS_COLORS['refunded']} />
            )}
          </div>
          <button onClick={() => setShowStatusSheet(true)} className="text-[15px] text-ios-blue font-[500]">
            Update Status
          </button>
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' && !order.status.startsWith('replacement') && (
          <>
            <IOSSectionHeader title="Order Timeline" />
            <IOSCardGroup>
              <div className="px-4 py-4">
                {statusTimeline.map((step, idx) => {
                  const isActive = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-ios-green text-white' : 'bg-ios-gray5 text-ios-gray'} ${isCurrent ? 'ring-2 ring-ios-green/30' : ''}`}>
                          {step.icon}
                        </div>
                        {idx < statusTimeline.length - 1 && (
                          <div className={`w-0.5 h-6 ${isActive ? 'bg-ios-green' : 'bg-ios-gray5'}`} />
                        )}
                      </div>
                      <div className="pt-1">
                        <span className={`text-[15px] ${isActive ? 'font-semibold text-ios-label' : 'text-ios-gray'}`}>{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </IOSCardGroup>
          </>
        )}

        {/* Tracking — show for shipped/delivered */}
        {(order.status === 'shipped' || order.status === 'delivered') && (
          <>
            <IOSSectionHeader title="Tracking" />
            <IOSCardGroup>
              {order.trackingLink ? (
                <>
                  <IOSListRow
                    label="Tracking Link"
                    value={
                      <span className="text-[15px] text-ios-blue flex items-center gap-1">
                        Open <ExternalLink size={13} strokeWidth={2} />
                      </span>
                    }
                    onClick={openTrackingLink}
                  />
                  <IOSListRow
                    label="Edit Link"
                    chevron
                    onClick={() => { setTrackingLink(order.trackingLink); setShowShipSheet(true); }}
                    isLast
                  />
                </>
              ) : (
                <IOSListRow
                  label="Add Tracking Link"
                  chevron
                  onClick={() => { setTrackingLink(''); setShowShipSheet(true); }}
                  isLast
                />
              )}
            </IOSCardGroup>
          </>
        )}

        {/* Items */}
        <IOSSectionHeader title={`Items (${(order.items || []).length})`} />
        <IOSCardGroup>
          {(order.items || []).length === 0 ? (
            <div className="px-4 py-4 text-[15px] text-ios-gray text-center">No items</div>
          ) : (
            (order.items || []).map((item, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-4 py-3 ${idx < (order.items?.length || 0) - 1 ? 'border-b border-ios-separator/20' : ''}`}>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-ios-gray5 flex-shrink-0">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium truncate">{item.title || 'Untitled'}</p>
                  <p className="text-[13px] text-ios-gray">Qty: {item.qty || 0} × ₹{item.price || 0}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[15px] font-semibold">₹{((item.price || 0) * (item.qty || 0)).toLocaleString()}</p>
                  {(item.mrp || 0) > (item.price || 0) && <p className="text-[12px] text-ios-gray line-through">₹{((item.mrp || 0) * (item.qty || 0)).toLocaleString()}</p>}
                </div>
              </div>
            ))
          )}
        </IOSCardGroup>

        {/* Bill Breakdown */}
        <IOSSectionHeader title="Bill Breakdown" />
        <IOSCardGroup>
          <IOSListRow label="Subtotal" value={`₹${(order.subtotal || 0).toLocaleString()}`} />
          {order.couponCode ? <IOSListRow label={`Coupon (${order.couponCode})`} value={`-₹${(order.couponDiscount || 0).toLocaleString()}`} /> : null}
          {order.giftCardCode ? <IOSListRow label={`Gift Card (${order.giftCardCode})`} value={`-₹${(order.giftCardUsed || 0).toLocaleString()}`} /> : null}
          <IOSListRow label="Delivery" value={(order.delivery || 0) > 0 ? `₹${order.delivery}` : 'Free'} />
          <div className="flex items-center px-4 py-3 bg-ios-blue/5">
            <span className="text-[17px] font-bold flex-1">Total</span>
            <span className="text-[17px] font-bold text-ios-blue">₹{(order.total || 0).toLocaleString()}</span>
          </div>
          <IOSListRow label="Amount Paid" value={`₹${(order.amountPaid || 0).toLocaleString()}`} isLast />
        </IOSCardGroup>

        {/* Payment */}
        <IOSSectionHeader title="Payment" />
        <IOSCardGroup>
          {paymentRows.map((row, idx) => {
            const last = idx === paymentRows.length - 1;
            if (row.copyable) {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 min-h-[44px] py-[10px] active:bg-black/[0.04] cursor-pointer"
                  onClick={row.onClick}
                >
                  <div className={`flex-1 min-w-0 flex items-center gap-2 ${!last ? 'border-b border-ios-separator/25' : ''} py-[2px] min-h-[28px]`}>
                    <span className="text-[17px] leading-[22px] text-ios-label">{row.label}</span>
                    <div className="flex-1" />
                    <span className="text-[17px] text-ios-gray leading-[22px] truncate max-w-[160px]">{row.value}</span>
                    <Copy size={14} className="text-ios-gray3 flex-shrink-0 ml-1" strokeWidth={2} />
                  </div>
                </div>
              );
            }
            if (row.label === 'Add Refund Info') {
              return <IOSListRow key={idx} label={row.label} chevron onClick={row.onClick} isLast={last} />;
            }
            return <IOSListRow key={idx} label={row.label} value={row.value} isLast={last} />;
          })}
        </IOSCardGroup>

        {/* Delivery Address */}
        <IOSSectionHeader title="Delivery Address" />
        <IOSCardGroup>
          <div className="px-4 py-3">
            <p className="text-[15px] font-semibold">{customerName}</p>
            <p className="text-[14px] text-ios-gray mt-1">{addressParts.join(', ') || '—'}</p>
            <p className="text-[14px] text-ios-gray mt-1">📞 {order.address?.phone || matchedUser?.phone || '—'}</p>
          </div>
        </IOSCardGroup>

        {/* Cancel Info */}
        {order.status === 'cancelled' && (
          <>
            <IOSSectionHeader title="Cancellation" />
            <div className="mx-5 bg-ios-red/[0.06] rounded-[12px] overflow-hidden border border-ios-red/15">
              {/* Remark */}
              <div className="flex items-center gap-3 px-4 min-h-[44px] py-[10px] border-b border-ios-red/10">
                <div className="flex-1 min-w-0 flex items-center gap-2 py-[2px]">
                  <span className="text-[17px] leading-[22px] text-ios-red font-[500]">Remark</span>
                  <div className="flex-1" />
                  <span className="text-[17px] text-ios-red/70 leading-[22px] truncate max-w-[160px]">{order.cancelRemark || '—'}</span>
                </div>
              </div>
              {/* Cancelled At */}
              <div className={`flex items-center gap-3 px-4 min-h-[44px] py-[10px] ${order.refundTxnId || !order.refundTxnId ? 'border-b border-ios-red/10' : ''}`}>
                <div className="flex-1 min-w-0 flex items-center gap-2 py-[2px]">
                  <span className="text-[17px] leading-[22px] text-ios-red font-[500]">Cancelled At</span>
                  <div className="flex-1" />
                  <span className="text-[17px] text-ios-red/70 leading-[22px]">{fmtDateTime(order.cancelledAt)}</span>
                </div>
              </div>
              {/* Refund Txn ID */}
              {order.refundTxnId ? (
                <>
                  <div
                    className="flex items-center gap-3 px-4 min-h-[44px] py-[10px] border-b border-ios-red/10 active:bg-ios-red/[0.04] cursor-pointer"
                    onClick={() => copyText(order.refundTxnId, 'Refund ID')}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-2 py-[2px]">
                      <span className="text-[17px] leading-[22px] text-ios-red font-[500]">Refund Txn</span>
                      <div className="flex-1" />
                      <span className="text-[17px] text-ios-red/70 leading-[22px] truncate max-w-[140px]">{order.refundTxnId}</span>
                      <Copy size={14} className="text-ios-red/40 flex-shrink-0 ml-1" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 min-h-[44px] py-[10px]">
                    <div className="flex-1 min-w-0 flex items-center gap-2 py-[2px]">
                      <span className="text-[17px] leading-[22px] text-ios-red font-[500]">Refund Date</span>
                      <div className="flex-1" />
                      <span className="text-[17px] text-ios-red/70 leading-[22px]">{fmtDateTime(order.refundDate)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="flex items-center gap-3 px-4 min-h-[44px] py-[10px] active:bg-ios-red/[0.04] cursor-pointer"
                  onClick={() => { setRefundTxnId(''); setShowRefundSheet(true); }}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2 py-[2px]">
                    <span className="text-[17px] leading-[22px] text-ios-red font-[500]">Add Refund Info</span>
                    <div className="flex-1" />
                    <ChevronRight size={16} className="text-ios-red/40 flex-shrink-0" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Details */}
        <IOSSectionHeader title="Details" />
        <IOSCardGroup>
          <IOSListRow label="Order ID" value={order.id || '—'} />
          <IOSListRow label="Customer" value={customerName} />
          <IOSListRow label="Email" value={customerEmail} />
          <IOSListRow label="Date" value={fmtDate(order.createdAt)} isLast />
        </IOSCardGroup>
      </div>

      {/* ─── Status Selection Sheet ─── */}
      <IOSSheet open={showStatusSheet} onClose={() => setShowStatusSheet(false)} title="Update Status">
        <div className="pt-4">
          <IOSSectionHeader title="Select New Status" />
          <IOSCardGroup>
            {ORDER_STATUSES.map((s, idx) => (
              <div
                key={s}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-black/[0.04] ${idx < ORDER_STATUSES.length - 1 ? 'border-b border-ios-separator/20' : ''}`}
                onClick={() => !saving && handleStatusSelect(s)}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[s] }} />
                <span className={`text-[17px] flex-1 capitalize ${order.status === s ? 'font-semibold' : ''}`}>
                  {s.replace(/_/g, ' ')}
                </span>
                {order.status === s && <Check size={18} className="text-ios-blue" />}
              </div>
            ))}
          </IOSCardGroup>
          {saving && <p className="text-center text-[13px] text-ios-gray mt-4">Updating...</p>}
        </div>
      </IOSSheet>

      {/* ─── Cancel Order Sheet ─── */}
      <IOSSheet open={showCancelSheet} onClose={() => setShowCancelSheet(false)} title="Cancel Order">
        <div className="pt-4">
          <IOSSectionHeader title="Cancellation Details" />
          <IOSCardGroup>
            <IOSTextArea label="Cancel Remark" value={cancelRemark} onChange={setCancelRemark} rows={3} />
            <IOSInput label="Refund Txn ID" value={cancelRefundTxn} onChange={setCancelRefundTxn} placeholder="Optional" isLast />
          </IOSCardGroup>
          <div className="px-5 mt-2">
            <p className="text-[12px] text-ios-gray">Refund date will be set automatically. You can also add refund info later.</p>
          </div>
          <div className="px-5 mt-6 flex flex-col gap-[10px]">
            <IOSButton variant="destructive" onClick={saveCancellation}>
              {saving ? 'Cancelling...' : 'Cancel Order'}
            </IOSButton>
          </div>
        </div>
      </IOSSheet>

      {/* ─── Ship / Tracking Sheet ─── */}
      <IOSSheet open={showShipSheet} onClose={() => setShowShipSheet(false)} title={order.status === 'shipped' || order.status === 'delivered' ? 'Tracking Link' : 'Ship Order'}>
        <div className="pt-4">
          <IOSSectionHeader title="Shipping Details" />
          <IOSCardGroup>
            <IOSInput label="Tracking Link" value={trackingLink} onChange={setTrackingLink} placeholder="https://..." isLast />
          </IOSCardGroup>
          <div className="px-5 mt-2">
            <p className="text-[12px] text-ios-gray">Paste the tracking URL. This will be visible to the customer.</p>
          </div>
          <div className="px-5 mt-6">
            <IOSButton onClick={saveShipping}>
              {saving ? 'Saving...' : order.status === 'shipped' || order.status === 'delivered' ? 'Save Tracking Link' : 'Mark as Shipped'}
            </IOSButton>
          </div>
        </div>
      </IOSSheet>

      {/* ─── Add Refund Sheet (for already cancelled orders) ─── */}
      <IOSSheet open={showRefundSheet} onClose={() => setShowRefundSheet(false)} title="Refund Info">
        <div className="pt-4">
          <IOSCardGroup>
            <IOSInput label="Refund Txn ID" value={refundTxnId} onChange={setRefundTxnId} placeholder="REF001" isLast />
          </IOSCardGroup>
          <div className="px-5 mt-2">
            <p className="text-[12px] text-ios-gray">Refund date will be set to today automatically.</p>
          </div>
          <div className="px-5 mt-6">
            <IOSButton onClick={saveRefund}>{saving ? 'Saving...' : 'Save Refund Info'}</IOSButton>
          </div>
        </div>
      </IOSSheet>
    </div>
  );
};

export default OrderDetail;
