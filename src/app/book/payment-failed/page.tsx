import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";
import PaymentFailedContent from "./PaymentFailedContent";

export default function PaymentFailed() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<div className="bg-white rounded-lg shadow-md p-8 text-center">Loading...</div>}>
              <PaymentFailedContent />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
