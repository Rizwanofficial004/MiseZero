import {
  BenchmarkSection,
  CtaSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  LogoMarquee,
  PosSection,
  PositioningSection,
  PricingSection,
} from "@/components/landing/sections";
import { LandingFooter, LandingNav } from "@/components/layout/landing-nav";

export default function HomePage() {
  return (
    <div className="bg-mint-50">
      <LandingNav />
      <main>
        <HeroSection />
        <LogoMarquee />
        <FeaturesSection />
        <HowItWorksSection />
        <PositioningSection />
        <BenchmarkSection />
        <PosSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
