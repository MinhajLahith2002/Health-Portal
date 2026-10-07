import Link from "next/link";

export default function HeaderLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm1 14h-2v-3H8v-2h3V7h2v3h3v2h-3v3z" />
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight text-blue-700">
        Health Bridge
      </span>
    </Link>
  );
}
