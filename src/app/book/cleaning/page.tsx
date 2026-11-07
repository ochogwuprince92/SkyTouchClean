"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

const cleaningPrices = {
  monthly: {
    1: 25000,
    2: 30000,
    3: 35000,
    4: 45000,
  },
  single: {
    1: 7000,
    2: 8000,
    3: 10000,
    4: 15000,
  },
};

export default function CleaningBooking() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bedroomCount: "",
    bookingPlan: "SINGLE_VISIT",
    customerName: "",
    phone: "",
    email: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    materialsOption: "CUSTOMER_PROVIDES",
    requiresDeepCleaning: false,
    heavilySoiled: false,
    customerNotes: "",
    honeypot: "",
  });

  const calculatePrice = () => {
    const bedrooms = parseInt(formData.bedroomCount);
    if (!bedrooms) return 0;

    if (formData.bookingPlan === "MONTHLY") {
      return cleaningPrices.monthly[bedrooms as keyof typeof cleaningPrices.monthly] || 0;
    } else {
      return cleaningPrices.single[bedrooms as keyof typeof cleaningPrices.single] || 0;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        bedroomCount: parseInt(formData.bedroomCount),
      };
      const response = await fetch("/api/bookings/cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
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
          <h1 className="text-4xl font-bold mb-8 text-deep-purple">Home Cleaning Booking</h1>

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
            {/* Step 1: Service Details */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Service Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Number of Bedrooms *
                    </label>
                    <select
                      name="bedroomCount"
                      value={formData.bedroomCount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4 Bedrooms</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Booking Plan *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-deep-purple-50">
                        <input
                          type="radio"
                          name="bookingPlan"
                          value="SINGLE_VISIT"
                          checked={formData.bookingPlan === "SINGLE_VISIT"}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold">Single Visit</div>
                          <div className="text-sm text-gray-600">
                            One-time cleaning service
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-deep-purple-50">
                        <input
                          type="radio"
                          name="bookingPlan"
                          value="MONTHLY"
                          checked={formData.bookingPlan === "MONTHLY"}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold">Monthly Package</div>
                          <div className="text-sm text-gray-600">
                            Four visits per month at a discounted rate
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.bedroomCount && (
                    <div className="p-4 bg-deep-purple-50 rounded-lg">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Estimated Price:</span>
                        <span className="text-deep-purple">
                          ₦{calculatePrice().toLocaleString()}
                        </span>
                      </div>
                      {formData.bookingPlan === "MONTHLY" && (
                        <p className="text-sm text-gray-600 mt-2">
                          Includes 4 visits per month
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={!formData.bedroomCount}
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
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
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

            {/* Step 3: Schedule & Options */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Schedule & Options
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Materials Option *
                    </label>
                    <select
                      name="materialsOption"
                      value={formData.materialsOption}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    >
                      <option value="CUSTOMER_PROVIDES">
                        I will provide materials (labour-only)
                      </option>
                      <option value="SKYTOUCH_PROVIDES">
                        SkyTouchClean should provide materials (quote extra)
                      </option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requiresDeepCleaning"
                        checked={formData.requiresDeepCleaning}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span>Requires deep cleaning</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="heavilySoiled"
                        checked={formData.heavilySoiled}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span>Heavily soiled</span>
                    </label>
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
                      placeholder="Any special requirements or notes..."
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
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-deep-purple">
                      Service Details
                    </h3>
                    <div className="bg-deep-purple-50 p-4 rounded-lg space-y-2">
                      <p>
                        <strong>Bedrooms:</strong> {formData.bedroomCount}
                      </p>
                      <p>
                        <strong>Plan:</strong>{" "}
                        {formData.bookingPlan === "MONTHLY"
                          ? "Monthly Package (4 visits)"
                          : "Single Visit"}
                      </p>
                      <p>
                        <strong>Materials:</strong>{" "}
                        {formData.materialsOption === "CUSTOMER_PROVIDES"
                          ? "Customer provides"
                          : "SkyTouchClean provides (extra quote)"}
                      </p>
                      {formData.requiresDeepCleaning && (
                        <p className="text-yellow-700">
                          <strong>⚠ Deep cleaning required</strong>
                        </p>
                      )}
                      {formData.heavilySoiled && (
                        <p className="text-yellow-700">
                          <strong>⚠ Heavily soiled</strong>
                        </p>
                      )}
                      <div className="pt-3 border-t font-bold text-lg">
                        <span>Estimated Price:</span>
                        <span className="text-deep-purple ml-2">
                          ₦{calculatePrice().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

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

                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-deep-purple">
                      Address & Schedule
                    </h3>
                    <div className="bg-deep-purple-50 p-4 rounded-lg space-y-2">
                      <p>
                        <strong>Address:</strong> {formData.address}
                      </p>
                      <p>
                        <strong>Date:</strong> {formData.preferredDate}
                      </p>
                      <p>
                        <strong>Time:</strong> {formData.preferredTime}
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
                      <strong>Note:</strong> Final price confirmed after property assessment. Deep
                      cleaning and heavily soiled spaces may attract extra charges.
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
