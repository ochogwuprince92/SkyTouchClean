import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-deep-purple">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-deep-purple">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-deep-purple">Phone/WhatsApp</h3>
                  <p className="text-gray-700">08157278277</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-deep-purple">Address</h3>
                  <p className="text-gray-700">
                    28 Agberin Street, Close to St Daniel Hospital, Oworo, Lagos.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-deep-purple">Business Hours</h3>
                  <p className="text-gray-700">Monday - Saturday: 8:00 AM - 6:00 PM</p>
                  <p className="text-gray-700">Sunday: Closed</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6 text-deep-purple">Send us a Message</h2>
              <p className="text-gray-700 mb-4">
                For inquiries and quotations, you can reach us via phone or WhatsApp.
                We typically respond within 24 hours.
              </p>
              <p className="text-gray-700">
                For immediate assistance, please call us at 08157278277.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
