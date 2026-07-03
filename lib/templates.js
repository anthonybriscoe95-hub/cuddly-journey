import { COMPANY } from "./company";

// Built-in copywriting engine. Used as-is in demo mode and as the fallback
// when no OPENAI_API_KEY is configured. /api/generate upgrades these to
// fully personalized AI drafts when a key is present.

const sign = `\n\n— ${COMPANY.name}\n${COMPANY.phone} · ${COMPANY.email}\n${COMPANY.website}`;

export function outreachMessage({ audience, name, city, business, tone = "friendly" }) {
  const who = name ? `Hi ${name.split(" ")[0]}!` : "Hi!";
  const where = city ? ` here in ${city}` : " in your area";
  const biz = business || "your business";

  const bodies = {
    homeowner: `${who} I'm with ${COMPANY.name} — we clean homes${where} and I wanted to introduce ourselves. We provide professional, streak-free window cleaning (screens and tracks too) with free, no-pressure estimates. Most homes are done in a single morning, and we'd love the opportunity to earn your business.`,
    business: `${who} I noticed ${biz}${where} and wanted to introduce ${COMPANY.name}. Crystal-clear storefront glass brings customers in the door — we offer reliable weekly, bi-weekly, or monthly service with free estimates and simple flat-rate pricing. We'd love the opportunity to earn your business.`,
    realtor: `${who} I work with realtors${where} through ${COMPANY.name}. Spotless windows make listing photos pop and walk-throughs shine — we offer fast pre-listing window cleaning with free estimates and flexible scheduling around showings. Happy to be your on-call glass team.`,
    property_manager: `${who} I'm reaching out from ${COMPANY.name}. We help property managers${where} keep portfolios looking sharp with scheduled window cleaning for common areas, storefronts, and unit turnovers — one invoice, photo documentation, and free walk-through estimates. We'd love the opportunity to earn your business.`,
    airbnb: `${who} I'm with ${COMPANY.name} — we help short-term rental hosts${where} keep 5-star-worthy views. Streak-free windows, mirrors, and glass doors between guests, with quick turnarounds and free estimates. Great reviews start with sparkling glass!`,
  };

  const openers = {
    friendly: "",
    professional: "",
    short: "",
  };

  let msg = (openers[tone] || "") + (bodies[audience] || bodies.homeowner);
  if (tone === "short") {
    msg = msg.split(". ").slice(0, 2).join(". ") + `. Free estimates — ${COMPANY.phone}.`;
  }
  return msg + sign;
}

export function reviewRequestSMS({ customer, reviewUrl }) {
  const first = customer ? customer.split(" ")[0] : "there";
  return `Hi ${first}, thanks for choosing ${COMPANY.shortName}! If you're happy with your sparkling windows, a quick Google review would mean the world to our small business: ${reviewUrl} — Thank you!`;
}

export function reviewRequestEmail({ customer, reviewUrl }) {
  const first = customer ? customer.split(" ")[0] : "there";
  return {
    subject: `Thanks from ${COMPANY.name}! ⭐`,
    body: `Hi ${first},\n\nThank you for trusting ${COMPANY.name} with your windows — we hope everything looks crystal clear!\n\nIf you have 30 seconds, a Google review helps our local business more than you know:\n${reviewUrl}\n\nAnd if anything isn't perfect, just reply to this email and we'll make it right.\n\nWith gratitude,${sign}`,
  };
}

export function socialPost({ platform, topic = "general", city = "Delaware" }) {
  const posts = {
    facebook: {
      general: `☀️ Sunshine season is here, ${city}! Don't let cloudy glass block the view. ${COMPANY.name} delivers streak-free windows, clean screens, and spotless tracks — with FREE estimates. 📞 ${COMPANY.phone} or book online at ${COMPANY.website}. Tag a neighbor who needs this! 🪟✨`,
      beforeafter: `Swipe to see the difference a Harbor Glass clean makes! 🤩 Before ➡️ After. This ${city} home went from hazy to crystal clear in one morning. Free estimates: ${COMPANY.phone} 🪟✨ #WindowCleaning #${city.replace(/\s/g, "")}`,
      promo: `🎉 NEIGHBOR SPECIAL — book with a neighbor on the same street and you BOTH save 10%! Streak-free windows, screens & tracks by ${COMPANY.name}. Free estimates: ${COMPANY.phone} · ${COMPANY.website}`,
    },
    instagram: {
      general: `Crystal-clear views, zero streaks. 🪟✨\nServing ${city} homes & storefronts.\nFree estimates → link in bio or ${COMPANY.phone}\n.\n.\n#windowcleaning #streakfree #delaware #smallbusiness #beforeandafter #homecare #storefront #harborglass`,
      beforeafter: `POV: you finally see what your windows were hiding. 😳➡️😍\nBefore & after in ${city}.\nFree estimates → ${COMPANY.phone}\n.\n#beforeandafter #windowcleaning #satisfying #cleantok #delaware #harborglass`,
      promo: `This week only: free screen cleaning with any full-home window clean in ${city}. 🧼🪟\nDM us or call ${COMPANY.phone}!\n#windowcleaning #delaware #deal #homecare`,
    },
    gbp: {
      general: `Streak-free window cleaning for ${city} homes and businesses. Residential & commercial service, screen and track cleaning, skylights, and glass doors — always with a free estimate. Call ${COMPANY.phone} or visit ${COMPANY.website} to book.`,
      beforeafter: `Another ${city} storefront shining bright! We restore hazy, water-spotted glass to crystal clear. See the difference professional window cleaning makes — free estimates at ${COMPANY.phone}.`,
      promo: `New customer special: mention this post for 10% off your first full-service window cleaning in ${city}. Includes streak-free glass, wiped sills, and a walk-through inspection. Book: ${COMPANY.phone}.`,
    },
  };
  return posts[platform]?.[topic] || posts.facebook.general;
}

export function chatReply(text) {
  const t = text.toLowerCase();
  if (/(price|cost|how much|estimate|quote)/.test(t))
    return `Great question! Every home and storefront is different, so we do free, no-pressure estimates. Most homes run $150–$350 for a full inside-and-out clean. Want me to grab your details for a free estimate? You can also call ${COMPANY.phone}.`;
  if (/(book|schedule|appointment|when|available)/.test(t))
    return `We'd love to get you on the schedule! Use the "Book Online" form above, or call/text ${COMPANY.phone} and we'll find a time that works — most estimates are scheduled within 48 hours.`;
  if (/(area|serve|location|where)/.test(t))
    return `We serve ${COMPANY.serviceArea} — including Wilmington, Newark, Middletown, Dover, Lewes, and Rehoboth Beach. If you're nearby, ask anyway — we're flexible!`;
  if (/(screen|track|skylight|mirror|door)/.test(t))
    return `Yes! Beyond windows we clean screens, tracks, mirrors, skylights, and glass doors. Bundle them with a window cleaning and save. Want a free estimate?`;
  if (/(insur|licens|safe)/.test(t))
    return `Absolutely — we're fully insured, and we treat your home or storefront like our own. References available on request.`;
  return `Thanks for reaching out to ${COMPANY.name}! We provide streak-free window cleaning with free estimates. Ask me about pricing, scheduling, or our service area — or call ${COMPANY.phone} anytime.`;
}
