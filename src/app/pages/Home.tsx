import { Hero } from "../components/luxride/Hero";
import { EstimateYourTrip } from "../components/luxride/EstimateYourTrip";
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
      {/* 3. Estimate Your Trip */}
      <EstimateYourTrip />
      {/* 4. Last-minute Booking */}
      <LastMinute />
      {/* 5. How It Works */}
      <HowItWorks />
      {/* 6. What's Included / Service Benefits */}
      <ServiceBenefits />
      {/* 7. Popular Transfers */}
      <PopularTransfers />
      {/* 8. Destinations */}
      <DestinationSEO />
      {/* 9. Fleet Preview */}
      <Fleet />
      {/* 10. Why Choose LuxRide */}
      <WhyChoose />
      {/* 11. Reviews */}
      <Reviews />
      {/* 12. FAQ */}
      <FAQ />
      {/* 13. Final CTA */}
      <FinalCTA />
      {/* 14. Footer (in RootLayout) */}
    </>
  );
}
