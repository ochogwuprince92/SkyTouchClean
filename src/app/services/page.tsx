import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-deep-purple text-center">
            Our Services
          </h1>

          {/* Home Cleaning */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-deep-purple text-white p-6">
                <h2 className="text-2xl font-bold mb-2">Home Cleaning</h2>
                <p className="text-deep-purple-100">
                  Professional cleaning for homes and offices
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Regular house cleaning (1-4 bedrooms)
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Monthly packages with 4 included visits
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Deep cleaning available on request
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Labour-only or materials-inclusive options
                  </li>
                </ul>
                <Link
                  href="/book?service=cleaning"
                  className="inline-block bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors"
                >
                  Book Cleaning
                </Link>
              </div>
            </div>
          </section>

          {/* Laundry Services */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-deep-purple text-white p-6">
                <h2 className="text-2xl font-bold mb-2">Laundry Services</h2>
                <p className="text-deep-purple-100">
                  Expert care for all your garments
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Trousers and shirts
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Native wears and Agbada
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Bedspreads and duvets
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Free pickup and delivery (service area)
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Special stain treatment available
                  </li>
                </ul>
                <Link
                  href="/book?service=laundry"
                  className="inline-block bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors"
                >
                  Book Laundry
                </Link>
              </div>
            </div>
          </section>

          {/* Fumigation */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-deep-purple text-white p-6">
                <h2 className="text-2xl font-bold mb-2">Fumigation</h2>
                <p className="text-deep-purple-100">
                  Professional pest control services
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Residential and commercial properties
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Custom quotation based on property size
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Safe and effective treatments
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    Staff assessment before pricing
                  </li>
                </ul>
                <div className="bg-deep-purple-50 p-4 rounded-md mb-6">
                  <p className="text-deep-purple font-semibold">
                    Request a quotation for fumigation services. Our team will assess your
                    property and provide a custom quote.
                  </p>
                </div>
                <Link
                  href="/book?service=fumigation"
                  className="inline-block bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
