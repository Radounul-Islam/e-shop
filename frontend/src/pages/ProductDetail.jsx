import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Star,
} from "lucide-react";
import useCartStore from "../store/cartStore";
import { useAuth } from "../context/AuthContext";
import useUiStore from "../store/uiStore";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCartStore();
  const { user } = useAuth();
  const { addToast } = useUiStore();

  // Review Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      addToast("Please select a star rating", "warning");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post(
        `/products/${id}/reviews`,
        { rating, comment }
      );
      // Immediately append the review to UI without refreshing
      setProduct((prev) => ({
        ...prev,
        reviews: [res.data, ...(prev.reviews || [])],
      }));
      setRating(0);
      setComment("");
      addToast("Review successfully posted!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Error posting review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product)
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        Product not found
      </div>
    );

  const avgRating = product.reviews?.length
    ? (
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length
      ).toFixed(1)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-8 font-semibold transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-slate-50 min-h-[400px] flex items-center justify-center p-8">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-cover rounded-xl shadow-lg mix-blend-multiply"
            />
          ) : (
            <span className="text-slate-300 font-bold text-4xl">No Image</span>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-sm font-black text-primary-600 uppercase tracking-widest mb-2">
            {product.category?.name || "Uncategorized"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
            {product.name}
          </h1>

          <div className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
            {product.discountPrice != null && (
              <span className="line-through text-slate-400 text-xl font-medium">৳{product.price.toFixed(2)}</span>
            )}
            <span>৳{(product.discountPrice != null ? product.discountPrice : product.price).toFixed(2)}</span>
          </div>

          <p className="text-slate-500 text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="mb-8">
            {product.stock > 10 ? (
              <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 w-fit px-4 py-2 rounded-full">
                <CheckCircle size={20} /> In Stock ({product.stock} available)
              </div>
            ) : product.stock > 0 ? (
              <div className="flex items-center gap-2 text-orange-500 font-bold bg-orange-50 w-fit px-4 py-2 rounded-full">
                <AlertCircle size={20} /> Low Stock (Only {product.stock} left!)
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500 font-bold bg-red-50 w-fit px-4 py-2 rounded-full">
                <AlertCircle size={20} /> Out of Stock
              </div>
            )}
          </div>

          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className={`py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${product.stock === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "btn-primary shadow-xl hover:shadow-2xl hover:-translate-y-1"}`}
          >
            <ShoppingCart size={24} />{" "}
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="mt-16 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Summary & Form */}
          <div className="w-full md:w-1/3">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-6">
              Customer Reviews
            </h2>

            <div className="flex items-center gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="text-5xl font-black text-slate-800">
                {avgRating}
              </div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={
                        star <= Math.round(avgRating) ? "currentColor" : "none"
                      }
                      className={
                        star <= Math.round(avgRating) ? "" : "text-slate-300"
                      }
                    />
                  ))}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  Based on {product.reviews?.length || 0} reviews
                </div>
              </div>
            </div>

            {user ? (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white border text-left border-slate-200 p-6 rounded-2xl shadow-sm"
              >
                <h3 className="font-bold text-lg mb-4 text-slate-800">
                  Write a Review
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-slate-600">
                    Overall Rating
                  </label>
                  <div
                    className="flex gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={28}
                          fill={
                            star <= (hoverRating || rating) ? "#facc15" : "none"
                          }
                          className={
                            star <= (hoverRating || rating)
                              ? "text-yellow-400"
                              : "text-slate-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-slate-600">
                    Your Review (Optional)
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                    rows="4"
                    placeholder="What did you like or dislike?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength="500"
                  />
                  <div className="text-right text-xs text-slate-400 mt-1">
                    {comment.length}/500
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center">
                <h3 className="font-bold text-lg mb-2 text-slate-800">
                  Review this product
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  You must be logged in to share your thoughts.
                </p>
                <Link
                  to="/login"
                  className="btn-primary py-2 px-6 inline-block rounded-xl"
                >
                  Login to Review
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Review List */}
          <div className="w-full md:w-2/3">
            <div className="space-y-6">
              {!product.reviews || product.reviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium">
                  No reviews yet. Be the first!
                </div>
              ) : (
                product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-b border-slate-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-slate-800">
                        {rev.user?.email || rev.user?.phone || "Anonymous"}
                      </div>
                      <div className="text-xs font-semibold text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= rev.rating ? "currentColor" : "none"}
                          className={star <= rev.rating ? "" : "text-slate-300"}
                        />
                      ))}
                    </div>
                    {rev.comment && (
                      <p className="text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
