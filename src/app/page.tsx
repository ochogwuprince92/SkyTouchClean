import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-deep-purple text-white py-10">
          <div className="container mx-auto px-2 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">
              WE CLEAN. WE WASH. WE FUMIGATE.
            </h1>
            <p className="font-display text-2xl md:text-3xl mb-8 text-deep-purple-100">
              Clean Spaces. Fresh Clothes. Less Worries.
            </p>
            <Link
              href="/book"
              className="inline-block bg-teal text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Book a Service
            </Link>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-deep-purple-50">
          <div className="container mx-auto px-2">
            <h2 className="text-3xl font-bold text-center mb-12 text-deep-purple">
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-deep-purple">
                  Home Cleaning
                </h3>
                <p className="text-gray-700 mb-4">
                  Professional home and office cleaning services. Monthly packages available.
                </p>
                <Link
                  href="/book?service=cleaning"
                  className="text-teal font-semibold hover:underline"
                >
                  Book Cleaning →
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-deep-purple">
                  Laundry Services
                </h3>
                <p className="text-gray-700 mb-4">
                  Expert laundry for all garments. Free pickup and delivery within service area.
                </p>
                <Link
                  href="/book?service=laundry"
                  className="text-teal font-semibold hover:underline"
                >
                  Book Laundry →
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-deep-purple">
                  Fumigation
                </h3>
                <p className="text-gray-700 mb-4">
                  Professional pest control services. Request a quotation for your property.
                </p>
                <Link
                  href="/book?service=fumigation"
                  className="text-teal font-semibold hover:underline"
                >
                  Request Quote →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Free Pickup Highlight */}
        <section className="py-16 bg-teal text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Free Laundry Pickup & Delivery
            </h2>
            <p className="text-xl mb-6">
              We offer free pickup and delivery for laundry services within our service area.
            </p>
            <p className="text-lg text-teal-100">
              Staff will confirm service area eligibility when you book.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-deep-purple">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-deep-purple text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2 text-deep-purple">
                  Book Online
                </h3>
                <p className="text-gray-700">
                  Fill out our simple booking form with your service details and preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-deep-purple text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2 text-deep-purple">
                  We Confirm
                </h3>
                <p className="text-gray-700">
                  Our team reviews your request and confirms schedule and final pricing.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-deep-purple text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2 text-deep-purple">
                  We Deliver
                </h3>
                <p className="text-gray-700">
                  Enjoy your clean space or fresh clothes. Satisfaction guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-deep-purple-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-deep-purple">
              Why Choose SkyTouchClean?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-teal text-4xl mb-4">✓</div>
                <h3 className="text-lg font-bold mb-2 text-deep-purple">
                  Professional Staff
                </h3>
                <p className="text-gray-700 text-sm">
                  Trained and experienced cleaning professionals
                </p>
              </div>
              <div className="text-center">
                <div className="text-teal text-4xl mb-4">✓</div>
                <h3 className="text-lg font-bold mb-2 text-deep-purple">
                  Quality Service
                </h3>
                <p className="text-gray-700 text-sm">
                  Consistent high-quality results every time
                </p>
              </div>
              <div className="text-center">
                <div className="text-teal text-4xl mb-4">✓</div>
                <h3 className="text-lg font-bold mb-2 text-deep-purple">
                  Reliable Schedule
                </h3>
                <p className="text-gray-700 text-sm">
                  We arrive on time, every time
                </p>
              </div>
              <div className="text-center">
                <div className="text-teal text-4xl mb-4">✓</div>
                <h3 className="text-lg font-bold mb-2 text-deep-purple">
                  Affordable Pricing
                </h3>
                <p className="text-gray-700 text-sm">
                  Competitive rates with no hidden fees
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
