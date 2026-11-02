import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";

export default function Book() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-deep-purple text-center">
            Book a Service
          </h1>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Select the service you need and fill out the form. We'll review your request and
            confirm the details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Laundry */}
            <Link
              href="/book/laundry"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-teal"
            >
              <div className="text-center">
                <div className="bg-deep-purple text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  👕
                </div>
                <h2 className="text-2xl font-bold mb-3 text-deep-purple">Laundry</h2>
                <p className="text-gray-700 mb-4">
                  Professional laundry services with free pickup and delivery
                </p>
                <div className="text-teal font-semibold">Book Laundry →</div>
              </div>
            </Link>

            {/* Cleaning */}
            <Link
              href="/book/cleaning"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-teal"
            >
              <div className="text-center">
                <div className="bg-deep-purple text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  🏠
                </div>
                <h2 className="text-2xl font-bold mb-3 text-deep-purple">Home Cleaning</h2>
                <p className="text-gray-700 mb-4">
                  Regular and deep cleaning for homes and offices
                </p>
                <div className="text-teal font-semibold">Book Cleaning →</div>
              </div>
            </Link>

            {/* Fumigation */}
            <Link
              href="/book/fumigation"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-teal"
            >
              <div className="text-center">
                <div className="bg-deep-purple text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  🦗
                </div>
                <h2 className="text-2xl font-bold mb-3 text-deep-purple">Fumigation</h2>
                <p className="text-gray-700 mb-4">
                  Professional pest control and fumigation services
                </p>
                <div className="text-teal font-semibold">Request Quote →</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
