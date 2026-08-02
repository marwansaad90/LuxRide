import { Hero } from "../components/luxride/Hero";
import {
  DestinationSEO,
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
      {/* 7. Destinations */}
      <DestinationSEO />
      {/* 8. Fleet Preview */}
      <Fleet />
      {/* 9. Why Choose LuxRide */}
      <WhyChoose />
      {/* 10. Reviews */}
      <Reviews />
      {/* 11. FAQ */}
      <FAQ />
      {/* 12. Final CTA */}
      <FinalCTA />
      {/* 13. Footer (in RootLayout) */}
    </>
  );
}
