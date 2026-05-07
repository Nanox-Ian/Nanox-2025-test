// ============================================================
// inquiry-embedded-form.js — Form Logic ONLY
// Responsibilities:
//   - iframe initialization
//   - setting src with cache-busting
//   - loading / resetting the inquiry form
//   - optional auto-refresh while modal is open
// ============================================================

// IMPORTANT: Use the full ResponsePage URL with &embed=true.
// The short /r/ redirect URL does NOT support embed mode or query params reliably.
// To update this URL: MS Forms → Share → Embed (</>) → copy src from the iframe snippet.
const MS_FORM_BASE_URL =
    "https://forms.office.com/Pages/ResponsePage.aspx?id=lrfI0RPIFUmB9ZTspjRhxZ8nYLoGdyxAgfxo8Sts--dUOTJZWVBEODFUTlJROFMzRU42MloyNjFXUCQlQCN0PWcu";

/** @type {number|null} */
let _refreshInterval = null;

// ─── Core Form Functions ───────────────────────────────────

/**
 * Sets the iframe src to a fresh URL with a cache-busting timestamp.
 * Always reassigns to force a new session and avoid stale cookie/state issues.
 */
export function loadInquiryForm() {
    const iframe = document.getElementById("msForm");
    if (!iframe) return;

    // Append cache-buster AFTER embed=true so the base params are preserved
    iframe.src = `${MS_FORM_BASE_URL}&t=${Date.now()}`;
}

/**
 * Clears the iframe src, effectively resetting the embedded form.
 */
export function resetInquiryForm() {
    const iframe = document.getElementById("msForm");
    if (!iframe) return;

    iframe.src = "";
}

// ─── Optional Auto-Refresh ────────────────────────────────

/**
 * Starts an auto-refresh interval that reloads the form every 30 seconds,
 * but only while the inquiry modal is visible.
 * Safely clears any previous interval before starting a new one.
 */
export function startAutoRefresh() {
    if (_refreshInterval) clearInterval(_refreshInterval);

    _refreshInterval = setInterval(() => {
        const modal = document.getElementById("inquiryModal");
        if (modal && modal.style.display === "flex") {
            loadInquiryForm();
        }
    }, 30000);
}

/**
 * Stops the auto-refresh interval if one is running.
 */
export function stopAutoRefresh() {
    if (_refreshInterval) {
        clearInterval(_refreshInterval);
        _refreshInterval = null;
    }
}