import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-display font-medium text-char mb-1">
              roast<span className="text-ember">&amp;</span>recover
            </p>
            <p className="text-xs text-ash max-w-xs leading-relaxed">
              Certified café equipment and packaging, sourced direct
              from factory to your café.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-ash font-medium">
                Shop
              </p>
              <Link href="/equipment" className="block text-ash hover:text-char transition-colors text-sm">
                Equipment
              </Link>
              <Link href="/packaging" className="block text-ash hover:text-char transition-colors text-sm">
                Packaging
              </Link>
              <Link href="/how-it-works" className="block text-ash hover:text-char transition-colors text-sm">
                How it works
              </Link>
              <Link href="/contact" className="block text-ash hover:text-char text-sm">
                Contact us
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-ash font-medium">
                Account
              </p>
              <Link href="/account" className="block text-ash hover:text-char transition-colors text-sm">
                My account
              </Link>
              <Link href="/account/orders" className="block text-ash hover:text-char transition-colors text-sm">
                Orders
              </Link>
              <Link href="/account/equipment" className="block text-ash hover:text-char transition-colors text-sm">
                Equipment
              </Link>
              <Link href="/why-roastandrecover" className="block text-ash hover:text-char text-sm">
                Why Roast & Recover
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-ash font-medium">
                Legal
              </p>
              <Link href="/terms" className="block text-ash hover:text-char transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block text-ash hover:text-char transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/shipping" className="block text-ash hover:text-char transition-colors text-sm">
                Shipping Policy
              </Link>
              <Link href="/returns" className="block text-ash hover:text-char transition-colors text-sm">
                Returns & Warranty
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-ash font-medium">
                Contact
              </p>
              <a
                href="mailto:ritual@roastandrecover.com"
                className="block text-ash hover:text-ember transition-colors text-sm"
              >
                ritual@roastandrecover.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ash">
            © {new Date().getFullYear()} Roast & Recover LLC. All rights
            reserved.
          </p>
          <p className="text-xs text-ash">
            Certified equipment · Direct sourcing · US LLC
          </p>
        </div>
      </div>
    </footer>
  );
}