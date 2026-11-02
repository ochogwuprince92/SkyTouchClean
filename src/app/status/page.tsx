"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";

export default function BookingStatus() {
  const [step, setStep] = useState<"lookup" | "verify" | "result">("lookup");
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("verify");
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("result");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-deep-purple text-center">
              Check Booking Status
            </h1>

            {/* Step 1: Lookup */}
            {step === "lookup" && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Enter Your Reference
                </h2>
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Booking Reference *
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g., STC-LAU-ABC12345"
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter the email used for booking"
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700"
                  >
                    Send Verification Code
                  </button>
                </form>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  We'll send a 6-digit code to your email for verification
                </p>
              </div>
            )}

            {/* Step 2: Verify OTP */}
            {step === "verify" && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Enter Verification Code
                </h2>
                <p className="text-gray-700 mb-6">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Verification Code *
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal text-center text-2xl tracking-widest"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700"
                  >
                    Verify & View Status
                  </button>
                </form>
                <button
                  onClick={() => setStep("lookup")}
                  className="w-full mt-4 px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
                >
                  ← Back
                </button>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Code expires in 10 minutes
                </p>
              </div>
            )}

            {/* Step 3: Result */}
            {step === "result" && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-deep-purple">
                  Booking Status
                </h2>

                <div className="space-y-4">
                  <div className="bg-deep-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Reference</p>
                    <p className="text-xl font-bold text-deep-purple">{reference}</p>
                  </div>

                  <div className="bg-deep-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-xl font-bold text-teal">PENDING_REVIEW</p>
                  </div>

                  <div className="bg-deep-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="text-lg font-semibold">Laundry Services</p>
                  </div>

                  <div className="bg-deep-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Estimated Total</p>
                    <p className="text-lg font-semibold">₦5,000</p>
                  </div>

                  <div className="bg-deep-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Preferred Pickup Date</p>
                    <p className="text-lg font-semibold">2025-01-15</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Our team is reviewing your booking. You will be contacted
                    shortly to confirm the details.
                  </p>
                </div>

                <button
                  onClick={() => setStep("lookup")}
                  className="w-full mt-6 px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
                >
                  Check Another Booking
                </button>
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
