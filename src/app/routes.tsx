import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/luxride/RootLayout";
import { Home } from "./pages/Home";
import { AboutPage } from "./pages/AboutPage";
import { FleetPage } from "./pages/FleetPage";
import { DestinationsPage } from "./pages/DestinationsPage";
import { TransferDetailsPage } from "./pages/TransferDetailsPage";
import { BookingPage } from "./pages/BookingPage";
import { ContactPage } from "./pages/ContactPage";
import { FAQPage } from "./pages/FAQPage";
import { CancellationPolicyPage } from "./pages/CancellationPolicyPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";
import { ValidationStatesPage } from "./pages/ValidationStatesPage";
import { LastMinutePage } from "./pages/LastMinutePage";
import { AvailabilityAdminPage } from "./pages/AvailabilityAdminPage";
import { WhatsAppPreviewPage } from "./pages/WhatsAppPreviewPage";
import { EmailPreviewPage } from "./pages/EmailPreviewPage";
import { BookingErrorPage } from "./pages/BookingErrorPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsPage } from "./pages/TermsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: AboutPage },
      { path: "fleet", Component: FleetPage },
      { path: "destinations", Component: DestinationsPage },
      { path: "transfer-details", Component: TransferDetailsPage },
      { path: "booking", Component: BookingPage },
      { path: "contact", Component: ContactPage },
      { path: "faq", Component: FAQPage },
      { path: "cancellation-policy", Component: CancellationPolicyPage },
      { path: "privacy-policy", Component: PrivacyPolicyPage },
      { path: "terms", Component: TermsPage },
      { path: "booking-success", Component: BookingSuccessPage },
      { path: "booking-error", Component: BookingErrorPage },
      { path: "validation-states", Component: ValidationStatesPage },
      { path: "last-minute", Component: LastMinutePage },
      { path: "availability-admin", Component: AvailabilityAdminPage },
      { path: "whatsapp-preview", Component: WhatsAppPreviewPage },
      { path: "email-preview", Component: EmailPreviewPage },
      { path: "*", Component: Home },
    ],
  },
]);
