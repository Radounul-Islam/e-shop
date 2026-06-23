import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert,
  Package,
  List,
  ShoppingBag,
  X,
  Edit,
  Trash2,
  Image,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUiStore from "../store/uiStore";

const AdminDashboard = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast, showConfirm } = useUiStore();

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const [data, setData] = useState({
    products: [],
    categories: [],
    orders: [],
    banners: [],
    professions: [],
  });

  // Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: 10,
    categoryId: "",
    imageUrl: "",
    isTrending: false,
    professionIds: [],
  });

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "" });

  // Profession Modal State
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [editingProfession, setEditingProfession] = useState(null);
  const [professionForm, setProfessionForm] = useState({ name: "" });

  // Order Details Modal State
  const [viewingOrder, setViewingOrder] = useState(null);

  // Banner Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerForm, setBannerForm] = useState({ imageUrl: "", isActive: true });

  // Order Filters State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSortField, setOrderSortField] = useState("date");
  const [orderSortDir, setOrderSortDir] = useState("desc");

  // Product Filters State
  const [productSortField, setProductSortField] = useState("name");
  const [productSortDir, setProductSortDir] = useState("asc");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/admin-login",
        { email: adminEmail, password: adminPass },
      );
      login(res.data);
      addToast("Successfully authenticated as admin.", "success");
    } catch (err) {
      addToast("Invalid admin credentials", "error");
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAdminData();
      // always fetch professions for product tagging checkboxes
      api.get("/professions").then(res => {
        setData(p => ({ ...p, professions: res.data }));
      }).catch(err => console.error(err));
    }
  }, [user, activeTab]);

  const fetchAdminData = async () => {
    try {
      if (activeTab === "categories") {
        const res = await api.get(
          "/products/categories/all",
        );
        setData((p) => ({ ...p, categories: res.data }));
      } else if (activeTab === "products") {
        const res = await api.get("/products");
        setData((p) => ({ ...p, products: res.data }));
      } else if (activeTab === "orders") {
        const res = await api.get("/admin/orders");
        setData((p) => ({ ...p, orders: res.data }));
      } else if (activeTab === "banners") {
        const res = await api.get("/admin/banners");
        setData((p) => ({ ...p, banners: res.data }));
      } else if (activeTab === "professions") {
        const res = await api.get("/professions");
        setData((p) => ({ ...p, professions: res.data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Product CRUD ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(
          `/admin/products/${editingProduct.id}`,
          productForm,
        );
        addToast("Product updated successfully.", "success");
      } else {
        await api.post(
          "/admin/products",
          productForm,
        );
        addToast("Product created successfully.", "success");
      }
      setShowProductModal(false);
      fetchAdminData();
    } catch (err) {
      addToast("Error saving product", "error");
    }
  };

  const deleteProduct = async (id) => {
    const isConfirmed = await showConfirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product?"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/admin/products/${id}`);
      addToast("Product deleted successfully.", "success");
      fetchAdminData();
    } catch (e) {
      console.error(e);
      addToast("Failed to delete product.", "error");
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice != null ? product.discountPrice : "",
        stock: product.stock,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || "",
        isTrending: product.isTrending,
        professionIds: product.professions ? product.professions.map(p => p.id) : []
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        stock: 10,
        categoryId: data.categories[0]?.id || "",
        imageUrl: "",
        isTrending: false,
        professionIds: []
      });
    }
    setShowProductModal(true);
  };

  // --- Category CRUD ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(
          `/admin/categories/${editingCategory.id}`,
          categoryForm,
        );
        addToast("Category updated successfully.", "success");
      } else {
        await api.post(
          "/admin/categories",
          categoryForm,
        );
        addToast("Category created successfully.", "success");
      }
      setShowCategoryModal(false);
      fetchAdminData();
    } catch (err) {
      addToast("Error saving category", "error");
    }
  };

  const deleteCategory = async (id) => {
    const isConfirmed = await showConfirm({
      title: "Delete Category",
      message: "Are you sure you want to delete this category? Ensure no products are linked to it."
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      addToast("Category deleted successfully.", "success");
      fetchAdminData();
    } catch (e) {
      console.error(e);
      addToast("Failed to delete category (it may have products attached).", "error");
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "" });
    }
    setShowCategoryModal(true);
  };

  // --- Profession CRUD ---
  const handleProfessionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProfession) {
        await api.put(`/admin/professions/${editingProfession.id}`, professionForm);
        addToast("Profession updated successfully.", "success");
      } else {
        await api.post("/admin/professions", professionForm);
        addToast("Profession created successfully.", "success");
      }
      setShowProfessionModal(false);
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || "Error saving profession", "error");
    }
  };

  const deleteProfession = async (id) => {
    const isConfirmed = await showConfirm({
      title: "Delete Profession",
      message: "Are you sure you want to delete this profession? It may be linked to products or users."
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/admin/professions/${id}`);
      addToast("Profession removed.", "success");
      fetchAdminData();
    } catch (e) {
      console.error(e);
      addToast("Failed to delete profession.", "error");
    }
  };

  const openProfessionModal = (profession = null) => {
    if (profession) {
      setEditingProfession(profession);
      setProfessionForm({ name: profession.name });
    } else {
      setEditingProfession(null);
      setProfessionForm({ name: "" });
    }
    setShowProfessionModal(true);
  };

  // --- Order Status & details ---
  const changeOrderStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, {
        status,
      });
      addToast("Order status updated successfully.", "success");
      fetchAdminData();
    } catch (e) {
      addToast("Failed to update status", "error");
    }
  };

  const handleDeleteOrder = async (id) => {
    const isConfirmed = await showConfirm({
      title: "Delete Order",
      message: "Are you sure you want to delete this order entirely?"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      addToast("Order removed successfully.", "success");
      fetchAdminData();
    } catch (e) {
      console.error(e);
      addToast("Failed to delete order", "error");
    }
  };

  // --- Banner CRUD ---
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/banners", bannerForm);
      setShowBannerModal(false);
      addToast("Banner added successfully.", "success");
      fetchAdminData();
    } catch (err) {
      addToast("Error saving banner", "error");
    }
  };

  const deleteBanner = async (id) => {
    const isConfirmed = await showConfirm({
      title: "Delete Banner",
      message: "Delete this banner?"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      addToast("Banner removed.", "success");
      fetchAdminData();
    } catch (e) {
      addToast("Failed to delete banner", "error");
    }
  };

  const toggleBannerStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/banners/${id}/status`, { isActive: !currentStatus });
      addToast("Banner status toggled.", "success");
      fetchAdminData();
    } catch (e) {
      addToast("Failed to update status", "error");
    }
  };

  const handleOrderSort = (field) => {
    if (orderSortField === field) {
      setOrderSortDir(orderSortDir === "asc" ? "desc" : "asc");
    } else {
      setOrderSortField(field);
      setOrderSortDir("desc");
    }
  };

  const handleProductSort = (field) => {
    if (productSortField === field) {
      setProductSortDir(productSortDir === "asc" ? "desc" : "asc");
    } else {
      setProductSortField(field);
      setProductSortDir(field === "name" ? "asc" : "desc");
    }
  };

  let displayedOrders = data.orders;
  if (activeTab === "orders") {
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      displayedOrders = displayedOrders.filter(
        (o) =>
          (o.user?.email || "").toLowerCase().includes(q) ||
          (o.user?.phone || "").toLowerCase().includes(q),
      );
    }
    displayedOrders = [...displayedOrders].sort((a, b) => {
      if (orderSortField === "status") {
        const cmp = (a.status || "").localeCompare(b.status || "");
        return orderSortDir === "asc" ? cmp : -cmp;
      }

      let valA, valB;
      if (orderSortField === "price") {
        valA = a.totalAmount;
        valB = b.totalAmount;
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      return orderSortDir === "asc" ? valA - valB : valB - valA;
    });
  }

  let displayedProducts = data.products;
  if (activeTab === "products") {
    displayedProducts = [...displayedProducts].sort((a, b) => {
      let valA, valB;
      if (productSortField === "price") {
        valA = a.price;
        valB = b.price;
      } else if (productSortField === "stock") {
        valA = a.stock;
        valB = b.stock;
      } else {
        valA = a.name;
        valB = b.name;
        const cmp = valA.localeCompare(valB);
        return productSortDir === "asc" ? cmp : -cmp;
      }
      return productSortDir === "asc" ? valA - valB : valB - valA;
    });
  }

  // Login Barrier
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
        {/* ... Existing Login Modal UI mapped exactly ... */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border-t-4 border-primary-600 animate-fade-in relative text-center pb-8">
          <button
            onClick={() => navigate("/")}
            className="absolute top-3 left-3 text-sm text-slate-400 hover:text-slate-800"
          >
            Back
          </button>
          <div className="pt-8 pb-4 flex justify-center text-primary-600">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Admin Access Portal
          </h2>

          <form
            onSubmit={handleAdminLogin}
            className="px-6 space-y-4 text-left"
          >
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-600">
                Admin Email
              </label>
              <input
                type="email"
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-600">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full btn-primary py-3 mt-2 shadow-lg"
            >
              Authenticate
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-400 px-8">
            Mock credentials: admin@admin.com / admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row relative">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 md:min-h-screen z-10 sticky top-0 md:relative">
        <div className="p-4 md:p-6 text-xl md:text-2xl font-black text-center tracking-widest border-b border-slate-800">
          <span className="text-primary-500">ADMIN</span>PANEL
        </div>
        <nav className="flex overflow-x-auto md:flex-col flex-row md:flex-grow p-3 md:p-4 gap-2 md:gap-0 md:space-y-2 md:py-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-colors font-medium text-sm md:text-base ${activeTab === "products" ? "bg-primary-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Package size={20} /> Products
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-colors font-medium text-sm md:text-base ${activeTab === "categories" ? "bg-primary-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <List size={20} /> Categories
          </button>
          <button
            onClick={() => setActiveTab("professions")}
            className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-colors font-medium text-sm md:text-base ${activeTab === "professions" ? "bg-primary-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Briefcase size={20} /> Professions
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-colors font-medium text-sm md:text-base ${activeTab === "orders" ? "bg-primary-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <ShoppingBag size={20} /> Orders
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-colors font-medium text-sm md:text-base ${activeTab === "banners" ? "bg-primary-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Image size={20} /> Banners
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 capitalize">
            {activeTab} Management
          </h1>
          <div className="flex gap-4">
            {activeTab === "products" && (
              <button
                onClick={() => openProductModal()}
                className="btn-primary py-2 flex items-center gap-2"
              >
                Add New Product
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={() => openCategoryModal()}
                className="btn-primary py-2 flex items-center gap-2"
              >
                Add New Category
              </button>
            )}
            {activeTab === "professions" && (
              <button
                onClick={() => openProfessionModal()}
                className="btn-primary py-2 flex items-center gap-2"
              >
                Add New Profession
              </button>
            )}
            {activeTab === "banners" && (
              <button
                onClick={() => { setBannerForm({ imageUrl: "", isActive: true }); setShowBannerModal(true); }}
                className="btn-primary py-2 flex items-center gap-2"
              >
                Add New Banner
              </button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === "orders" && (
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <input
                type="text"
                placeholder="Search orders by user email or phone..."
                className="w-full max-w-md border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              {orderSearch && (
                <button
                  onClick={() => setOrderSearch("")}
                  className="btn-primary py-2 px-4 shadow-sm"
                >
                  Reset / All Orders
                </button>
              )}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  {activeTab === "products" && (
                    <>
                      <th
                        className="p-4 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handleProductSort("name")}
                      >
                        Name{" "}
                        {productSortField === "name" &&
                          (productSortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handleProductSort("price")}
                      >
                        Price{" "}
                        {productSortField === "price" &&
                          (productSortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handleProductSort("stock")}
                      >
                        Stock{" "}
                        {productSortField === "stock" &&
                          (productSortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="p-4">Trending</th>
                      <th className="p-4 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "categories" && (
                    <>
                      <th className="p-4">Name</th>
                      <th className="p-4">ID</th>
                      <th className="p-4 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "orders" && (
                    <>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th
                        className="p-4 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handleOrderSort("price")}
                      >
                        Total{" "}
                        {orderSortField === "price" &&
                          (orderSortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handleOrderSort("status")}
                      >
                        Status{" "}
                        {orderSortField === "status" &&
                          (orderSortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={() => handleOrderSort("date")}
                      >
                        Date{" "}
                        {orderSortField === "date" &&
                          (orderSortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="p-4 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "banners" && (
                    <>
                      <th className="p-4">Image</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date Added</th>
                      <th className="p-4 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "professions" && (
                    <>
                      <th className="p-4">Profession Name</th>
                      <th className="p-4">ID</th>
                      <th className="p-4 text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === "products" &&
                  displayedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-4 font-semibold">{p.name}</td>
                      <td className="p-4 font-bold text-primary-600">
                        {p.discountPrice != null ? (
                          <div className="flex flex-col">
                            <span className="line-through text-slate-400 text-xs font-medium">৳{p.price.toFixed(2)}</span>
                            <span>৳{p.discountPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span>৳{p.price.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold flex items-center gap-2">
                        <span>{p.stock}</span>
                        {p.stock > 10 ? (
                          <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            In Stock
                          </span>
                        ) : p.stock > 0 ? (
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="p-4">{p.isTrending ? "Yes" : "No"}</td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => openProductModal(p)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                {activeTab === "professions" &&
                  data.professions.map((prof) => (
                    <tr key={prof.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold flex items-center gap-2">
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">{prof.name}</span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm font-mono">{prof.id}</td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => openProfessionModal(prof)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteProfession(prof.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                {activeTab === "categories" &&
                  data.categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold">{c.name}</td>
                      <td className="p-4 text-slate-400 text-sm">{c.id}</td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => openCategoryModal(c)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteCategory(c.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                {activeTab === "orders" &&
                  displayedOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 relative group">
                      <td className="p-4 text-sm font-medium">
                        {o.id.slice(0, 8)}
                      </td>
                      <td className="p-4">
                        {o.user?.email || o.user?.phone || "Guest"}
                      </td>
                      <td className="p-4 font-bold text-primary-600">
                        ৳{o.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            changeOrderStatus(o.id, e.target.value)
                          }
                          className="bg-transparent font-bold text-sm border-b border-primary-200 outline-none p-1 cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-slate-500 text-right">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => setViewingOrder(o)}
                          className="text-blue-500 hover:text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-md text-xs uppercase tracking-wide"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                {activeTab === "banners" &&
                  data.banners?.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <img src={b.imageUrl} alt="banner" className="h-16 w-32 object-cover rounded-md shadow-sm border border-slate-200" />
                      </td>
                      <td className="p-4 font-bold">
                        <button 
                          onClick={() => toggleBannerStatus(b.id, b.isActive)}
                          className={`px-3 py-1 rounded-full text-xs uppercase transition-colors ${b.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                        >
                           {b.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteBanner(b.id)} className="text-red-500 hover:text-red-700 p-2">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {data[activeTab]?.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No {activeTab} found.
            </div>
          )}
        </div>
      </main>

      {/* Product Editor Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              <X size={24} />
            </button>
            <div className="p-6 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-2xl font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border p-2 rounded-lg"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    required
                    className="w-full border p-2 rounded-lg"
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Price (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full border p-2 rounded-lg"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-primary-600">
                    Discount Price (৳) Optional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border p-2 rounded-lg border-primary-200"
                    value={productForm.discountPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, discountPrice: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border p-2 rounded-lg"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="w-full border p-2 rounded-lg"
                    value={productForm.imageUrl}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  <select
                    required
                    className="w-full border p-2 rounded-lg"
                    value={productForm.categoryId}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        categoryId: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category...</option>
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isTrending}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          isTrending: e.target.checked,
                        })
                      }
                      className="rounded text-primary-600 focus:ring-primary-500w-5 h-5"
                    />
                    <span className="font-semibold text-sm">
                      Feature as Trending
                    </span>
                  </label>
                </div>

                {/* Profession Tagging */}
                {data.professions.length > 0 && (
                  <div className="col-span-2 mt-2">
                    <label className="block text-sm font-semibold mb-2 text-slate-700 flex items-center gap-2">
                      <Briefcase size={15} className="text-primary-600" />
                      Tag by Profession (for personalized sorting)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                      {data.professions.map((prof) => {
                        const isChecked = productForm.professionIds.includes(prof.id);
                        return (
                          <label
                            key={prof.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm font-semibold select-none ${
                              isChecked
                                ? "border-primary-400 bg-primary-50 text-primary-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-primary-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked
                                  ? productForm.professionIds.filter((id) => id !== prof.id)
                                  : [...productForm.professionIds, prof.id];
                                setProductForm({ ...productForm, professionIds: updated });
                              }}
                              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                            />
                            {prof.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Editor Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              <X size={24} />
            </button>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded-lg"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profession Editor Modal */}
      {showProfessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in-fast">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setShowProfessionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="blue-gradient p-6 rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <Briefcase size={24} />
                <h2 className="text-xl font-bold">
                  {editingProfession ? "Edit Profession" : "Add New Profession"}
                </h2>
              </div>
              <p className="text-primary-100 text-xs mt-1 font-semibold">
                This will appear as a checklist option for customers on login
              </p>
            </div>

            <form onSubmit={handleProfessionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">
                  Profession Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer, Doctor, Teacher..."
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  value={professionForm.name}
                  onChange={(e) =>
                    setProfessionForm({ ...professionForm, name: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfessionModal(false)}
                  className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6">
                  {editingProfession ? "Save Changes" : "Create Profession"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              <X size={24} />
            </button>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <p className="text-sm text-slate-500">ID: {viewingOrder.id}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Customer Info
                  </h3>
                  <p className="font-semibold text-slate-800">
                    {viewingOrder.user?.email ||
                      viewingOrder.user?.phone ||
                      "Guest"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Payment Method
                  </h3>
                  <p className="font-semibold text-slate-800">
                    {viewingOrder.paymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Delivery Address
                  </h3>
                  <p className="text-slate-800">
                    {viewingOrder.deliveryAddress}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b pb-2">
                  Items
                </h3>
                <div className="space-y-3">
                  {viewingOrder.items?.map((i) => (
                    <div
                      key={i.id}
                      className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400 w-6">
                          {i.quantity}x
                        </span>
                        <span className="font-semibold">
                          {i.product?.name || "Unknown Product (Deleted)"}
                        </span>
                      </div>
                      <span className="font-bold text-primary-600">
                        ৳{(i.price * i.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <h3 className="font-bold text-lg">Total Amount</h3>
                <span className="text-2xl font-black text-primary-600">
                  ৳{viewingOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Editor Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative my-8">
            <button
              onClick={() => setShowBannerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              <X size={24} />
            </button>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold">Add New Banner</h2>
            </div>
            <form onSubmit={handleBannerSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/banner.jpg"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={bannerForm.isActive}
                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5 cursor-pointer"
                  />
                  Active (show on Home Page)
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6">
                  Add Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
