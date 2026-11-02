export default function Footer() {
  return (
    <footer className="bg-deep-purple-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SkyTouchClean</h3>
            <p className="text-deep-purple-100">
              Clean Spaces. Fresh Clothes. Less Worries.
            </p>
            <p className="text-deep-purple-100 mt-2">
              WE CLEAN. WE WASH. WE FUMIGATE.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-deep-purple-100 mb-2">
              Phone/WhatsApp: 08157278277
            </p>
            <p className="text-deep-purple-100">
              Address: 28 Agberin Street, Close to St Daniel Hospital, Oworo, Lagos.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-deep-purple-100">
              <li>
                <a href="/privacy" className="hover:text-teal-200 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-teal-200 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-deep-purple-700 mt-8 pt-6 text-center text-deep-purple-200">
          <p>SkyTouchClean - Honesty AND Service.</p>
        </div>
      </div>
    </footer>
  );
}
