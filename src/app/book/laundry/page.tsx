"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

const laundryItems = [
  { code: "LA_TROUSERS_SHIRT", label: "Trousers and Shirt", price: 1000 },
  { code: "LA_NATIVE_WEAR", label: "Native Wears", price: 1500 },
  { code: "LA_AGBADA", label: "Agbada (Complete Set)", price: 3000 },
  { code: "LA_BEDSPREAD", label: "Bedspread", price: 1500 },
  { code: "LA_DUVET", label: "Duvets", price: 3500, isFromPrice: true },
];

export default function LaundryBooking() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    pickupAddress: "",
    deliveryAddress: "",
    preferredPickupDate: "",
    preferredPickupTime: "",
    customerNotes: "",
    honeypot: "",
  });

  const updateQuantity = (code: string, quantity: number) => {
    setItems((prev) => ({
      ...prev,
      [code]: Math.max(0, quantity),
    }));
  };

  const calculateTotal = () => {
    return Object.entries(items).reduce((total, [code, qty]) => {
      const item = laundryItems.find((i) => i.code === code);
      if (item && qty > 0) {
        return total + item.price * qty;
      }
      return total;
    }, 0);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const itemsArray = Object.entries(items)
        .filter(([_, qty]) => qty > 0)
        .map(([code, qty]) => ({ itemCode: code, quantity: qty }));

      const response = await fetch("/api/laundry-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: itemsArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/book/confirmation?reference=${data.reference}`);
      } else {
        alert(data.error || "Failed to submit booking");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <Link href="/book" className="text-teal hover:underline mb-4 inline-block">
            ← Back to Services
          </Link>
          <h1 className="text-4xl font-bold mb-8 text-deep-purple">Laundry Booking</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? "bg-teal text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s ? "bg-teal" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Step 1: Items */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Select Items
                </h2>
                <div className="space-y-4">
                  {laundryItems.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-deep-purple">{item.label}</h3>
                        <p className="text-gray-600">
                          {item.isFromPrice ? "From " : ""}₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.code, (items[item.code] || 0) - 1)}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {items[item.code] || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.code, (items[item.code] || 0) + 1)}
                          className="w-8 h-8 rounded bg-teal text-white hover:bg-teal-700 font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {Object.values(items).some((q) => q > 0) && (
                  <div className="mt-6 p-4 bg-deep-purple-50 rounded-lg">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Estimated Total:</span>
                      <span className="text-deep-purple">
                        ₦{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={Object.values(items).every((q) => q === 0)}
                    className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Address */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Contact & Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Pickup Address *
                    </label>
                    <input
                      type="text"
                      name="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Notes */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Schedule & Notes
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Preferred Pickup Date *
                    </label>
                    <input
                      type="date"
                      name="preferredPickupDate"
                      value={formData.preferredPickupDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Preferred Pickup Time *
                    </label>
                    <input
                      type="time"
                      name="preferredPickupTime"
                      value={formData.preferredPickupTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      name="customerNotes"
                      value={formData.customerNotes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      placeholder="Any special care instructions or notes..."
                    />
                  </div>
                  {/* Honeypot field for bot detection */}
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleInputChange}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Review & Submit
                </h2>

                <div className="space-y-6">
                  {/* Items Summary */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-deep-purple">Items</h3>
                    <div className="bg-deep-purple-50 p-4 rounded-lg">
                      {Object.entries(items)
                        .filter(([_, qty]) => qty > 0)
                        .map(([code, qty]) => {
                          const item = laundryItems.find((i) => i.code === code);
                          return (
                            <div
                              key={code}
                              className="flex justify-between py-2 border-b last:border-0"
                            >
                              <span>
                                {item?.label} x{qty}
                              </span>
                              <span className="font-semibold">
                                ₦{((item?.price || 0) * qty).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      <div className="flex justify-between pt-3 font-bold text-lg border-t mt-3">
                        <span>Total</span>
                        <span className="text-deep-purple">
                          ₦{calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-deep-purple">
                      Contact Information
                    </h3>
                    <div className="bg-deep-purple-50 p-4 rounded-lg space-y-2">
                      <p>
                        <strong>Name:</strong> {formData.customerName}
                      </p>
                      <p>
                        <strong>Phone:</strong> {formData.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-deep-purple">
                      Addresses
                    </h3>
                    <div className="bg-deep-purple-50 p-4 rounded-lg space-y-2">
                      <p>
                        <strong>Pickup:</strong> {formData.pickupAddress}
                      </p>
                      <p>
                        <strong>Delivery:</strong> {formData.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-deep-purple">
                      Schedule
                    </h3>
                    <div className="bg-deep-purple-50 p-4 rounded-lg space-y-2">
                      <p>
                        <strong>Date:</strong> {formData.preferredPickupDate}
                      </p>
                      <p>
                        <strong>Time:</strong> {formData.preferredPickupTime}
                      </p>
                    </div>
                  </div>

                  {formData.customerNotes && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-deep-purple">
                        Notes
                      </h3>
                      <div className="bg-deep-purple-50 p-4 rounded-lg">
                        <p>{formData.customerNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Staff will confirm service area eligibility and final
                      pricing. Special stain treatment and delicate items may attract extra
                      charges.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Booking"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
