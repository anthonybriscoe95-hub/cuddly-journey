// Lead Finder search. With GOOGLE_MAPS_API_KEY set, queries the Google Places
// Text Search API (an official, ToS-compliant source of public business
// listings). Without a key, returns { fallback: true } and the client
// searches the built-in sample dataset instead.
//
// Note: this app deliberately does NOT scrape Facebook, Nextdoor, or Reddit.
// Those channels are supported as *manual* sources — leads you spot yourself
// while participating in those communities and log with the quick-add form.

export async function POST(req) {
  const { query, city } = await req.json();
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    return Response.json({ fallback: true, results: [] });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.location,places.rating,places.userRatingCount,places.types",
      },
      body: JSON.stringify({
        textQuery: `${query} in ${city || "Delaware"}`,
        maxResultCount: 20,
      }),
    });

    if (!res.ok) return Response.json({ fallback: true, results: [] });
    const data = await res.json();

    const results = (data.places || []).map((p) => {
      // Opportunity score: visible storefront businesses with real ratings
      // volume and a website are the most reachable, highest-intent targets.
      let score = 60;
      if (p.websiteUri) score += 10;
      if (p.nationalPhoneNumber) score += 10;
      if ((p.userRatingCount || 0) > 25) score += 10;
      if ((p.rating || 0) >= 4.0) score += 5;
      return {
        name: p.displayName?.text || "Unknown",
        website: (p.websiteUri || "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
        phone: p.nationalPhoneNumber || "",
        email: "",
        city: city || (p.formattedAddress || "").split(",").slice(-3, -2)[0]?.trim() || "",
        address: p.formattedAddress || "",
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        source: "Google Maps",
        type: "business",
        score: Math.min(score, 98),
      };
    });

    return Response.json({ fallback: false, results });
  } catch {
    return Response.json({ fallback: true, results: [] });
  }
}
