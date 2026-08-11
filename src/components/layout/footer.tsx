import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg">Readora</h3>
            <p className="text-sm text-muted-foreground">
              A public digital library providing access to copyright-free literature for everyone, everywhere.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:underline">Catalog</Link></li>
              <li><Link href="/collections" className="hover:underline">Collections</Link></li>
              <li><Link href="/authors" className="hover:underline">Authors</Link></li>
              <li><Link href="/random" className="hover:underline">Random Book</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/mission" className="hover:underline">Mission</Link></li>
              <li><Link href="/institutional" className="hover:underline">Institutional</Link></li>
              <li><Link href="/accessibility" className="hover:underline">Accessibility</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/copyright" className="hover:underline">Copyright Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Readora. Dedicated to the public domain.</p>
        </div>
      </div>
    </footer>
  )
}
