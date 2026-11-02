"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BookingConfirmation() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "STC-LAU-ABC12345";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-teal text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                ✓
              </div>
              <h1 className="text-3xl font-bold mb-4 text-deep-purple">
                Booking Submitted!
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Your booking has been successfully submitted. Our team will review your request
                and contact you to confirm the details.
              </p>

              <div className="bg-deep-purple-50 p-6 rounded-lg mb-6">
                <h2 className="font-semibold text-lg mb-3 text-deep-purple">
                  Your Reference
                </h2>
                <p className="text-2xl font-bold text-deep-purple tracking-wider">
                  {reference}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Please save this reference for future inquiries
                </p>
              </div>

              <div className="space-y-3 text-left mb-8">
                <div className="flex items-start">
                  <span className="text-teal mr-2">•</span>
                  <p className="text-gray-700">
                    You will receive a confirmation email shortly
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-teal mr-2">•</span>
                  <p className="text-gray-700">
                    Our team will contact you to confirm schedule and final pricing
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-teal mr-2">•</span>
                  <p className="text-gray-700">
                    Use your reference to check booking status anytime
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/status"
                  className="bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors"
                >
                  Check Status
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
