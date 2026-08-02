# Client input required

Only client-owned data that is still missing is listed here. The frontend remains reviewable without these items; the table identifies what must be resolved before the later WordPress or final-content phase.

| Missing client input | Where used | Current placeholder or safe behavior | Blocks client review | Blocks WordPress implementation |
|---|---|---|---|---|
| Production business email | Contact page, footer, email notification preview, future dual-delivery workflow | Displays “Pending client confirmation”; no fake mail link is exposed | No | Yes — required for production mail routing |
| Final Facebook URL | Contact page and footer | Disabled recognizable Facebook icon/label | No | Yes — required before publishing the social link |
| Final Instagram URL | Contact page and footer | Disabled recognizable Instagram icon/label | No | Yes — required before publishing the social link |
| Final business hours | Contact page and future site settings | Explicit “pending client confirmation” copy; no schedule is invented | No | Yes — required for final contact/site settings |
| Complete pickup-to-destination mapping | Homepage estimate, booking, destination cards, future route manager | Only approved relationships in `data.ts` are selectable; unknown combinations are absent | No | Yes — required for the complete production route catalogue |
| Prices for unapproved route/trip combinations | Calculator, booking summary, transfer details, future pricing admin | Unsupported trip types are disabled and never fall back to or double One Way | No | Yes — required before enabling those combinations |
| Exact driver-accommodation applicability by route | Price calculation and future route settings | €33 constant retained, but no route receives it until explicitly configured | No | Yes — required before accommodation can be charged |
| Exact admission-fee policy | What’s Included and transfer content | Safe wording: “Admission fee information where applicable”; tickets are not claimed as included | No | Yes — required for final policy/content rules |
| Final destination photos | Hero support imagery, destinations, popular routes, about page | Existing natural-color stock photos remain visual placeholders; official vehicle images are not placeholders | No | No, but required for final content approval |
| Exact original reference-theme font, if a licensed/original font is required | English navigation and headings | Barlow/Barlow Condensed are used as a legal visual alternative; Cairo is used consistently for Arabic body and headings | No | No, but required for exact visual sign-off |
| Source and commercial-use rights for the Hurghada Al-Mina Mosque hero background image | Homepage Hero background | Client-provided local prototype asset at `src/assets/hero/hurghada-al-mina.jpg`; no commercial-use license is claimed as verified | No | Yes — required before final production launch |
| Final production vehicle availability after client review | Homepage calculator and booking flow | All three vehicles are temporarily selectable in the client-review prototype to validate capacity and pricing behavior. Production availability remains pending confirmation before launch | No | Yes — required before final production booking behavior |
| Final Tripadvisor average rating, review count, and approved review excerpts | Dedicated Tripadvisor reviews section | Clearly labeled visual placeholders; no customer identity, rating, count, or testimonial is invented | No | Yes — required for real widgets/content |
