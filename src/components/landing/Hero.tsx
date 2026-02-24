import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Users, TrendingUp, DollarSign } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-lavender-50 via-white to-lavender-100">
      <div className="absolute inset-0 bg-grid-lavender-100/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <span className="text-xl font-bold text-primary">elevateHer</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Start Free Trial</Link>
          </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Enterprise-Grade Retention Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Empower Mothers{" "}
            <span className="text-primary">Returning to Work</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The only platform that combines AI-powered coaching, real-time
            sentiment tracking, and measurable ROI to retain your most valuable
            talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">2,500+</p>
            <p className="text-sm text-muted-foreground">Mothers Supported</p>
          </div>
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">94%</p>
            <p className="text-sm text-muted-foreground">Retention Rate</p>
          </div>
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">$2.3M</p>
            <p className="text-sm text-muted-foreground">Client Savings</p>
          </div>
        </div>
      </div>
    </section>
  );
}
