import React from 'react';
import useUiStore from '../store/uiStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const UINotificationRenderer = () => {
  const { toasts, removeToast, confirmModal, alertModal } = useUiStore();

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />;
      case 'error':
        return <XCircle className="text-rose-500 w-5 h-5 shrink-0" />;
      default:
        return <Info className="text-blue-500 w-5 h-5 shrink-0" />;
    }
  };

  const getToastBg = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-50/95';
      case 'warning':
        return 'border-amber-500/20 bg-amber-50/95';
      case 'error':
        return 'border-rose-500/20 bg-rose-50/95';
      default:
        return 'border-blue-500/20 bg-blue-50/95';
    }
  };

  return (
    <>
      {/* Toast Notifications container */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in ${getToastBg(
              toast.type
            )}`}
          >
            {getToastIcon(toast.type)}
            <div className="grow text-sm font-semibold text-slate-800">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in-fast">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <AlertTriangle className="w-8 h-8 shrink-0 animate-bounce" />
                <h3 className="text-xl font-bold text-slate-800">{confirmModal.title}</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                {confirmModal.message}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={confirmModal.onCancel}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in-fast">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-primary-600">
                <Info className="w-8 h-8 shrink-0" />
                <h3 className="text-xl font-bold text-slate-800">{alertModal.title}</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                {alertModal.message}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={alertModal.onClose}
                className="btn-primary py-2 px-6 rounded-xl font-bold text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UINotificationRenderer;
