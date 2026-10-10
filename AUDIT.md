# Portfolio audit — 10 October 2026

## Implemented
- Replaced the inactive dashboard flow and fabricated progress with PDF upload/search, page references, deletion and a focus timer.
- Real PDF extraction replaces binary-as-text reading. Independent random session tokens replace shared global book content. Questions use POST bodies; errors return appropriate status codes without internal exception details.
- The active server imports no OpenAI, Torch, SentenceTransformers or Chroma libraries. No model downloads, GPU work or external document transfers.
- Upload names never become filesystem paths. Uploads are not written to disk. Bounded session count, document size/page/text limits and expiry reduce memory use.
- Added privacy, terms, cookie, refund and demo-information pages. Required, unchecked upload consent; no email or account collection.
- No active tracking, embeds, external fonts, reviews or marketing outcome claims. No raster images are rendered, so the active interface needs no image alt text. Unused hero asset provenance is unknown: do not publish it without permission.
- Semantic headings, explicit form labels, native keyboard controls, visible focus, skip link, status announcements, responsive layout and dark text on light surfaces. Accessibility is not certified: browser/screen-reader testing remains necessary.

## Legal scope
The owner confirmed this is a portfolio project, not an established business. South Africa is a provisional jurisdiction based on workspace context, not a confirmed fact about the operator or audience. No assurance against lawsuits or claim of legal compliance is made.

For a South African public service, review POPIA lawful processing, minimality, notification, security, retention, data-subject rights, Information Officer obligations and children's information. Being a demo or free does not automatically exempt processing. Avoid real personal documents during evaluation.

If selling online, review ECTA supplier disclosures, cancellation/cooling-off rights and applicable Consumer Protection Act duties. No blanket "no refunds" term has been added. Other jurisdictions may apply if visitors are targeted elsewhere.

Sources:
- POPIA: https://www.justice.gov.za/legislation/acts/2013-004.pdf
- Information Regulator guidance: https://inforegulator.org.za/popia/
- ECTA and amended legislation: https://www.gov.za/documents/electronic-communications-and-transactions-act

The source app uses no cookies or optional tracking, so no tracking consent banner was added. This is a finding about this implementation, not a universal legal conclusion. Check hosting/CDN cookies, analytics, logs and embeds on the deployed domain; reassess consent if these change.

## Required before public service launch
1. Supply the real operator/public privacy contact, confirm jurisdiction and intended age group, and adapt policies to actual hosting and retention. A student portfolio need not invent company registration details.
2. Existing `.env`, uploads (including a CV), database and virtual environment are tracked by Git. Ignore rules prevent new untracked files only. Review whether real credentials or personal/copyrighted data were exposed; rotate exposed credentials and remove sensitive tracked files/history through an agreed repository cleanup. No secret values were printed and no existing documents or history were deleted during this audit.
3. Put the API behind HTTPS, a request-body limit and rate limits. Enforce worker/process memory and time limits: hostile compressed PDFs can consume resources before page/text limits are checked. Current in-process PDF parsing is suitable for trusted portfolio evaluation, not unrestricted public uploads. Capacity limits are not abuse prevention.
4. Disable sensitive request-body logging, set provider retention, configure same-origin API proxying and suitable security headers/CSP. Keep one API worker or introduce isolated shared storage before scaling. Anonymous session tokens are bearer secrets, not user accounts.
5. Validate installed dependency versions/security advisories, browser behaviour, keyboard navigation, zoom, contrast and screen-reader flows against the deployed site. No browser automation was available in this session; no deployed-site or load testing was performed. Build and lint passed; five backend integration tests passed.
6. Verify licences for any future images, quotes, fonts or documents. The app does not redistribute the repository ebooks through the UI. Existing files have not been cleared for copyright.

## Verification limits
The UI has been type-checked and production-built; it has not been exercised in a real browser. API tests cover mocked successful extraction/search, isolation, deletion, consent, invalid files, a real blank PDF, session expiry and capacity. Absolute CPU/memory or performance guarantees require measurements on the target host and device.
