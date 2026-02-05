import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturePillars } from "@/components/home/FeaturePillars";
import { BentoGrid } from "@/components/home/BentoGrid";
import { CryptoTicker } from "@/components/home/CryptoTicker";
import { Testimonials } from "@/components/home/Testimonials";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <CryptoTicker />
        <FeaturePillars />
        <BentoGrid />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
