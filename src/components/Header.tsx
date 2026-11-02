import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="bg-deep-purple text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold">SkyTouchClean</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base">
            <Link href="/" className="hover:text-teal-200 transition-colors">
              Home
            </Link>
            <Link href="/services" className="hover:text-teal-200 transition-colors">
              Services
            </Link>
            <Link href="/pricing" className="hover:text-teal-200 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-teal-200 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-teal-200 transition-colors">
              Contact
            </Link>
            <Link
              href="/book"
              className="bg-teal text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-700 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
