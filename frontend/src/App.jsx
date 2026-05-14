import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  ShoppingCart,
  LogIn,
  Store,
  Package,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import useCartStore from "./store/cartStore";
import { useAuth } from "./context/AuthContext";

// Pages placeholders (we'll implement them next)
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import AuthModal from "./components/AuthModal";
import MyOrders from "./pages/MyOrders";

const Navbar = () => {
  const { items } = useCartStore();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="blue-gradient shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold bg-white text-primary-600 px-3 py-1 rounded-lg shrink-0"
        >
          <Store size={28} />
          <span>E-Shop</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/shop"
            className="text-white hover:text-primary-100 font-medium"
          >
            Shop
          </Link>
          <Link to="/cart" className="relative text-white hover:text-primary-100">
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-white hover:text-primary-100 flex items-center gap-1 font-medium transition-colors"
                >
                  <LayoutDashboard size={20} /> Admin
                </Link>
              )}
              <Link
                to="/orders"
                className="text-white hover:text-primary-100 flex items-center gap-1 font-medium"
              >
                <Package size={20} /> Orders
              </Link>
              <span className="text-sm border border-white/30 px-3 py-1 rounded-full text-white">
                {user.email || user.phone}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-red-500 text-white border border-white/20 hover:border-red-500 transition-all duration-300 font-medium text-sm group shadow-sm hover:shadow-red-500/20"
              >
                <LogOut
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 hover:text-primary-100 text-white font-medium"
            >
              <LogIn size={20} /> Login
            </Link>
          )}
        </div>

        {/* Mobile controls (Cart Icon + Hamburger) */}
        <div className="flex md:hidden items-center gap-5">
          <Link to="/cart" className="relative text-white">
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-primary-100"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 flex flex-col gap-4 animate-fade-in shadow-xl">
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white hover:text-primary-100 font-medium border-b border-white/10 pb-2"
          >
            Shop
          </Link>
          
          {user ? (
            <div className="flex flex-col gap-4">
              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-primary-100 flex items-center gap-2 font-medium border-b border-white/10 pb-2"
                >
                  <LayoutDashboard size={20} /> Admin Setup
                </Link>
              )}
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary-100 flex items-center gap-2 font-medium border-b border-white/10 pb-2"
              >
                <Package size={20} /> My Orders
              </Link>
              <div className="text-sm px-3 py-2 rounded-lg bg-white/10 text-white font-medium">
                Signed in as: {user.email || user.phone}
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-md mt-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-primary-100 text-white font-medium py-2"
            >
              <LogIn size={20} /> Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<AuthModal />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-12">
        <p>&copy; 2026 E-Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
