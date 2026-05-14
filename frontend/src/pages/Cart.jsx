import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import useCartStore from "../store/cartStore";

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white p-12 text-center card">
          <h2 className="text-xl font-bold text-slate-600 mb-4">
            Your cart is empty
          </h2>
          <Link
            to="/shop"
            className="btn-primary inline-flex items-center gap-2"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="card p-4 flex items-center gap-4"
              >
                <div className="h-20 w-20 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Image</span>
                  )}
                </div>

                <div className="flex-grow">
                  <h3 className="font-bold text-slate-800">
                    {item.product.name}
                  </h3>
                  <div className="text-primary-600 font-extrabold flex items-center gap-2">
                    {item.product.discountPrice != null && (
                      <span className="line-through text-slate-400 text-xs font-medium">৳{item.product.price.toFixed(2)}</span>
                    )}
                    <span>৳{(item.product.discountPrice != null ? item.product.discountPrice : item.product.price).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      className="p-1 hover:text-primary-600 transition-colors"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      className="p-1 hover:text-primary-600 transition-colors"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="w-full md:w-80 shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold border-b pb-4 mb-4 text-slate-800">
                Order Summary
              </h2>

              <div className="flex justify-between mb-2 text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ৳{getTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-4 text-slate-600">
                <span>Shipping</span>
                <span className="text-sm italic">Calculated next</span>
              </div>

              <div className="flex justify-between items-center border-t py-4 mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-extrabold text-2xl text-primary-600">
                  ৳{getTotal().toFixed(2)}
                </span>
              </div>

              <button
                className="w-full btn-primary py-3 text-lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
