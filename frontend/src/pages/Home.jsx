import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, TrendingUp } from 'lucide-react';
import useCartStore from '../store/cartStore';

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const { addItem } = useCartStore();

  useEffect(() => {
    // We fetch trending and latest. If backend isn't ready, it handles gracefully.
    const fetchHomeData = async () => {
      try {
        const trendRes = await axios.get('http://localhost:5000/api/products?trending=true');
        setTrendingProducts(trendRes.data.slice(0, 4));
        
        const latestRes = await axios.get('http://localhost:5000/api/products?latest=true');
        setLatestProducts(latestRes.data.slice(0, 4));
      } catch (err) {
        console.error("Could not fetch products", err);
      }
    };
    fetchHomeData();
  }, []);

  const ProductCard = ({ product }) => (
    <div className="card group relative flex flex-col">
      <Link to={`/product/${product.id}`} className="block h-48 bg-slate-100 p-4 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-slate-300 font-bold text-4xl">Image</div>
        )}
      </Link>
      <div className="p-5 flex-grow flex flex-col">
        <Link to={`/product/${product.id}`} className="hover:text-primary-600 transition-colors">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-slate-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="mt-auto pt-2 flex justify-between items-center">
          <span className="text-xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
          <button 
            onClick={() => addItem(product)}
            className="btn-primary py-1.5 px-3 text-sm whitespace-nowrap"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden blue-gradient py-24 sm:py-32 flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Elevate Your Style with <span className="text-primary-100">Premium Choice</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-50 mb-10 opacity-90 max-w-2xl mx-auto">
            Discover our curated collection of trending gear. Unbeatable quality paired with seamless, secure shopping.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/shop" className="bg-white text-primary-700 hover:bg-slate-50 font-bold rounded-lg px-8 py-3.5 shadow-lg flex items-center gap-2 transition-transform transform hover:-translate-y-1">
              Shop Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        
        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="text-primary-600" size={28} />
            <h2 className="text-3xl font-bold text-slate-800">Trending Now</h2>
          </div>
          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
             <div className="text-center py-12 text-slate-400 bg-slate-100 rounded-xl">No trending products added yet.</div>
          )}
        </section>

        {/* Latest Arrivals Section */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Star className="text-primary-600" size={28} />
            <h2 className="text-3xl font-bold text-slate-800">Latest Arrivals</h2>
          </div>
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
             <div className="text-center py-12 text-slate-400 bg-slate-100 rounded-xl">No latest products added yet.</div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Home;
