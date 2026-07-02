# Firestore Rules & Feature Updates ✅

## Issues Fixed

### 1. ✅ Gift Card - 16 Digit Format

**Problem:** Gift cards were generating with format `GC-XXXXXXXX` (prefix + 8 characters) instead of pure 16 digits.

**Solution:** Updated gift card generation to create 16-digit numeric codes.

**Before:**
```javascript
// Generated: GC-A2B4C6D8
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let c = 'GC-';
for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
```

**After:**
```javascript
// Generates: 1234567890123456 (16 pure digits)
let c = '';
for (let i = 0; i < 16; i++) {
  c += Math.floor(Math.random() * 10).toString();
}
```

**Example Gift Card Codes:**
- `1234567890123456`
- `9876543210987654`
- `4567891234567890`

---

### 2. ✅ Shipping - Tracking ID Required

**Problem:** When marking orders as "shipped", there was no field to enter tracking ID.

**Solution:** Added tracking ID input field with validation.

**Features:**
- ✅ Tracking ID input field in order details modal
- ✅ Required validation when clicking "Shipped" button
- ✅ Shows current tracking ID if already set
- ✅ Stores tracking ID in Firestore order document
- ✅ Displays tracking info in order details

**How it works:**
1. Admin opens order details
2. Enters tracking ID in the input field
3. Clicks "Shipped" button
4. System validates tracking ID is not empty
5. Updates order status to "shipped" with tracking ID
6. Tracking ID is saved and displayed

**UI Elements:**
```
┌─────────────────────────────────────────┐
│ Update Order Status                      │
├─────────────────────────────────────────┤
│ [Pending] [Confirmed] [Processing]      │
│ [Shipped] [Delivered]                   │
│                                          │
│ Tracking ID (Required for Shipped)      │
│ ┌─────────────────────────────────────┐ │
│ │ Enter tracking ID for shipment      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Current Tracking: TRK123456789          │
└─────────────────────────────────────────┘
```

---

## Updated Firestore Rules

Updated `firestore.rules` to:
1. ✅ Allow admin to update `trackingId` field in orders
2. ✅ Support 16-digit numeric gift card codes
3. ✅ Maintain all existing security rules

**Key Changes:**

```javascript
// Orders - Admin can now update trackingId
allow update: if request.auth != null && (
  isAdmin() ||  // Admins can update status, trackingId, canCancel, deliveredAt
  // ... user permissions
);

// Gift Cards - Now supports 16-digit codes
match /giftcards/{code} {
  allow read: if request.auth != null;
  allow create, delete: if isAdmin();
  // ... existing rules
}
```

---

## Updated Firebase Function

**`updateOrderStatus` function now accepts tracking ID:**

```typescript
export async function updateOrderStatus(
  id: string, 
  status: string, 
  trackingId?: string  // NEW: Optional tracking ID
) {
  const updates: Record<string, any> = { status };
  if (status === 'delivered') updates.deliveredAt = new Date().toISOString();
  if (['shipped', 'delivered'].includes(status)) updates.canCancel = false;
  if (status === 'shipped' && trackingId) updates.trackingId = trackingId;  // NEW
  await updateDoc(doc(db, 'orders', id), updates);
}
```

---

## Order Data Structure

Orders now include:

```javascript
{
  orderId: "ORD123",
  status: "shipped",
  trackingId: "TRK987654321",  // NEW FIELD
  customer: { ... },
  items: [ ... ],
  totalAmount: 1500,
  deliveredAt: null,
  canCancel: false,
  // ... other fields
}
```

---

## Testing Checklist

### Gift Cards:
- [x] Generate new gift card creates 16-digit code
- [x] Code is purely numeric (0-9)
- [x] No prefix or special characters
- [x] Can create and delete gift cards
- [x] Firestore accepts 16-digit document IDs

### Shipping with Tracking:
- [x] Tracking ID field appears in order details
- [x] Cannot mark as shipped without tracking ID
- [x] Alert shows if tracking ID is missing
- [x] Tracking ID saves to Firestore
- [x] Current tracking ID displays in UI
- [x] Status updates to "shipped" correctly

---

## How to Deploy Firestore Rules

1. **Copy the updated rules:**
   ```bash
   # Rules are in: firestore.rules
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy --only firestore:rules
   ```

   OR manually in Firebase Console:
   - Go to Firebase Console
   - Select your project
   - Navigate to Firestore Database
   - Click on "Rules" tab
   - Copy and paste the rules from `firestore.rules`
   - Click "Publish"

---

## Summary

✅ **Gift Cards:** Now generate as 16-digit numbers (e.g., `1234567890123456`)  
✅ **Shipping:** Tracking ID is required and saved when marking orders as shipped  
✅ **Firestore Rules:** Updated to support both features  
✅ **Build:** Project builds successfully  

All features are working and match the Firestore security rules! 🎉
