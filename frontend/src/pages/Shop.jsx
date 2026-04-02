import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', categoryId: '', minPrice: '', maxPrice: '', latest: false });
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products/categories/all');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = new URLSearchParams();
        if (filters.search) query.append('search', filters.search);
        if (filters.categoryId) query.append('categoryId', filters.categoryId);
        if (filters.minPrice) query.append('minPrice', filters.minPrice);
        if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);
        if (filters.latest) query.append('latest', 'true');
        
        const res = await axios.get(`http://localhost:5000/api/products?${query.toString()}`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    // small debounce simulation can be added here if needed, but simple re-fetch works
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="card p-6 sticky top-24">
          <div className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-800 border-b pb-4">
            <Filter size={20} /> Filters
          </div>

          <div className="mb-6">
             <label className="block text-sm font-semibold text-slate-600 mb-2">Search</label>
             <input
               type="text"
               name="search"
               placeholder="Search products..."
               value={filters.search}
               onChange={handleFilterChange}
               className="w-full border-slate-200 rounded-lg shadow-sm px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
             />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
            <select 
              name="categoryId" 
              value={filters.categoryId} 
              onChange={handleFilterChange}
              className="w-full border-slate-200 rounded-lg shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Price Range</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                name="minPrice" 
                placeholder="Min" 
                value={filters.minPrice} 
                onChange={handleFilterChange}
                className="w-full border-slate-200 rounded-lg shadow-sm px-3 py-2 text-sm"
              />
              <span className="text-slate-400 self-center">-</span>
              <input 
                type="number" 
                name="maxPrice" 
                placeholder="Max" 
                value={filters.maxPrice} 
                onChange={handleFilterChange}
                className="w-full border-slate-200 rounded-lg shadow-sm px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="latest" 
                checked={filters.latest} 
                onChange={handleFilterChange}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-semibold text-slate-600">Sort by Latest</span>
            </label>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-grow">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Products ({products.length})</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="card group flex flex-col">
                <Link to={`/product/${product.id}`} className="block relative h-48 bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
                  {product.imageUrl ? (
                     <img src={product.imageUrl} alt={product.name} className="h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : <span className="text-slate-300 font-bold text-xl">No Image</span>}
                </Link>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="text-xs text-primary-600 font-bold mb-1 tracking-wider uppercase">
                    {product.category?.name || 'Uncategorized'}
                  </div>
                  <Link to={`/product/${product.id}`} className="hover:text-primary-600 transition-colors">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className="text-xl font-extrabold text-slate-800">${product.price.toFixed(2)}</span>
                    <button onClick={() => addItem(product)} className="btn-primary py-1.5 px-4 text-sm whitespace-nowrap">Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-400 bg-white border border-slate-100 rounded-xl">
            No products match your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
