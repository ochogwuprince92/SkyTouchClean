import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-deep-purple">About SkyTouchClean</h1>
          <div className="max-w-3xl">
            <p className="text-lg text-gray-700 mb-6">
              SkyTouchClean is your trusted partner for professional cleaning services in Lagos.
              We specialize in home cleaning, laundry services, and fumigation, delivering
              quality results with honesty and excellent service.
            </p>
            <h2 className="text-2xl font-bold mb-4 text-deep-purple">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              To provide exceptional cleaning services that exceed customer expectations,
              creating clean, healthy, and comfortable spaces for our clients.
            </p>
            <h2 className="text-2xl font-bold mb-4 text-deep-purple">Our Values</h2>
            <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
              <li>Honesty and transparency in all our dealings</li>
              <li>Quality service delivered consistently</li>
              <li>Customer satisfaction as our top priority</li>
              <li>Professional and trained staff</li>
              <li>Environmentally responsible practices</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
