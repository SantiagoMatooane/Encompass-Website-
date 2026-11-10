# Encompass Corp. — Data Centre

Buildless website. Serve `dist/` with a static HTTP server.

Shared scroll-driven colour atmosphere and fading chapter transitions. Slogan: Giving your business direction.

Five scroll-snapped chapters: Home, About, Solutions, Team, Contact. English, French and Mandarin copy, responsive layouts, keyboard-accessible dialogs, reduced-motion support and locally hosted assets.

## Prototype boundaries
- Account signup/login uses Firebase Authentication. See [client authentication](docs/client-auth.md) for setup, test boundaries and manual inbox checks.
- Product descriptions are draft positioning; detail dialogs identify the offers as previews.
- Contact form opens the user's email app. No backend submission or storage.
- Public contact details: Data Centre uses annele@encompass.studio, 079 515 0130 (tel:+27795150130), South Africa. Marketing Solutions uses santiago@encompass.studio, 0759531545, France; its phone is retained exactly as supplied. These public links are separate from the form recipient.
- Team portraits are placeholders. The header uses the supplied Encompass Corp. logo, edited to white with transparency.
- No written guideline document was available; implemented the user's five-page written brief.
- Headings use open-source Barlow Condensed as a visual approximation, not Porsche's proprietary font. Body uses Inter. Add a licensed brand font later if provided.

## Photo credits
- Danist Soh: https://unsplash.com/photos/clear-glass-and-black-building-kWvsIYwUkJs
- Max Bürgi: https://unsplash.com/photos/abstract-light-streaks-on-a-blue-background-2pPNznUrp70
- Both source pages state free to use under https://unsplash.com/license
- Photos are illustrative; they do not depict company offices or employees.

## Logo rendering
The supplied original is preserved in dist/assets/encompass-logo-original.png. A browser SVG colour filter renders the exact source silhouette in white and makes the white background transparent, without redrawing its contours. Generated cutouts were rejected after visual inspection because they contained stray pixels. The production header uses the original directly.

## Marketing page
`dist/marketing.html` is the continuous Marketing Solutions page. The division selector connects it to the existing Data Centre. Four sections follow the supplied handwritten guideline: framed hero, marketing overview, two services, contact. White background, softly animated blue/green edge shapes, Instrument Serif typography, blue contact fade, English/French/Mandarin copy. Reduced-motion preferences disable ambient movement.

Current services: Digital Marketing (content creation, AI videos, brand positioning, social media management and paid campaigns) and Website Creation (packages scoped to needs and complexity). No invented prices, outcomes, client statistics, or package quotas.

Additional free placeholder photos:
- Spencer DeMera: https://unsplash.com/photos/green-rolling-hills-under-a-bright-blue-sky-DEF5GEz76-o
- Aaron Burden: https://unsplash.com/photos/close-up-of-vibrant-green-fern-leaves-in-soft-light-bYiJojtkHnc
Both source pages confirm the Unsplash License. Credits are linked in the site footer.

Publication is still pending the previously requested approval to host the supplied contact details. Local changes do not grant that approval.

## Marketing visual revision
Updated to the supplied blue/white/black reference with oversized Inter headings. Removed green text, nature imagery, retro serif treatments, and the rejected growth sentence. About heading: Marketing analysis. Hero, analysis and package sections now use business-related Pexels photos, with in-site credit links.

Photo sources:
- https://www.pexels.com/photo/people-in-a-business-meeting-7888760/
- https://www.pexels.com/photo/using-laptop-in-a-business-meeting-7693683/
- https://www.pexels.com/photo/person-using-laptop-and-smartphone-4549413/
- https://www.pexels.com/photo/crop-faceless-developer-working-on-software-code-on-laptop-5926382/

## Current product experiences

- Legal includes a guided fictional workspace with in-memory document and task state. Automated email and WhatsApp workflows are separately scoped options; the demo sends nothing.
- Peachlight Kitchen includes supplied food photographs, table selection, a local cart and fictional order confirmation. Currency previews use fixed illustrative USD/ZAR/EUR/JPY rates, start paused and stop on interactions. Submitted confirmation currency and totals are frozen. No real orders, payments or messages are sent.
- CRM is an in-development concept presentation with planned focus areas and an enquiry action; no CRM demo or internal client data is exposed.
- The Data Centre About showcase rotates while visible, holds during interaction and dialogs, and uses a static layout for reduced motion.
- Contact forms still compose email addressed to santiagomatooane3@gmail.com. Server-side enquiry delivery is pending.

## Browser regression checks

Serve `dist/` on port 4173 and run isolated Chrome with remote debugging on port 9227. Run each check sequentially:

```powershell
node verify-auth.mjs
node verify-auth.mjs --sdk-only
node verify-legal.mjs
node verify-restaurant.mjs
node verify-restaurant-real.mjs
node verify-crm.mjs
node verify-about.mjs
node verify-contact.mjs
```

Authentication mocks exercise UI flows without live accounts or email. The SDK-only check loads the real public Firebase configuration read-only. See `docs/client-auth.md` for emulator and manual inbox checks. Real-timer restaurant and About checks require the browser to remain available during the run. Review screenshots and galleries are local artifacts under ignored `.openai/` or the system temporary directory, not project source. French and Mandarin copy still needs fluent-speaker review.

## Marketing services update — November 2026

`dist/marketing-services.js` provides detailed, accessible service dialogs with Pexels photography and correctly selected enquiry interests. `dist/website-examples.html` presents ten supplied screenshots across five website projects. Gallery cards expand on hover/focus and open a native image dialog on click or keyboard activation. Escape closes dialogs and returns focus. Mobile layouts use a single column; reduced-motion settings remove gallery transitions. New copy supports English, French and Mandarin.

The three inspiration collages and handwritten notes are reference material, not portfolio entries. Optimized portfolio JPEGs are stored in `dist/assets/portfolio/`; originals are untouched. The Website Creation return link reopens its service dialog. No prices or package quotas have been invented.

Validated locally: JavaScript syntax, both service dialogs, portfolio navigation, image enlargement, Escape/focus return, asset paths and enquiry options. This is local work on `feature/santiago-marketing`; no push, merge or deployment.
