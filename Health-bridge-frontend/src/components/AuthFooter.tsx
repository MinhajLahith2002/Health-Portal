import Link from "next/link";

export default function AuthFooter() {
  return (
    <footer className="w-full border-t border-slate-100 bg-white/80 backdrop-blur py-5 px-6 sm:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[10px]">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm1 14h-2v-3H8v-2h3V7h2v3h3v2h-3v3z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-700">Health Bridge</span>
          <span>•</span>
          <span>© 2026 Health Bridge. All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Help Center
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
