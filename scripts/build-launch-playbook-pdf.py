#!/usr/bin/env python3
"""Build the Day-1 Launch Playbook PDF from docs/marketing-launch-playbook.md.

Output: C:/Users/admin/Desktop/Your-Shopfront-Launch-Playbook.pdf

Run: python scripts/build-launch-playbook-pdf.py
Re-run any time the markdown source is updated.
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path("C:/Users/admin/Desktop/Your-Shopfront-Launch-Playbook.pdf")

# Brand-ish palette (matches Your Shopfront chrome tokens)
INK = colors.HexColor("#111418")
MUTE = colors.HexColor("#5C6470")
LINE = colors.HexColor("#E2E5EA")
TINT = colors.HexColor("#F4F6F9")
PRIMARY = colors.HexColor("#2438FF")  # cobalt
SUNSHINE = colors.HexColor("#FFE34D")
SUNSHINE_INK = colors.HexColor("#1A1500")
CORAL = colors.HexColor("#FF6B5B")

styles = getSampleStyleSheet()

H1 = ParagraphStyle(
    "H1", parent=styles["Heading1"],
    fontName="Helvetica-Bold", fontSize=22, leading=26,
    textColor=INK, spaceBefore=8, spaceAfter=12,
)
H2 = ParagraphStyle(
    "H2", parent=styles["Heading2"],
    fontName="Helvetica-Bold", fontSize=15, leading=19,
    textColor=INK, spaceBefore=18, spaceAfter=8,
)
H3 = ParagraphStyle(
    "H3", parent=styles["Heading3"],
    fontName="Helvetica-Bold", fontSize=12, leading=15,
    textColor=PRIMARY, spaceBefore=12, spaceAfter=4,
)
BODY = ParagraphStyle(
    "Body", parent=styles["BodyText"],
    fontName="Helvetica", fontSize=10, leading=14,
    textColor=INK, alignment=TA_LEFT, spaceAfter=6,
)
MUTED = ParagraphStyle(
    "Muted", parent=BODY,
    textColor=MUTE, fontSize=9, leading=12,
)
CALLOUT = ParagraphStyle(
    "Callout", parent=BODY,
    fontName="Helvetica-Bold", fontSize=10, leading=14,
    textColor=SUNSHINE_INK, backColor=SUNSHINE,
    borderPadding=(8, 10, 8, 10), spaceAfter=10,
)
SCRIPT = ParagraphStyle(
    "Script", parent=BODY,
    fontName="Courier", fontSize=9, leading=12,
    textColor=INK, backColor=TINT,
    borderPadding=(10, 12, 10, 12),
    borderColor=LINE, borderWidth=0.5,
    spaceAfter=10,
)
LIST = ParagraphStyle("List", parent=BODY, leftIndent=14, bulletIndent=2, spaceAfter=3)


def hr():
    return HRFlowable(width="100%", thickness=0.5, color=LINE, spaceBefore=4, spaceAfter=8)


def script(text: str):
    """Render copy-paste script box. Preserves line breaks."""
    return Paragraph(text.replace("\n", "<br/>"), SCRIPT)


def kv_table(rows, col_widths=None, header=True):
    """Tabular data with subtle styling."""
    t = Table(rows, colWidths=col_widths)
    style = [
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, -1), INK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), TINT),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, 0), (-1, 0), INK),
        ]
    t.setStyle(TableStyle(style))
    return t


def bullet(text: str):
    return Paragraph(f"• {text}", LIST)


def build():
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.7 * inch, rightMargin=0.7 * inch,
        topMargin=0.7 * inch, bottomMargin=0.7 * inch,
        title="Your Shopfront — Day-1 Launch Playbook",
        author="Parker Henkel",
    )

    story = []

    # ── Cover ────────────────────────────────────────────────────────────────
    story.append(Paragraph("Your Shopfront", H2))
    story.append(Paragraph("Day-1 Organic Launch Playbook", H1))
    story.append(Paragraph(
        "Goal: 10 website sales today via organic-only channels. "
        "Realistic ceiling 3–8 sales; 10 requires the warm-network "
        "tier to carry the volume.",
        MUTED,
    ))
    story.append(hr())

    # ── Math ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("The math (read first)", H2))
    story.append(kv_table([
        ["Channel", "Realistic conversion", "Volume needed for 10 sales"],
        ["Cold DM / cold email", "0.2 – 2% close", "500 – 5,000 contacts"],
        ["LinkedIn DM (warmer)", "~10% reply · ~2% close", "~500 sends"],
        ["Facebook group post", "0.1 – 0.5% of views convert", "2,000 – 10,000 views"],
        ["Personal text (warm)", "5 – 20% close", "50 – 200 contacts"],
    ], col_widths=[1.9 * inch, 2.1 * inch, 2.5 * inch]))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>Honest call:</b> 10 cold-organic sales in 1 day is aggressive. "
        "Realistic ceiling with hard effort is 3–8. To hit 10, the warm network "
        "must carry volume — AZ Window Shine + Spiff Pros customer lists, "
        "family / friends, anyone you know who runs a small business. "
        "Plan for 5; celebrate at 10.",
        BODY,
    ))

    # ── Unfair advantage ─────────────────────────────────────────────────────
    story.append(Paragraph("Your unfair advantage", H2))
    story.append(Paragraph(
        "You have <b>30 industry-specific demos</b>. Don't pitch "
        "&quot;I'll build you a website.&quot; Pitch "
        "<b>&quot;I already built a demo of YOUR business — here's the link, "
        "$99 to make it yours.&quot;</b> Demo-first pitches convert 3–5× "
        "higher than generic pitches.",
        BODY,
    ))

    # ── Channel priority ─────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Channel priority (rank-ordered by ROI for one day)", H2))

    # 1. Personal-network text
    story.append(Paragraph("1. Personal-network text blast — highest hit rate", H3))
    story.append(Paragraph(
        "Text every business owner / aspiring business owner in your phone. "
        "Conversion typically 10–30%. Send to 30–50 contacts. Expect 3–8 sales from this alone.",
        BODY,
    ))
    story.append(script(
        "Hey [name] — just launched Your Shopfront. We do done-for-you websites for\n"
        "small businesses, live in 24h. Running a promo this week, $99 setup + $99/mo\n"
        "for 3 months (normally $299 + $149/mo). Cancel anytime, 30-day money back.\n\n"
        "Here's a demo: yourshopfront.com/demos/ironside-plumbing\n"
        "(Every demo is real and buyable.)\n\n"
        "Worth a look for you or anyone you know?"
    ))

    # 2. Cold DM
    story.append(Paragraph("2. Cold DM to local AZ trades — volume play", H3))
    story.append(Paragraph(
        "Pull 100 local plumbers / electricians / HVAC / painters / cleaners / roofers "
        "from <b>Google Maps</b>. Filter for ones with <b>bad or no websites</b> "
        "(your wedge). Match each to the closest demo (see slug list at end).",
        BODY,
    ))
    story.append(script(
        "Hi [Name] — saw [Business Name] and noticed you don't have a site (or your\n"
        "current one is dated). I run Your Shopfront and built a demo of what a\n"
        "[industry] site looks like in our system:\n\n"
        "yourshopfront.com/demos/ironside-plumbing\n\n"
        "$99 launch promo this week — live in 24h, $99/mo for 3 months, cancel\n"
        "anytime. Want to grab one before the promo ends?"
    ))
    story.append(Paragraph("<b>Channel order:</b>", BODY))
    story.append(bullet("Facebook Page Messenger — highest deliverability"))
    story.append(bullet("LinkedIn DM — ~10% reply rate (highest of any cold channel)"))
    story.append(bullet("Instagram DM — lower but possible"))
    story.append(Paragraph(
        "<i>100 personalized DMs → realistic 1–3 sales day-1, more in the week.</i>",
        MUTED,
    ))

    # 3. FB groups
    story.append(PageBreak())
    story.append(Paragraph("3. AZ-specific Facebook groups — one post each, no spam", H3))
    story.append(Paragraph("Gold mines for your ICP:", BODY))
    story.append(bullet("Contractors of Phoenix AZ — facebook.com/groups/PhoenixAZContractors"))
    story.append(bullet("Phoenix Local Small Business Owners — facebook.com/groups/471789696247021"))
    story.append(bullet("Arizona Small Business Contractors — facebook.com/groups/azsbcon"))
    story.append(bullet("Arizona Small Local Business Referral &amp; Networking — facebook.com/groups/148674782009385"))
    story.append(bullet("Phoenix Small Business Networking — facebook.com/groups/phoenixsmallbusinessnetworking"))
    story.append(bullet("Phoenix Area Small Business Network — facebook.com/groups/PASBN"))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>Script (value-first; most groups ban hard sells):</b>",
        BODY,
    ))
    story.append(script(
        "Quick win for AZ small businesses without a great website 👇\n\n"
        "I just launched Your Shopfront — done-for-you websites built specifically for\n"
        "home-service businesses. Pick a design, send your content, we have your\n"
        "site live in 24 hours.\n\n"
        "Running a launch promo this week: $99 setup + $99/mo for 3 months.\n"
        "Cancel anytime. 30-day money back.\n\n"
        "Here's an example of a plumber's site I'd build:\n"
        "yourshopfront.com/demos/ironside-plumbing\n\n"
        "Or a tree-care service:\n"
        "yourshopfront.com/demos/westwood-tree\n\n"
        "Happy to send you a custom demo for your specific trade — drop your\n"
        "industry in the comments and I'll DM you the relevant one."
    ))
    story.append(Paragraph(
        "<i>&quot;Drop your industry&quot; line creates engagement (algorithm boost) "
        "+ qualifies prospects + earns DM permission.</i>",
        MUTED,
    ))

    # 4. Nextdoor
    story.append(Paragraph("4. Nextdoor — Neighbor Services post", H3))
    story.append(Paragraph(
        "3.2M SMB owners on Nextdoor; home services = 37% of business pages. "
        "You don't need business verification — use the &quot;Neighbor Services&quot; option. "
        "Post in your neighborhood + nearby. Same value-first frame as Facebook.",
        BODY,
    ))

    # 5. Short-form video
    story.append(Paragraph("5. Short-form video — TikTok / IG Reels / YT Shorts", H3))
    story.append(Paragraph(
        "30-second screen-record scrolling through 3–4 demos with text overlay:",
        BODY,
    ))
    story.append(bullet("&quot;Every small business in Arizona deserves a real website.&quot;"))
    story.append(bullet("&quot;$99 launch promo. Live in 24 hours.&quot;"))
    story.append(bullet("&quot;yourshopfront.com&quot;"))
    story.append(Paragraph(
        "Cross-post to all 3 platforms. Video drives 2.5× engagement vs static.",
        BODY,
    ))

    # 6. LinkedIn
    story.append(Paragraph("6. LinkedIn — personal post + targeted DMs", H3))
    story.append(Paragraph(
        "Post your launch story to personal feed. DM 20 connections who own/work at "
        "home-service SMBs. LinkedIn DMs ~10% reply rate.",
        BODY,
    ))

    # 7. Reddit
    story.append(Paragraph("7. Reddit — last priority, high ban risk", H3))
    story.append(Paragraph(
        "r/smallbusiness allows self-promo only in pinned &quot;Self-Promotion Saturday&quot; "
        "threads. r/Entrepreneur same. Outside those: comment helpfully on other posts, "
        "mention Your Shopfront only if directly relevant. Don't lead with the pitch.",
        BODY,
    ))

    # ── Hour-by-hour ─────────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Hour-by-hour playbook for today", H2))

    story.append(Paragraph("Hour 0 – 2 · Prep", H3))
    story.append(bullet("Pull 100-target list from Google Maps (plumbers/electricians/HVAC/painters/cleaners in Phoenix)"))
    story.append(bullet("Match each target to the closest demo slug (see table at end)"))
    story.append(bullet("Draft 3 message templates (FB DM, LinkedIn DM, text)"))
    story.append(bullet("Compile personal-contact list (30–50 people)"))

    story.append(Paragraph("Hour 2 – 4 · Warm network", H3))
    story.append(bullet("Text the 30–50 personal contacts (highest conversion)"))
    story.append(bullet("Call 3–5 closest contacts who run SMBs personally — these close fastest"))

    story.append(Paragraph("Hour 4 – 10 · Cold blitz", H3))
    story.append(bullet("DM 100 local businesses on Facebook Messenger"))
    story.append(bullet("Post in all 6 AZ Facebook groups"))
    story.append(bullet("Post 1 Nextdoor Neighbor Services"))
    story.append(bullet("Post LinkedIn announcement + DM 20 connections"))
    story.append(bullet("Record + post 30s demo Reel to TikTok / IG / YT Shorts"))

    story.append(Paragraph("Hour 10 – 18 · Follow up + close", H3))
    story.append(bullet("Respond to every DM/comment FAST (speed-to-lead = 5× conversion)"))
    story.append(bullet("Warm leads: &quot;Promo ends [tomorrow] — want me to start your build tonight?&quot;"))
    story.append(bullet("Undecided: send a 2nd personalized demo"))

    story.append(Paragraph("Hour 18 – 24 · Last push", H3))
    story.append(bullet("Cold-call 20 unresponded high-priority targets (AZ Window Shine phone experience transfers)"))

    # ── Multiplier ───────────────────────────────────────────────────────────
    story.append(Paragraph("Multiplier no competitor has", H2))
    story.append(Paragraph(
        "You operate AZ Window Shine, an established Arizona business. "
        "Email / text your existing customers:",
        BODY,
    ))
    story.append(script(
        "I just launched a sister business that builds websites for small biz.\n"
        "If you know a plumber/electrician/anyone running their own thing —\n"
        "I'd love to send them a demo. $99 promo this week."
    ))
    story.append(Paragraph(
        "Customer referrals close at <b>20–40%</b> vs cold's 0.2–2%.",
        BODY,
    ))

    # ── Skip today ───────────────────────────────────────────────────────────
    story.append(Paragraph("What to skip today", H2))
    story.append(bullet("Paid Facebook/Google ads (you said organic)"))
    story.append(bullet("Cold email at scale — needs warmed domain + verified list; conversion math doesn't work at $99/mo"))
    story.append(bullet("Product Hunt / Hacker News — wrong audience for home-service SMBs"))
    story.append(bullet("Yelp / Craigslist — too slow / low-intent for day-1"))

    # ── Demo URL table ───────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Demo URLs by industry (paste-ready)", H2))
    story.append(Paragraph(
        "Every URL below is live and buyable. Each demo ends with a &quot;Get this design&quot; "
        "CTA going straight to <font face='Courier'>/checkout?tier=subscription&amp;demo=&lt;slug&gt;</font>.",
        BODY,
    ))
    demo_rows = [["Trade / vertical", "URL"]]
    for trade, slug in [
        ("Plumber", "ironside-plumbing"),
        ("Electrician", "voltcraft-electric"),
        ("HVAC", "mesa-hvac"),
        ("Roofer", "summit-roofing"),
        ("Pressure-wash", "aurora-pressure-wash"),
        ("Junk removal", "tidy-pros-junk"),
        ("Lawn care", "greenwise-lawn"),
        ("Tree service", "westwood-tree"),
        ("Pool care", "sandstone-pool-care"),
        ("Window cleaning", "crystalline-window-co"),
        ("House cleaning", "brightside-cleaning"),
        ("Painters", "heritage-painters"),
        ("Movers", "bellhorn-movers"),
        ("Laundromat", "sparkle-suds-laundromat"),
        ("Restaurant / pizza", "angelos"),
        ("Brewery / taproom", "north-fork"),
        ("Wine bar", "cask-vine"),
        ("Bookstore", "print-block-books"),
        ("Yoga / wellness", "still-point"),
        ("Florist", "wildflower-stone"),
        ("Photo studio", "mara-lin"),
        ("Premium trades", "premium-trade"),
        ("Dev shop", "switchback"),
        ("Architecture / design", "brutalist"),
        ("B2B consulting", "documentary-b2b"),
        ("Editorial design", "swiss-editorial"),
        ("Delivery service", "doorstep-editorial"),
        ("Film / video", "cinematic-dark"),
        ("Interior / lifestyle", "daylight-lounge"),
        ("Creative agency", "webgl-experimental"),
    ]:
        demo_rows.append([trade, f"yourshopfront.com/demos/{slug}"])
    story.append(kv_table(demo_rows, col_widths=[2.1 * inch, 4.4 * inch]))

    story.append(Spacer(1, 16))
    story.append(hr())
    story.append(Paragraph(
        f"Generated from <font face='Courier'>docs/marketing-launch-playbook.md</font>. "
        f"Re-run <font face='Courier'>python scripts/build-launch-playbook-pdf.py</font> to refresh.",
        MUTED,
    ))

    doc.build(story)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
