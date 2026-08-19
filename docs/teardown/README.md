# Wishlist teardown — capture brief

The one piece of Part 1 evidence the discovery engine cannot produce. Scraped
text says shoppers hesitate; only the live UI shows that **no wishlist surface
offers any way to resolve the hesitation**.

**Blocked on you** — these must be captured from your own phone. Everything else
in this brief is ready.

## Why it earns a slide

Part 1 measures `genuine_intent` at 80.3% but cannot split out comparison sets or
occasion-bound saves (see the intent-axis limit in `Methodology.tsx`). The
teardown covers that gap without any tagging: an unresolved comparison set is
visible on screen 1 of all three apps, in lists of only 4–9 items. That is a
demonstration, not a percentage, and it does not depend on the corpus.

## Capture

Three screenshots, **mobile app only** — the desktop web wishlist has a filter
rail and sidebar that misrepresent the "before" state.

- [ ] Myntra — wishlist, top of list, unscrolled
- [ ] AJIO — same
- [ ] Nykaa Fashion — same
- [ ] Optional: a heavier list (25+ items) from a second person. Small lists
      prove the point; a long one makes "this is unfinishable" visceral.

**Redact before anything leaves your machine.** The Myntra wishlist header
carries the delivery name and address. Check all three for PII — usernames,
addresses, order counts — before they enter this folder.

Save as `myntra.png`, `ajio.png`, `nykaa.png`, annotated versions suffixed
`-annotated.png`.

## What to annotate — verify each against your own capture

Claims below come from the playbook's teardown. Do not put one on a slide unless
your screenshot actually shows it.

**Myntra** — every card leads with % OFF and a struck-through price · "PRICE DROP
BY ₹169" is the only proactive nudge · a cashback banner sits above the first
product · category chips filter by *what* an item is, never by *why* it was saved
· three actions per card (delete · move to bag · share), two terminal and one an
escape hatch · no save date, no reason, no occasion, no size guidance.

**AJIO** — exactly two actions exist, delete or add to bag, both terminal · ADD TO
BAG is the loudest element on a screen whose user has by definition already
declined to buy now · no filters, no sort, no item count.

**Nykaa Fashion** — two promo banners above the first saved item · the first
content on the page is a coupon code · "Move to Bag" is the quietest element on
the card while the remove **X** sits on the product photo.

## The line the slide has to land

Every conversion lever on all three wishlists is monetary — discount badges, a
price-drop alert, a cashback banner, a coupon above the first saved item. All
three treat the wishlist as a discount-delivery channel rather than a decision
surface.

Which reframes the brief's hardest constraint: **no monetary incentives is not a
handicap, it is the only design space none of the incumbents has entered.**
