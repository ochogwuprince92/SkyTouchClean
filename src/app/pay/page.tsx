"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";

function PayContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref") || "";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/booking-status/otp-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification code");
        return;
      }
      setStep("otp");
    } catch {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to initialize payment");
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Payment initialization failed. Please try again.");
      setLoading(false);
    }
  };

  if (!reference) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-700">No booking reference provided.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold mb-2 text-deep-purple text-center">
        Complete Payment
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Reference: <span className="font-semibold text-deep-purple">{reference}</span>
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
      )}

      {step === "email" && (
        <form onSubmit={handleSendOTP} className="space-y-4">
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
            disabled={loading}
            className="w-full bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
          <p className="text-sm text-gray-600 text-center">
            We'll send a 6-digit code to your email to authorize payment
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handlePay} className="space-y-4">
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
            disabled={loading}
            className="w-full bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Redirecting to payment..." : "Pay with Paystack"}
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
          >
            ← Back
          </button>
          <p className="text-sm text-gray-600 text-center">
            Code sent to <strong>{email}</strong> · expires in 10 minutes
          </p>
        </form>
      )}
    </div>
  );
}

export default function PayPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Suspense fallback={<div className="bg-white rounded-lg shadow-md p-8 text-center">Loading...</div>}>
              <PayContent />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
