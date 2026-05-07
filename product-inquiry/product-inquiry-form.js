// ================================================================
// product-inquiry-form.js — Form Logic ONLY (Product Inquiry)
// Responsibilities:
//   - iframe initialization
//   - setting src with cache-busting (?t=timestamp)
//   - loading / resetting the Product Inquiry MS Form
//   - optional auto-refresh while modal is open
//
// Does NOT contain any UI, modal, or button logic
// Does NOT share state with inquiry-embedded-form.js
// ================================================================

// Full ResponsePage URL with embed mode.
// To update: MS Forms → Share → Embed (</>) → copy src from the iframe snippet.
const PI_FORM_BASE_URL =
    "https://forms.office.com/Pages/ResponsePage.aspx?id=lrfI0RPIFUmB9ZTspjRhxZ8nYLoGdyxAgfxo8Sts--dUNTY2OENXNlZWRlhUSTNVSFZYTzg3S00wSCQlQCN0PWcu";

/** @type {number|null} */
let _piRefreshInterval = null;

// ── Core Form Functions ────────────────────────────────────────

/**
 * Sets the Product Inquiry iframe src to a fresh URL with a
 * cache-busting timestamp, forcing a new session on every open.
 */
export function loadProductInquiryForm() {
    const iframe = document.getElementById("piFormFrame");
    if (!iframe) return;

    // Append cache-buster after the base URL so params are preserved
    iframe.src = `${PI_FORM_BASE_URL}&t=${Date.now()}`;
}

/**
 * Clears the iframe src, resetting the embedded form.
 * Called when the modal closes to avoid a stale session on next open.
 */
export function resetProductInquiryForm() {
    const iframe = document.getElementById("piFormFrame");
    if (!iframe) return;

    iframe.src = "";
}

// ── Optional Auto-Refresh ──────────────────────────────────────

/**
 * Starts a 30-second auto-refresh cycle, but only while the
 * Product Inquiry form modal is visible on screen.
 */
export function startPIAutoRefresh() {
    if (_piRefreshInterval) clearInterval(_piRefreshInterval);

    _piRefreshInterval = setInterval(() => {
        const modal = document.getElementById("piFormModal");
        if (modal && modal.style.display === "flex") {
            loadProductInquiryForm();
        }
    }, 30000);
}

/**
 * Stops the auto-refresh interval if one is running.
 */
export function stopPIAutoRefresh() {
    if (_piRefreshInterval) {
        clearInterval(_piRefreshInterval);
        _piRefreshInterval = null;
    }
}