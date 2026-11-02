export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-deep-purple mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Information We Collect</h2>
            <p className="text-gray-700">
              SkyTouchClean collects the following information to provide our services:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Name and contact information (phone, email)</li>
              <li>Service addresses (pickup, delivery, cleaning location)</li>
              <li>Booking details and preferences</li>
              <li>Payment information (processed securely via Paystack)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">How We Use Your Information</h2>
            <p className="text-gray-700">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Process and fulfill your service requests</li>
              <li>Communicate about your bookings</li>
              <li>Send service notifications and updates</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Secure HTTPS connections</li>
              <li>Encrypted password storage using Argon2id</li>
              <li>Secure payment processing via Paystack</li>
              <li>Role-based access control for staff</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Data Retention</h2>
            <p className="text-gray-700">
              We retain your data for as long as necessary to provide our services and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Your Rights</h2>
            <p className="text-gray-700">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-deep-purple mb-4">Contact Us</h2>
            <p className="text-gray-700">
              For privacy-related inquiries, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              Email: privacy@skytouchclean.com<br />
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
