import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallButton from "@/components/MobileCallButton";
import Link from "next/link";

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-deep-purple text-center">
            Pricing
          </h1>

          {/* Home Cleaning */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-deep-purple">Home Cleaning</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-deep-purple text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Property</th>
                      <th className="px-6 py-4 text-right">Monthly Package</th>
                      <th className="px-6 py-4 text-right">Individual Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">1 Bedroom</td>
                      <td className="px-6 py-4 text-right font-semibold">₦25,000</td>
                      <td className="px-6 py-4 text-right font-semibold">₦7,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">2 Bedrooms</td>
                      <td className="px-6 py-4 text-right font-semibold">₦30,000</td>
                      <td className="px-6 py-4 text-right font-semibold">₦8,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">3 Bedrooms</td>
                      <td className="px-6 py-4 text-right font-semibold">₦35,000</td>
                      <td className="px-6 py-4 text-right font-semibold">₦10,000</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">4 Bedrooms</td>
                      <td className="px-6 py-4 text-right font-semibold">₦45,000</td>
                      <td className="px-6 py-4 text-right font-semibold">₦15,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-deep-purple-50">
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="text-deep-purple">Note:</strong> Monthly packages include
                  four visits per month.
                </p>
                <p className="text-sm text-gray-700">
                  Deep cleaning and heavily soiled spaces may attract extra charges.
                  Final price confirmed after property assessment.
                </p>
              </div>
            </div>
          </section>

          {/* Laundry */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-deep-purple">Laundry Services</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-deep-purple text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Item</th>
                      <th className="px-6 py-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Trousers and Shirt</td>
                      <td className="px-6 py-4 text-right font-semibold">₦1,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Native Wears</td>
                      <td className="px-6 py-4 text-right font-semibold">₦1,500</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Agbada (Complete Set)</td>
                      <td className="px-6 py-4 text-right font-semibold">₦3,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Bedspread</td>
                      <td className="px-6 py-4 text-right font-semibold">₦1,500</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Duvets</td>
                      <td className="px-6 py-4 text-right font-semibold">From ₦3,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-deep-purple-50">
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="text-deep-purple">Note:</strong> Prices are item-based, not
                  weight-based.
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Duvet final price is confirmed by staff based on size/type.
                </p>
                <p className="text-sm text-gray-700">
                  Special stain treatment and delicate garments may attract additional charges.
                </p>
              </div>
            </div>
          </section>

          {/* Quote-Only Items */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-deep-purple">Quote-Only Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-3 text-deep-purple">Fumigation</h3>
                <p className="text-gray-700 mb-4">
                  Professional pest control for residential and commercial properties.
                </p>
                <div className="bg-deep-purple-50 p-4 rounded-md">
                  <p className="text-deep-purple font-semibold">Request a quotation</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Price based on property size and assessment
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-3 text-deep-purple">
                  Bedsheets & Curtains
                </h3>
                <p className="text-gray-700 mb-4">
                  Professional cleaning for bedsheets and curtains.
                </p>
                <div className="bg-deep-purple-50 p-4 rounded-md">
                  <p className="text-deep-purple font-semibold">Price on request</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Contact us for a custom quote
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-deep-purple-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-deep-purple">Important Notes</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-teal mr-2">•</span>
                All prices are in Nigerian Naira (₦)
              </li>
              <li className="flex items-start">
                <span className="text-teal mr-2">•</span>
                Additional work outside agreed scope may be quoted separately
              </li>
              <li className="flex items-start">
                <span className="text-teal mr-2">•</span>
                Customer may provide materials (labour-only) or request SkyTouchClean to supply
              </li>
              <li className="flex items-start">
                <span className="text-teal mr-2">•</span>
                Laundry pickup and delivery are free within service area
              </li>
              <li className="flex items-start">
                <span className="text-teal mr-2">•</span>
                Extra charges require customer approval before processing
              </li>
            </ul>
          </section>

          <div className="text-center">
            <Link
              href="/book"
              className="inline-block bg-teal text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Book a Service
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCallButton />
    </div>
  );
}
