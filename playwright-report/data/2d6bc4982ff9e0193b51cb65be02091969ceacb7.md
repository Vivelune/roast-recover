# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance.spec.ts >> Page load performance >> Homepage loads under 5 seconds
- Location: tests/e2e/performance.spec.ts:13:9

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 5000
Received:   5031
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - link "roast&recover" [ref=e3] [cursor=pointer]:
      - /url: /
    - generic [ref=e4]:
      - link "Equipment" [ref=e5] [cursor=pointer]:
        - /url: /equipment
      - link "Packaging" [ref=e6] [cursor=pointer]:
        - /url: /packaging
      - link "Why us" [ref=e7] [cursor=pointer]:
        - /url: /why-roastandrecover
      - link "Blog" [ref=e8] [cursor=pointer]:
        - /url: /blog
      - link "Contact" [ref=e9] [cursor=pointer]:
        - /url: /contact
    - generic [ref=e10]:
      - link [ref=e11] [cursor=pointer]:
        - /url: /cart
        - button [ref=e12]:
          - img
      - link [ref=e13] [cursor=pointer]:
        - /url: /equipment/cart
        - button [ref=e14]:
          - img
      - link "Sign in" [ref=e16] [cursor=pointer]:
        - /url: /sign-in
  - main [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e23]: Certified equipment & packaging
          - heading "Direct from source. Built for your café." [level=1] [ref=e26]:
            - text: Direct from source.
            - text: Built for your café.
          - paragraph [ref=e28]: Espresso machines, grinders, cups, and bags — sourced from certified factories and shipped to your café, without the distributor markup in between.
          - generic [ref=e30]:
            - link "Shop equipment" [ref=e31] [cursor=pointer]:
              - /url: /equipment
              - text: Shop equipment
              - img [ref=e32]
            - link "Shop packaging" [ref=e34] [cursor=pointer]:
              - /url: /packaging
        - img "Commercial espresso machine" [ref=e38]
      - generic [ref=e40]:
        - generic [ref=e42]:
          - img [ref=e44]
          - paragraph [ref=e47]: UL & NSF certified
          - paragraph [ref=e48]: Every machine, verified before it ships.
        - generic [ref=e50]:
          - img [ref=e52]
          - paragraph [ref=e56]: US-based company
          - paragraph [ref=e57]: Registered LLC, US support and warranty.
        - generic [ref=e59]:
          - img [ref=e61]
          - paragraph [ref=e66]: Built to order
          - paragraph [ref=e67]: No warehouse markup, sourced per order.
      - generic [ref=e68]:
        - generic [ref=e69]:
          - paragraph [ref=e70]: Why direct sourcing
          - heading "Three layers of markup, removed." [level=2] [ref=e71]
        - generic [ref=e72]:
          - generic [ref=e74]:
            - paragraph [ref=e75]: "01"
            - paragraph [ref=e76]: Factory verified
            - paragraph [ref=e77]: We work only with manufacturers whose models already carry UL or NSF certification — no shortcuts.
          - generic [ref=e79]:
            - paragraph [ref=e80]: "02"
            - paragraph [ref=e81]: No distributor markup
            - paragraph [ref=e82]: Pricing reflects factory cost plus a transparent margin, not three resellers' worth of markup.
          - generic [ref=e84]:
            - paragraph [ref=e85]: "03"
            - paragraph [ref=e86]: Built per order
            - paragraph [ref=e87]: We don't sit on warehouse inventory — your equipment is sourced when you order, keeping costs down.
      - generic [ref=e89]:
        - generic [ref=e90]:
          - paragraph [ref=e91]: How it works
          - heading "From factory floor to your café." [level=2] [ref=e92]
        - generic [ref=e93]:
          - generic [ref=e96]:
            - img [ref=e98]
            - paragraph [ref=e100]: Order placed
            - paragraph [ref=e101]: Choose your equipment or packaging and pay a deposit to begin sourcing.
          - generic [ref=e103]:
            - img [ref=e105]
            - paragraph [ref=e109]: Sourced & verified
            - paragraph [ref=e110]: Your order is built and certification is confirmed before it ships.
          - generic [ref=e112]:
            - img [ref=e114]
            - paragraph [ref=e118]: Shipped to your café
            - paragraph [ref=e119]: Balance is due on completion, then it ships straight to your door.
      - generic [ref=e122]:
        - generic [ref=e123]:
          - paragraph [ref=e124]:
            - generic [ref=e125]: 0%
          - paragraph [ref=e126]: distributor markup
        - generic [ref=e127]:
          - paragraph [ref=e128]:
            - generic [ref=e129]: 0%
          - paragraph [ref=e130]: certified equipment
        - generic [ref=e131]:
          - paragraph [ref=e132]:
            - generic [ref=e133]: 0 days
          - paragraph [ref=e134]: avg. lead time
        - generic [ref=e135]:
          - paragraph [ref=e136]:
            - generic [ref=e137]: US 0
          - paragraph [ref=e138]: registered company
      - generic [ref=e140]:
        - heading "Ready to cut out the middlemen?" [level=2] [ref=e142]
        - link "Get started" [ref=e145] [cursor=pointer]:
          - /url: /equipment
          - text: Get started
          - img [ref=e146]
  - contentinfo [ref=e148]:
    - generic [ref=e149]:
      - generic [ref=e150]:
        - generic [ref=e151]:
          - paragraph [ref=e152]: roast&recover
          - paragraph [ref=e153]: Certified café equipment and packaging, sourced direct from factory to your café.
        - generic [ref=e154]:
          - paragraph [ref=e155]: Shop
          - list [ref=e156]:
            - listitem [ref=e157]:
              - link "Equipment" [ref=e158] [cursor=pointer]:
                - /url: /equipment
            - listitem [ref=e159]:
              - link "Packaging" [ref=e160] [cursor=pointer]:
                - /url: /packaging
            - listitem [ref=e161]:
              - link "How it works" [ref=e162] [cursor=pointer]:
                - /url: /how-it-works
            - listitem [ref=e163]:
              - link "About" [ref=e164] [cursor=pointer]:
                - /url: /about
            - listitem [ref=e165]:
              - link "Blog" [ref=e166] [cursor=pointer]:
                - /url: /blog
            - listitem [ref=e167]:
              - link "Contact us" [ref=e168] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e169]:
          - paragraph [ref=e170]: Account
          - list [ref=e171]:
            - listitem [ref=e172]:
              - link "My account" [ref=e173] [cursor=pointer]:
                - /url: /account
            - listitem [ref=e174]:
              - link "Orders" [ref=e175] [cursor=pointer]:
                - /url: /account/orders
            - listitem [ref=e176]:
              - link "Equipment" [ref=e177] [cursor=pointer]:
                - /url: /account/equipment
            - listitem [ref=e178]:
              - link "Why Roast & Recover" [ref=e179] [cursor=pointer]:
                - /url: /why-roastandrecover
        - generic [ref=e180]:
          - paragraph [ref=e181]: Legal
          - list [ref=e182]:
            - listitem [ref=e183]:
              - link "Terms of Service" [ref=e184] [cursor=pointer]:
                - /url: /terms
            - listitem [ref=e185]:
              - link "Privacy Policy" [ref=e186] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e187]:
              - link "Shipping Policy" [ref=e188] [cursor=pointer]:
                - /url: /shipping
            - listitem [ref=e189]:
              - link "Returns & Warranty" [ref=e190] [cursor=pointer]:
                - /url: /returns
      - generic [ref=e191]:
        - paragraph [ref=e193]: © 2026 Roast & Recover LLC. All rights reserved.
        - generic [ref=e194]:
          - paragraph [ref=e195]: Certified equipment · Direct sourcing · US LLC
          - generic [ref=e196]: "|"
          - link "ritual@roastandrecover.com" [ref=e197] [cursor=pointer]:
            - /url: mailto:ritual@roastandrecover.com
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | const PAGES = [
  4  |   { path: "/", name: "Homepage" },
  5  |   { path: "/equipment", name: "Equipment listing" },
  6  |   { path: "/packaging", name: "Packaging listing" },
  7  |   { path: "/how-it-works", name: "How it works" },
  8  |   { path: "/blog", name: "Blog" },
  9  | ];
  10 | 
  11 | test.describe("Page load performance", () => {
  12 |   for (const { path, name } of PAGES) {
  13 |     test(`${name} loads under 5 seconds`, async ({ page }) => {
  14 |       const start = Date.now();
  15 |       await page.goto(path, { waitUntil: "domcontentloaded" });
  16 |       const duration = Date.now() - start;
  17 |       console.log(`${name}: ${duration}ms`);
> 18 |       expect(duration).toBeLessThan(5000);
     |                        ^ Error: expect(received).toBeLessThan(expected)
  19 | 
  20 |       // No JS errors on load
  21 |       const errors: string[] = [];
  22 |       page.on("pageerror", (err) => errors.push(err.message));
  23 |       await page.waitForTimeout(1000);
  24 |       // Filter out known dev-mode warnings
  25 |       const realErrors = errors.filter(
  26 |         (e) =>
  27 |           !e.includes("Clerk") &&
  28 |           !e.includes("hydration") &&
  29 |           !e.includes("development keys")
  30 |       );
  31 |       expect(realErrors).toHaveLength(0);
  32 |     });
  33 |   }
  34 | });
```