// Single source of truth for the /for/[vertical] page family.
//
// Why this exists: an SEO/GEO audit found the site said "every small
// business" dozens of times and named zero actual verticals — the product
// sells to real verticals, but the HTML never said so, so it couldn't match
// what buyers actually type ("website design for plumbers"). This file maps
// exactly 8 verticals to one real, existing demo theme each. Adding a 9th
// vertical is a data-only change here — src/app/for/page.tsx and
// src/app/for/[vertical]/page.tsx both read this list and generate their
// static params from it.
//
// Content mining: `needs`, `included`, `howItWorksIntro`, and `faq` are
// original prose written for this page family, grounded in the mapped
// theme's own `content` block (src/lib/themes/*.ts) — describing what that
// specific demo's design and copy actually do, never a claim about Your
// Shopfront's own track record. No testimonials, reviews, stats, or client
// names appear anywhere in this file — there are zero customers to cite.

import { PROMO_SETUP } from "./pricing-constants"

export interface VerticalFaqItem {
  q: string
  a: string
}

export interface VerticalIncludedItem {
  title: string
  body: string
}

export interface Vertical {
  /** URL segment — the page renders at /for/<slug>. */
  slug: string
  /** Plural display name, e.g. "Plumbers". */
  name: string
  /** Singular form for mid-sentence use, e.g. "plumber". */
  singular: string
  /** Plural form for mid-sentence use. Explicit because "company" -> "companys" under naive +"s". */
  plural: string
  /** Lowercase display form for mid-sentence use. Explicit because acronyms
   *  must not be lowercased — "HVAC companies", never "hvac companies". */
  nameLower: string
  /** Must be a real key in src/lib/themes — verified against allThemes at render time. */
  themeSlug: string
  /** One-sentence sub-headline under the H1. */
  heroSub: string
  /** Brand-free <title> — the root layout template appends " — Your Shopfront". */
  metaTitle: string
  /** Unique meta description, also reused as the JSON-LD Service description. */
  metaDescription: string
  /** 2 paragraphs: what this kind of business actually needs from a website. */
  needs: [string, string]
  /** Exactly 4 vertical-specific "what's included" call-outs. */
  included: [VerticalIncludedItem, VerticalIncludedItem, VerticalIncludedItem, VerticalIncludedItem]
  /** Transition sentence into the mapped theme's own How It Works steps. */
  howItWorksIntro: string
  /** One sentence describing the specific demo's visual identity. */
  demoDescription: string
  /** Exactly 3 vertical-specific FAQ entries. */
  faq: [VerticalFaqItem, VerticalFaqItem, VerticalFaqItem]
}

export const verticals: Vertical[] = [
  {
    slug: "plumbers",
    name: "Plumbers",
    singular: "plumber",
    plural: "plumbers",
    nameLower: "plumbers",
    themeSlug: "ironside-plumbing",
    heroSub:
      "Emergency calls don't wait for business hours. Your site shouldn't either.",
    metaTitle: "Website Design for Plumbers",
    metaDescription:
      `A plumbing website built for the emergency call: 24/7 booking above the fold, flat-rate quote messaging, and service-area clarity. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "A plumbing website has one job during a burst pipe at 11pm: get a phone number or a booking form in front of someone who is already panicking, in under three seconds. That means no slideshow hero, no scrolling to find the phone number, no contact form buried on a separate page. The emergency-call action has to be the first thing a visitor sees on a phone screen, because that is where nearly every emergency search happens.",
      "The rest of the site earns trust in the background: license and bonding info, a clear service-area list so people ten miles outside your radius don't waste your dispatcher's time, and a plain description of how pricing works. Flat-rate quoted before the wrench touches anything is the model buyers already expect, and burying it reads as evasive. Photos matter less here than clarity — a clean shot of a repaired fitting says more than a stock photo of a smiling man in a hard hat.",
    ],
    included: [
      {
        title: "24/7 booking front and center",
        body: "The primary call-to-action stays visible above the fold on every device — a burst pipe doesn't wait for your visitor to scroll.",
      },
      {
        title: "Service-area and licensing, upfront",
        body: "Your license number, bonding status, and coverage radius live on the homepage, not three clicks deep in an About page.",
      },
      {
        title: "Flat-rate quote messaging",
        body: "Copy built around 'quoted before we start' — the pricing model plumbing customers already expect and reward with the call.",
      },
      {
        title: "Mobile-first, not mobile-adjusted",
        body: "Built for the one-handed phone search at 2am, then scaled up for desktop — not the other way around.",
      },
    ],
    howItWorksIntro:
      "Here's what that looks like built out. Ironside Plumbing — one of our 30 designs — is the demo we point plumbers to first: a bold, hazard-yellow-and-black layout with a booking form built into the hero and zero scrolling required to find it.",
    demoDescription:
      "a hazard-yellow hero with an always-visible booking form, built for burst-pipe searches at 2am.",
    faq: [
      {
        q: "Can the emergency-call design work for non-emergency plumbers too?",
        a: "Yes — the layout adapts. If you're mostly scheduled work like remodels and fixture installs, we can lead with a booking calendar instead of a 24/7 banner. The urgency-first version is the default because most plumbing searches are emergencies, but it's not the only mode this design supports.",
      },
      {
        q: "Do I need professional photos of my work?",
        a: "No. Send what you have — job-site phone photos work fine, and we can source respectful stock photography for anything you don't have shots of yet. What matters more is the copy: your service area, license number, and how you price a job.",
      },
      {
        q: "What if I want a different color than the yellow-and-black shown?",
        a: "Ironside ships with two alternate palettes — a red 'hazard' variant and a steel blue — built into the same layout. Any of our 30 designs is available under this same pricing regardless of trade; plumbing yellow is our default, not a rule.",
      },
    ],
  },
  {
    slug: "electricians",
    name: "Electricians",
    singular: "electrician",
    plural: "electricians",
    nameLower: "electricians",
    themeSlug: "voltcraft-electric",
    heroSub:
      "Panel upgrades and EV chargers are considered purchases. Emergency calls aren't. Your site has to sell both.",
    metaTitle: "Website Design for Electricians",
    metaDescription:
      `A licensed-electrician website built for emergency calls and project quotes alike — permit-ready copy, flat-rate pricing, upfront licensing. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "Electrical work splits into two very different buyer moods, and a good site has to serve both without feeling schizophrenic. Half your traffic is a breaker that won't reset or a panel throwing sparks — that visitor wants a phone number and a same-day promise, nothing else. The other half is someone comparing quotes for an EV charger install or a panel upgrade before a home sale, and that visitor wants to see licensing, permit handling, and a straight answer on what code-compliant work actually costs before they'll pick up the phone.",
      "Licensing is non-negotiable copy for electricians in a way it isn't for some other trades. 'Master electrician,' 'bonded and insured,' and permit language aren't marketing flourish — they're the actual differentiator buyers screen for, because unlicensed electrical work is a real liability people have heard horror stories about. A site that states this plainly, high on the page, converts better than one that assumes it's implied.",
    ],
    included: [
      {
        title: "Emergency and project modes in one layout",
        body: "The same hero form handles 'my outlet is sparking' and 'quote me an EV charger install' without forcing a visitor to guess which page they need.",
      },
      {
        title: "Licensing stated, not implied",
        body: "Master electrician, bonded-and-insured, and permit-ready language sits in the hero, not buried in an About page.",
      },
      {
        title: "Flat-rate, pre-work pricing",
        body: "Copy built around a quote before any wire gets pulled — the model that wins jobs against hourly-rate competitors.",
      },
      {
        title: "Workmanship guarantee messaging",
        body: "A stated callback policy removes the single biggest objection to hiring an unfamiliar electrician.",
      },
    ],
    howItWorksIntro:
      "Voltcraft Electric — one of our 30 designs — is the electrical-trade demo: black and voltage-yellow, a form-card hero built for both the sparking-panel visitor and the EV-charger shopper, with licensing copy stated in the first screen.",
    demoDescription:
      "a black-and-voltage-yellow layout with licensing stated up front and a form built for both emergencies and EV charger quotes.",
    faq: [
      {
        q: "I mostly do commercial work, not residential emergencies — does this design still fit?",
        a: "It adapts. We'd swap the hero from an emergency-call form to a project-intake form covering scope, timeline, and site details, and lean harder on the licensing and permit copy, which matters even more to commercial clients and property managers.",
      },
      {
        q: "Can we show EV charger and panel-upgrade pricing separately from emergency call-out rates?",
        a: "Yes — the how-it-works section is exactly the place for that split: emergency steps on one track, project steps like quote, permit, install, and inspection on another.",
      },
      {
        q: "Is the yellow-and-black look required, or can I use my own brand colors?",
        a: "It's the default because it reads as electrical at a glance, but Voltcraft ships a cobalt and a phosphor-green alternate palette, and any color change is included in your unlimited edits — this isn't a one-shot template.",
      },
    ],
  },
  {
    slug: "hvac-companies",
    name: "HVAC companies",
    singular: "HVAC company",
    plural: "HVAC companies",
    nameLower: "HVAC companies",
    themeSlug: "mesa-hvac",
    heroSub:
      "A/C down in extreme heat is a same-day decision. Your site needs to close it in one screen.",
    metaTitle: "Website Design for HVAC Companies",
    metaDescription:
      `An HVAC website built for same-day A/C emergencies and system-install comparison shopping — flat-rate diagnostics, warranty copy, booking above the fold. ${PROMO_SETUP} to start.`,
    needs: [
      "HVAC websites live and die on seasonality and speed. When a system fails in extreme heat or cold, the visitor is comparing a few tabs at once and calling whichever one answers the actual question first: same-day availability. Every design decision should optimize for that — a booking form that doesn't ask for anything beyond name, number, and a one-line problem description, because the customer will explain the rest to a real person on the phone or in person, not in a web form.",
      "The other half of HVAC revenue — new system installs, maintenance plans, tune-ups — is a considered purchase where price transparency matters more. A visitor comparing a multi-thousand-dollar system replacement wants to know upfront whether you do flat-rate diagnostics or charge a trip fee, and whether a warranty covers labor as well as parts. Burying that in a phone-only quote process loses comparison shoppers who won't call three companies just to find out.",
    ],
    included: [
      {
        title: "Same-day dispatch, above the fold",
        body: "The booking action is visible the instant the page loads — no scrolling past a hero photo to find it.",
      },
      {
        title: "Climate-emergency framing",
        body: "Copy built for 'AC out in extreme heat,' the actual search intent driving most HVAC emergency traffic.",
      },
      {
        title: "Flat-rate diagnostic pricing",
        body: "No hourly-rate ambiguity — the price is quoted on-site before any repair starts.",
      },
      {
        title: "Parts-and-labor warranty stated",
        body: "A stated 1-year warranty removes the biggest hesitation for a system-replacement decision.",
      },
    ],
    howItWorksIntro:
      "Mesa HVAC — one of our 30 designs — is built for exactly this: a deep-navy, sunset-orange emergency palette with a booking-card hero, designed for hot-market same-day A/C repair.",
    demoDescription:
      "a navy-and-orange booking-card hero built for same-day dispatch in extreme-heat markets.",
    faq: [
      {
        q: "We do more installs than emergency repairs — is the urgency-first layout still right?",
        a: "We'd shift the hero to lead with a free-estimate request instead of a same-day dispatch form, and move the warranty and financing copy higher. The underlying design and pricing stay identical — it's a content swap, not a rebuild.",
      },
      {
        q: "Can we list our service plans and maintenance memberships?",
        a: "Yes, as a dedicated section. Recurring maintenance plans are a natural addition for HVAC, and we build them into the site content during onboarding once you tell us the tiers.",
      },
      {
        q: "Does the price include seasonal promotions, like a spring tune-up special?",
        a: "Unlimited edits are included on the subscription tier, so you can email us a seasonal offer any time and we update the site same-day at no extra charge.",
      },
    ],
  },
  {
    slug: "cleaning-services",
    name: "Cleaning services",
    singular: "cleaning company",
    plural: "cleaning services",
    nameLower: "cleaning services",
    themeSlug: "brightside-cleaning",
    heroSub: "Recurring business lives or dies on how easy it is to book the first visit.",
    metaTitle: "Website Design for Cleaning Services",
    metaDescription:
      `A cleaning-company website built for instant flat-rate booking, same-cleaner consistency, and a stated re-clean guarantee. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "Cleaning is a recurring-revenue business wearing a one-time-purchase website problem: most cleaning sites make a first-time visitor call for a quote, wait for a callback, and schedule over the phone — three points of friction before the first booking even happens. The businesses that convert best let a visitor pick a home size, see an instant flat-rate price, and book a date in one sitting, the same way they'd book anything else online.",
      "Once someone books, the second job of the site is answering the questions that keep a customer from canceling after visit one: will I get the same cleaner every time, are they background-checked and insured, and what happens if something gets missed. Naming these plainly — a consistent cleaner, a stated guarantee, a real re-clean policy — does more for retention than any before-and-after photo, because the anxiety cleaning customers have is about trust and consistency, not whether a floor looks clean in a photo.",
    ],
    included: [
      {
        title: "Instant flat-rate booking",
        body: "Home size in, price out, date picked — no call-back loop required to get a first booking.",
      },
      {
        title: "Same-cleaner-every-visit messaging",
        body: "The single biggest retention lever in recurring cleaning, stated on the page instead of left as an assumption.",
      },
      {
        title: "Insurance and background-check copy",
        body: "Trust signals that matter more here than almost anywhere else — a stranger is coming into someone's home.",
      },
      {
        title: "Re-clean guarantee, spelled out",
        body: "A stated 24-hour re-clean policy removes the main objection to trying a new cleaning company.",
      },
    ],
    howItWorksIntro:
      "Brightside Cleaning — one of our 30 designs — is the recurring-service demo: a sky-and-mint gradient, soft pillowy cards, and a booking-card hero built around a 60-second instant-price flow.",
    demoDescription:
      "a sky-and-mint booking-card hero built around a 60-second instant-price flow.",
    faq: [
      {
        q: "We do commercial cleaning, not homes — does this design translate?",
        a: "The instant-quote mechanic still works — square footage in, price out — and we'd swap the home-cleaning language for commercial specifics like after-hours access and frequency options during onboarding.",
      },
      {
        q: "Can customers manage recurring bookings themselves, like skipping a week?",
        a: "The site itself is a marketing and lead-capture site, not a scheduling backend. For an existing booking system like Housecall Pro or Jobber, we can link out to it, and we're happy to talk through what that integration should look like for your setup.",
      },
      {
        q: "Do we need real photos of our team for the trust section?",
        a: "Real photos help here more than in most trades, since customers are inviting people into their homes — but if you don't have them yet, we can launch with respectful stock and swap in your team's photos the moment you send them, at no extra charge.",
      },
    ],
  },
  {
    slug: "restaurants",
    name: "Restaurants",
    singular: "restaurant",
    plural: "restaurants",
    nameLower: "restaurants",
    themeSlug: "angelos",
    heroSub: "Are you open right now, what's on the menu, and where do I park — answer those three things first.",
    metaTitle: "Website Design for Restaurants",
    metaDescription:
      `A restaurant website built to answer hours, menu, and location instantly, with a photography-led layout for the food itself. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "A restaurant website exists to answer three questions faster than a phone call would: are you open right now, what's on the menu, and where exactly are you. Hours and location need to be visible without a click — buried hours are the single most common reason a hungry visitor bounces to a competitor's listing instead. The menu doesn't need to be a PDF wedged into an app; the actual dishes, with prices, readable on a phone in daylight, is worth more than any hero photo.",
      "Beyond the essentials, the strongest restaurant sites lean into whatever makes the place actually distinct — a family recipe going back generations, a wood-fired oven, a neighborhood history — because that's the difference between looking like every other listing on a delivery app and giving someone a reason to walk in instead of ordering delivery. Photography carries more weight here than in almost any other kind of business: one good overhead shot of a finished dish does more conversion work than three paragraphs of description.",
    ],
    included: [
      {
        title: "Hours and address, above the fold",
        body: "The two facts a hungry visitor needs fastest, visible without scrolling or clicking through to a separate page.",
      },
      {
        title: "Real menu, not a PDF",
        body: "Dishes and prices rendered as actual page content — readable on a phone, indexable by search, not locked in a download.",
      },
      {
        title: "Story and history, given room",
        body: "A dedicated space for what makes the place distinct — a recipe, a founding year, a neighborhood connection — not squeezed into a footer line.",
      },
      {
        title: "Photography-led layout",
        body: "Built to showcase food photography prominently, because a finished-dish photo converts harder here than in almost any other category.",
      },
    ],
    howItWorksIntro:
      "Angelo's — one of our 30 designs — is the restaurant demo: a newspaper-Italian-Americana layout with a parchment-and-tomato palette, a gallery hero built for food photography, and a masthead treatment that reads as heritage rather than generic.",
    demoDescription:
      "a parchment-and-tomato newspaper-style layout with a gallery hero built for food photography.",
    faq: [
      {
        q: "Can we take online orders or reservations through the site?",
        a: "The site itself is built for menu, hours, story, and contact — the pieces that get someone to call or walk in. For online ordering or reservation booking, we link out to whatever platform you already use, rather than trying to rebuild that infrastructure inside a marketing site.",
      },
      {
        q: "How often can we update the menu?",
        a: "As often as you want — menu changes, seasonal specials, and holiday-hours updates are all covered under unlimited edits on the subscription tier, and we turn them around same-day.",
      },
      {
        q: "We're not a heritage restaurant with decades of history — does this design still work?",
        a: "The layout and photography focus work for any food business; the copy just leans on whatever your actual story is — a chef's background, a signature dish, a first-year opening story — rather than manufacturing history you don't have.",
      },
    ],
  },
  {
    slug: "photographers",
    name: "Photographers",
    singular: "photographer",
    plural: "photographers",
    nameLower: "photographers",
    themeSlug: "mara-lin",
    heroSub: "The portfolio is the pitch. Everything else on the site should get out of its way.",
    metaTitle: "Website Design for Photographers",
    metaDescription:
      `An editorial photography website built around a full-bleed gallery, plain usage-rights language, and a brief-first inquiry flow. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "For a photographer, the website's entire job is to get out of the way of the work. A gallery that loads slowly, crops images to fit someone else's grid, or surrounds photos with unrelated chrome is actively working against the one thing that sells the service: the images themselves, shown large and deliberately, in an order that tells a story rather than a random grid. The best photographer sites read closer to a magazine spread than a typical small-business homepage — generous negative space, full-bleed images, minimal text competing for attention.",
      "Past the gallery, the second job is making the business side frictionless without cheapening the aesthetic — a clear way to send a brief or inquire about a booking, plain language about usage rights and licensing (a real point of confusion for clients hiring for the first time), and enough information about process that a client knows what a shoot day actually looks like before they commit. None of that needs to look like a typical contact form; it can carry the same editorial restraint as the rest of the site.",
    ],
    included: [
      {
        title: "Full-bleed gallery, not a grid",
        body: "Images shown large and deliberately sequenced, closer to an editorial spread than a stock photo grid.",
      },
      {
        title: "Editorial type, minimal chrome",
        body: "Type and layout built to stay out of the way of the photography — nothing competing with the work for attention.",
      },
      {
        title: "Usage-rights language, stated plainly",
        body: "A common friction point for first-time clients, addressed upfront instead of left for a contract negotiation.",
      },
      {
        title: "Brief-first inquiry flow",
        body: "An inquiry path built around 'tell us who this is for and what it needs to say,' not a generic contact form.",
      },
    ],
    howItWorksIntro:
      "Mara Lin — one of our 30 designs — is the editorial-photography demo: near-black and warm-white, a gallery hero, and a process built around brief, concept, shoot, and delivery — the same rhythm a real commission follows.",
    demoDescription:
      "a near-black editorial gallery hero built to let full-bleed photography do the selling.",
    faq: [
      {
        q: "Can we swap in our own portfolio images?",
        a: "That's the entire point — send us your selects and we build the gallery around them during onboarding. The demo images are illustrative; your site launches with your work.",
      },
      {
        q: "Do we need a video reel, not just stills?",
        a: "The gallery layout supports both — if directing or motion work is part of what you sell, we build that into the same editorial structure rather than bolting on a separate video page.",
      },
      {
        q: "Is this too minimal for a photographer who also does events or family portraits, not just editorial work?",
        a: "The restraint of this particular design suits fashion and editorial work best; for event or family photography we'd usually point you toward one of our warmer, gallery-style designs instead — happy to talk through which of the 30 fits your actual work.",
      },
    ],
  },
  {
    slug: "florists",
    name: "Florists",
    singular: "florist",
    plural: "florists",
    nameLower: "florists",
    themeSlug: "wildflower-stone",
    heroSub: "What's in season this week is the whole offer. Show it, don't bury it in a catalog.",
    metaTitle: "Website Design for Florists",
    metaDescription:
      `A florist website built around weekly seasonal availability, local-sourcing copy, and a separate path for weddings and events. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "Florist websites tend to fail in one of two directions: either a static catalog of arrangements that never changes, so it stops matching what's actually available, or a generic template that could belong to any florist in the country. The strongest florist sites lean into what's actually true about the business — what's in bloom this week, what's grown or sourced locally, and what makes the arrangements distinct from a supermarket bouquet — and treat that as the main content, not an afterthought below a generic hero banner.",
      "Weddings and events are usually the highest-margin part of a florist's business and deserve their own clear path — a way to request a consultation and understand how far in advance to book, without needing real client photos, which this kind of site correctly never asks for. Day-to-day retail traffic, like a bouquet for pickup or a standing weekly order, needs a much simpler path: what's available now, and how to get it, without wading through wedding-package copy to find it.",
    ],
    included: [
      {
        title: "Weekly-availability framing",
        body: "Built around 'what's in season this week' rather than a static catalog that goes stale the moment inventory changes.",
      },
      {
        title: "Local-sourcing language, given room",
        body: "A dedicated place to say what's grown or sourced nearby — a real differentiator against wire-service competitors.",
      },
      {
        title: "Wedding and event path, separated",
        body: "A distinct inquiry flow for the highest-margin work, separate from day-to-day retail browsing.",
      },
      {
        title: "Quiet, editorial restraint",
        body: "Hand-drawn dividers and an all-italic nav instead of the loud, crowded layout most florist templates default to.",
      },
    ],
    howItWorksIntro:
      "Wildflower & Stone — one of our 30 designs — is the florist demo: cream, sage, and dusty rose, Cormorant Garamond type, and a structure built around weekly availability rather than a fixed product catalog.",
    demoDescription:
      "a cream-and-sage editorial layout built around weekly seasonal availability rather than a fixed catalog.",
    faq: [
      {
        q: "We don't do weddings, just retail arrangements — is half this design wasted on us?",
        a: "Not at all — we'd drop the wedding and event path entirely and put the full weight of the page behind weekly availability and standing orders, which is most of what this layout is built to do anyway.",
      },
      {
        q: "How do we update what's in season?",
        a: "Email us the change — a new weekly drop, a sold-out item, a seasonal shift — and it's live same-day under unlimited edits. No login or CMS training required.",
      },
      {
        q: "Can we sell dried arrangements that ship nationally alongside local pickup?",
        a: "Yes — the site can clearly separate 'pickup from the studio' from 'ships anywhere,' which matters since dried botanicals and fresh bouquets have completely different fulfillment expectations.",
      },
    ],
  },
  {
    slug: "yoga-studios",
    name: "Yoga & wellness studios",
    singular: "yoga studio",
    plural: "yoga studios",
    nameLower: "yoga and wellness studios",
    themeSlug: "still-point",
    heroSub: "The room's atmosphere is the offer. The site should feel like walking in, not like buying a gym membership.",
    metaTitle: "Website Design for Yoga & Wellness Studios",
    metaDescription:
      `A yoga and wellness studio website built around schedule visibility, genuine beginner-welcome language, and calm, unhurried pacing. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "Yoga and wellness studios sell an atmosphere as much as a service, and most studio websites undercut that by defaulting to a generic fitness-membership template — countdown timers, aggressive sale banners, stock photos of people mid-jump. The sites that actually convert quiet visitors into first-time students do the opposite: slow pacing, real language about who the classes are for ('all levels, genuinely' means something specific — no performance, no comparison), and enough calm in the design itself that it previews what the room will feel like before anyone walks in.",
      "Practically, the two things a new student needs fastest are a schedule — morning or evening, drop-in or booked ahead — and a plain answer to whether they'll feel out of place as a beginner. Membership pricing matters, but it earns its place after those two questions are answered, not before. A studio that leads with pricing before atmosphere reads as transactional in a category where the whole pitch is the opposite.",
    ],
    included: [
      {
        title: "Schedule, front and center",
        body: "Morning and evening class times visible immediately — the first practical question any new student actually has.",
      },
      {
        title: "Genuine beginner-welcome language",
        body: "Copy that says specifically what 'all levels' means, instead of the vague reassurance most studio sites default to.",
      },
      {
        title: "Calm, unhurried pacing",
        body: "No countdown timers or sale banners — the design itself previews the atmosphere of the room.",
      },
      {
        title: "Membership pricing, placed second",
        body: "Pricing and unlimited-access plans shown after the schedule and welcome copy, not leading with a sales pitch.",
      },
    ],
    howItWorksIntro:
      "Still Point — one of our 30 designs — is the yoga and wellness demo: bone, terracotta, and sage, an italic display face, and a deliberately slow-paced layout built to preview the room's atmosphere rather than sell a gym membership.",
    demoDescription:
      "a bone-and-terracotta layout with deliberately slow, calm pacing built to preview a room's atmosphere.",
    faq: [
      {
        q: "We teach more than yoga — meditation, breathwork, sound baths — does this design cover that?",
        a: "Yes — the schedule and class-type structure isn't yoga-specific; it's built to list any mix of session types with their own times and descriptions.",
      },
      {
        q: "Can students book a class or just see the schedule?",
        a: "The site itself is built for schedule visibility and first-visit conversion, not a full booking-system replacement. For actual reservations, we link out to whatever booking platform you already run.",
      },
      {
        q: "Is this too quiet for a studio that also wants to promote workshops and events?",
        a: "Workshops and one-off events get their own section, styled with the same restraint as the rest of the page — the goal is highlighting them without breaking the calm tone that's the whole point of this design.",
      },
    ],
  },
]

export function getVertical(slug: string): Vertical | undefined {
  return verticals.find((v) => v.slug === slug)
}
