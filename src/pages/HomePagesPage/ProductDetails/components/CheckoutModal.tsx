// components/CheckoutModal.tsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, X, Package, CreditCard, Truck, Wallet, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import '../../../../assets/css/CheckoutModal.css';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    pid: string;
    name: string;
    price?: number;
    formattedPrice?: string;
    gallery?: string[];
  };
}

interface PhilippineCity {
  id: string;
  name: string;
  region: string;
  province: string;
  postalCode: string;
}

// Mock Philippine cities data (in production, fetch from API)
const MOCK_PHILIPPINE_CITIES: PhilippineCity[] = [
  { id: '1', name: 'Manila', region: 'NCR', province: 'Metro Manila', postalCode: '1000' },
  { id: '2', name: 'Quezon City', region: 'NCR', province: 'Metro Manila', postalCode: '1100' },
  { id: '3', name: 'Makati', region: 'NCR', province: 'Metro Manila', postalCode: '1200' },
  { id: '4', name: 'Taguig', region: 'NCR', province: 'Metro Manila', postalCode: '1630' },
  { id: '5', name: 'Pasig', region: 'NCR', province: 'Metro Manila', postalCode: '1600' },
  { id: '6', name: 'Mandaluyong', region: 'NCR', province: 'Metro Manila', postalCode: '1550' },
  { id: '7', name: 'San Juan', region: 'NCR', province: 'Metro Manila', postalCode: '1500' },
  { id: '8', name: 'Cebu City', region: 'VII', province: 'Cebu', postalCode: '6000' },
  { id: '9', name: 'Davao City', region: 'XI', province: 'Davao del Sur', postalCode: '8000' },
  { id: '10', name: 'Baguio', region: 'CAR', province: 'Benguet', postalCode: '2600' },
  { id: '11', name: 'Iloilo City', region: 'VI', province: 'Iloilo', postalCode: '5000' },
  { id: '12', name: 'Bacolod', region: 'VI', province: 'Negros Occidental', postalCode: '6100' },
  { id: '13', name: 'Cagayan de Oro', region: 'X', province: 'Misamis Oriental', postalCode: '9000' },
  { id: '14', name: 'Zamboanga City', region: 'IX', province: 'Zamboanga del Sur', postalCode: '7000' },
  { id: '15', name: 'General Santos', region: 'XII', province: 'South Cotabato', postalCode: '9500' },
];

// Image URLs for actual payment method logos - Updated with better sources
const PAYMENT_LOGOS = {
  // Card logos
  visa: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
  mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  amex: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
  jcb: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg',
  
  // E-wallet logos (using smaller, more reliable sources)
  gcash: '/paymentLogos/gcash.png',
  maya: '/paymentLogos/maya.png',
  grabpay: '/paymentLogos/grab.png', // Note: capital G
  
  // Payment center logos - using your local PNG files
  sevenEleven: '/paymentLogos/7leven.png',
  cebuana: '/paymentLogos/cebuana.png', // Using the simpler filename
  palawan: '/paymentLogos/palawan.png'
};

// Enhanced payment methods with actual logos
const PAYMENT_METHODS = {
  COD: {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: Truck,
    hasOptions: false,
    description: 'Pay when you receive your order'
  },
  CARD: {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    hasOptions: true,
    options: [
      { 
        id: 'visa', 
        name: 'Visa', 
        logoUrl: PAYMENT_LOGOS.visa,
        logoAlt: 'Visa',
        type: 'card'
      },
      { 
        id: 'mastercard', 
        name: 'Mastercard', 
        logoUrl: PAYMENT_LOGOS.mastercard,
        logoAlt: 'Mastercard',
        type: 'card'
      },
      { 
        id: 'amex', 
        name: 'American Express', 
        logoUrl: PAYMENT_LOGOS.amex,
        logoAlt: 'American Express',
        type: 'card'
      },
      { 
        id: 'jcb', 
        name: 'JCB', 
        logoUrl: PAYMENT_LOGOS.jcb,
        logoAlt: 'JCB',
        type: 'card'
      }
    ],
    description: 'All banks accepted'
  },
  EWALLET: {
    id: 'ewallet',
    name: 'E-Wallet',
    icon: Wallet,
    hasOptions: true,
    options: [
      { 
        id: 'gcash', 
        name: 'GCash', 
        logoUrl: PAYMENT_LOGOS.gcash,
        logoAlt: 'GCash',
        type: 'ewallet'
      },
      { 
        id: 'maya', 
        name: 'Maya', 
        logoUrl: PAYMENT_LOGOS.maya,
        logoAlt: 'Maya',
        type: 'ewallet'
      },
      { 
        id: 'grabpay', 
        name: 'GrabPay', 
        logoUrl: PAYMENT_LOGOS.grabpay,
        logoAlt: 'GrabPay',
        type: 'ewallet'
      }
    ],
    description: 'Payment Centers Available'
  },
  PAYMENT_CENTER: {
    id: 'payment_center',
    name: 'Payment Center',
    icon: Package,
    hasOptions: true,
    options: [
      { 
        id: '7eleven', 
        name: '7-Eleven', 
        logoUrl: PAYMENT_LOGOS.sevenEleven,
        logoAlt: '7-Eleven',
        type: 'payment_center'
      },
      { 
        id: 'cebuana', 
        name: 'Cebuana Lhuillier', 
        logoUrl: PAYMENT_LOGOS.cebuana,
        logoAlt: 'Cebuana Lhuillier',
        type: 'payment_center'
      },
      { 
        id: 'palawan', 
        name: 'Palawan Express', 
        logoUrl: PAYMENT_LOGOS.palawan,
        logoAlt: 'Palawan Express',
        type: 'payment_center'
      }
    ],
    description: 'Over-the-counter payment'
  }
};

// Mock backend API URLs
const API_URLS = {
  CHECKOUT: '/api/checkout',
  CITIES: 'https://psgc.rootscratch.com/api/cities', // Using external API
  PAYMENT: '/api/payment/process',
};

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  cityId: string;
  postalCode: string;
  paymentMethod: string;
  paymentSubMethod?: string;
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  };
  notes?: string;
}

// Card details form component
const CardDetailsForm: React.FC<{
  cardDetails: any;
  onChange: (details: any) => void;
  disabled: boolean;
}> = ({ cardDetails, onChange, disabled }) => {
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  return (
    <div className="mt-4 p-4 rounded-xl" style={{
      background: 'rgba(253, 203, 0, 0.05)',
      border: '1px solid rgba(253, 203, 0, 0.2)'
    }}>
      <h4 className="bee-body-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-light)' }}>
        <CreditCard size={16} />
        Card Details
      </h4>
      
      <div className="space-y-3">
        {/* Card Number */}
        <div>
          <label className="block bee-body-xs mb-1" style={{ color: 'var(--muted)' }}>
            Card Number
          </label>
          <input
            type="text"
            className="input-default"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            value={cardDetails?.number || ''}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value);
              onChange({ ...cardDetails, number: formatted });
            }}
            disabled={disabled}
          />
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block bee-body-xs mb-1" style={{ color: 'var(--muted)' }}>
            Cardholder Name
          </label>
          <input
            type="text"
            className="input-default"
            placeholder="JUAN DELA CRUZ"
            value={cardDetails?.name || ''}
            onChange={(e) => onChange({ ...cardDetails, name: e.target.value.toUpperCase() })}
            disabled={disabled}
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block bee-body-xs mb-1" style={{ color: 'var(--muted)' }}>
              Expiry Date (MM/YY)
            </label>
            <input
              type="text"
              className="input-default"
              placeholder="MM/YY"
              maxLength={5}
              value={cardDetails?.expiry || ''}
              onChange={(e) => {
                const formatted = formatExpiry(e.target.value);
                onChange({ ...cardDetails, expiry: formatted });
              }}
              disabled={disabled}
            />
          </div>
          
          <div>
            <label className="block bee-body-xs mb-1" style={{ color: 'var(--muted)' }}>
              CVV
            </label>
            <input
              type="password"
              className="input-default"
              placeholder="123"
              maxLength={4}
              value={cardDetails?.cvv || ''}
              onChange={(e) => onChange({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '') })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, product }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cities, setCities] = useState<PhilippineCity[]>(MOCK_PHILIPPINE_CITIES);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<PhilippineCity | null>(null);
  const [expandedPayment, setExpandedPayment] = useState<string | null>('cod');
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    cityId: '',
    postalCode: '',
    paymentMethod: 'cod',
    paymentSubMethod: '',
    cardDetails: {
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    },
    notes: ''
  });

  // Load cities from external API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        // Uncomment in production when CORS is configured
        // const response = await fetch(API_URLS.CITIES);
        // const data = await response.json();
        // setCities(data);
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setCities(MOCK_PHILIPPINE_CITIES);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        setCities(MOCK_PHILIPPINE_CITIES);
      } finally {
        setIsLoadingCities(false);
      }
    };

    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  const handleCityChange = (cityId: string) => {
    const city = cities.find(c => c.id === cityId) || null;
    setSelectedCity(city);
    setFormData(prev => ({
      ...prev,
      cityId,
      postalCode: city?.postalCode || ''
    }));
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setExpandedPayment(methodId);
    setFormData(prev => ({
      ...prev,
      paymentMethod: methodId,
      paymentSubMethod: '',
      cardDetails: methodId === 'card' ? prev.cardDetails : undefined
    }));
  };

  const handlePaymentSubMethodSelect = (subMethodId: string) => {
    setFormData(prev => ({
      ...prev,
      paymentSubMethod: subMethodId
    }));
  };

  // Mock API call for checkout
  const submitCheckoutToAPI = async (checkoutData: any) => {
    setIsProcessing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, return mock response
      return {
        success: true,
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        paymentReference: Math.random().toString(36).substr(2, 10).toUpperCase(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock payment processing
  const processPayment = async (paymentData: any) => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: 'completed',
      paymentMethod: paymentData.method,
      amount: paymentData.amount
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.cityId) {
      alert('Please fill in all required fields');
      return;
    }

    // Payment validation
    if (formData.paymentMethod === 'card' && (!formData.cardDetails?.number || !formData.cardDetails?.expiry || !formData.cardDetails?.cvv)) {
      alert('Please enter all card details');
      return;
    }

    if ((formData.paymentMethod === 'ewallet' || formData.paymentMethod === 'payment_center') && !formData.paymentSubMethod) {
      alert('Please select a payment option');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation (basic PH format)
    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      alert('Please enter a valid Philippine phone number (e.g., 09123456789)');
      return;
    }

    try {
      // Prepare checkout data
      const checkoutData = {
        product: {
          id: product.pid,
          name: product.name,
          price: product.price,
          image: product.gallery?.[0]
        },
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          shippingAddress: {
            street: formData.address,
            city: selectedCity?.name,
            province: selectedCity?.province,
            region: selectedCity?.region,
            postalCode: formData.postalCode,
            country: 'Philippines'
          }
        },
        payment: {
          method: formData.paymentMethod,
          subMethod: formData.paymentSubMethod,
          cardDetails: formData.paymentMethod === 'card' ? {
            last4: formData.cardDetails?.number?.slice(-4),
            type: formData.cardDetails?.number?.startsWith('4') ? 'Visa' : 'Mastercard'
          } : undefined,
          amount: product.price ? product.price + 150 : 0,
          currency: 'PHP'
        },
        order: {
          notes: formData.notes,
          source: 'website',
          timestamp: new Date().toISOString()
        }
      };

      // 1. Process payment (mock)
      const paymentResult = await processPayment({
        method: formData.paymentMethod,
        amount: checkoutData.payment.amount,
        currency: 'PHP'
      });

      if (!paymentResult.success) {
        throw new Error('Payment processing failed');
      }

      // 2. Submit checkout (mock)
      const checkoutResult = await submitCheckoutToAPI(checkoutData);

      if (checkoutResult.success) {
        console.log('Checkout successful:', {
          orderId: checkoutResult.orderId,
          paymentReference: paymentResult.transactionId,
          customer: formData
        });

        // Show success state
        setIsSubmitted(true);

        // Reset after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            address: '',
            cityId: '',
            postalCode: '',
            paymentMethod: 'cod',
            paymentSubMethod: '',
            cardDetails: {
              number: '',
              expiry: '',
              cvv: '',
              name: ''
            },
            notes: ''
          });
          setSelectedCity(null);
          setExpandedPayment('cod');
        }, 5000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Sorry, something went wrong with your order. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isSubmitted && !isProcessing) {
      onClose();
      // Reset form after closing
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          address: '',
          cityId: '',
          postalCode: '',
          paymentMethod: 'cod',
          paymentSubMethod: '',
          cardDetails: {
            number: '',
            expiry: '',
            cvv: '',
            name: ''
          },
          notes: ''
        });
        setSelectedCity(null);
        setExpandedPayment('cod');
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-4 md:p-8 lg:p-10"
        style={{
          position: 'relative',
          zIndex: 10000,
          background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.98), rgba(20, 20, 20, 0.98))',
          border: '1px solid rgba(253, 204, 0, 0.35)',
          boxShadow: '0 30px 90px rgba(253, 204, 0, 0.25)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="text-center py-8 md:py-16">
            <div
              className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.3), rgba(255, 215, 0, 0.2))',
                border: '2px solid rgba(253, 204, 0, 0.5)',
                animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <CheckCircle2 size={32} className="md:w-12 md:h-12" style={{ color: 'var(--beesee-gold)' }} />
            </div>
            <h3 className="bee-title-md mb-4 md:mb-5 px-4" style={{ color: 'var(--text-light)' }}>
              Order Confirmed Successfully!
            </h3>
            <p className="bee-body max-w-md mx-auto px-4 mb-6">
              Thank you for your purchase! Your order has been confirmed.
              We'll send you a confirmation email shortly with tracking details.
            </p>
            <div className="mt-6 md:mt-8 p-4 md:p-5 rounded-xl max-w-md mx-auto" style={{ 
              background: 'rgba(253, 204, 0, 0.08)',
              border: '1px solid rgba(253, 204, 0, 0.2)'
            }}>
              <p className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                📦 Estimated delivery: 3-5 business days
              </p>
              <p className="bee-body-sm mt-2" style={{ color: 'var(--muted)' }}>
                ✉️ Confirmation sent to: {formData.email}
              </p>
              {formData.paymentMethod === 'card' && (
                <p className="bee-body-sm mt-2" style={{ color: 'var(--muted)' }}>
                  💳 Paid with: {formData.cardDetails?.number?.slice(-4) ? `Card ending in ${formData.cardDetails.number.slice(-4)}` : 'Card'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6 md:mb-8 lg:mb-10">
              <div className="flex-1 min-w-0">
                <h3 className="bee-title-sm mb-2 truncate" style={{ color: 'var(--text-light)' }}>
                  Complete Your Purchase
                </h3>
                <p className="bee-body-sm truncate" style={{ color: 'var(--muted)' }}>
                  {product.name}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Package size={16} style={{ color: 'var(--beesee-gold)', flexShrink: 0 }} />
                  <span className="bee-body-sm truncate" style={{ color: 'var(--beesee-gold)' }}>
                    {product.formattedPrice || 'Price not available'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 md:w-11 md:h-11 ml-4 flex-shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-white/10 hover:rotate-90"
                style={{ color: 'var(--muted)' }}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader size={20} className="animate-spin" /> : <X size={20} className="md:w-6 md:h-6" />}
              </button>
            </div>

            {/* Product Preview - Responsive */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="mb-6 md:mb-8 p-4 md:p-5 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-3 md:gap-4">
                  <img 
                    src={product.gallery[0]} 
                    alt={product.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="bee-body-sm font-medium mb-1 truncate" style={{ color: 'var(--text-light)' }}>
                      {product.name}
                    </h4>
                    <p className="bee-body-sm truncate" style={{ color: 'var(--muted)' }}>
                      Product ID: {product.pid}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields - Responsive Grid */}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Full Name */}
              <div>
                <label className="block bee-body-sm mb-2 md:mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-default"
                  placeholder="Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={isProcessing}
                />
              </div>

              {/* Email and Phone in grid on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block bee-body-sm mb-2 md:mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-default"
                    placeholder="juan.delacruz@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block bee-body-sm mb-2 md:mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-default"
                    placeholder="09123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block bee-body-sm mb-2 md:mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Shipping Address (Street, Barangay) *
                </label>
                <textarea
                  required
                  className="input-default min-h-[80px] md:min-h-[100px]"
                  placeholder="House number, Street, Barangay"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={isProcessing}
                />
              </div>

              {/* City and Postal Code - Responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block bee-body-sm mb-2 md:mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                    City *
                  </label>
                  <div className="relative">
                    <select
                      required
                      className="input-default appearance-none pr-10"
                      value={formData.cityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      disabled={isProcessing || isLoadingCities}
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.province}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      {isLoadingCities ? (
                        <Loader size={16} className="animate-spin" style={{ color: 'var(--muted)' }} />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block bee-body-sm mb-2 md:mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="input-default"
                    placeholder="Auto-filled from city"
                    value={formData.postalCode}
                    readOnly
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Payment Method Section */}
              <div>
                <h3 className="bee-title-sm mb-4" style={{ color: 'var(--text-light)' }}>
                  Payment Method
                </h3>
                
                {/* Shipping Discount Banner */}
                <div className="mb-4 p-3 rounded-lg flex items-center justify-between" style={{
                  background: 'linear-gradient(135deg, rgba(253, 203, 0, 0.1), rgba(255, 215, 0, 0.05))',
                  border: '1px solid rgba(253, 203, 0, 0.2)'
                }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                      background: 'rgba(253, 203, 0, 0.2)'
                    }}>
                      <Truck size={16} style={{ color: 'var(--beesee-gold)' }} />
                    </div>
                    <span className="bee-body-sm font-medium" style={{ color: 'var(--text-light)' }}>
                      Shipping Discount
                    </span>
                  </div>
                  <span className="bee-body font-bold" style={{ color: 'var(--beesee-gold)' }}>
                    -₱199.00
                  </span>
                </div>

                {/* Payment Methods List */}
                <div className="space-y-3">
                  {Object.values(PAYMENT_METHODS).map((method) => {
                    const Icon = method.icon;
                    const isExpanded = expandedPayment === method.id;
                    const isSelected = formData.paymentMethod === method.id;
                    
                    return (
                      <div 
                        key={method.id}
                        className="rounded-xl overflow-hidden transition-all"
                        style={{
                          border: isSelected ? '1px solid rgba(253, 203, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(253, 203, 0, 0.08)' : 'rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        {/* Payment Method Header with Radio Button */}
                        <div 
                          className="p-4 cursor-pointer flex items-center justify-between"
                          onClick={() => handlePaymentMethodSelect(method.id)}
                          style={{ opacity: isProcessing ? 0.6 : 1 }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Radio Button */}
                            <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={isSelected}
                                onChange={() => handlePaymentMethodSelect(method.id)}
                                className="hidden"
                                disabled={isProcessing}
                                id={`payment-${method.id}`}
                              />
                              <label 
                                htmlFor={`payment-${method.id}`}
                                className="flex items-center justify-center w-5 h-5 rounded-full border-2 cursor-pointer"
                                style={{ 
                                  borderColor: isSelected ? 'var(--beesee-gold)' : 'var(--muted)'
                                }}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full" style={{ 
                                    background: 'var(--beesee-gold)' 
                                  }}></div>
                                )}
                              </label>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0" style={{
                                background: isSelected ? 'var(--beesee-gold)' : 'rgba(255, 255, 255, 0.1)'
                              }}>
                                <Icon size={20} style={{ color: isSelected ? '#000' : 'var(--text-light)' }} />
                              </div>
                              <div>
                                <h4 className="bee-body font-medium" style={{ color: 'var(--text-light)' }}>
                                  {method.name}
                                </h4>
                                {method.description && (
                                  <p className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                                    {method.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {method.hasOptions && (
                              <span className="bee-body-sm px-2 py-1 rounded" style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'var(--muted)'
                              }}>
                                {method.options.length} options
                              </span>
                            )}
                            {method.hasOptions && (
                              isExpanded ? (
                                <ChevronUp size={20} style={{ color: 'var(--muted)' }} />
                              ) : (
                                <ChevronDown size={20} style={{ color: 'var(--muted)' }} />
                              )
                            )}
                          </div>
                        </div>

                        {/* Payment Method Options (Dropdown) */}
                        {isExpanded && method.hasOptions && (
                          <div className="px-4 pb-4">
                            <div className="pt-3 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                              <div className="space-y-2">
                                {method.options.map((option: any) => {
                                  const isSubSelected = formData.paymentSubMethod === (option.id || option);
                                  const optionName = option.name || option;
                                  const optionId = option.id || option;
                                  
                                  return (
                                    <label 
                                      key={optionId}
                                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5"
                                      style={{
                                        background: isSubSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        border: isSubSelected ? '1px solid var(--beesee-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                                        opacity: isProcessing ? 0.6 : 1
                                      }}
                                    >
                                      {/* Radio Button for Sub-option */}
                                      <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                                        <input
                                          type="radio"
                                          name={`paymentSubMethod-${method.id}`}
                                          value={optionId}
                                          checked={isSubSelected}
                                          onChange={() => handlePaymentSubMethodSelect(optionId)}
                                          className="hidden"
                                          disabled={isProcessing}
                                          id={`payment-sub-${method.id}-${optionId}`}
                                        />
                                        <label 
                                          htmlFor={`payment-sub-${method.id}-${optionId}`}
                                          className="flex items-center justify-center w-4 h-4 rounded-full border-2 cursor-pointer"
                                          style={{ 
                                            borderColor: isSubSelected ? 'var(--beesee-gold)' : 'var(--muted)'
                                          }}
                                        >
                                          {isSubSelected && (
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ 
                                              background: 'var(--beesee-gold)' 
                                            }}></div>
                                          )}
                                        </label>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                        {/* Actual Logo with proper styling */}
                                        <div className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 overflow-hidden" 
                                          style={{ 
                                            background: '#fff',
                                            padding: option.type === 'card' ? '2px' : '4px'
                                          }}>
                                          {option.logoUrl ? (
                                            <img 
                                              src={option.logoUrl} 
                                              alt={option.logoAlt || optionName}
                                              className="w-full h-full object-contain"
                                              onError={(e) => {
                                                // Fallback if image fails to load
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                  parent.innerHTML = `<span class="bee-body-sm font-bold" style="color: #000">${optionName.charAt(0)}</span>`;
                                                  parent.style.display = 'flex';
                                                  parent.style.alignItems = 'center';
                                                  parent.style.justifyContent = 'center';
                                                }
                                              }}
                                            />
                                          ) : (
                                            <span className="bee-body-sm font-bold" style={{ color: '#000' }}>
                                              {optionName.charAt(0)}
                                            </span>
                                          )}
                                        </div>
                                        <span className="bee-body-sm" style={{ color: 'var(--text-light)' }}>
                                          {optionName}
                                        </span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                              
                              {/* Additional Information for Selected Option */}
                              {method.id === 'card' && formData.paymentSubMethod && (
                                <div className="mt-4">
                                  <div className="p-3 rounded-lg flex items-center gap-3" style={{
                                    background: 'rgba(253, 203, 0, 0.05)',
                                    border: '1px solid rgba(253, 203, 0, 0.2)'
                                  }}>
                                    <CreditCard size={20} style={{ color: 'var(--beesee-gold)' }} />
                                    <div>
                                      <p className="bee-body-sm font-medium" style={{ color: 'var(--text-light)' }}>
                                        {formData.paymentSubMethod === 'visa' && 'Visa'}
                                        {formData.paymentSubMethod === 'mastercard' && 'Mastercard'}
                                        {formData.paymentSubMethod === 'amex' && 'American Express'}
                                        {formData.paymentSubMethod === 'jcb' && 'JCB'}
                                      </p>
                                      <p className="bee-body-xs" style={{ color: 'var(--muted)' }}>
                                        All banks accepted. Secure payment processed.
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Card Details Form */}
                                  {formData.paymentMethod === 'card' && (
                                    <CardDetailsForm
                                      cardDetails={formData.cardDetails}
                                      onChange={(details) => setFormData(prev => ({ ...prev, cardDetails: details }))}
                                      disabled={isProcessing}
                                    />
                                  )}
                                </div>
                              )}
                              
                              {/* E-Wallet Instructions */}
                              {method.id === 'ewallet' && formData.paymentSubMethod && (
                                <div className="mt-4 p-3 rounded-lg" style={{ 
                                  background: 'rgba(253, 203, 0, 0.08)'
                                }}>
                                  <p className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                                    {formData.paymentSubMethod === 'gcash' && '💡 Payment should be completed within 30 mins. Accessible 24/7.'}
                                    {formData.paymentSubMethod === 'maya' && '💡 Payment should be completed within 30 mins. Accessible 24/7.'}
                                    {formData.paymentSubMethod === 'grabpay' && '💡 Pay using your GrabPay wallet. Quick and secure.'}
                                  </p>
                                </div>
                              )}
                              
                              {/* Payment Center Instructions */}
                              {method.id === 'payment_center' && formData.paymentSubMethod && (
                                <div className="mt-4 p-3 rounded-lg" style={{ 
                                  background: 'rgba(253, 203, 0, 0.08)'
                                }}>
                                  <p className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                                    {formData.paymentSubMethod === '7eleven' && '🏪 Open 24/7. Amount will reflect within 24 hrs after payment. Partner may charge fee.'}
                                    {formData.paymentSubMethod === 'cebuana' && '💰 Available at all Cebuana Lhuillier branches. Processing fee may apply.'}
                                    {formData.paymentSubMethod === 'palawan' && '🏦 Available at Palawan Express branches. Quick processing.'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block bee-body-sm mb-2 md:mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Order Notes (Optional)
                </label>
                <textarea
                  className="input-default min-h-[60px] md:min-h-[80px]"
                  placeholder="Special instructions for delivery..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={isProcessing}
                />
              </div>

              {/* Order Summary - Responsive */}
              <div className="p-4 md:p-5 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h4 className="bee-body-sm font-medium mb-3 md:mb-4" style={{ color: 'var(--text-light)' }}>
                  Order Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bee-body-sm" style={{ color: 'var(--muted)' }}>Subtotal</span>
                    <span className="bee-body-sm" style={{ color: 'var(--text-light)' }}>{product.formattedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bee-body-sm" style={{ color: 'var(--muted)' }}>Shipping</span>
                    <span className="bee-body-sm" style={{ color: 'var(--text-light)' }}>₱150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bee-body-sm" style={{ color: 'var(--muted)' }}>Shipping Discount</span>
                    <span className="bee-body-sm" style={{ color: 'var(--beesee-gold)' }}>-₱199</span>
                  </div>
                  {selectedCity && (
                    <div className="flex justify-between">
                      <span className="bee-body-sm" style={{ color: 'var(--muted)' }}>Delivery to</span>
                      <span className="bee-body-sm text-right" style={{ color: 'var(--text-light)' }}>
                        {selectedCity.name}
                      </span>
                    </div>
                  )}
                  <div className="h-px my-3" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
                  <div className="flex justify-between">
                    <span className="bee-body font-medium" style={{ color: 'var(--text-light)' }}>Total</span>
                    <span className="bee-body font-medium" style={{ color: 'var(--beesee-gold)' }}>
                      {product.price ? `₱${(product.price + 150 - 199).toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button - Responsive */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  className="beesee-button w-full flex items-center justify-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Confirm Order
                    </>
                  )}
                </button>
                <p className="bee-body-sm text-center mt-3" style={{ color: 'var(--muted)' }}>
                  By confirming, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;