import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Truck, Smartphone } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addressObj, setAddressObj] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [showAuthModal, setShowAuthModal] = useState(!user);

  if (!user && !showAuthModal) {
    setShowAuthModal(true);
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!addressObj.street || !addressObj.city || !addressObj.zip || !addressObj.country) {
      return alert('Please fill in all required delivery address fields (state is optional)');
    }
    
    try {
      const formattedAddress = `${addressObj.street}, ${addressObj.city}, ${addressObj.state ? addressObj.state + ' ' : ''}${addressObj.zip}, ${addressObj.country}`;
      const orderData = {
        orderItems: items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
        deliveryAddress: formattedAddress,
        paymentMethod
      };
      
      const res = await axios.post('http://localhost:5000/api/orders', orderData);
      if (res.status === 201) {
        clearCart();
        alert('Order Placed Successfully!');
        navigate('/shop');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    }
  };

  if (!user) {
     return <AuthModal onClose={() => navigate('/cart')} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <form onSubmit={handlePlaceOrder} className="flex-grow space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Truck className="text-primary-600"/> Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="col-span-1 sm:col-span-2">
                 <label className="block text-sm font-semibold mb-1">Street Address *</label>
                 <input required type="text"
                   className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                   placeholder="123 Main St, Apt 4B"
                   value={addressObj.street}
                   onChange={e => setAddressObj({...addressObj, street: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold mb-1">City *</label>
                 <input required type="text"
                   className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                   placeholder="New York"
                   value={addressObj.city}
                   onChange={e => setAddressObj({...addressObj, city: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold mb-1">State / Province</label>
                 <input type="text"
                   className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                   placeholder="NY"
                   value={addressObj.state}
                   onChange={e => setAddressObj({...addressObj, state: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold mb-1">ZIP / Postal Code *</label>
                 <input required type="text"
                   className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                   placeholder="10001"
                   value={addressObj.zip}
                   onChange={e => setAddressObj({...addressObj, zip: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold mb-1">Country *</label>
                 <input required type="text"
                   className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                   placeholder="United States"
                   value={addressObj.country}
                   onChange={e => setAddressObj({...addressObj, country: e.target.value})}
                 />
               </div>
            </div>
          </div>

          <div className="card p-6">
             <h2 className="text-xl font-bold mb-4">Payment Method</h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}>
                   <input type="radio" value="CASH_ON_DELIVERY" checked={paymentMethod==='CASH_ON_DELIVERY'} onChange={e => setPaymentMethod(e.target.value)} className="hidden" />
                   <Truck size={32} className={paymentMethod === 'CASH_ON_DELIVERY' ? 'text-primary-600' : 'text-slate-400'} />
                   <span className="font-semibold text-sm">Cash on Delivery</span>
                </label>
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === 'MOBILE_BANK' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}>
                   <input type="radio" value="MOBILE_BANK" checked={paymentMethod==='MOBILE_BANK'} onChange={e => setPaymentMethod(e.target.value)} className="hidden" />
                   <Smartphone size={32} className={paymentMethod === 'MOBILE_BANK' ? 'text-primary-600' : 'text-slate-400'} />
                   <span className="font-semibold text-sm">Mobile Banking</span>
                </label>
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}>
                   <input type="radio" value="CREDIT_CARD" checked={paymentMethod==='CREDIT_CARD'} onChange={e => setPaymentMethod(e.target.value)} className="hidden" />
                   <CreditCard size={32} className={paymentMethod === 'CREDIT_CARD' ? 'text-primary-600' : 'text-slate-400'} />
                   <span className="font-semibold text-sm">Card</span>
                </label>
             </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-lg mt-6 shadow-xl">
             Confirm Order (৳{getTotal().toFixed(2)})
          </button>
        </form>

        <aside className="w-full md:w-80 shrink-0">
          <div className="card p-6 sticky top-24 bg-slate-50 border-none shadow-inner">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Order Items</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
               {items.map(i => {
                 const activePrice = i.product.discountPrice != null ? i.product.discountPrice : i.product.price;
                 return (
                   <div key={i.product.id} className="flex justify-between text-sm">
                     <span className="truncate pr-2">{i.quantity} x {i.product.name}</span>
                     <span className="font-semibold">৳{(activePrice * i.quantity).toFixed(2)}</span>
                   </div>
                 );
               })}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
               <span>Total</span>
               <span className="text-primary-600">৳{getTotal().toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
