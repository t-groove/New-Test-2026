import LandingNavbar from "@/components/landing-navbar";
import LandingHero from "@/components/landing-hero";
import ProblemSection from "@/components/problem-section";
import FeaturesGrid from "@/components/features-grid";
import HowItWorks from "@/components/how-it-works";
import PricingSection from "@/components/pricing-section";
import LandingFooter from "@/components/landing-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <LandingNavbar />
      <LandingHero />
      <ProblemSection />
      <FeaturesGrid />
      <HowItWorks />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}
