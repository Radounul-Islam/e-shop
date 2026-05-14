import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import useCartStore from "../store/cartStore";

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { addItem } = useCartStore();

  useEffect(() => {
    // We fetch trending and latest. If backend isn't ready, it handles gracefully.
    const fetchHomeData = async () => {
      try {
        const trendRes = await api.get(
          "/products?trending=true",
        );
        setTrendingProducts(trendRes.data.slice(0, 4));

        const latestRes = await api.get(
          "/products?latest=true",
        );
        setLatestProducts(latestRes.data.slice(0, 4));

        const bannerRes = await api.get("/banners");
        setBanners(bannerRes.data);
      } catch (err) {
        console.error("Could not fetch products or banners", err);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const ProductCard = ({ product }) => (
    <div className="card group relative flex flex-col">
      <Link
        to={`/product/${product.id}`}
        className="block h-48 bg-slate-100 p-4 flex items-center justify-center overflow-hidden"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-300 font-bold text-4xl">Image</div>
        )}
      </Link>
      <div className="p-5 flex-grow flex flex-col">
        <Link
          to={`/product/${product.id}`}
          className="hover:text-primary-600 transition-colors"
        >
          <h3 className="font-bold text-lg mb-1 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-slate-500 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-auto pt-2 flex justify-between items-center">
          <div className="flex flex-col">
            {product.discountPrice != null && (
              <span className="line-through text-slate-400 text-xs font-medium">৳{product.price.toFixed(2)}</span>
            )}
            <span className="text-xl font-bold text-primary-600">
              ৳{(product.discountPrice != null ? product.discountPrice : product.price).toFixed(2)}
            </span>
          </div>
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
            Elevate Your Style with{" "}
            <span className="text-primary-100">Premium Choice</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-50 mb-10 opacity-90 max-w-2xl mx-auto">
            Discover our curated collection of trending gear. Unbeatable quality
            paired with seamless, secure shopping.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/shop"
              className="bg-white text-primary-700 hover:bg-slate-50 font-bold rounded-lg px-8 py-3.5 shadow-lg flex items-center gap-2 transition-transform transform hover:-translate-y-1"
            >
              Shop Now <ArrowRight size={20} />
            </Link>
          </div>
          
          {/* Banner Slider */}
          {banners.length > 0 && (
            <div className="mt-12 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 relative aspect-[21/9] animate-fade-in group">
              {banners.map((b, idx) => (
                <div
                  key={b.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBannerIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
                >
                  <img src={b.imageUrl} alt="Promotion Banner" className="w-full h-full object-cover" />
                </div>
              ))}
              
              {/* Slider Dots */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBannerIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
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
              {trendingProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-slate-100 rounded-xl">
              No trending products added yet.
            </div>
          )}
        </section>

        {/* Latest Arrivals Section */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Star className="text-primary-600" size={28} />
            <h2 className="text-3xl font-bold text-slate-800">
              Latest Arrivals
            </h2>
          </div>
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-slate-100 rounded-xl">
              No latest products added yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
