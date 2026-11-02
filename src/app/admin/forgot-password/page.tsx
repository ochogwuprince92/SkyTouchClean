"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-deep-purple-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-2 text-deep-purple text-center">
              Reset Password
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Enter your email to receive a password reset link
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700"
                >
                  Send Reset Link
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-teal text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✓
                </div>
                <h2 className="text-xl font-bold mb-3 text-deep-purple">
                  Check Your Email
                </h2>
                <p className="text-gray-700 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. The link will
                  expire in 1 hour.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-teal hover:underline"
                >
                  Send another email
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/admin/login" className="text-sm text-gray-600 hover:text-deep-purple">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
