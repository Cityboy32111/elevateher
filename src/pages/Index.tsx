import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <ROICalculator />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
