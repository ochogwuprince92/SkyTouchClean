"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
        ✓
      </div>
      <h1 className="text-3xl font-bold mb-4 text-deep-purple">
        Payment Successful!
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Your payment has been successfully processed. Your booking is now confirmed.
      </p>

      {reference && (
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold text-lg mb-3 text-deep-purple">
            Transaction Reference
          </h2>
          <p className="text-2xl font-bold text-deep-purple tracking-wider">
            {reference}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Please save this reference for future inquiries
          </p>
        </div>
      )}

      <div className="space-y-3 text-left mb-8">
        <div className="flex items-start">
          <span className="text-green-500 mr-2">✓</span>
          <p className="text-gray-700">
            Payment verified and recorded
          </p>
        </div>
        <div className="flex items-start">
          <span className="text-green-500 mr-2">✓</span>
          <p className="text-gray-700">
            Booking status updated to confirmed
          </p>
        </div>
        <div className="flex items-start">
          <span className="text-green-500 mr-2">✓</span>
          <p className="text-gray-700">
            Confirmation email has been sent
          </p>
        </div>
        <div className="flex items-start">
          <span className="text-green-500 mr-2">✓</span>
          <p className="text-gray-700">
            Our team will contact you to schedule the service
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/status"
          className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors"
        >
          Check Booking Status
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
