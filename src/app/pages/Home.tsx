import { Hero } from "../components/luxride/Hero";
import {
  FinalCTA,
  Fleet,
  HowItWorks,
  LastMinute,
  PopularTransfers,
  ServiceBenefits,
  WhyChoose,
} from "../components/luxride/Sections";
import { Reviews } from "../components/luxride/Reviews";
import { FAQ } from "../components/luxride/FAQ";

export function Home() {
  return (
    <>
      {/* 1. Header (in RootLayout) */}
      {/* 2. Compact Hero */}
      <Hero />
      {/* 3. Last-minute Booking */}
      <LastMinute />
      {/* 4. How It Works */}
      <HowItWorks />
      {/* 5. What's Included / Service Benefits */}
      <ServiceBenefits />
      {/* 6. Popular Transfers */}
      <PopularTransfers />
      {/* 7. Fleet Preview */}
      <Fleet />
      {/* 8. Why Choose LuxRide */}
      <WhyChoose />
      {/* 9. Reviews */}
      <Reviews />
      {/* 10. FAQ */}
      <FAQ />
      {/* 11. Final CTA */}
      <FinalCTA />
      {/* 12. Footer (in RootLayout) */}
    </>
  );
}
