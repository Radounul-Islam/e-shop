import { create } from 'zustand';

const useUiStore = create((set, get) => ({
  toasts: [],
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },
  alertModal: {
    isOpen: false,
    title: '',
    message: '',
    onClose: null,
  },

  // Toast actions
  addToast: (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Confirm actions
  showConfirm: ({ title = 'Are you sure?', message, onConfirm, onCancel }) => {
    return new Promise((resolve) => {
      set({
        confirmModal: {
          isOpen: true,
          title,
          message,
          onConfirm: () => {
            set((state) => ({ confirmModal: { ...state.confirmModal, isOpen: false } }));
            if (onConfirm) onConfirm();
            resolve(true);
          },
          onCancel: () => {
            set((state) => ({ confirmModal: { ...state.confirmModal, isOpen: false } }));
            if (onCancel) onCancel();
            resolve(false);
          },
        },
      });
    });
  },

  // Alert actions
  showAlert: ({ title = 'Alert', message, onClose }) => {
    return new Promise((resolve) => {
      set({
        alertModal: {
          isOpen: true,
          title,
          message,
          onClose: () => {
            set((state) => ({ alertModal: { ...state.alertModal, isOpen: false } }));
            if (onClose) onClose();
            resolve(true);
          },
        },
      });
    });
  },
}));

export default useUiStore;
