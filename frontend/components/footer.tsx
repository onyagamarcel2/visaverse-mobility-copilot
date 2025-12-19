import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/onboarding" className="text-muted-foreground hover:text-foreground transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#guides" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>&copy; 2025 VisaVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
