# Axon Growth — Restore Guide

Status: **un-mounted for launch 2026-05-21** per operator decision. Launch without sister-company ties; re-enable later once the cross-sell is ready.

The component file `src/components/apex/home/partner-axon-growth.tsx` is **preserved as-is** in the repo. Only its references and supporting copy were removed. To restore, apply the four edits below.

---

## 1. `src/app/page.tsx`

Add the import (alphabetized between `home/how-it-works` and `home/pricing-teaser`):

```diff
 import { HomeHowItWorks } from "@/components/apex/home/how-it-works"
+import { HomePartnerAxonGrowth } from "@/components/apex/home/partner-axon-growth"
 import { HomePricingTeaser } from "@/components/apex/home/pricing-teaser"
```

Mount the section between `<HomePricingTeaser />` and `<HomeFaq />`:

```diff
         <HomePricingTeaser />
+        <HomePartnerAxonGrowth />
         <HomeFaq />
```

## 2. `src/components/apex/site-footer.tsx`

Add the third link to the `COMPANY` array:

```diff
 const COMPANY: FooterLink[] = [
   { label: "About", href: "/about" },
   { label: "Email us", href: "mailto:hello@apexsites.com" },
+  { label: "Marketing → Axon Growth", href: "https://axongrowth.ai/?ref=apexsites" },
 ]
```

## 3. `src/components/apex/home/faq.tsx`

Append this Q&A object to the end of the `QUESTIONS` array (after the "Wix or Squarespace" question):

```ts
{
  q: "Do you handle Google Ads or SEO too?",
  a: "Not directly — we keep Apex focused on the deliverable. For paid acquisition and Local SEO, we partner with our sister company Axon Growth (axongrowth.ai), which is built for trades on the same playbook. Apex Sites customers get priority onboarding when they bundle.",
},
```

## 4. `src/lib/chat/system-prompt.ts`

Re-add the "What's NOT for sale here" paragraph (between the pricing block and `# The 30 designs` heading):

```md
# What's NOT for sale here
We don't run Google Ads or local SEO directly. For paid acquisition + Local SEO + lead attribution, we partner with our sister company **Axon Growth** (axongrowth.ai). Apex Sites customers get priority onboarding when they bundle. Mention this when prospects ask about marketing, ads, GBP, ranking, or "how do I get traffic."
```

Re-add the bullet to the `# How to respond` list (right before "If the user asks something off-topic"):

```md
- If the user asks about Axon Growth, link `[axongrowth.ai](https://axongrowth.ai/?ref=apexsites)` and explain it's the marketing arm, sold separately.
```

---

## Verification after restore

```sh
pnpm typecheck
pnpm build
rg -n "axongrowth|AxonGrowth|HomePartnerAxonGrowth" src/
```

Expect references in all four edited files plus the preserved component.
