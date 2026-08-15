import Link from "next/link";
import { Anchor, ShieldCheck, FileText, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 text-muted-foreground text-xs py-12">
      <div className="container mx-auto px-4 md:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <Anchor className="w-5 h-5 text-primary" />
              <span className="font-serif font-bold text-base text-foreground">Literary Harbour</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Knowledge Without Borders. A global, open digital library providing access to public-domain literature, open-access academic books, and open educational resources.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground font-serif">Library &amp; Community</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/catalog" className="hover:underline">Browse Library</Link></li>
              <li><Link href="/academic" className="hover:underline">Academic Books</Link></li>
              <li><Link href="/community" className="hover:underline text-indigo-600 dark:text-indigo-400 font-bold">Academic Community</Link></li>
              <li><Link href="/sacred-texts" className="hover:underline text-amber-600 dark:text-amber-400 font-bold">Religious Texts</Link></li>
              <li><Link href="/collections" className="hover:underline">Collections</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Rights & Governance</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/rights" className="hover:underline flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-600" /> Rights & Legal Policy</Link></li>
              <li><Link href="/contributors" className="hover:underline flex items-center gap-1"><HeartHandshake className="w-3 h-3 text-purple-500" /> Contributors & Honor Roll</Link></li>
              <li><Link href="/rights#takedown" className="hover:underline">Takedown Procedure</Link></li>
              <li><Link href="/rights#attribution" className="hover:underline">Attribution Policy</Link></li>
              <li><Link href="/rights#geo" className="hover:underline">Geographic Restrictions</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Open Academic Sources</h4>
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              Integrated with DOAB, OAPEN Library, OpenStax, Project Gutenberg, Standard Ebooks, and verified university presses.
            </p>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Literary Harbor. Rights compliance comes before content acquisition.</p>
          <div className="flex items-center space-x-4">
            <Link href="/rights" className="hover:underline">Report Copyright Issue</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/pricing" className="hover:underline">Institutional Plans</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
