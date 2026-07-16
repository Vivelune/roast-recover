import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-8 items-start mb-16">
          {/* Brand Info Block */}
          <div className="lg:col-span-2 space-y-4">
            <p className="font-display font-semibold text-lg text-char tracking-tight">
              roast<span className="text-ember">&amp;</span>recover
            </p>
            <p className="text-sm text-ash max-w-sm leading-relaxed">
              Certified café equipment and packaging, sourced direct
              from factory to your café.
            </p>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.15em] text-char font-semibold">
              Shop
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/equipment" className="text-ash hover:text-char transition-colors">
                  Equipment
                </Link>
              </li>
              <li>
                <Link href="/packaging" className="text-ash hover:text-char transition-colors">
                  Packaging
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-ash hover:text-char transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-ash hover:text-char transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-ash hover:text-char transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-ash hover:text-char transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Column */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.15em] text-char font-semibold">
              Account
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/account" className="text-ash hover:text-char transition-colors">
                  My account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-ash hover:text-char transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/account/equipment" className="text-ash hover:text-char transition-colors">
                  Equipment
                </Link>
              </li>
              <li>
                <Link href="/why-roastandrecover" className="text-ash hover:text-char transition-colors">
                  Why Roast & Recover
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.15em] text-char font-semibold">
              Legal
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="text-ash hover:text-char transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-ash hover:text-char transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-ash hover:text-char transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-ash hover:text-char transition-colors">
                  Returns & Warranty
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-Footer Brand Band */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-xs text-ash">
              © {new Date().getFullYear()} Roast & Recover LLC. All rights reserved.
            </p>
            <p className="text-[11px] text-ash/70 md:hidden">
              Certified equipment · Direct sourcing · US LLC
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <p className="text-xs text-ash hidden md:block">
              Certified equipment · Direct sourcing · US LLC
            </p>
            <span className="hidden sm:inline text-gray-200">|</span>
            <a
              href="mailto:ritual@roastandrecover.com"
              className="text-xs text-ash hover:text-ember transition-colors font-medium bg-steam px-3 py-1.5 rounded-full"
            >
              ritual@roastandrecover.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}