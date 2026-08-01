# MotoCare Research Findings

## 1. Real-time/daily fuel price sources for Thailand
**Approaches/Options:**
*   **Bangchak Official Web Service:** Bangchak provides an API-like endpoint for their fuel price widgets (e.g., `https://oil-price.bangchak.co.th/ApiOilPrice2/en`).
*   **EPPO (Energy Policy and Planning Office):** The government offers an Energy Open Data portal, but it is primarily geared toward statistical analysis rather than a real-time retail feed.
*   **Community API Wrappers (e.g., thai-oil-api):** Open-source GitHub projects (like `max180643/thai-oil-api`) scrape and aggregate data from PTT, Bangchak, and others, offering JSON endpoints.
*   **PTT SOAP Web Service:** Historically, PTT provides a SOAP WSDL (`https://orapiweb.pttor.com/oilservice/OilPrice.asmx?WSDL`), which requires a backend wrapper (e.g., Python `zeep` or Node.js `soap` library) to parse XML into JSON for the client.

**Pros/Cons/Limitations:**
*   Official APIs like Bangchak's are reliable but cover only one brand.
*   Government EPPO data isn't easily accessible as a real-time JSON feed.
*   Community wrappers are free and convenient (JSON format) but carry the risk of breaking if the upstream site layout changes or if the maintainer abandons the project.
*   PTT's SOAP service is archaic and requires backend parsing; it is not ideal for a pure client-side PWA.

**Sources:**
*   Bangchak API: https://oil-price.bangchak.co.th/ApiOilPrice2/en
*   EPPO Data: https://www.eppo.go.th
*   Thai Oil API (GitHub): https://github.com/max180643/thai-oil-api

## 2. Web Push / local notifications on a PWA for document-expiry reminders
**Approaches/Options:**
*   **Service Workers + Web Push API:** The standard web method for PWAs to receive background notifications.

**Pros/Cons/Limitations (iOS Safari vs Android Chrome):**
*   **Android (Chrome):** Robust support. Push notifications act like native apps. The user can be prompted for permission directly from the browser context. Background wake-up is reliable.
*   **iOS (Safari):** Only supported on iOS 16.4+. Crucially, Web Push *requires* the user to "Add to Home Screen" first. Notifications do not work for standard in-browser visits. The prompt for permission must be triggered by a direct user interaction. Apple also enforces stricter background limits, meaning background syncs are less reliable if the app hasn't been opened recently.

**Fallback Approaches:**
*   **Calendar Integration:** Generating a `.ics` file or `webcal://` link allowing the user to add the expiry date directly to their Google or Apple Calendar.
*   **Alternative Channels:** If push isn't available, asking the user to provide an email or LINE ID for backend-triggered reminders.

**Sources:**
*   WebKit Push API docs: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
*   Apple Web Push requirements: https://developer.apple.com/notifications/safari-push-notifications/

## 3. Deep-link/renewal patterns for Thai government and insurance renewals
**Approaches/Options:**
*   **DLT e-Service (Department of Land Transport):** The official portal (eservice.dlt.go.th) and DLT Vehicle Tax mobile app for paying annual car tax (ป้ายวงกลม) and compulsory insurance (พ.ร.บ.).
*   **Major Insurers (Viriyah, Thanachart, Muang Thai):** Online portals for purchasing voluntary insurance (ประกันชั้น 1/2/3).

**Pros/Cons/Limitations:**
*   **No Public Deep Links:** There is no publicly documented support for deep-linking with specific URL parameters (like pre-filling the license plate) to bypass the standard DLT login flow.
*   **Security Barrier:** DLT e-Service requires secure login via Digital ID (ThaID). Users must manually navigate to "Paying annual car tax via the Internet".
*   **Private Insurance:** While private insurers have web portals, they typically rely on their own lead-generation funnels and do not offer standardized deep-linking for third-party apps to pass vehicle data directly.

**Sources:**
*   DLT e-Service: https://eservice.dlt.go.th/
*   DGA (Government Data Linkage Center): https://www.dga.or.th/

## 4. Common part-sourcing / price-tracking link patterns for motorcycle mods in Thailand
**Approaches/Options:**
*   **Official Open APIs (Shopee Open Platform / Lazada Open Platform):** Intended for ERP, OMS, or authorized affiliate marketing tools.
*   **Affiliate Networks (Involve Asia):** Third-party networks that handle link generation and commission tracking.
*   **Web Scraping:** Using bots to monitor standard product URLs.

**Pros/Cons/Limitations:**
*   **Strict API Limits:** Shopee limits requests (e.g., 100/min). Lazada places dormant apps (90 days) into hibernation.
*   **Purpose Restriction:** Official APIs cannot be used for unauthorized site-wide price scraping. They are primarily for managing your own shop or getting data for specific affiliate products.
*   **Scraping Blockers:** Both platforms employ heavy anti-scraping measures (IP bans, CAPTCHAs). Automated price tracking via scraping is highly fragile and technically difficult to maintain at scale.

**Sources:**
*   Shopee Open Platform: https://openplatform.shopee.com/
*   Lazada Open Platform: https://openapi.lazada.com/

## 5. OCR for Thai + Latin-numeral fuel pump receipts
**Approaches/Options:**
*   **Client-side (Tesseract.js + Thai traineddata):** Runs entirely in the browser using WebAssembly.
*   **Cloud (Google Cloud Vision / Azure AI Document Intelligence):** Managed REST APIs for document extraction.
*   **Typhoon OCR (VLM):** A Vision-Language Model optimized specifically for the Thai context.

**Pros/Cons/Limitations:**
*   **Tesseract.js:** Free and offline-first (great for privacy and PWA constraints). However, the library is heavy, and native accuracy for Thai script (especially thermal receipts with stacked diacritics and poor lighting) is notoriously poor without intensive image pre-processing.
*   **Google/Azure Cloud:** Very high "out-of-the-box" accuracy for complex, crumpled receipts. Capable of handling mixed Thai/Latin text easily. The downside is it requires network connectivity and costs money per API call.
*   **Typhoon OCR:** Excellent at parsing the *meaning* (e.g., distinguishing fuel type from the station name), but requires significant backend infrastructure (GPUs) to host, making it unsuitable for a pure offline PWA.

**Sources:**
*   Tesseract.js: https://tesseract.projectnaptha.com/
*   Typhoon OCR: https://opentyphoon.ai/

## 6. Web Speech API Thai (th-TH) language support in practice
**Approaches/Options:**
*   Using `window.speechSynthesis` (Text-to-Speech) and `webkitSpeechRecognition` (Speech-to-Text) with `lang = 'th-TH'`.

**Pros/Cons/Limitations:**
*   **Android (Chrome):** Excellent support. Uses Google's robust backend for speech recognition natively.
*   **iOS (Safari):** Safari supports `webkitSpeechRecognition` (iOS 14.5+), but Thai support is highly variable and depends heavily on the user's OS language settings and downloaded voice packs. PWAs/WebViews often face issues with microphone permissions on iOS.
*   **Network Dependency:** Speech recognition usually requires an active internet connection to send audio to browser-vendor servers.
*   **Fallback:** If unsupported or offline, the UI must gracefully fall back to a standard text input or manual form entry.

**Sources:**
*   MDN Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

## 7. Dexie.js offline-first + sync-queue patterns
**Approaches/Options:**
*   **Custom Sync Queue:** Storing pending mutations (creates, updates, deletes) in a dedicated Dexie table (e.g., `_syncQueue`). A background loop or service worker listens for the 'online' event to flush the queue to the backend.
*   **Dexie Cloud:** A paid add-on for Dexie that handles offline-first sync, conflict resolution, and user authentication automatically.
*   **Community Libraries (e.g., @dexie-kit/sync):** Provides offline queues and retries for REST APIs.

**Pros/Cons/Limitations:**
*   **Custom Queue:** Maximum flexibility and free, but you must manually handle conflict resolution (e.g., Last-Write-Wins or server-wins), schema versioning, and error handling for failed syncs.
*   **Dexie Cloud:** Easy to implement and highly robust, but introduces a vendor dependency and subscription cost.

**Sources:**
*   Dexie Cloud: https://dexie.org/cloud/
*   Dexie.js React Tutorial: https://dexie.org/docs/Tutorial/React

## 8. vite-plugin-pwa patterns for precaching fonts/icons/vault documents
**Approaches/Options:**
*   **includeAssets:** For simple, known static assets (like fonts `.woff2` and icons `.svg`), adding them to the `includeAssets` array in `vite.config.ts` ensures they are precached by the default `generateSW` strategy.
*   **Workbox globPatterns:** If using `injectManifest`, defining custom `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']` in the Workbox config.
*   **Background Sync Plugin:** Using Workbox's `BackgroundSyncPlugin` to queue failed network requests and flush them when reconnected.

**Pros/Cons/Limitations:**
*   **Static vs Dynamic:** `includeAssets` and `globPatterns` are easy to configure but only work for static files present at build time (e.g., fonts, icons).
*   **Dynamic Caching (Vault Documents):** For user-generated vault documents (which aren't available at build time), precaching won't work. You must use Workbox runtime caching strategies (e.g., `CacheFirst` or `StaleWhileRevalidate`) or store the base64/blob directly in IndexedDB.
*   **Background Sync API:** While Workbox makes background sync easy for simple POST requests, the underlying API is poorly supported on iOS Safari, making custom Dexie queues (Topic 7) a more reliable cross-platform solution.

**Sources:**
*   Vite PWA Assets: https://vite-pwa-org.netlify.app/guide/static-assets.html
*   Workbox Background Sync: https://developer.chrome.com/docs/workbox/modules/workbox-background-sync/

## 9. Client-side PDF generation options (jsPDF, pdf-lib) for a resale passport
**Approaches/Options:**
*   **jsPDF:** Imperative library for drawing text/shapes onto a PDF canvas.
*   **pdf-lib:** Library for creating and modifying existing PDF documents.
*   **@react-pdf/renderer:** Declarative React components to build PDFs.
*   **pdfmake:** Declarative JSON structure for document generation.

**Pros/Cons/Limitations (Specifically for Thai Font Support):**
*   **jsPDF & pdf-lib:** Require manual TTF font embedding. Both struggle natively with complex Thai script rendering (e.g., floating vowels and tone marks often render misaligned or separated from the base consonant) because they lack advanced text shaping engines.
*   **@react-pdf/renderer:** Integrates perfectly with React state/props. With proper font registration, it handles layout well, though custom font loading still requires careful setup for Thai Unicode ranges.
*   **pdfmake:** Often preferred by Thai developers as it has community wrappers (like `pdfmake-thai`) that specifically address the complex text layout rules for Thai characters, avoiding the tedious coordinate math required by jsPDF.

**Sources:**
*   react-pdf: https://react-pdf.org/
*   pdfmake: https://pdfmake.github.io/docs/

## 10. Libraries/utilities for Buddhist-era (พ.ศ.) date conversion
**Approaches/Options:**
*   **Native Intl API:** Using built-in `Date.prototype.toLocaleDateString('th-TH-u-ca-buddhist')`.
*   **Day.js with Plugin:** Using `dayjs` coupled with the `buddhistEra` plugin (`dayjs/plugin/buddhistEra`).
*   **Manual Arithmetic (Current Prototype):** Using string concatenation like `day + ' ' + thaiShortMonth + ' ' + (year + 543)`.

**Pros/Cons/Limitations:**
*   **Native Intl API:** Built-in and requires no extra dependencies, meaning a lighter payload for PWAs. Highly reliable for display but doesn't handle complex formatting strings easily.
*   **Day.js:** Lightweight and handles string formatting perfectly. Using the official plugin avoids manually modifying the global Date object.
*   **Manual Arithmetic (year + 543):** Simple but highly prone to edge case errors. The "+543" rule doesn't cleanly apply to leap years, user input parsing, or localization boundaries (other countries use +544). Also, performing date logic on B.E. years instead of Gregorian can break database storage. Dates should always be processed/stored in standard Gregorian A.D. and only converted to B.E. on the presentation layer.

**Sources:**
*   MDN Intl.DateTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
*   Day.js Buddhist Era Plugin: https://day.js.org/docs/en/plugin/buddhist-era

## 11. Client-side image compression libraries for photo picker
**Approaches/Options:**
*   **browser-image-compression:** A popular, dedicated JS library for compressing images in the browser.
*   **Custom Canvas API:** Manually drawing the `File` to an HTML `<canvas>` and calling `toBlob()` with a lower quality.

**Pros/Cons/Limitations:**
*   **browser-image-compression:** 
    *   **Pros:** Automatically handles Web Workers (so the UI doesn't freeze during heavy compression), automatically corrects EXIF orientation (preventing photos from appearing sideways after upload), and optimizes file size by prioritizing dimension resizing over raw quality reduction. It returns a `Blob` which is more efficient for network transfer than Base64 (which adds ~33% overhead).
    *   **Cons:** Adds a minor dependency to the bundle.
*   **Custom Canvas API:** 
    *   **Pros:** No external dependencies.
    *   **Cons:** Runs on the main thread (blocking the UI), requires manual handling of EXIF orientation data (often lost or incorrectly read by default), and requires writing complex boilerplate code.

**Sources:**
*   browser-image-compression (GitHub): https://github.com/Donaldcwl/browser-image-compression
