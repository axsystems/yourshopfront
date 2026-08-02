// Single source of truth for the /for/[vertical] page family.
//
// Why this exists: an SEO/GEO audit found the site said "every small
// business" dozens of times and named zero actual verticals — the product
// sells to real verticals, but the HTML never said so, so it couldn't match
// what buyers actually type ("website design for plumbers"). This file maps
// each vertical to one real, existing demo theme. Adding another vertical
// is a data-only change here — src/app/for/page.tsx and
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
        body: "Your stated 1-year warranty removes the biggest hesitation for a system-replacement decision.",
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
  {
    slug: "roofers",
    name: "Roofers",
    singular: "roofer",
    plural: "roofers",
    nameLower: "roofers",
    themeSlug: "summit-roofing",
    heroSub:
      "A storm just hit. The next call goes to whichever roofer's site answers fastest.",
    metaTitle: "Website Design for Roofers",
    metaDescription:
      `A roofing website built for the storm-damage search: a free-inspection CTA up top, insurance-claim messaging, and certification stated upfront. ${PROMO_SETUP} to start.`,
    needs: [
      "Most roofing searches start after something has already gone wrong — a storm rolled through, shingles are missing, and a wet ceiling stain is spreading. That visitor isn't browsing; they want a free inspection scheduled in the next two minutes, and a form buried past a scrolling hero photo loses them to whichever competitor's site puts a name-and-phone field first. The page's entire job in that moment is speed: capture contact details, confirm someone will get on the roof soon, and get out of the way.",
      "The other half of roofing work — full replacements, re-roofs planned around a home sale, routine maintenance — moves at buyer-comparison speed instead. That visitor wants to see manufacturer certification, licensing, and a plain statement of how insurance claims get handled before they'll commit to a call, because a roof is one of the most expensive single repairs a homeowner ever makes and unlicensed work is a real, documented risk. Stating certification and warranty terms plainly, high on the page, does more to convert that visitor than any drone photo of a finished roof.",
    ],
    included: [
      {
        title: "Free-inspection CTA, above the fold",
        body: "The call-to-action for a free inspection stays visible the instant the page loads — a storm-damage search doesn't wait for a visitor to scroll past a hero image.",
      },
      {
        title: "Insurance-claim language stated",
        body: "Copy built around walking a homeowner through the adjuster process, not just quoting a repair price — the actual friction point in most storm-damage jobs.",
      },
      {
        title: "Certification and licensing, upfront",
        body: "Manufacturer certification and bonding status live on the homepage, not buried three clicks deep in an About page.",
      },
      {
        title: "Warranty terms, spelled out",
        body: "A stated manufacturer-plus-workmanship warranty, transferable to the next owner, removes the biggest hesitation on a full replacement.",
      },
    ],
    howItWorksIntro:
      "Summit Roofing — one of our 30 designs — is the demo we point roofers to first: an industrial dark layout with an orange-glow accent and a form-card hero built to capture a storm-damage lead in seconds.",
    demoDescription:
      "an industrial dark layout with an orange-glow accent and a form-card hero built for storm-damage urgency.",
    faq: [
      {
        q: "We mostly do standalone repairs and re-roofs, not storm and insurance claims — does this design still fit?",
        a: "Yes — we'd swap the hero from a free-inspection form to a straightforward quote-request form and move the insurance-claim copy lower, since it matters less to that buyer. The underlying layout and pricing stay identical.",
      },
      {
        q: "Do we need professional drone or aerial photography?",
        a: "No. Job-site phone photos work fine to start, and we can source respectful stock roofing photography for anything you don't have shots of yet — the certification and warranty copy carries more of the trust-building than photography does here.",
      },
      {
        q: "Is the orange-and-black look required, or can we use a different palette?",
        a: "Summit ships with a cyan and a crimson alternate palette built into the same layout, and any color change is included in your unlimited edits — this isn't a one-shot template.",
      },
    ],
  },
  {
    slug: "painters",
    name: "Painters",
    singular: "painter",
    plural: "painters",
    nameLower: "painters",
    themeSlug: "heritage-painters",
    heroSub:
      "A paint job either still looks right in five years or it doesn't. Your site should look like it knows the difference.",
    metaTitle: "Website Design for Painters",
    metaDescription:
      `A painting-company website built around a gallery of finished work, an itemized-quote process, and a stated workmanship warranty. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "Painting is a visible-quality business, which means the strongest sales tool a painter has is a gallery of finished rooms and exteriors, not a paragraph describing craftsmanship. A visitor comparing painters is really comparing photos — clean cut lines, even coverage, trim that doesn't bleed onto the wall — and a site that buries its best work behind a stock hero photo of a paint roller is wasting its one real advantage. The gallery should lead, not follow.",
      "Past the gallery, the buyers who convert best want an itemized written quote before they'll commit, because the industry has a reputation for verbal estimates that balloon once prep work starts. Stating the process plainly — an on-site visit, an itemized scope covering surfaces and product specs, and a workmanship warranty that actually says what happens if paint peels or bubbles — reads as a serious operation rather than a guy with a truck and a ladder.",
    ],
    included: [
      {
        title: "Gallery-led homepage",
        body: "Finished work shown large, up front — the actual differentiator in a visible-quality trade, not a paragraph of adjectives.",
      },
      {
        title: "Itemized written quotes stated",
        body: "Copy built around an on-site visit and a detailed scope in writing, not a vague verbal estimate that grows mid-project.",
      },
      {
        title: "Licensing and insurance, upfront",
        body: "Bonded-and-insured status stated on the homepage — a real screening factor for anyone letting a crew into their home.",
      },
      {
        title: "Workmanship warranty spelled out",
        body: "A stated multi-year warranty against peeling or bubbling removes the biggest hesitation on a first-time hire.",
      },
    ],
    howItWorksIntro:
      "Heritage Painters — one of our 30 designs — is the demo we point painters to first: a warm ivory-and-terracotta layout with an editorial Fraunces serif and a gallery hero built to let finished work do the selling.",
    demoDescription:
      "a warm ivory-and-terracotta gallery layout built to let finished paint work do the selling.",
    faq: [
      {
        q: "We do commercial and multi-unit painting, not residential homes — does the gallery format still work?",
        a: "Yes — we'd swap residential interiors for commercial and multi-unit project photos and lean harder on scheduling-around-tenants copy, which matters more to that buyer. The gallery-first structure works for either.",
      },
      {
        q: "We don't have professional photography of past jobs yet — is that a problem?",
        a: "No. Job-site phone photos are fine to start, and we can source respectful stock photography for any gap while you build up your own gallery over time.",
      },
      {
        q: "Can we show interior, exterior, and cabinetry work all in one gallery?",
        a: "Yes — send us photos from each and we'll order the gallery so a visitor sees a mix of what you actually do, not just whichever job you happened to photograph most recently.",
      },
    ],
  },
  {
    slug: "landscapers",
    name: "Landscapers",
    singular: "landscaper",
    plural: "landscapers",
    nameLower: "landscapers",
    themeSlug: "greenwise-lawn",
    heroSub:
      "Spring is a scramble and August goes quiet — the site has to sell through both, not just the rush.",
    metaTitle: "Website Design for Landscapers",
    metaDescription:
      `A landscaping website built around property-specific quote requests, a clear split between maintenance and installs, and slow-season lead flow. ${PROMO_SETUP} to start.`,
    needs: [
      "Landscaping demand is lumpy in a way a lot of local-service sites never plan for: spring brings a rush of aeration, mulch, and cleanup requests all at once, while a dry August or a frozen January can leave the phone quiet for weeks. A site tuned only for the spring rush wastes its off-season job, which is showing a property owner exactly what a standing maintenance contract covers so signing on doesn't have to wait for next spring.",
      "A hardscape patio or a full yard redesign is also a different sale than a weekly mow, and the site should make that split obvious instead of routing a five-figure paver project through the same one-line box as a routine trim. Finished-install photos earn the big-ticket redesign; a fast, property-specific quote ask earns the standing maintenance contract. A crew's truck sitting in a driveway all afternoon with the company name on the door is doing real advertising too — the site just has to be ready to catch whoever looks it up that evening.",
    ],
    included: [
      {
        title: "Property-specific quote messaging",
        body: "Copy built around 'tell us about your property, get a real number' — the pricing conversation this buyer already expects, resolved with a call instead of a guess.",
      },
      {
        title: "Installs shown apart from maintenance",
        body: "Hardscape and redesign work given its own space with finished photos — a different sale from a weekly mow, priced and pitched differently.",
      },
      {
        title: "Off-season service messaging",
        body: "Room for whatever keeps revenue moving in the slow months — snow, cleanup, dormant-season work — instead of a page that only makes sense every spring.",
      },
      {
        title: "Insured-crew language",
        body: "Coverage status stated plainly — the detail that matters when equipment and crews are working around a property unsupervised.",
      },
    ],
    howItWorksIntro:
      "Greenwise Lawn — one of our 30 designs — is the demo we point landscapers to first: a naturalist moss-and-cream layout with a booking-card hero, built around a property-specific quote ask rather than a generic contact page.",
    demoDescription:
      "a moss-and-cream naturalist layout with a booking-card hero built around a property-specific quote ask.",
    faq: [
      {
        q: "We mostly do one-off installs and hardscape, not recurring mowing — does this design still fit?",
        a: "Yes — we'd lead with a project-inquiry section covering scope and photos of past installs instead of the maintenance-contract framing, and move recurring-service messaging lower, since a different buyer is doing the comparing.",
      },
      {
        q: "The phone goes quiet every winter — can the site do anything about that?",
        a: "That's what the off-season messaging is for — tell us what you actually offer in the slow months, whether that's snow removal, holiday lighting, or dormant-season pruning, and we build it into the site so there's a reason to convert traffic year-round, not just in spring.",
      },
      {
        q: "Do we need to publish pricing, or is a quote request enough?",
        a: "A quote request is enough. Most landscaping buyers expect to describe their property and get a number back — a published price list rarely holds up once lot size, terrain, and access start changing the actual cost job to job.",
      },
    ],
  },
  {
    slug: "movers",
    name: "Movers",
    singular: "mover",
    plural: "movers",
    nameLower: "movers",
    themeSlug: "bellhorn-movers",
    heroSub:
      "Nobody calls three moving companies for fun. Whichever site shows a real price first gets the booking.",
    metaTitle: "Website Design for Movers",
    metaDescription:
      `A moving-company website built around an instant flat-rate quote calculator, licensed-and-insured language, and same-day booking. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "Moving is a high-anxiety, one-time purchase, and most moving-company sites make it worse by forcing a phone call just to learn a rough price. The sites that convert best put a calculator in the hero itself — zip codes and home size in, an instant flat-rate estimate out — so a visitor comparing three or four movers gets a real number from yours before they've had to explain their situation out loud to anyone. Losing that visitor to a call-only competitor happens in the first ten seconds, not after a conversation.",
      "Past the price, the specifics that separate a real moving company from a guy with a truck and a rented dolly are exactly what buyers can't tell from a stock photo: is the crew insured, does the price include furniture wrapping and disassembly, and will they actually place items in the new space or just drop boxes in the garage. Stating those details plainly, next to the price, is what turns an instant quote into a booked date instead of one more open tab.",
    ],
    included: [
      {
        title: "Flat-rate pricing, front and center",
        body: "The page leads with a real flat-rate number instead of 'call for a quote' — the ask still routes to a call, but the price expectation is set before that call happens.",
      },
      {
        title: "Licensed-and-insured, stated",
        body: "Coverage status shown plainly next to the price — the real differentiator between a company and an unmarked truck.",
      },
      {
        title: "Full-service scope, spelled out",
        body: "Wrapping, disassembly, and placement in the new space stated upfront, not left for the crew to explain on move day.",
      },
      {
        title: "Same-day booking messaging",
        body: "A visible path to book today's or tomorrow's date for the buyer moving on a short timeline, not planning months out.",
      },
    ],
    howItWorksIntro:
      "Bellhorn Movers — one of our 30 designs — is the demo we point movers to first: a friendly navy-and-orange layout with a calculator hero that returns a live flat-rate price before a visitor ever picks up the phone.",
    demoDescription:
      "a navy-and-orange calculator hero that returns a live flat-rate price before a visitor has to call.",
    faq: [
      {
        q: "We do long-distance moves, not just local — does an instant calculator still make sense?",
        a: "For local moves the calculator can quote a real flat rate; for long-distance we'd swap it for a request-a-quote form that captures origin, destination, and inventory, since long-distance pricing depends on weight and distance in a way that isn't reducible to a one-screen calculator.",
      },
      {
        q: "Can we show separate pricing for packing services versus load-and-drive only?",
        a: "Yes — the pricing section can list packing as an add-on tier next to the base moving rate, so a visitor who wants full-service versus a self-pack option can see both without calling to ask.",
      },
      {
        q: "Is the navy-and-orange palette required, or can we use our own brand colors?",
        a: "Bellhorn ships with a coral and a teal-indigo alternate palette built into the same layout, and any color swap is included in your unlimited edits.",
      },
    ],
  },
  {
    slug: "wine-bars",
    name: "Wine bars",
    singular: "wine bar",
    plural: "wine bars",
    nameLower: "wine bars",
    themeSlug: "cask-vine",
    heroSub:
      "Someone deciding where to go tonight needs to feel the room before they book the table.",
    metaTitle: "Website Design for Wine Bars",
    metaDescription:
      `A wine bar website built around a reservation path, a gallery that carries the room's atmosphere, and a stated seating policy. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "A wine bar sells an evening, not a product, and a site that leads with a drinks-menu PDF is selling the wrong thing. The visitor deciding between your bar and three others tonight is really asking one question: what does this room feel like — quiet or loud, romantic or casual, the kind of place worth dressing up for. A gallery-led homepage answers that in three photos faster than any paragraph of copy can, which is why the strongest wine-bar sites treat the interior itself as the hero image, not an afterthought below a reservation button.",
      "Once the atmosphere lands, the practical questions matter fast: can I actually get a table tonight, is this a reservation-required place or a walk-in one, and how long am I expected to stay. A stated seating policy — table turns or none, walk-ins welcome or reservations recommended — removes the single biggest source of hesitation for someone who doesn't want to show up and get turned away. Wine-list philosophy and a path to buy a bottle to take home round out the page, but they earn their place after the room and the reservation path, not before.",
    ],
    included: [
      {
        title: "Gallery-led hero",
        body: "The room itself shown large and first — atmosphere sells a wine bar faster than a drinks list ever will.",
      },
      {
        title: "Reservation path, front and center",
        body: "A clear way to book a table (or see that walk-ins are welcome) without hunting through a separate page.",
      },
      {
        title: "Seating policy, stated plainly",
        body: "Table turns or none, reservations recommended or not — removed as a source of hesitation before someone walks in.",
      },
      {
        title: "Retail bottle-sales path",
        body: "A place to highlight bottles available to take home, for the wine list that doubles as a retail offer.",
      },
    ],
    howItWorksIntro:
      "Cask & Vine — one of our 30 designs — is the demo we point wine bars to first: a wine-and-gold gallery layout with a low-lit hero photograph and an editorial Playfair Display serif, built to carry a room's atmosphere before a single word of copy loads.",
    demoDescription:
      "a wine-and-gold gallery layout with a low-lit hero photograph, built to carry a room's atmosphere before any copy.",
    faq: [
      {
        q: "We're a full bar and small-plates menu, not exclusively a natural-wine list — does this design still fit?",
        a: "Yes — the gallery-led structure and reservation path work regardless of what's actually on the list; the copy states your own wine and food program rather than any specific list philosophy shown in the demo.",
      },
      {
        q: "Can we take reservations directly through the site?",
        a: "The site itself is built for atmosphere, hours, and a reservation call-to-action. For the actual booking system, we link out to whatever platform you already use, like Resy or Tock, rather than rebuilding that infrastructure inside a marketing site.",
      },
      {
        q: "Do we need professional interior photography for the gallery to carry the room the way this demo does?",
        a: "It helps more here than in most categories, since the room is the whole pitch — but we can launch with respectful stock and swap in your own photography the moment you have it, at no extra charge.",
      },
    ],
  },
  {
    slug: "breweries",
    name: "Breweries",
    singular: "brewery",
    plural: "breweries",
    nameLower: "breweries",
    themeSlug: "north-fork",
    heroSub: "What's on tap right now is the whole homepage. Everything else is secondary.",
    metaTitle: "Website Design for Breweries",
    metaDescription:
      `A brewery and taproom website built around an easy-to-update tap list, patio and dog-policy clarity, and a cans-to-go path. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "A brewery's website answers a narrower question than most local businesses: is the taproom open right now, and what's actually pouring. Rotating taps mean that answer changes weekly or even daily, which means the tap list has to be something the owner can update by email in minutes, not a page that requires calling a developer every time a seasonal batch runs out. A site that still lists a beer that sold out three weeks ago reads as closed, even during business hours.",
      "Past the tap list, the questions that decide whether someone drives over tonight are specific and practical: is there food or a food truck, can the dog come along, and is there a cans-or-crowlers-to-go option for anyone who doesn't want to stay and drink in. Independent breweries also compete on identity against bigger regional and national brands, so a site carrying a real heritage badge or masthead-style mark — instead of a generic bar-and-grill template — does real work toward standing out on a crowded strip of taprooms.",
    ],
    included: [
      {
        title: "Current tap board, given real space",
        body: "The lineup gets its own section on the page instead of a sidebar afterthought, and when what's pouring changes, we update it the same day under your unlimited edits.",
      },
      {
        title: "Patio and dog policy, stated",
        body: "The practical questions that decide a visit, answered before someone drives over, not discovered at the door.",
      },
      {
        title: "Heritage badge identity",
        body: "A masthead-style mark built to carry an independent brewery's own identity instead of a generic bar-and-grill look.",
      },
      {
        title: "Cans-and-crowlers-to-go path",
        body: "A separate path for the customer who wants to take beer home instead of staying in the taproom.",
      },
    ],
    howItWorksIntro:
      "North Fork — one of our 30 designs — is the demo we point breweries to first: a beer-hall masthead layout with a heritage badge mark, forest-and-mustard palette, built to read as an independent taproom rather than a chain.",
    demoDescription:
      "a beer-hall masthead layout with a heritage badge mark, built for an independent taproom identity.",
    faq: [
      {
        q: "We distribute to bars and stores too, not just a taproom — can the site cover both?",
        a: "Yes — we'd add a 'find our beer' section pointing to retail and bar accounts alongside the taproom hours and tap list, so both audiences land on the right information.",
      },
      {
        q: "How often can we update what's currently on tap?",
        a: "As often as it changes — email us the update and it's live same-day under unlimited edits. No login or CMS training required to keep the list accurate.",
      },
      {
        q: "We don't run a food program at all — does the site need one?",
        a: "No — if you don't serve food, the site simply states that plainly, or points to a rotating food-truck schedule if you host one, instead of implying a kitchen that doesn't exist.",
      },
    ],
  },
  {
    slug: "bookstores",
    name: "Bookstores",
    singular: "bookstore",
    plural: "bookstores",
    nameLower: "bookstores",
    themeSlug: "print-block-books",
    heroSub:
      "Someone deciding whether to drive over wants to know what's happening this week, not just that you sell books.",
    metaTitle: "Website Design for Bookstores",
    metaDescription:
      `An independent-bookstore website built around staff picks, an easy-to-update events calendar, and a distinct maker-shop identity. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "An independent bookstore is competing directly against same-day shipping, which means the website's job isn't to look like a catalog — it's to answer why walking in beats ordering online. Staff picks, a specific curatorial voice, and local zines or small-press titles nobody else stocks are the actual differentiators, and they need real room on the homepage instead of being squeezed into a footer line below a generic 'shop now' button that just makes the store look like a smaller, slower Amazon.",
      "The second job is staying current: an events calendar for readings, launches, and book clubs that's actually accurate, updated weekly rather than showing a stale flyer from two months ago. A store that can update its own events and staff picks by email, without touching code, keeps the site matching what's really happening in the shop — which matters more here than in almost any other retail category, because the whole pitch is 'come see what's new,' and a site that never changes undercuts that pitch on sight.",
    ],
    included: [
      {
        title: "Staff-picks section",
        body: "Real room for a curatorial voice — the actual reason to walk in instead of ordering the same title online.",
      },
      {
        title: "Events section, given real space",
        body: "Readings, launches, and book clubs get their own place on the page instead of a footer line — email us an update and it's live the same day under your unlimited edits.",
      },
      {
        title: "Local-press and zine shelf",
        body: "A dedicated place for small-run titles a chain or an algorithm won't ever surface.",
      },
      {
        title: "Distinct shop identity",
        body: "A visual identity built to feel like a specific store, not a generic retail template with a different name.",
      },
    ],
    howItWorksIntro:
      "Print Block — one of our 30 designs — is the demo we point bookstores to first: a riso-print, halftone-overlay layout in navy, pink, and green, built to carry a maker-shop identity instead of a generic retail look.",
    demoDescription:
      "a riso-print halftone layout in navy, pink, and green, built to carry a distinct maker-shop identity.",
    faq: [
      {
        q: "We also sell online and ship nationally, not just in-store — does this design still fit?",
        a: "Yes — we'd add a clear path to your online shop or a 'ship to me' note alongside the in-store staff picks and events, so both kinds of customer find what they need.",
      },
      {
        q: "Can we list weekly events like readings and book clubs ourselves?",
        a: "Email us the update — a new reading, a launch, a schedule change — and it's live the same day under unlimited edits. No login or CMS training required.",
      },
      {
        q: "Do we need a real-time inventory search so people can check if a title's in stock?",
        a: "The site isn't built as a full inventory system; a simple 'call or email to check stock' path covers that need without the cost and maintenance of a real-time search feature.",
      },
    ],
  },
  {
    slug: "design-studios",
    name: "Design studios",
    singular: "design studio",
    plural: "design studios",
    // Deliberately "creative studios," not "design studios": the template
    // interpolates this into "Pick the {nameLower} design shown above" and
    // "the {nameLower} design shown above" — with "design studios" that
    // reads as a stutter ("design studios design"). "Creative studios" is
    // an accurate synonym for this vertical and reads clean in both spots.
    nameLower: "creative studios",
    themeSlug: "swiss-editorial",
    heroSub:
      "A client vetting studios is really vetting judgment. Show a handful of projects fully, not a wall of thumbnails.",
    metaTitle: "Website Design for Design Studios",
    metaDescription:
      `A design-studio website built around a curated project index, a stated process with defined revision rounds, and a brief-first inquiry path. ${PROMO_SETUP} to start, live in 24 hours.`,
    needs: [
      "A design studio's website is itself a portfolio piece, which means the usual small-business instinct — show everything, cover every service — actively works against it. The studios that read as serious present a small, curated set of projects, each given real space to explain the problem and the reasoning behind the solution, rather than a crowded grid of thumbnails that makes every project look interchangeable. Restraint in the layout itself is part of the pitch: if the site is disciplined, the client assumes the work will be too.",
      "Past the portfolio, the buyers who convert best want the actual process stated plainly before they'll reach out — how many concept directions, how many rounds of revision are included, and what handoff looks like. A studio site that only says 'let's talk' without any of that reads as unstructured, and structure is exactly what a client hiring for a real engagement is trying to screen for. An inquiry path built around 'tell us about the project' does more work here than a generic contact form ever could.",
    ],
    included: [
      {
        title: "Curated project index",
        body: "A small set of projects shown fully, not a crowded grid — restraint in the layout signals restraint in the work.",
      },
      {
        title: "Process stated, with rounds defined",
        body: "Discovery, concept, a stated number of revision rounds, and handoff — the structure serious clients screen for.",
      },
      {
        title: "One direction, not a spread of options",
        body: "A single, fully developed concept presented with reasoning, instead of three half-considered options left for the client to referee.",
      },
      {
        title: "Documented handoff",
        body: "Final files and written brand guidelines delivered at the end of the engagement, not just a mockup link and a goodbye.",
      },
    ],
    howItWorksIntro:
      "Swiss Editorial — one of our 30 designs — is the demo we point design studios to first: a Swiss-style editorial layout in cream, ink, and oxblood, with a tabular project index and a process built around one fully developed direction at a time.",
    demoDescription:
      "a Swiss-style editorial layout with a tabular project index and restrained cream-and-ink type.",
    faq: [
      {
        q: "We do brand strategy and naming, not just visual identity — does the project-index format still work?",
        a: "Yes — the same structure works for strategy engagements; each entry just leads with the problem and the reasoning rather than a visual mockup, which suits process-heavy work well.",
      },
      {
        q: "Can we show real client names, or does the understated approach in the demo apply to us too?",
        a: "That's your call entirely — the demo keeps client names understated as a stylistic choice for that particular studio; your site can name clients plainly if that's how you prefer to present the work.",
      },
      {
        q: "Is the minimal, restrained look too quiet for a studio that wants a bolder homepage?",
        a: "This particular design's restraint is the point for a Swiss-editorial aesthetic; if your studio's brand is louder and more maximalist, we'd point you toward one of our bolder designs instead — any of the 30 is available at this same price.",
      },
    ],
  },
]

export function getVertical(slug: string): Vertical | undefined {
  return verticals.find((v) => v.slug === slug)
}
