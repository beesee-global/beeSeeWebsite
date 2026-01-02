// CheckoutModal.tsx - E-commerce Checkout Form
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ShoppingCart,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  X,
} from "lucide-react";

import "../../../../assets/css/productDetails.css";

interface Product {
  pid: string;
  name: string;
  price?: number;
}

interface Props {
  open: boolean;
  product: Product;
  onClose: () => void;
}

interface CheckoutForm {
  // Customer Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Shipping Address
  address: string;
  city: string;
  province: string;
  postalCode: string;

  // Payment
  paymentMethod: string;
  
  // Additional
  quantity: number;
  notes: string;
}

const defaultForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  paymentMethod: "cod",
  quantity: 1,
  notes: "",
};

const provinces = [
  "Metro Manila",
  "Cavite",
  "Laguna",
  "Batangas",
  "Rizal",
  "Bulacan",
  "Pampanga",
  "Cebu",
  "Davao",
  // Add more provinces as needed
];

const paymentMethods = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "gcash", label: "GCash" },
  { value: "paymaya", label: "PayMaya" },
  { value: "card", label: "Credit/Debit Card" },
  { value: "bank", label: "Bank Transfer" },
];

const currency = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);

const CheckoutModal: React.FC<Props> = ({ open, product, onClose }) => {
  const [form, setForm] = useState<CheckoutForm>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const shippingFee = 150;
  const subtotal = (product.price || 0) * form.quantity;
  const total = subtotal + shippingFee;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [open]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer info
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+63|0)[0-9]{10}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid Philippine phone number";
    }

    // Shipping address
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.province) newErrors.province = "Province is required";
    if (!form.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^[0-9]{4}$/.test(form.postalCode)) {
      newErrors.postalCode = "Invalid postal code (4 digits)";
    }

    // Quantity
    if (form.quantity < 1) newErrors.quantity = "Quantity must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    setForm((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta),
    }));
  };

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setSnackbar({
        open: true,
        type: "error",
        message: "Please fill in all required fields correctly",
      });
      return;
    }

    setLoading(true);

    try {
      // API call - Replace with your actual endpoint
      const orderData = {
        product_id: product.pid,
        product_name: product.name,
        quantity: form.quantity,
        subtotal,
        shipping_fee: shippingFee,
        total,
        customer: {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
        },
        shipping_address: {
          address: form.address,
          city: form.city,
          province: form.province,
          postal_code: form.postalCode,
        },
        payment_method: form.paymentMethod,
        notes: form.notes,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to process order");

      setSnackbar({
        open: true,
        type: "success",
        message: "Order placed successfully! We'll contact you shortly.",
      });

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        type: "error",
        message: "Failed to place order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        className="checkout-modal"
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShoppingCart size={24} color="var(--brand-dark)" />
            <span className="modal-title">Checkout</span>
          </div>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </div>

        {/* Content */}
        <DialogContent className="modal-content">
          <form id="checkout-form" onSubmit={handleSubmit}>
            {/* Order Summary */}
            <div className="order-summary">
              <h3 style={{ marginBottom: 16, fontSize: "1.1rem", fontWeight: 700 }}>
                Order Summary
              </h3>
              <div className="summary-item">
                <span>{product.name}</span>
                <span>{currency(product.price || 0)}</span>
              </div>
              <div className="summary-item">
                <span>Quantity</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    style={{
                      width: 32,
                      height: 32,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontWeight: 600, minWidth: 30, textAlign: "center" }}>
                    {form.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    style={{
                      width: 32,
                      height: 32,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="summary-item">
                <span>Shipping Fee</span>
                <span>{currency(shippingFee)}</span>
              </div>
              <div className="summary-item total">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="form-section">
              <h3 className="form-section-title">Customer Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">First Name *</label>
                  <div className="form-input-wrapper">
                    <User size={18} className="form-input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Juan"
                      className="form-input"
                    />
                  </div>
                  {errors.firstName && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      {errors.firstName}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Last Name *</label>
                  <div className="form-input-wrapper">
                    <User size={18} className="form-input-icon" />
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Dela Cruz"
                      className="form-input"
                    />
                  </div>
                  {errors.lastName && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Email *</label>
                <div className="form-input-wrapper">
                  <Mail size={18} className="form-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@example.com"
                    className="form-input"
                  />
                </div>
                {errors.email && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="form-label">Phone Number *</label>
                <div className="form-input-wrapper">
                  <Phone size={18} className="form-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+63 912 345 6789"
                    className="form-input"
                  />
                </div>
                {errors.phone && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="form-section">
              <h3 className="form-section-title">Shipping Address</h3>
              
              <div className="form-field">
                <label className="form-label">Street Address *</label>
                <div className="form-input-wrapper">
                  <MapPin size={18} className="form-input-icon" />
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Barangay Example"
                    className="form-input"
                  />
                </div>
                {errors.address && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    {errors.address}
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">City *</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Quezon City"
                      className="form-input"
                      style={{ paddingLeft: 12 }}
                    />
                  </div>
                  {errors.city && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      {errors.city}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Province *</label>
                  <div className="form-input-wrapper">
                    <select
                      name="province"
                      value={form.province}
                      onChange={handleChange}
                      className="form-select"
                      style={{ paddingLeft: 12 }}
                    >
                      <option value="">Select Province</option>
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.province && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      {errors.province}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Postal Code *</label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="1100"
                    maxLength={4}
                    className="form-input"
                    style={{ paddingLeft: 12 }}
                  />
                </div>
                {errors.postalCode && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    {errors.postalCode}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3 className="form-section-title">Payment Method</h3>
              
              <div className="form-field">
                <label className="form-label">Select Payment *</label>
                <div className="form-input-wrapper">
                  <CreditCard size={18} className="form-input-icon" />
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="form-section">
              <h3 className="form-section-title">Additional Notes (Optional)</h3>
              
              <div className="form-field">
                <div className="form-input-wrapper">
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Special instructions, preferred delivery time, etc."
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>
          </form>
        </DialogContent>

        {/* Footer */}
        <DialogActions className="modal-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              `Place Order - ${currency(total)}`
            )}
          </button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.type}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CheckoutModal;