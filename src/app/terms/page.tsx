export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-deep-purple mb-8">Terms of Service</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700">
              By using SkyTouchClean services, you agree to these Terms of Service. If you do not agree,
              please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Services</h2>
            <p className="text-gray-700">
              SkyTouchClean provides home cleaning, laundry services, and fumigation services in Nigeria.
              All services are subject to availability and our service area.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Pricing</h2>
            <p className="text-gray-700">
              All prices are quoted in Nigerian Naira (NGN) and are subject to change without notice.
              Prices displayed on our website are for reference only. Final prices may vary based on:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Actual service requirements</li>
              <li>Additional materials needed</li>
              <li>Special care requirements</li>
              <li>Service location</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Payments</h2>
            <p className="text-gray-700">
              Payment is processed securely through Paystack. By making a payment, you agree to Paystack's
              terms of service. Refunds are processed on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Cancellations</h2>
            <p className="text-gray-700">
              Cancellations must be made at least 24 hours before the scheduled service time.
              Late cancellations may incur a fee. No-shows will be charged the full service amount.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Customer Responsibilities</h2>
            <p className="text-gray-700">
              Customers are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Providing accurate information for bookings</li>
              <li>Ensuring access to the service location</li>
              <li>Securing valuables before service</li>
              <li>Notifying us of any special requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Liability</h2>
            <p className="text-gray-700">
              SkyTouchClean is not liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Damage to items not properly secured by the customer</li>
              <li>Loss of items not disclosed to our staff</li>
              <li>Delays caused by circumstances beyond our control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Modifications</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Continued use of our services
              constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Contact Us</h2>
            <p className="text-gray-700">
              For questions about these terms, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              Email: info@skytouchclean.com<br />
              Phone: +234 XXX XXX XXXX
            </p>
          </section>

          <section>
            <p className="text-gray-600 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
