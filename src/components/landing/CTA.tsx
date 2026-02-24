import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-primary to-lavender-700 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Retain Your Best Talent?</h2>
        <p className="text-lg text-lavender-100">
          Join hundreds of companies already using elevateHer to support returning mothers and reduce turnover.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            Schedule a Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
