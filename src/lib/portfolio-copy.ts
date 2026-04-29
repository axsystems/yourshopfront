/**
 * One unique short paragraph per theme (24 total) for the
 * "About this design" section on /portfolio/[slug]. Each paragraph
 * is meant to make the page legitimately distinct content for Google
 * — calls out the conversion pattern, target industry, and design
 * philosophy instead of just restating colors.
 */
export const portfolioCopy: Record<string, string> = {
  // Round 3 — theme options (8)
  "ironside-plumbing":
    "Built for emergency-service trades where the phone has to ring now. Hazard-stripe accents, brutalist Archivo Black headlines, and a phone-first hero that pulses on page load. Every conversion path leads to call-now — no quote forms hiding the number.",
  "greenwise-lawn":
    "An organic palette (moss, cream, terracotta) for recurring lawn-care work. Booking-card hero with date pickers and instant pricing. Soft Fraunces serifs signal craft over scale — the message is 'we'll know your yard,' not 'we have 200 trucks.'",
  "bellhorn-movers":
    "Calculator-led hero shows your move price in real time as you tap fields. Navy + orange + hard-shadow buttons keep it playful for a category most movers treat as transactional. Trust-strip credentials reassure without the corporate vibe.",
  "heritage-painters":
    "Editorial Charleston warm-craft. Terracotta + gold + ink palette, gallery-led hero showcasing project work, Fraunces italic for premium positioning. Built for painters and restorers who charge a premium and want their site to look like the work, not the truck.",
  "brightside-cleaning":
    "Sky-and-mint gradient hero with a pillowy booking card. Friendly modern, recurring-services positioning. Plus Jakarta Sans + Caveat script for human warmth. Conversion path: pick a date, see your price, book — three taps.",
  "summit-roofing":
    "Industrial dark with Oswald display caps. Form-card hero captures storm-damage leads instantly. Black + orange glow signals urgency without screaming. Designed for roofers who get most of their leads from a hailstorm and a phone notification.",
  "westwood-tree":
    "Forest greens + safety orange. ISA-certified-arborist credibility hero with photo gallery. For arborists, landscapers, and rugged outdoor trades who want to look serious without looking corporate. Insurance and certifications front-and-center.",
  "voltcraft-electric":
    "High-voltage industrial. Black + electric yellow, license number prominent in the header, phone-first hero. Built for licensed electricians and HVAC techs running 24/7 emergency lines who need 'call now' to be the loudest pixel on the page.",
  // Round 1 — promoted theme options (2)
  "premium-trade":
    "An editorial trade brand for contractors who want to feel premium without losing credibility. Bone + copper + ink with pipe-blue accents. Fraunces serif headlines, stat tiles, and a form-card hero. The opposite of 'we'll be there in 30 min' — engineered restraint over urgency.",
  "doorstep-editorial":
    "Pickup-and-delivery service design. Address-bar hero takes a zip code and shows availability inline. Cream + forest + butter palette, italic editorial display. Built for laundry pickup, dog walking, oil delivery, and any recurring delivery brand where 'do you serve my address' is the first question.",
  // Round 1 — portfolio (6)
  "daylight-lounge":
    "An indie laundromat reimagined as a hospitality lounge. Cream + terracotta + sage pastels, Fraunces serif display, photo-collage hero. The conversion path centers on 'come hang out' rather than 'do a transaction' — a useful pattern for any service business that wants to feel like a third place.",
  "documentary-b2b":
    "B2B credentialed style for healthcare and hospitality laundry. Navy + yellow + red, ISO/OSHA/HIPAA strip up top, form-card hero for inbound contract leads. Built for compliance-sensitive vendors where 'we're certified' is the headline, not the footnote.",
  "swiss-editorial":
    "An independent design practice's portfolio site. Cream + ink + oxblood, Instrument Serif italic, tabular project index that hover-reveals. The hero is mostly type — long-form, headline-only, no decoration. Built for studios who don't pitch with bullet points.",
  "cinematic-dark":
    "A film-noir studio brand. Deep black + warm white + copper + teal, custom cursor, full-bleed atmosphere. Built for production companies and luxury creative — the kind of agency that makes you fill out a contact form and waits a week to reply.",
  "webgl-experimental":
    "Acid green + electric blue developer-tools positioning. Hyper-tech with a custom cursor and orb hero. Built for AI tools, devtools, frontier-tech products that want to look like they're shipping at the edge — useful pattern if your buyer is a CTO who already uses Linear.",
  "brutalist":
    "Pop-art neo-brutalism for a creative agency that's proud of being loud. Yellow + black + pink + cobalt, 4px hard borders, hard-shadow buttons, ALL CAPS mega type. Subtlety not invited. Useful inspiration for any brand whose competitive moat is volume.",
  // Round 2 — portfolio (8)
  "print-block-books":
    "An indie bookstore + zine press. Riso/halftone aesthetic, paper + navy + pink + green, dashed pink stamps. Conversion path: discover-then-subscribe, not browse-then-buy. Bookstore, but make it pop.",
  "wildflower-stone":
    "Slow-goods florist + apothecary. Cream + sage + dusty rose + gold, Cormorant Garamond + EB Garamond, hand-drawn leaf dividers, all-italic navigation. The opposite of urgency — a useful pattern for any high-margin craft business that survives on returning customers, not first-time clicks.",
  "angelos":
    "A heritage Brooklyn pizza joint, est. 1956. Newspaper-Italian-Americana with Bodoni Moda, parchment + tomato + mustard, double-rule borders, hand-stamp accents. Every conversion path leads to 'come in tonight' — useful for any restaurant whose moat is decades, not Yelp stars.",
  "still-point":
    "A wabi-sabi yoga studio. Bone + terracotta + sage with Noto Serif JP character marks, Cormorant italic, morphing organic hero shape. Quiet pacing, calm conversion. Ideal pattern for wellness, meditation, and recovery brands where 'no, that's not us' is half the message.",
  "north-fork":
    "An independent brewery + taproom. Forest + cream + mustard + oxblood, Archivo Black masthead, Crimson Pro italic lede, heritage badge mark. Beer-hall loud type for taproom hours. Useful template for any local hospitality brand that needs to feel both heritage and current.",
  "cask-vine":
    "A 22-seat natural wine bar. Wine + gold + cream, Italiana display, Cormorant italic accent. Deep, low-lit, elegant — the dinner-reservation kind of conversion. The site is the host: scarce seating, careful copy, no 'BOOK NOW' button.",
  "mara-lin":
    "Fashion-photo darkroom. Near-black + warm-white + tan, Tenor Sans + DM Mono labels, custom cursor, full-bleed editorial figure. For photographers, directors, and fashion talent who don't list prices — the brief comes through email, not a pricing page.",
  "switchback":
    "A Linear-style observability SaaS. Near-black grid + emerald glow + JetBrains Mono labels. Centered hero with a code-card preview, multi-tile feature grid, gradient text. Useful template for any developer-tools brand whose buyer evaluates by aesthetic before reading docs.",
}

export function getPortfolioCopy(slug: string): string {
  return (
    portfolioCopy[slug] ??
    "A production-grade design from the Apex Sites portfolio."
  )
}
