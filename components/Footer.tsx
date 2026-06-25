export default function Footer() {
    return (
      <footer className="border-t border-gray-100 mt-20 bottom-0 absolute w-full">
        <div className="max-w-6xl mx-auto px-8 py-10 flex justify-between items-center text-sm text-ash">
          <p className="font-display font-medium text-char">
            Roast<span className="text-ember">&amp;</span>Recover
          </p>
          <p>© {new Date().getFullYear()} Roast & Recover LLC</p>
        </div>
      </footer>
    );
  }