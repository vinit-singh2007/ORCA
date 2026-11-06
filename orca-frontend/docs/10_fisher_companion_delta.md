# ORCA Companion Update — Fisher-Facing Product and New Institutional Research Layer

**Old source:** https://teampflresearch.vercel.app/fisher.html. **Design requirement:** never turn the fisherman companion into a wallet-first or blockchain-dependent app.

## Preserve core fisher needs

Trip planning and return, official PFZ and marine state, local conditions, geofences, accessible Gujarati/Hindi/other language support, voice, offline/low connectivity, map, appropriate safety/warning terms, vessel-specific context when authorized. The original field-research notes should guide real user tests rather than be treated as a proven universal population model.

## How research layer improves the fisher experience

Research Studio produces **validated regional derived products** (for example a source-qualified seasonal explanation) which the fisher companion can display in simple language when suitable. But historical scientific research is not an automatically current operational advisory. The user-facing app must present official alert source, issue time, effective area and limitations directly.

## Strict performance boundary

- Simple “what are the wave conditions” query uses cached/source-backed direct pipeline, **not external A2A negotiation, ENS, or Arkiv receipts**.
- High-impact warning information continues to work if agent federation or blockchain is offline.
- A fisher's precise location, chat, vessel details, or contact cannot be added to a public task without explicit policy/consent and appropriate coarse aggregation.
- PFZ suitability claims are product-specific indicators, not guarantees of catch; no unverified safe/unsafe certainty.

## UX and evaluation

Test readability, offline readiness, TTS/STT in actual target languages, exact source/time recognition, low-literacy accessibility, no unwanted chain wallet requirement, error/caching states, warning comprehension and pilot feedback. Validate that any new Research Studio feature actually improves decisions without making the companion more complex.
