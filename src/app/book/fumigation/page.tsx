"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FumigationBooking() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    propertyType: "",
    pestProblem: "",
    propertySize: "",
    preferredDate: "",
    customerNotes: "",
    honeypot: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings/fumigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/book/confirmation?reference=${data.reference}`);
      } else {
        alert(data.error || "Failed to submit enquiry");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit enquiry. Please try again.");
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
          <h1 className="text-4xl font-bold mb-8 text-deep-purple">Fumigation Enquiry</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? "bg-teal text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
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
            {/* Step 1: Property Details */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Property Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Property Type *
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="office">Office</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Property Size *
                    </label>
                    <select
                      name="propertySize"
                      value={formData.propertySize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="small">Small (up to 500 sq ft)</option>
                      <option value="medium">Medium (500-1500 sq ft)</option>
                      <option value="large">Large (1500-3000 sq ft)</option>
                      <option value="xlarge">Extra Large (3000+ sq ft)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Pest Problem *
                    </label>
                    <select
                      name="pestProblem"
                      value={formData.pestProblem}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="cockroaches">Cockroaches</option>
                      <option value="rodents">Rodents</option>
                      <option value="termites">Termites</option>
                      <option value="bedbugs">Bedbugs</option>
                      <option value="ants">Ants</option>
                      <option value="mosquitoes">Mosquitoes</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={!formData.propertyType || !formData.propertySize || !formData.pestProblem}
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

            {/* Step 3: Schedule & Notes */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Schedule & Notes
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
                      Additional Information
                    </label>
                    <textarea
                      name="customerNotes"
                      value={formData.customerNotes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      placeholder="Any additional details about the pest problem or property..."
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

                <div className="mt-6 p-4 bg-deep-purple-50 rounded-lg mb-6">
                  <p className="text-sm text-gray-700">
                    <strong className="text-deep-purple">Quotation Process:</strong> Our team will
                    assess your property and provide a custom quotation. You will receive the quote
                    via email or phone. No payment is required until you accept the quotation.
                  </p>
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
                    {isSubmitting ? "Submitting..." : "Submit Enquiry"}
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
