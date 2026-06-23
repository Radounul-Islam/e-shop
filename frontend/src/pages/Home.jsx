import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import {
  ArrowRight,
  Star,
  TrendingUp,
  Sparkles,
  Settings,
  ChevronDown,
  Briefcase,
  Loader2,
  X
} from "lucide-react";
import useCartStore from "../store/cartStore";
import { useAuth } from "../context/AuthContext";
import useUiStore from "../store/uiStore";

const Home = () => {
  const { user, login } = useAuth();
  const { addToast } = useUiStore();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Profession personalization states
  const [allProfessions, setAllProfessions] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef(null);

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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all professions if user is logged in
  useEffect(() => {
    if (user && user.role === "USER") {
      api.get("/professions")
        .then((res) => setAllProfessions(res.data))
        .catch((err) => console.error("Error fetching professions:", err));
    }
  }, [user]);

  // Sync tempSelectedIds with user's professions when user changes or dropdown is toggled
  useEffect(() => {
    if (user && user.professions) {
      setTempSelectedIds(user.professions.map((p) => p.id));
    } else {
      setTempSelectedIds([]);
    }
  }, [user, isDropdownOpen]);

  // Fetch and filter recommended products based on user's professions
  useEffect(() => {
    const fetchRecommended = async () => {
      if (user && user.role === "USER" && user.professions && user.professions.length > 0) {
        try {
          const res = await api.get("/products");
          const userProfIds = user.professions.map((p) => p.id);
          const filtered = res.data.filter((product) =>
            product.professions && product.professions.some((p) => userProfIds.includes(p.id))
          );
          setRecommendedProducts(filtered);
        } catch (err) {
          console.error("Error fetching recommended products:", err);
        }
      } else {
        setRecommendedProducts([]);
      }
    };
    fetchRecommended();
  }, [user]);

  const handleDropdownToggle = (id) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveProfessions = async () => {
    setIsSaving(true);
    try {
      const res = await api.post("/professions/setup", { professionIds: tempSelectedIds });
      
      const updatedUser = {
        ...user,
        hasCompletedProfessionSetup: true,
        professions: res.data.user.professions,
      };
      login(updatedUser);
      addToast("Profession preferences updated successfully!", "success");
      setIsDropdownOpen(false);
    } catch (err) {
      console.error(err);
      addToast("Failed to save professions.", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
        {/* Profession Personalization Card */}
        {user && user.role === "USER" && (
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-primary-600 animate-pulse" size={20} />
                Tailor Your Experience
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Select your profession(s) to view recommended products.
              </p>
              {/* Active Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {user.professions && user.professions.length > 0 ? (
                  user.professions.map((p) => (
                    <span
                      key={p.id}
                      className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full border border-primary-100 flex items-center gap-1 shadow-sm"
                    >
                      {p.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs font-semibold italic">
                    No professions selected. Select to get recommendations.
                  </span>
                )}
              </div>
            </div>

            {/* Dropdown Selector */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all shadow-sm border border-slate-200/50 cursor-pointer"
              >
                <Settings size={16} />
                <span>Manage Professions</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 md:right-0 left-0 md:left-auto mt-2 w-full md:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-30 animate-scale-in">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-800">Select Professions</span>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {allProfessions.length === 0 ? (
                      <div className="text-center py-4 text-xs font-semibold text-slate-450">
                        No professions available.
                      </div>
                    ) : (
                      allProfessions.map((prof) => {
                        const isChecked = tempSelectedIds.includes(prof.id);
                        return (
                          <label
                            key={prof.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleDropdownToggle(prof.id)}
                              className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm text-slate-700 font-bold">
                              {prof.name}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfessions}
                      disabled={isSaving}
                      className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin w-3.5 h-3.5" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommended Products Section */}
        {user && user.role === "USER" && user.professions && user.professions.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="text-primary-600" size={28} />
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Recommended for You</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Based on your selected profession(s)
                </p>
              </div>
            </div>
            {recommendedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 bg-slate-100 rounded-xl font-bold">
                No products matched your profession(s) yet. Try changing your profession preferences or check back later!
              </div>
            )}
          </section>
        )}

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
