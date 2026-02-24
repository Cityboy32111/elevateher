import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-white/80 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-lavender-400 fill-lavender-400" />
              <span className="text-lg font-bold text-white">elevateHer</span>
            </div>
            <p className="text-sm">
              Enterprise SaaS platform helping companies retain mothers returning to work.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Product</h4>
            <div className="space-y-2 text-sm">
              <p>Features</p>
              <p>Pricing</p>
              <p>Case Studies</p>
              <p>Documentation</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Company</h4>
            <div className="space-y-2 text-sm">
              <p>About</p>
              <p>Blog</p>
              <p>Careers</p>
              <p>Contact</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Legal</h4>
            <div className="space-y-2 text-sm">
              <p>Privacy Policy</p>
              <p>Terms of Service</p>
              <p>Cookie Policy</p>
              <p>GDPR</p>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} elevateHer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
