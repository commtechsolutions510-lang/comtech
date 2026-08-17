import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CreditCard, Truck, User, MapPin, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import type { Address } from '../types';

type Step = 'info' | 'delivery' | 'address' | 'summary' | 'payment';

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

interface DeliveryInfo {
  method: 'delivery' | 'pickup';
}

interface AddressInfo {
  addressId?: string;
  region: string;
  city: string;
  area: string;
  street: string;
  additional?: string;
  contactPhone: string;
}

const steps: { key: Step; label: string; icon: typeof User }[] = [
  { key: 'info', label: 'Info', icon: User },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'summary', label: 'Summary', icon: Check },
  { key: 'payment', label: 'Payment', icon: CreditCard },
];

export function Checkout() {
  const { items, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentData, setPaymentData] = useState<{ reference: string; amount: number; email: string; publicKey: string } | null>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ fullName: '', email: '', phone: '' });
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({ method: 'delivery' });
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    addressId: undefined,
    region: '',
    city: '',
    area: '',
    street: '',
    additional: '',
    contactPhone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (items.length === 0) {
      window.location.href = '/cart';
    }
  }, [items.length]);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      api.get('/customers').then((data) => {
        setCustomerInfo({ fullName: data.fullName || '', email: data.email || '', phone: data.phone || '' });
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setAddressInfo({
            addressId: defaultAddr.id,
            region: defaultAddr.region,
            city: defaultAddr.city,
            area: defaultAddr.area,
            street: defaultAddr.street,
            additional: defaultAddr.additional || '',
            contactPhone: defaultAddr.contactPhone,
          });
        }
      }).catch(() => {});
    }
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);
  const deliveryFee = deliveryInfo.method === 'delivery' ? (subtotal > 500 ? 0 : 25) : 0;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 'info') {
      if (!customerInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) newErrors.email = 'Invalid email format';
      if (!customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    }
    if (step === 'delivery') {
      if (deliveryInfo.method === 'delivery' && !addressInfo.region.trim()) newErrors.region = 'Region is required';
    }
    if (step === 'address') {
      if (deliveryInfo.method === 'delivery') {
        if (!addressInfo.region.trim()) newErrors.region = 'Region is required';
        if (!addressInfo.city.trim()) newErrors.city = 'City is required';
        if (!addressInfo.area.trim()) newErrors.area = 'Area is required';
        if (!addressInfo.street.trim()) newErrors.street = 'Street address is required';
        if (!addressInfo.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const index = steps.findIndex((s) => s.key === currentStep);
      if (index < steps.length - 1) {
        setCurrentStep(steps[index + 1].key);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const prevStep = () => {
    const index = steps.findIndex((s) => s.key === currentStep);
    if (index > 0) {
      setCurrentStep(steps[index - 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const placeOrder = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('customer_token');
      const orderPayload: any = {
        items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })),
        deliveryMethod: deliveryInfo.method,
        deliveryFee,
        discountAmount: discount,
        deliveryAddress: deliveryInfo.method === 'delivery' ? { ...addressInfo } : undefined,
      };

      if (!token) {
        orderPayload.customerEmail = customerInfo.email;
        orderPayload.customerName = customerInfo.fullName;
        orderPayload.customerPhone = customerInfo.phone;
      }

      const order = await api.post('/orders', orderPayload);
      setOrderNumber(order.orderNumber);
      clearCart();

      const payData = await api.post('/payments/paystack/initialize', {
        orderId: order.id,
        email: customerInfo.email,
        amount: total,
      });
      setPaymentData(payData);
      setCurrentStep('payment');
    } catch {
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-[#F5F7FA] text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Checkout
            </span>
            <h1 className="text-[clamp(2rem,8vw,3rem)] font-bold text-[#0B1F3A] tracking-tight leading-tight">
              Checkout
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive ? 'border-[#1677FF] bg-[#1677FF] text-white' :
                      isCompleted ? 'border-green-500 bg-green-500 text-white' :
                      'border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-16 h-0.5 mx-2 ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <span key={step.key} className={`text-xs font-medium ${currentStep === step.key ? 'text-[#1677FF]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
                {currentStep === 'info' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Customer Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Full Name</label>
                        <input
                          type="text"
                          value={customerInfo.fullName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Email</label>
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Phone</label>
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'delivery' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Delivery Method</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => setDeliveryInfo({ method: 'delivery' })}
                        className={`p-6 rounded-xl border-2 text-left transition-colors ${
                          deliveryInfo.method === 'delivery' ? 'border-[#1677FF] bg-[#F3F8FF]' : 'border-[#E5E7EB] hover:border-gray-300'
                        }`}
                      >
                        <Truck className={`w-8 h-8 mb-3 ${deliveryInfo.method === 'delivery' ? 'text-[#1677FF]' : 'text-gray-400'}`} />
                        <h3 className="font-semibold text-[#0B1F3A]">Home Delivery</h3>
                        <p className="text-sm text-gray-500 mt-1">Delivered to your address</p>
                        <p className="text-sm font-medium text-[#1677FF] mt-2">GH₵{subtotal > 500 ? '0.00' : '25.00'}</p>
                      </button>
                      <button
                        onClick={() => setDeliveryInfo({ method: 'pickup' })}
                        className={`p-6 rounded-xl border-2 text-left transition-colors ${
                          deliveryInfo.method === 'pickup' ? 'border-[#1677FF] bg-[#F3F8FF]' : 'border-[#E5E7EB] hover:border-gray-300'
                        }`}
                      >
                        <MapPin className={`w-8 h-8 mb-3 ${deliveryInfo.method === 'pickup' ? 'text-[#1677FF]' : 'text-gray-400'}`} />
                        <h3 className="font-semibold text-[#0B1F3A]">Store Pickup</h3>
                        <p className="text-sm text-gray-500 mt-1">Collect from our store</p>
                        <p className="text-sm font-medium text-green-600 mt-2">Free</p>
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'address' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Delivery Address</h2>
                    {addresses.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-[#0B1F3A] mb-2">Saved Addresses</label>
                        <div className="space-y-2">
                          {addresses.map((addr) => (
                            <button
                              key={addr.id}
                              onClick={() => setAddressInfo({
                                addressId: addr.id,
                                region: addr.region,
                                city: addr.city,
                                area: addr.area,
                                street: addr.street,
                                additional: addr.additional || '',
                                contactPhone: addr.contactPhone,
                              })}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                addressInfo.addressId === addr.id ? 'border-[#1677FF] bg-[#F3F8FF]' : 'border-[#E5E7EB] hover:border-gray-300'
                              }`}
                            >
                              <p className="font-medium text-[#0B1F3A]">{addr.city}, {addr.area}</p>
                              <p className="text-sm text-gray-500">{addr.street}, {addr.region}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Region</label>
                          <input
                            type="text"
                            value={addressInfo.region}
                            onChange={(e) => setAddressInfo({ ...addressInfo, region: e.target.value })}
                            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                          />
                          {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#0B1F3A] mb-1">City</label>
                          <input
                            type="text"
                            value={addressInfo.city}
                            onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Area</label>
                        <input
                          type="text"
                          value={addressInfo.area}
                          onChange={(e) => setAddressInfo({ ...addressInfo, area: e.target.value })}
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                        />
                        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Street Address</label>
                        <input
                          type="text"
                          value={addressInfo.street}
                          onChange={(e) => setAddressInfo({ ...addressInfo, street: e.target.value })}
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                        />
                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={addressInfo.contactPhone}
                          onChange={(e) => setAddressInfo({ ...addressInfo, contactPhone: e.target.value })}
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                        />
                        {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'summary' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Order Summary</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#F5F7FA] rounded-lg">
                        <h3 className="font-semibold text-[#0B1F3A] mb-2">Customer Info</h3>
                        <p className="text-sm text-gray-600">{customerInfo.fullName}</p>
                        <p className="text-sm text-gray-600">{customerInfo.email}</p>
                        <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                      </div>
                      <div className="p-4 bg-[#F5F7FA] rounded-lg">
                        <h3 className="font-semibold text-[#0B1F3A] mb-2">Delivery Method</h3>
                        <p className="text-sm text-gray-600">{deliveryInfo.method === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
                      </div>
                      {deliveryInfo.method === 'delivery' && (
                        <div className="p-4 bg-[#F5F7FA] rounded-lg">
                          <h3 className="font-semibold text-[#0B1F3A] mb-2">Address</h3>
                          <p className="text-sm text-gray-600">{addressInfo.street}, {addressInfo.area}, {addressInfo.city}, {addressInfo.region}</p>
                        </div>
                      )}
                      <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
                        {items.map((item) => {
                          const price = item.variant?.price ?? item.product.basePrice;
                          return (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.product.name} x {item.quantity}</span>
                              <span className="font-medium">GH₵{(price * item.quantity).toFixed(2)}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-sm text-gray-600 pt-2">
                          <span>Subtotal</span>
                          <span>GH₵{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Delivery</span>
                          <span>{deliveryFee === 0 ? 'Free' : `GH₵${deliveryFee.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-[#0B1F3A] pt-2 border-t border-[#E5E7EB]">
                          <span>Total</span>
                          <span>GH₵{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'payment' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Payment</h2>
                    {paymentData ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-600 mb-4">Redirecting to Paystack...</p>
                        <div className="w-8 h-8 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-gray-400 mt-4">Please complete payment on the next screen.</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-600 mb-4">Processing your order...</p>
                        <div className="w-8 h-8 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    )}
                    {orderNumber && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <p className="text-sm font-medium text-green-800">Order placed successfully!</p>
                        <p className="text-lg font-bold text-green-900 mt-1">{orderNumber}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {errors.submit && (
                  <p className="mt-4 text-sm text-red-500">{errors.submit}</p>
                )}

                <div className="flex justify-between mt-8">
                  {currentStep !== 'info' && currentStep !== 'payment' ? (
                    <button
                      onClick={prevStep}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#172033] hover:text-[#0B1F3A]"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {currentStep !== 'payment' && currentStep !== 'summary' && (
                    <button
                      onClick={nextStep}
                      className="inline-flex items-center px-6 py-3 bg-[#1677FF] text-white font-semibold rounded-lg hover:bg-[#0f6ae7] transition-colors"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                  {currentStep === 'summary' && (
                    <button
                      onClick={placeOrder}
                      disabled={isLoading}
                      className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white font-semibold rounded-lg hover:bg-[#112b4d] transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#F5F7FA] p-6 rounded-xl border border-[#E5E7EB] sticky top-24">
                <h3 className="text-lg font-bold text-[#0B1F3A] mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {items.map((item) => {
                    const price = item.variant?.price ?? item.product.basePrice;
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate max-w-[60%]">{item.product.name} x{item.quantity}</span>
                        <span className="font-medium">GH₵{(price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-[#E5E7EB] pt-3 mt-3 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>GH₵{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery</span>
                      <span>{deliveryFee === 0 ? 'Free' : `GH₵${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[#0B1F3A]">
                      <span>Total</span>
                      <span>GH₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
