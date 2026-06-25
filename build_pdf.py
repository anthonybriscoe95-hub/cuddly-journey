#!/usr/bin/env python3
"""
Generates "The Real Business Playbook" — a comprehensive guide to running a
business: budgeting, saving, paying yourself, pricing, taxes, marketing, and
getting sales. Built with ReportLab.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    Table, TableStyle, ListFlowable, ListItem, HRFlowable, KeepTogether,
    NextPageTemplate,
)
from reportlab.platypus.tableofcontents import TableOfContents

# ----------------------------------------------------------------------------
# Color palette
# ----------------------------------------------------------------------------
NAVY     = colors.HexColor("#0B2545")
BLUE     = colors.HexColor("#13315C")
TEAL     = colors.HexColor("#1B7A8C")
GOLD     = colors.HexColor("#C9A227")
LIGHT    = colors.HexColor("#EEF2F7")
BOXBG    = colors.HexColor("#F4F7FB")
TIPBG    = colors.HexColor("#EAF6F1")
WARNBG   = colors.HexColor("#FCF3E7")
KEYBG    = colors.HexColor("#F0ECF8")
GREY     = colors.HexColor("#5A6472")
DARK     = colors.HexColor("#1A1F26")

OUTPUT = "The-Real-Business-Playbook.pdf"

# ----------------------------------------------------------------------------
# Styles
# ----------------------------------------------------------------------------
styles = getSampleStyleSheet()

def S(name, **kw):
    styles.add(ParagraphStyle(name, **kw))

S("CoverTitle", fontName="Helvetica-Bold", fontSize=40, leading=44,
  textColor=colors.white, alignment=TA_CENTER, spaceAfter=12)
S("CoverSub", fontName="Helvetica", fontSize=16, leading=22,
  textColor=GOLD, alignment=TA_CENTER, spaceAfter=8)
S("CoverSmall", fontName="Helvetica", fontSize=11, leading=16,
  textColor=LIGHT, alignment=TA_CENTER)

S("H1", fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=NAVY,
  spaceBefore=6, spaceAfter=10)
S("H1num", fontName="Helvetica-Bold", fontSize=12, leading=14, textColor=TEAL,
  spaceAfter=2)
S("H2", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=BLUE,
  spaceBefore=14, spaceAfter=6)
S("H3", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=TEAL,
  spaceBefore=10, spaceAfter=3)

S("Body", fontName="Helvetica", fontSize=10.5, leading=15.5, textColor=DARK,
  alignment=TA_JUSTIFY, spaceAfter=7)
S("BodyTight", fontName="Helvetica", fontSize=10.5, leading=15, textColor=DARK,
  alignment=TA_LEFT, spaceAfter=3)
S("BodyBullet", fontName="Helvetica", fontSize=10.5, leading=15, textColor=DARK,
  alignment=TA_LEFT)
S("Lead", fontName="Helvetica-Oblique", fontSize=12, leading=17, textColor=BLUE,
  alignment=TA_LEFT, spaceAfter=10)

S("BoxTitle", fontName="Helvetica-Bold", fontSize=10.5, leading=14,
  textColor=NAVY, spaceAfter=3)
S("BoxBody", fontName="Helvetica", fontSize=10, leading=14.5, textColor=DARK,
  alignment=TA_LEFT)

S("TblHead", fontName="Helvetica-Bold", fontSize=9.5, leading=12,
  textColor=colors.white)
S("TblCell", fontName="Helvetica", fontSize=9.5, leading=12.5, textColor=DARK)
S("TblCellB", fontName="Helvetica-Bold", fontSize=9.5, leading=12.5, textColor=NAVY)

S("Quote", fontName="Helvetica-Oblique", fontSize=13, leading=18,
  textColor=NAVY, alignment=TA_CENTER, spaceBefore=4, spaceAfter=4)

S("TOCH", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=NAVY,
  spaceAfter=14)
S("Source", fontName="Helvetica", fontSize=8.8, leading=12, textColor=GREY,
  alignment=TA_LEFT, spaceAfter=2)
S("Foot", fontName="Helvetica", fontSize=8, leading=10, textColor=GREY)

# ----------------------------------------------------------------------------
# Flowable helpers
# ----------------------------------------------------------------------------
def bullets(items, style="BodyBullet", lead=GOLD):
    li = [ListItem(Paragraph(t, styles[style]), leftIndent=6, value="•",
                   bulletColor=lead) for t in items]
    return ListFlowable(li, bulletType="bullet", start="•", leftIndent=16,
                        bulletFontName="Helvetica-Bold", bulletFontSize=10,
                        spaceBefore=2, spaceAfter=8)

def numbered(items, style="BodyBullet"):
    li = [ListItem(Paragraph(t, styles[style]), leftIndent=6) for t in items]
    return ListFlowable(li, bulletType="1", leftIndent=18,
                        bulletFontName="Helvetica-Bold", bulletFontSize=10,
                        bulletColor=TEAL, spaceBefore=2, spaceAfter=8)

def callout(title, body, bg=BOXBG, bar=TEAL):
    """A colored callout box with a left accent bar."""
    if isinstance(body, str):
        inner = [Paragraph(body, styles["BoxBody"])]
    else:
        inner = body
    cells = []
    if title:
        cells.append([Paragraph(title, styles["BoxTitle"])])
    for fl in inner:
        cells.append([fl])
    t = Table(cells, colWidths=[6.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 3, bar),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (0, 0), 9),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 9),
        ("TOPPADDING", (0, 1), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -2), 1),
    ]))
    return KeepTogether([Spacer(1, 4), t, Spacer(1, 8)])

def tip(body, title="✓  PRO TIP"):
    return callout(title, body, bg=TIPBG, bar=TEAL)

def warn(body, title="⚠  WATCH OUT"):
    return callout(title, body, bg=WARNBG, bar=GOLD)

def key(body, title="\U0001F511  KEY IDEA"):
    return callout(title, body, bg=KEYBG, bar=colors.HexColor("#6C4AB6"))

def make_table(data, col_widths, header=True):
    tbl_data = []
    for r, row in enumerate(data):
        new = []
        for cell in row:
            st = "TblHead" if (header and r == 0) else "TblCell"
            if isinstance(cell, tuple):
                cell, st = cell
            new.append(Paragraph(str(cell), styles[st]))
        tbl_data.append(new)
    t = Table(tbl_data, colWidths=col_widths, repeatRows=1 if header else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#D7DEE8")),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#C4CEDB")),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ]
    else:
        style += [("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT])]
    t.setStyle(TableStyle(style))
    return KeepTogether([Spacer(1, 2), t, Spacer(1, 8)])

# ----------------------------------------------------------------------------
# Chapter heading flowable (registers TOC entries)
# ----------------------------------------------------------------------------
class Chapter(Paragraph):
    def __init__(self, number, title):
        self._cn = number
        self._ct = title
        text = title
        super().__init__(text, styles["H1"])
    def draw(self):
        super().draw()

_chap_counter = [0]
def chapter(title, story):
    _chap_counter[0] += 1
    n = _chap_counter[0]
    story.append(PageBreak())
    # colored number tag
    tag = Table([[Paragraph(f"CHAPTER {n}", styles["H1num"])]],
                colWidths=[1.6 * inch])
    tag.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(tag)
    story.append(Spacer(1, 6))
    h = TocChapter(title, n)
    story.append(h)
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD,
                            spaceBefore=2, spaceAfter=12))

class TocChapter(Paragraph):
    """H1 paragraph that emits a TOC entry on draw."""
    def __init__(self, text, number):
        self.tocText = text
        self.tocNumber = number
        super().__init__(text, styles["H1"])
    def draw(self):
        Paragraph.draw(self)
        key = f"ch{self.tocNumber}"
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(self.tocText, key, level=0, closed=False)
        # notify TOC
        self.canv.beginForm  # noop guard
        self._doc.notify("TOCEntry", (0, self.tocText, self.canv.getPageNumber(), key))

# ----------------------------------------------------------------------------
# Page templates / canvas decoration
# ----------------------------------------------------------------------------
TITLE = "The Real Business Playbook"

def cover_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
    # gold band
    canvas.setFillColor(GOLD)
    canvas.rect(0, letter[1] - 3.0 * inch, letter[0], 0.10 * inch, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.rect(0, 1.7 * inch, letter[0], 0.10 * inch, fill=1, stroke=0)
    canvas.restoreState()

def content_page(canvas, doc):
    canvas.saveState()
    # header rule
    canvas.setStrokeColor(colors.HexColor("#D7DEE8"))
    canvas.setLineWidth(0.5)
    canvas.line(0.9 * inch, letter[1] - 0.72 * inch,
                letter[0] - 0.9 * inch, letter[1] - 0.72 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(0.9 * inch, letter[1] - 0.62 * inch, TITLE.upper())
    # footer
    canvas.line(0.9 * inch, 0.7 * inch, letter[0] - 0.9 * inch, 0.7 * inch)
    canvas.drawString(0.9 * inch, 0.55 * inch,
                      "Build it. Budget it. Keep it.")
    canvas.drawRightString(letter[0] - 0.9 * inch, 0.55 * inch,
                           f"Page {doc.page}")
    canvas.restoreState()

def plain_page(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawRightString(letter[0] - 0.9 * inch, 0.55 * inch,
                           f"Page {doc.page}")
    canvas.restoreState()

# ----------------------------------------------------------------------------
# Document
# ----------------------------------------------------------------------------
class Doc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        pass

doc = Doc(OUTPUT, pagesize=letter,
          leftMargin=0.9 * inch, rightMargin=0.9 * inch,
          topMargin=0.95 * inch, bottomMargin=0.9 * inch,
          title=TITLE, author="Compiled for you")

frame_cover = Frame(0, 0, letter[0], letter[1], id="cover")
frame_content = Frame(0.9 * inch, 0.85 * inch,
                      letter[0] - 1.8 * inch, letter[1] - 1.75 * inch,
                      id="content")
frame_plain = Frame(0.9 * inch, 0.85 * inch,
                    letter[0] - 1.8 * inch, letter[1] - 1.55 * inch,
                    id="plain")

doc.addPageTemplates([
    PageTemplate(id="Cover", frames=[frame_cover], onPage=cover_bg),
    PageTemplate(id="Plain", frames=[frame_plain], onPage=plain_page),
    PageTemplate(id="Content", frames=[frame_content], onPage=content_page),
])

story = []

# ---- helper to give chapters access to doc.notify ----
orig_init = TocChapter.__init__
def patched(self, text, number, _doc=doc):
    orig_init(self, text, number)
    self._doc = _doc
TocChapter.__init__ = patched

# ============================================================================
# COVER
# ============================================================================
story.append(NextPageTemplate("Plain"))
story.append(Spacer(1, 2.7 * inch))
story.append(Paragraph("THE REAL", styles["CoverTitle"]))
story.append(Paragraph("BUSINESS PLAYBOOK", styles["CoverTitle"]))
story.append(Spacer(1, 0.25 * inch))
story.append(Paragraph("The money side of business they never taught you in school", styles["CoverSub"]))
story.append(Spacer(1, 1.7 * inch))
story.append(Paragraph("How to budget &bull; save &bull; pay yourself &bull; price your work", styles["CoverSmall"]))
story.append(Paragraph("manage taxes &bull; get customers &bull; drive sales to your website", styles["CoverSmall"]))
story.append(Spacer(1, 0.4 * inch))
story.append(Paragraph("A practical, plain-English guide compiled from current expert sources", styles["CoverSmall"]))

# ============================================================================
# WELCOME / HOW TO USE
# ============================================================================
story.append(PageBreak())
story.append(Paragraph("Start Here", styles["H1"]))
story.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=12))
story.append(Paragraph(
    "School and college teach you a lot &mdash; but they rarely teach you how to actually run "
    "the money side of a business. How much to pay yourself. What to do with profit. How to "
    "price so you don't go broke while looking busy. How to keep the tax man happy. And how to "
    "get real customers walking through your (digital) door.", styles["Body"]))
story.append(Paragraph(
    "This playbook fills that gap. It's written in plain English, broken into short chapters, and "
    "built so you can read it front-to-back or jump straight to what you need today. Every chapter "
    "ends with a short action checklist so you're never left wondering <i>\"okay&hellip; but what do I "
    "actually do?\"</i>", styles["Body"]))
story.append(Paragraph(
    "The information here is compiled from current, reputable sources &mdash; the IRS, the U.S. Small "
    "Business Administration, the U.S. Chamber of Commerce, major banks, and respected finance and "
    "marketing publications. Full source links are listed at the back.", styles["Body"]))

story.append(key([
    Paragraph("Three money habits separate the businesses that last from the ones that quietly close:",
              styles["BoxBody"]),
    Spacer(1, 4),
    bullets([
        "<b>Separate</b> your business money from your personal money &mdash; from day one.",
        "<b>Pay yourself on purpose</b> &mdash; a planned amount, not whatever is left over.",
        "<b>Keep a cash cushion</b> &mdash; profit on paper means nothing if the bank account is empty.",
    ]),
]))

story.append(warn(
    "This guide is educational, not legal, tax, or financial advice. Tax numbers and rules "
    "(rates, limits, mileage) change every year and vary by country and state. Before you make "
    "big decisions &mdash; choosing a business structure, electing S-corp status, taking on debt "
    "&mdash; confirm the current details with a licensed accountant or attorney."))

# ============================================================================
# TABLE OF CONTENTS
# ============================================================================
story.append(NextPageTemplate("Content"))
story.append(PageBreak())
story.append(Paragraph("What's Inside", styles["TOCH"]))
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle("TOCL", fontName="Helvetica", fontSize=11.5, leading=22,
                   textColor=DARK, leftIndent=6, rightIndent=12,
                   firstLineIndent=-2),
]
story.append(toc)

# ============================================================================
# CHAPTER 1 — Mindset & Getting Started
# ============================================================================
chapter("The Foundation: Think Like an Owner", story)
story.append(Paragraph(
    "A business is simply a system that solves a problem for people and gets paid for it. "
    "Everything else &mdash; budgets, taxes, marketing &mdash; is just protecting and growing "
    "that simple exchange. Before you spend a dollar, get three things straight: who you help, "
    "what problem you solve, and how the money actually flows.", styles["Lead"]))

story.append(Paragraph("Validate before you build", styles["H2"]))
story.append(Paragraph(
    "Most failed businesses didn't fail because the owner worked too little. They failed because "
    "they built something nobody wanted, or priced it so no money was left over. Validation means "
    "testing your idea <i>before</i> you commit serious time or money &mdash; gathering real evidence "
    "that people want what you plan to sell, instead of guessing.", styles["Body"]))
story.append(numbered([
    "<b>Name the problem.</b> Write one sentence: \"I help [who] do [what] so they can [result].\"",
    "<b>Check real demand.</b> Are people already searching for, complaining about, or paying to solve this problem? If nobody is spending on it, that's a warning sign.",
    "<b>Know your customer.</b> Identify your target market &mdash; the specific people most likely to buy &mdash; and their real pain points.",
    "<b>Talk to 10&ndash;20 of them.</b> A short survey or honest conversation tells you whether they'd buy, what they'd pay, and which features matter.",
    "<b>Build a minimum viable product (MVP).</b> The simplest version you can sell. Test it in the real market before pouring in resources.",
]))
story.append(tip(
    "Pre-sales beat surveys. Someone saying \"that's a great idea\" is free. Someone handing you "
    "$20 (or a deposit) is validation. Whenever you can, ask for the sale before you build the whole thing."))

story.append(Paragraph("The one-page plan", styles["H2"]))
story.append(Paragraph(
    "You don't need a 40-page business plan to start. You need clarity. A one-page plan forces you "
    "to answer the questions that actually decide whether you make money:", styles["Body"]))
story.append(make_table([
    ["Question", "What to nail down"],
    ["What do I sell?", "The specific product or service, and the result it gives the buyer."],
    ["Who buys it?", "Your target customer &mdash; be specific. \"Everyone\" is not a market."],
    ["How do they find me?", "Your main 1&ndash;2 marketing channels (see Chapters 9&ndash;10)."],
    ["What does it cost to deliver?", "Every direct and indirect cost (see Chapter 5)."],
    ["What's the price &amp; margin?", "Price minus cost = profit. This is your whole business in one line."],
    ["What's my monthly break-even?", "The revenue you must hit to cover all costs and pay yourself."],
], [1.8 * inch, 4.7 * inch]))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Write your one-sentence problem statement.",
    "Talk to at least 10 potential customers this week.",
    "Fill in the one-page plan table above before spending real money.",
]))

# ============================================================================
# CHAPTER 2 — Business Structure
# ============================================================================
chapter("Set It Up Right: Structure, Registration & EIN", story)
story.append(Paragraph(
    "Your business structure decides how you're taxed, how protected your personal assets are, and "
    "how you're allowed to pay yourself. You can start simple and upgrade later &mdash; but knowing "
    "the differences now saves you money and headaches.", styles["Lead"]))

story.append(make_table([
    ["Structure", "Liability", "Taxes", "Best for"],
    ["Sole Proprietor", "None &mdash; you and the business are legally the same.",
     "Profits flow to your personal return; pay self-employment tax.",
     "Testing an idea, side hustles, very low-risk work."],
    ["LLC", "Yes &mdash; separates personal assets from business debts.",
     "By default taxed like a sole prop (single-member) or partnership; flexible.",
     "Most small businesses wanting protection + simplicity."],
    ["LLC taxed as S-Corp", "Yes (same LLC protection).",
     "Pay yourself a <i>reasonable salary</i> + take distributions; can cut self-employment tax.",
     "Profitable businesses (often once net profit is solidly into five figures)."],
], [1.35 * inch, 1.55 * inch, 1.95 * inch, 1.65 * inch]))

story.append(key(
    "<b>\"Piercing the corporate veil.\"</b> An LLC only protects you if you treat it like a "
    "separate entity. If you mix personal and business money (commingling), a court can decide "
    "you and your business aren't really separate &mdash; and your personal savings, car, and "
    "home become fair game for business debts. Separation isn't bureaucracy; it's your shield."))

story.append(Paragraph("Getting your EIN", styles["H2"]))
story.append(Paragraph(
    "An EIN (Employer Identification Number) is like a Social Security number for your business. "
    "It's free, and you can usually get it in minutes directly from the IRS website (IRS.gov) &mdash; "
    "never pay a third-party site for one.", styles["Body"]))
story.append(bullets([
    "<b>Cost:</b> $0. Apply online at IRS.gov and receive it immediately.",
    "<b>Order of operations:</b> form your LLC first, <i>then</i> get the EIN, so the number ties to the legal entity &mdash; not to you personally.",
    "<b>You'll need one if</b> you hire employees, elect corporate (S/C-corp) taxation, or want to open a business bank account without using your SSN.",
    "<b>Sole proprietors</b> can often use an SSN, but many get an EIN anyway for privacy and easier banking.",
]))
story.append(warn(
    "Rules and forms differ by country and U.S. state, and structures have ongoing costs and "
    "filing requirements. Before forming an entity or electing S-corp status, talk to an "
    "accountant &mdash; the right move depends on your profit, state, and goals."))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Decide your starting structure (sole prop or LLC are the common starts).",
    "If forming an LLC, register with your state, then get a free EIN at IRS.gov.",
    "Note any annual filing/renewal fees so they don't surprise you.",
]))

# ============================================================================
# CHAPTER 3 — Separate Your Money
# ============================================================================
chapter("Separate Your Money & Keep Clean Books", story)
story.append(Paragraph(
    "This is the single highest-leverage habit in this entire guide. Open a dedicated business "
    "bank account on day one and run every dollar of business income and expense through it. It "
    "protects your legal liability, makes taxes painless, and lets you actually see how your "
    "business is doing.", styles["Lead"]))

story.append(Paragraph("Why separation matters", styles["H2"]))
story.append(bullets([
    "<b>Legal protection:</b> keeps your LLC's liability shield intact (no commingling).",
    "<b>Clean taxes:</b> at tax time you have one account to review, not a tangle of personal and business spending.",
    "<b>Clear numbers:</b> you can finally answer \"am I actually making money?\" &mdash; instead of guessing.",
    "<b>Looks professional:</b> customers pay \"Your Business LLC,\" not \"John's personal Venmo.\"",
]))

story.append(Paragraph("Bookkeeping basics for beginners", styles["H2"]))
story.append(Paragraph(
    "Bookkeeping is just recording money in and money out. Most small owners start with the "
    "<b>cash method</b>: record income when you actually receive it and expenses when you actually "
    "pay them. You can use a spreadsheet at first, or software like Wave (free), QuickBooks, or "
    "Xero. The trick is to connect your bank account to your bookkeeping from day one so "
    "transactions flow in automatically.", styles["Body"]))
story.append(make_table([
    ["Record", "Why it matters", "Keep for"],
    ["Income (invoices, sales)", "Proves revenue; basis for taxes owed.", "At least 3 years"],
    ["Expenses + receipts", "Every receipt is a potential tax deduction.", "At least 3 years"],
    ["Bank &amp; card statements", "Reconcile against your books monthly.", "At least 3 years"],
    ["Major asset purchases", "Equipment, vehicles &mdash; affect depreciation.", "At least 7 years"],
], [2.1 * inch, 2.9 * inch, 1.5 * inch]))

story.append(tip(
    "Reconcile weekly, not yearly. Spend 15 minutes every Friday categorizing the week's "
    "transactions. A year of \"I'll do it later\" is the #1 reason owners dread tax season and "
    "miss deductions worth real money."))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Open a business checking account (and ideally a business savings account).",
    "Get a business debit/credit card and use it for 100% of business spending.",
    "Pick a bookkeeping tool and connect your bank. Schedule a weekly 15-minute review.",
]))

# ============================================================================
# CHAPTER 4 — Budgeting
# ============================================================================
chapter("How to Budget Your Money", story)
story.append(Paragraph(
    "A budget is just a plan that tells your money where to go before it disappears. Without one, "
    "revenue comes in and vanishes into a hundred small decisions. With one, every dollar has a "
    "job: keep the lights on, grow the business, and build a cushion.", styles["Lead"]))

story.append(Paragraph("The 50 / 30 / 20 framework", styles["H2"]))
story.append(Paragraph(
    "The 50/30/20 rule is a simple, popular starting framework. Adapted for a business, it splits "
    "your money into three buckets:", styles["Body"]))
story.append(make_table([
    ["Bucket", "Share", "What goes here"],
    [("<b>Essentials</b>", "TblCellB"), "50%", "Rent, utilities, software, supplies, wages &mdash; the costs of keeping the doors open."],
    [("<b>Growth</b>", "TblCellB"), "30%", "Marketing, new equipment, product development, training &mdash; investing in the future."],
    [("<b>Savings &amp; debt</b>", "TblCellB"), "20%", "Emergency reserve, paying down debt, long-term investment."],
], [1.5 * inch, 0.8 * inch, 4.2 * inch]))
story.append(Paragraph(
    "The exact percentages aren't sacred &mdash; treat them as a starting point and adjust to your "
    "industry. A software business spends little on \"essentials\" and lots on growth; a restaurant "
    "is the opposite. The point is that <i>every</i> dollar gets deliberately assigned.", styles["Body"]))

story.append(Paragraph("The \"Profit First\" twist", styles["H2"]))
story.append(Paragraph(
    "Most owners use the formula <i>Sales &minus; Expenses = Profit</i> &mdash; and profit ends up "
    "being whatever (if anything) is left. The Profit First idea flips it: <i>Sales &minus; Profit "
    "= Expenses</i>. You take your profit and pay <i>off the top</i> first, into a separate account, "
    "then run the business on what remains. It forces discipline by making profit a non-negotiable "
    "bill rather than an afterthought.", styles["Body"]))
story.append(key(
    "Use separate accounts as \"envelopes.\" Many owners run multiple business accounts: one for "
    "operating expenses, one for taxes (so the money is never \"yours\" to spend), one for profit, "
    "and one for owner pay. When income lands, split it by percentage into each. You physically "
    "can't overspend a bucket that's empty."))

story.append(Paragraph("Build your monthly budget in 4 steps", styles["H2"]))
story.append(numbered([
    "<b>List fixed costs.</b> Rent, software, insurance, loan payments &mdash; the bills that show up every month no matter what.",
    "<b>Estimate variable costs.</b> Materials, shipping, payment processing, contractor pay &mdash; these rise and fall with sales.",
    "<b>Set aside taxes.</b> Move a percentage of every sale (commonly 25&ndash;30%) into a tax account immediately (see Chapter 8).",
    "<b>Assign the rest</b> to growth, owner pay, and savings using your chosen framework.",
]))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "List every fixed and variable cost your business has.",
    "Pick a framework (50/30/20 or Profit First) and set your bucket percentages.",
    "Open separate accounts for taxes and profit so the money is split automatically.",
]))

# ============================================================================
# CHAPTER 5 — Pricing
# ============================================================================
chapter("Pricing & Profit: Don't Be Busy and Broke", story)
story.append(Paragraph(
    "Pricing poorly is the quiet killer. You can have plenty of customers and still lose money if "
    "your price doesn't cover your true costs plus profit. Get this chapter right and almost "
    "everything else gets easier.", styles["Lead"]))

story.append(Paragraph("Markup vs. margin (know the difference)", styles["H2"]))
story.append(Paragraph(
    "These two get confused constantly, and the confusion costs money. The key: <b>markup is based "
    "on your cost; margin is based on your selling price.</b>", styles["Body"]))
story.append(make_table([
    ["Term", "Formula", "Example ($70 cost, $100 price)"],
    [("Profit margin", "TblCellB"), "(Price &minus; Cost) &divide; Price", "$30 &divide; $100 = <b>30% margin</b>"],
    [("Markup", "TblCellB"), "(Price &minus; Cost) &divide; Cost", "$30 &divide; $70 = <b>~43% markup</b>"],
], [1.4 * inch, 2.5 * inch, 2.6 * inch]))
story.append(tip(
    "Handy rule of thumb: a 2&times; (100%) markup equals a 50% margin. Your markup percentage will "
    "always look bigger than your margin percentage on the same sale &mdash; don't let that trick "
    "you into thinking you're earning more than you are."))

story.append(Paragraph("Three ways to set a price", styles["H2"]))
story.append(bullets([
    "<b>Cost-plus:</b> add up every cost to deliver, then add a fixed markup. Simple and safe &mdash; if it costs $50 and you add 20%, you charge $60.",
    "<b>Value-based:</b> price on what the result is <i>worth</i> to the customer, not what it costs you. If you save a client $10,000, charging $2,000 is easy to justify. This usually earns the most.",
    "<b>Competitive:</b> price relative to the market. Useful as a reference, but never copy a competitor's price without knowing your own costs &mdash; theirs might be losing money.",
]))

story.append(Paragraph("Count ALL your costs first", styles["H2"]))
story.append(Paragraph(
    "Before you can mark anything up, you need your true cost. Most owners forget the indirect "
    "ones and quietly lose money on every sale.", styles["Body"]))
story.append(bullets([
    "<b>Direct costs:</b> materials, labor, packaging, shipping, payment-processing fees.",
    "<b>Indirect costs (overhead):</b> rent, utilities, software, insurance, marketing, admin time &mdash; and <i>your own time</i>.",
]))
story.append(warn(
    "Pricing too low is the #1 cash-flow mistake there is. If you're constantly busy but the bank "
    "account never grows, your prices &mdash; not your effort &mdash; are almost always the problem. "
    "Raising prices 10&ndash;20% often does more for your income than working more hours."))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Calculate the fully-loaded cost (direct + indirect) of one unit or one job.",
    "Set a target profit margin and back into your price from there.",
    "Review prices at least once a year &mdash; costs creep up, prices should too.",
]))

# ============================================================================
# CHAPTER 6 — Cash Flow
# ============================================================================
chapter("Cash Flow: The Number That Keeps You Alive", story)
story.append(Paragraph(
    "Here's a truth no classroom drills into you: a profitable business can still go broke. "
    "Profit is an accounting idea; cash is what actually pays your rent. Confusing the two has "
    "ended more good businesses than bad ideas ever did.", styles["Lead"]))

story.append(key(
    "In a U.S. Bank study, <b>82% of business failures were tied to poor cash-flow management</b> "
    "&mdash; not weak profits. Many of those businesses were profitable on paper. They simply "
    "couldn't turn that profit into cash in the bank fast enough to survive."))

story.append(Paragraph("Profit vs. cash flow", styles["H2"]))
story.append(Paragraph(
    "<b>Profit</b> = sales minus costs over a period. <b>Cash flow</b> = the actual money moving "
    "in and out of your account. The gap between them is timing. Imagine you invoice a client "
    "$10,000 today with \"net-60\" terms &mdash; that's profit on paper now, but the cash doesn't "
    "arrive for two months. Meanwhile rent, suppliers, and payroll all want real money <i>today</i>. "
    "That gap is called a working-capital shortfall, and it's the \"quiet assassin\" of good businesses.",
    styles["Body"]))

story.append(Paragraph("The most common cash-flow mistakes", styles["H2"]))
story.append(bullets([
    "<b>Overestimating future sales</b> and spending the money before it arrives.",
    "<b>Ignoring payment timing</b> &mdash; offering net-30/60 terms while your own bills are due now.",
    "<b>Growing too fast</b> &mdash; growth eats cash (more inventory, staff, tools) before revenue catches up.",
    "<b>No reserve</b> &mdash; one late payment or surprise expense triggers a domino effect.",
    "<b>Pricing poorly</b> &mdash; thin margins leave no cash to absorb bumps.",
]))

story.append(Paragraph("How to stay cash-positive", styles["H2"]))
story.append(numbered([
    "<b>Check cash weekly.</b> Don't wait for monthly statements &mdash; review your balance and upcoming obligations every week.",
    "<b>Use a 13-week cash forecast.</b> A simple sheet projecting money in and out for the next quarter gives early warning of a squeeze.",
    "<b>Get paid faster.</b> Invoice immediately, take deposits, offer small early-payment discounts, and accept cards/online payment.",
    "<b>Slow down outflows.</b> Negotiate longer terms with suppliers; don't pre-pay what you don't have to.",
    "<b>Keep a reserve.</b> Aim for at least 3 months of operating costs (Chapter 7).",
]))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Build a simple 13-week cash-flow forecast and update it weekly.",
    "Set invoice terms that get you paid faster; ask for deposits on big jobs.",
    "Know your monthly break-even number by heart.",
]))

# ============================================================================
# CHAPTER 7 — Saving
# ============================================================================
chapter("How to Save: Building Your Cash Cushion", story)
story.append(Paragraph(
    "A business emergency fund is what turns a crisis into an inconvenience. A slow season, a "
    "broken machine, a client who pays late &mdash; with a cushion, these are bumps. Without one, "
    "any of them can end you. Saving isn't optional; it's part of operating.", styles["Lead"]))

story.append(Paragraph("How much to save", styles["H2"]))
story.append(Paragraph(
    "The common benchmark is <b>3 to 6 months of core operating expenses</b> kept in reserve. "
    "Where you land depends on how steady your income is:", styles["Body"]))
story.append(make_table([
    ["Your situation", "Target reserve"],
    ["Steady, contracted, predictable income", "Closer to 3 months"],
    ["Seasonal income or a few big clients", "Closer to 6 months (or more)"],
    ["Brand new / volatile industry", "As much buffer as you can build"],
], [3.6 * inch, 2.9 * inch]))

story.append(Paragraph("How to actually build it", styles["H2"]))
story.append(numbered([
    "<b>Know your monthly operating cost.</b> Add up compensation, rent, utilities, software, insurance &mdash; your real monthly burn.",
    "<b>Open a separate high-yield savings account.</b> Keep the reserve away from your operating account so you're not tempted to spend it, and let it earn interest.",
    "<b>Automate it.</b> Set up an automatic weekly or monthly transfer. Saving should happen without a decision each time.",
    "<b>Save a percentage, not a fixed dollar amount.</b> Put aside a % of net income so your savings grow in good months and ease off in lean ones.",
    "<b>Bank the windfalls.</b> A surprisingly strong month, a bonus, a tax refund &mdash; send a chunk straight to reserves.",
]))

story.append(tip(
    "Treat your emergency fund like it doesn't exist. It's for genuine emergencies and "
    "opportunities &mdash; not for covering a chronic overspend. And revisit the target yearly: as "
    "you grow, your monthly costs rise, so your reserve goal should too."))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Calculate your true monthly operating cost.",
    "Open a separate high-yield business savings account today.",
    "Automate a recurring transfer &mdash; even a small one &mdash; and increase it over time.",
]))

# ============================================================================
# CHAPTER 8 — Paying Yourself + Taxes
# ============================================================================
chapter("How to Pay Yourself (and Handle Taxes)", story)
story.append(Paragraph(
    "You started this to build a living, not a hobby. But <i>how</i> you pay yourself depends on "
    "your business structure &mdash; and getting it wrong can cost you in taxes or trigger trouble "
    "with the IRS. Here's the plain-English version.", styles["Lead"]))

story.append(Paragraph("Owner's draw vs. salary", styles["H2"]))
story.append(make_table([
    ["", "Owner's Draw", "Salary (payroll)"],
    [("What it is", "TblCellB"), "You transfer profit from the business to yourself, any time, any amount (if equity allows).",
     "A fixed, regular paycheck run through payroll with taxes withheld."],
    [("Who uses it", "TblCellB"), "Sole proprietors and default LLCs.",
     "Required for owners of an LLC taxed as an S-corp (and C-corps)."],
    [("Upside", "TblCellB"), "Flexible &mdash; take more in strong months, less when revenue dips.",
     "Predictable; banks and lenders understand W-2 income easily."],
    [("Watch out", "TblCellB"), "No taxes withheld &mdash; you must set money aside yourself.",
     "Must be a <i>reasonable</i> amount; payroll adds admin."],
], [1.0 * inch, 2.75 * inch, 2.75 * inch]))

story.append(Paragraph("The \"reasonable salary\" rule (S-corp)", styles["H2"]))
story.append(Paragraph(
    "If your LLC elects S-corp taxation, the IRS requires you to pay yourself a <b>reasonable "
    "salary</b> &mdash; roughly what you'd have to pay someone else to do your job &mdash; through "
    "payroll. Profit beyond that can be taken as <b>distributions</b>, which aren't subject to "
    "self-employment (Social Security + Medicare) tax. That split is the main tax advantage of an "
    "S-corp.", styles["Body"]))
story.append(key(
    "Example: a business nets $100,000. The owner pays a reasonable salary of $60,000 (subject to "
    "payroll taxes) and takes $40,000 as distributions (not subject to self-employment tax). But "
    "beware &mdash; pay yourself <i>too little</i> salary to dodge taxes and the IRS can reclassify "
    "it and add penalties. \"Reasonable\" is the keyword."))

story.append(Paragraph("Set your own pay deliberately", styles["H2"]))
story.append(bullets([
    "Decide your pay as a planned number based on your budget and break-even &mdash; not \"whatever's left.\"",
    "Make sure the business keeps enough cash to operate and to fund its reserve before you increase your own pay.",
    "If you rely only on draws, keep good records (P&amp;L, bank statements) &mdash; you'll need them to qualify for a mortgage or loan, since there's no W-2.",
]))

story.append(Paragraph("Taxes: the part nobody warns you about", styles["H2"]))
story.append(Paragraph(
    "When you're self-employed, no employer withholds taxes for you &mdash; so you have to do it "
    "yourself, usually four times a year. Plan for this from your first dollar.", styles["Body"]))
story.append(bullets([
    "<b>Self-employment tax</b> covers Social Security + Medicare &mdash; about 15.3% on net self-employment earnings (up to an annual wage-base cap), <i>on top of</i> income tax. You can deduct half of it.",
    "<b>Quarterly estimated taxes:</b> if you'll owe tax, you generally pay the IRS four times a year (Form 1040-ES) to avoid penalties.",
    "<b>You must file</b> if net self-employment earnings were $400 or more.",
    "<b>Set aside ~25&ndash;30% of profit</b> for taxes in a separate account so it's never a shock.",
]))

story.append(Paragraph("Common deductions (write-offs)", styles["H2"]))
story.append(Paragraph(
    "A deduction lowers the income you're taxed on. Keep receipts for everything &mdash; legitimate "
    "business expenses reduce your tax bill. Commonly available deductions include:", styles["Body"]))
story.append(bullets([
    "<b>Home office</b> &mdash; a portion of home costs if you use a space regularly and exclusively for business.",
    "<b>Vehicle/mileage</b> &mdash; business miles at the IRS standard rate, <i>or</i> actual vehicle expenses.",
    "<b>Health insurance</b> premiums for the self-employed.",
    "<b>Retirement contributions</b> (e.g., Solo 401(k), SEP-IRA) &mdash; saves for your future <i>and</i> cuts taxes now.",
    "<b>Equipment</b> &mdash; often deductible the year you buy it (Section 179).",
    "<b>Business meals</b> &mdash; typically 50% deductible when tied to business.",
    "<b>Software, supplies, marketing, professional fees</b> &mdash; ordinary costs of doing business.",
]))
story.append(warn(
    "Tax rates, mileage rates, contribution limits, and the wage base change <b>every year</b> and "
    "differ by state and country. The figures here illustrate how things work &mdash; always confirm "
    "the current numbers with the IRS (or your country's tax authority) or a licensed accountant "
    "before filing. A good accountant usually saves more than they cost."))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Decide how you'll pay yourself based on your structure, and set a deliberate amount.",
    "Open a tax savings account and move 25&ndash;30% of every payment into it.",
    "Mark the quarterly estimated-tax dates on your calendar; consider hiring an accountant.",
]))

# ============================================================================
# CHAPTER 9 — Funding & Credit
# ============================================================================
chapter("Funding & Building Business Credit", story)
story.append(Paragraph(
    "Most businesses don't start with investors &mdash; they start with the owner's own money and "
    "early sales. But knowing your funding options (and building credit early) gives you room to "
    "grow when the time is right.", styles["Lead"]))

story.append(Paragraph("Bootstrapping vs. borrowing", styles["H2"]))
story.append(make_table([
    ["", "Bootstrapping", "Loans / Outside funding"],
    [("What", "TblCellB"), "Funding growth from your own savings and revenue.",
     "Borrowed capital (SBA loans, bank loans, microloans) or investors."],
    [("Upside", "TblCellB"), "Full control, no debt, no giving up ownership.",
     "Cash up front to buy equipment, hire, or bridge operations."],
    [("Downside", "TblCellB"), "Slower; all the risk and cost is on you.",
     "Repayment + interest; lenders want good credit, a plan, sometimes collateral."],
], [0.95 * inch, 2.75 * inch, 2.8 * inch]))
story.append(Paragraph(
    "Most entrepreneurs bootstrap in year one &mdash; it requires no approval and you keep complete "
    "control (and all the risk). As you build a track record, outside funding becomes easier and "
    "cheaper to get.", styles["Body"]))

story.append(Paragraph("Funding options to know", styles["H2"]))
story.append(bullets([
    "<b>SBA microloans</b> &mdash; up to $50,000, startup-friendly, for working capital or equipment.",
    "<b>SBA-backed &amp; bank loans</b> &mdash; lower rates, longer terms, but stricter requirements.",
    "<b>SCORE &amp; SBDC</b> &mdash; free U.S. mentoring and guidance on funding and planning.",
    "<b>Alternative lenders</b> &mdash; may weigh cash flow and time-in-business over a perfect credit score.",
]))

story.append(Paragraph("Building credit", styles["H2"]))
story.append(bullets([
    "Banks often want a personal credit score above ~680 for the best loans; some startup lenders go lower (around 500) with strong cash flow or collateral.",
    "Build <b>business</b> credit separately: get an EIN, open accounts in the business name, and pay every bill on time.",
    "A strong, documented track record &mdash; consistent revenue, clean books, a real plan &mdash; can open doors even with imperfect credit.",
]))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Start by bootstrapping and proving the model before taking on debt.",
    "Open accounts in the business's name and pay on time to build business credit.",
    "Explore SBA programs and free SCORE/SBDC mentoring before signing any loan.",
]))

# ============================================================================
# CHAPTER 10 — Marketing
# ============================================================================
chapter("Getting Customers: Marketing That Works", story)
story.append(Paragraph(
    "You can have the best product in the world, but if nobody knows it exists, you have a hobby. "
    "Marketing is simply getting the right people to discover, trust, and buy from you &mdash; "
    "consistently. You don't need a big budget; you need the right channels done well.", styles["Lead"]))

story.append(Paragraph("Pick channels, don't chase all of them", styles["H2"]))
story.append(Paragraph(
    "Trying to be everywhere at once spreads you thin. Pick one or two channels where your "
    "customers actually spend time, get good at them, then expand.", styles["Body"]))
story.append(make_table([
    ["Channel", "Why it works", "Best for"],
    ["Social media", "Businesses with a social account generate ~32% more sales than those without; Instagram, TikTok &amp; Facebook give strong ROI.",
     "Visual products, building an audience, social commerce."],
    ["Email marketing", "One of the highest-ROI channels &mdash; around $42 back for every $1 spent.",
     "Repeat sales, nurturing leads, announcements."],
    ["Content marketing", "How-to guides, behind-the-scenes, and customer stories build trust and SEO.",
     "Earning trust, ranking on Google, long-term traffic."],
    ["Referrals / word of mouth", "Trusted recommendations convert better than any ad.",
     "Service businesses, local businesses."],
], [1.25 * inch, 3.15 * inch, 2.1 * inch]))

story.append(Paragraph("Content that actually resonates", styles["H2"]))
story.append(bullets([
    "<b>How-to guides</b> that solve a real customer problem.",
    "<b>Before-and-after</b> transformations and demonstrations.",
    "<b>Customer stories &amp; testimonials</b> &mdash; social proof sells.",
    "<b>Behind-the-scenes</b> content that builds a human connection.",
]))
story.append(tip(
    "Quality beats quantity. One genuinely useful post or video a week, done consistently, beats "
    "daily noise. And use the tools you have &mdash; AI can help draft emails, schedule posts, and "
    "answer routine customer questions so you spend time where it counts."))

story.append(Paragraph("Build an email list from day one", styles["H2"]))
story.append(Paragraph(
    "Social platforms can change their rules or algorithms overnight; your email list is an audience "
    "you own. Offer something valuable (a discount, a guide, a checklist) in exchange for an email, "
    "then stay in touch with helpful content and offers. It's the most cost-effective channel there "
    "is.", styles["Body"]))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Choose ONE primary channel where your customers already are, and commit to it.",
    "Start collecting emails immediately with a simple incentive.",
    "Publish one high-quality, helpful piece of content per week.",
]))

# ============================================================================
# CHAPTER 11 — Sales to your website
# ============================================================================
chapter("Driving Sales to Your Website", story)
story.append(Paragraph(
    "Getting visitors is only half the job. The goal isn't traffic &mdash; it's <i>transactions</i>. "
    "This chapter covers both sides: getting the right people to your site (SEO &amp; traffic) and "
    "turning them into buyers once they arrive (conversion).", styles["Lead"]))

story.append(key(
    "Success online in 2025 isn't measured by how many visitors you get &mdash; it's measured by "
    "how many <b>actions</b> you inspire. Ten visitors who buy beat a thousand who bounce. Always "
    "optimize for qualified buyers, not vanity traffic."))

story.append(Paragraph("Part 1 &mdash; Get the right traffic (SEO)", styles["H2"]))
story.append(bullets([
    "<b>Target buyer-intent keywords.</b> Ranking for \"what is X\" brings browsers; ranking for \"affordable X near me\" or \"buy X\" brings buyers. Chase revenue keywords, not just popular ones.",
    "<b>Use long-tail keywords.</b> Specific phrases (\"handmade leather dog collars for large breeds\") are lower-competition and higher-converting than broad ones.",
    "<b>Publish evergreen content.</b> Helpful articles that stay relevant earn steady traffic for months or years.",
    "<b>Earn trust signals.</b> Reviews, clear contact info, and quality content help both rankings and buyers' confidence.",
]))

story.append(Paragraph("Part 2 &mdash; Turn visitors into buyers (CRO)", styles["H2"]))
story.append(Paragraph(
    "Conversion Rate Optimization (CRO) is making more of your existing visitors say \"yes.\" SEO "
    "gets them to the door; CRO convinces them to walk in.", styles["Body"]))
story.append(bullets([
    "<b>Speed matters &mdash; a lot.</b> ~40% of shoppers abandon a site that takes more than 3 seconds to load. Fast pages rank better and convert better.",
    "<b>Go mobile-first.</b> Most visitors are on phones &mdash; design for the small screen first, not as an afterthought.",
    "<b>One clear call-to-action per page.</b> Tell visitors exactly what to do next: \"Buy now,\" \"Book a call,\" \"Get the guide.\"",
    "<b>Remove friction.</b> Fewer form fields, guest checkout, multiple payment options, obvious pricing.",
    "<b>Show proof.</b> Reviews, testimonials, guarantees, and clear return policies reduce the fear of buying.",
]))

story.append(Paragraph("Track what matters", styles["H2"]))
story.append(Paragraph(
    "Set up free analytics and watch the numbers that connect to money: where buyers come from, "
    "which pages convert, and where people drop off. Then fix the biggest leak first. The aim is "
    "always to see how your visits actually contribute to revenue &mdash; not just to count clicks.",
    styles["Body"]))

story.append(Paragraph("Action checklist", styles["H3"]))
story.append(bullets([
    "Test your site speed; if it loads slower than ~3 seconds, fix that first.",
    "Make sure every key page is mobile-friendly with one clear call-to-action.",
    "Add reviews/testimonials, and set up analytics to find and fix your biggest drop-off.",
]))

# ============================================================================
# CHAPTER 12 — Putting it together
# ============================================================================
chapter("Putting It All Together", story)
story.append(Paragraph(
    "You now have the money playbook school skipped. The businesses that survive aren't usually the "
    "ones with the flashiest idea &mdash; they're the ones whose owners quietly do the boring "
    "fundamentals well, month after month. Here's the whole book on one page.", styles["Lead"]))

story.append(Paragraph("Your 90-day starter plan", styles["H2"]))
story.append(make_table([
    ["When", "Do this"],
    [("Days 1&ndash;30", "TblCellB"),
     "Validate your idea with real customers. Choose a structure, get your EIN, open a business bank account, and start clean books."],
    [("Days 31&ndash;60", "TblCellB"),
     "Nail your pricing (cover all costs + margin). Build your budget with separate tax and profit accounts. Set your own pay."],
    [("Days 61&ndash;90", "TblCellB"),
     "Start your reserve fund. Launch ONE marketing channel and your email list. Set up website analytics and fix your biggest conversion leak."],
], [1.2 * inch, 5.3 * inch]))

story.append(Paragraph("The 10 rules to live by", styles["H2"]))
story.append(numbered([
    "Keep business and personal money 100% separate.",
    "Price for profit &mdash; being busy isn't the same as being paid.",
    "Watch cash weekly; profit on paper won't pay rent.",
    "Pay yourself on purpose, with a planned number.",
    "Set aside 25&ndash;30% for taxes the moment money lands.",
    "Build a 3&ndash;6 month cash reserve and don't touch it.",
    "Reinvest in growth, but never spend money you don't yet have.",
    "Pick one or two marketing channels and get genuinely good at them.",
    "Own your audience &mdash; build an email list from day one.",
    "Get a good accountant; review your numbers every single month.",
]))

story.append(Spacer(1, 10))
story.append(HRFlowable(width="60%", thickness=1, color=GOLD, hAlign="CENTER",
                        spaceAfter=10))
story.append(Paragraph(
    "\"Revenue is vanity, profit is sanity, but cash is king.\"", styles["Quote"]))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "You've got this. Start small, stay consistent, protect your cash, and keep learning. "
    "Now go build something that lasts.", styles["Body"]))

# ============================================================================
# SOURCES
# ============================================================================
story.append(PageBreak())
story.append(Paragraph("Sources &amp; Further Reading", styles["H1"]))
story.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=10))
story.append(Paragraph(
    "This playbook was compiled from current, reputable sources. Tax and rate figures change "
    "annually &mdash; always confirm specifics with the IRS or a licensed professional.", styles["Body"]))

src = {
 "Budgeting (50/30/20 &amp; frameworks)": [
   "Biz2Credit &mdash; The 50/30/20 Rule for a Small Business Budget: biz2credit.com/business-loan/50-30-20-rule-small-business-budget",
   "Citizens &mdash; What Is the 50/30/20 Budget Rule: citizensbank.com/learning/50-30-20-budget.aspx",
   "CRI CFO Hub &mdash; What is the Budget Rule for Small Business: cfohub.com/what-is-the-budget-rule-for-small-business/",
 ],
 "Paying yourself (draw vs. salary)": [
   "Nav &mdash; Owner's Draw vs Salary: nav.com/blog/owners-draw-vs-salary-what-is-an-owners-draw-643421/",
   "OnPay &mdash; Pay Yourself Right: onpay.com/insights/pay-yourself-owners-draw-vs-salary/",
   "Paychex &mdash; Understanding Owner's Draw: paychex.com/articles/payroll-taxes/what-is-an-owners-draw",
 ],
 "Saving &amp; emergency funds": [
   "Ramsey Solutions &mdash; Business Emergency Fund: ramseysolutions.com/business/business-emergency-fund",
   "Bank of America &mdash; Small Business Emergency Fund: business.bankofamerica.com/en/resources/how-to-establish-a-small-business-emergency-fund",
   "American Express &mdash; Financial Reserves for Business Emergencies",
 ],
 "Pricing &amp; profit margins": [
   "U.S. Chamber of Commerce (CO&mdash;) &mdash; Pricing Markups Explained: uschamber.com/co/start/strategy/what-are-pricing-markups",
   "Shopify &mdash; How to Price a Product: shopify.com/blog/how-to-price-your-product",
   "Ramp &mdash; Proven Pricing Strategies for Small Businesses: ramp.com/blog/small-business-pricing-methods",
 ],
 "Cash flow &amp; why businesses fail": [
   "LivePlan &mdash; Cash Flow vs. Profit: liveplan.com/blog/managing/cash-vs-profits",
   "Finntree &mdash; Why 82% of Small Businesses Fail: finntree.com/blog/cash-flow-management/why-82-percent-small-businesses-fail",
   "U.S. Chamber of Commerce &mdash; Reasons Small Businesses Fail: uschamber.com/co/start/strategy/why-small-businesses-fail",
 ],
 "Taxes &amp; deductions": [
   "IRS &mdash; Self-Employed Individuals Tax Center: irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center",
   "IRS &mdash; Estimated Taxes: irs.gov/businesses/small-businesses-self-employed/estimated-taxes",
   "TurboTax &mdash; Top Tax Write-Offs for the Self-Employed",
 ],
 "Business structure, EIN &amp; setup": [
   "IRS &mdash; Single Member LLCs: irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies",
   "IRS &mdash; Sole Proprietorships: irs.gov/businesses/small-businesses-self-employed/sole-proprietorships",
   "Bench &mdash; Separate Business &amp; Personal Finances: bench.co/syllabus/bookkeeping/separate-business-personal-finances/",
 ],
 "Funding &amp; credit": [
   "U.S. Small Business Administration &mdash; Fund Your Business: sba.gov/business-guide/plan-your-business/fund-your-business",
   "SBA &mdash; Loans: sba.gov/funding-programs/loans",
   "SCORE &mdash; Funding Options: score.org/funding-options/",
 ],
 "Marketing, SEO &amp; conversion": [
   "LocaliQ &mdash; Small Business Marketing Trends Report: localiq.com/blog/small-business-marketing-trends-report/",
   "EmailOctopus &mdash; Email Marketing Strategies: emailoctopus.com/blog/email-marketing-strategies-to-grow-small-business",
   "Triple Whale &mdash; Conversion Rate Optimization Strategies: triplewhale.com/blog/conversion-rate-optimization-cro",
   "Cariad Marketing &mdash; How to Drive Traffic to Your E-commerce Website",
 ],
 "Validating ideas &amp; planning": [
   "Harvard Business School Online &mdash; 5 Steps to Validate Your Business Idea: online.hbs.edu/blog/post/market-validation",
   "LivePlan &mdash; Validate Your Idea: liveplan.com/blog/starting/validate-your-idea",
 ],
}
for topic, items in src.items():
    story.append(Paragraph(topic, styles["H3"]))
    for it in items:
        story.append(Paragraph("&bull; " + it, styles["Source"]))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 10))
story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#C4CEDB")))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Compiled June 2026. Educational use only &mdash; not legal, tax, or financial advice. "
    "Verify all tax figures and legal requirements with current official sources and a licensed "
    "professional for your country and state.", styles["Foot"]))

# ============================================================================
# BUILD (two passes for TOC)
# ============================================================================
doc.multiBuild(story)
print("WROTE", OUTPUT)
