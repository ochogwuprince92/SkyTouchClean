"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
        ✗
      </div>
      <h1 className="text-3xl font-bold mb-4 text-deep-purple">
        Payment Failed
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        We were unable to process your payment. Don't worry, your booking is still saved and you can try payment again.
      </p>

      {reference && (
        <div className="bg-red-50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold text-lg mb-3 text-deep-purple">
            Transaction Reference
          </h2>
          <p className="text-2xl font-bold text-deep-purple tracking-wider">
            {reference}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Please save this reference for support inquiries
          </p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
        <p className="text-sm text-yellow-800">
          <strong>Common reasons for payment failure:</strong>
        </p>
        <ul className="text-sm text-yellow-800 mt-2 text-left list-disc list-inside">
          <li>Insufficient funds</li>
          <li>Incorrect card details</li>
          <li>Bank declined transaction</li>
          <li>Network timeout</li>
        </ul>
      </div>

      <div className="space-y-3 text-left mb-8">
        <div className="flex items-start">
          <span className="text-teal mr-2">•</span>
          <p className="text-gray-700">
            Your booking is still saved in our system
          </p>
        </div>
        <div className="flex items-start">
          <span className="text-teal mr-2">•</span>
          <p className="text-gray-700">
            You can retry payment using the "Check Status" option
          </p>
        </div>
        <div className="flex items-start">
          <span className="text-teal mr-2">•</span>
          <p className="text-gray-700">
            Contact us if the issue persists
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/status"
          className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors"
        >
          Retry Payment
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
        >
          Back to Home
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t">
        <p className="text-sm text-gray-600">
          Need help? Contact us at:
        </p>
        <p className="text-sm font-semibold text-deep-purple">
          📞 08157278277
        </p>
        <p className="text-sm text-gray-600">
          📍 28 Agberin Street, Close to St Daniel Hospital, Oworo, Lagos
        </p>
      </div>
    </div>
  );
}
