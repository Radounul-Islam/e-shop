import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/myorders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
         <Package className="text-primary-600" size={32} />
         <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
           You have not placed any orders yet.
        </div>
      ) : (
        <div className="space-y-6">
           {orders.map(order => (
             <div key={order.id} className="card p-6 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-primary-500'}`}></div>
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg text-slate-800">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                          {order.status}
                        </span>
                     </div>
                     <span className="text-sm text-slate-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="text-right">
                      <div className="font-extrabold text-2xl text-slate-800">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">{order.paymentMethod.replace(/_/g, ' ')}</div>
                   </div>
                </div>

                <div className="space-y-3">
                   {order.items.map(item => (
                      <Link 
                        key={item.id} 
                        to={`/product/${item.productId}`}
                        className="flex justify-between items-center bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors group"
                      >
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white shadow-sm rounded flex items-center justify-center shrink-0 overflow-hidden">
                               {item.product?.imageUrl ? (
                                 <img src={item.product.imageUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                               ) : (
                                 <Package size={16} className="text-slate-300"/>
                               )}
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                                    {item.product?.name || 'Unknown Product'}
                                  </span>
                                  <ExternalLink size={12} className="text-slate-300 group-hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-all" />
                               </div>
                               <span className="text-xs text-slate-400">Quantity: {item.quantity}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-sm font-bold text-slate-700">${item.price.toFixed(2)}</span>
                            {order.status === 'DELIVERED' && (
                              <div className="text-[10px] text-primary-500 font-bold mt-0.5">Rate & Review</div>
                            )}
                         </div>
                      </Link>
                   ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 text-sm">
                   <span className="text-slate-500 font-semibold mb-1 block">Delivery Address:</span>
                   <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{order.deliveryAddress}</p>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
