// ================================================================
// product-inquiry.js — UI / Button / Modal Logic ONLY
// Responsibilities:
//   - Inject ONE Product Inquiry button below the products grid (#Items)
//   - Privacy Policy confirmation modal
//   - Product Inquiry form modal
//   - Mobile/tablet back button (hidden on desktop)
//   - Body scroll lock
//   - Orientation & resize handling
//
// ❌ Does NOT contain iframe src, form URL, or cache-busting logic
// ❌ Does NOT interact with the existing ChatInquiry system
// ================================================================

import {
    loadProductInquiryForm,
    resetProductInquiryForm,
} from "./product-inquiry-form.js";

// ── Helpers ────────────────────────────────────────────────────

function preventBodyScroll(prevent) {
    document.body.style.overflow               = prevent ? "hidden" : "";
    document.documentElement.style.overflow    = prevent ? "hidden" : "";
}

// ── Build Confirmation Modal (Privacy Policy) ──────────────────

function buildConfirmationModal() {
    const modal = document.createElement("div");
    modal.id        = "piConfirmationModal";
    modal.className = "pi-modal";
    modal.style.display = "none";

    modal.innerHTML = `
        <div class="pi-confirmation-content">
            <div class="pi-confirmation-body">

                <div class="pi-confirmation-header">
                    <h3>Privacy Policy Acknowledgement</h3>
                    <p>
                        Before proceeding to the product inquiry form, please acknowledge
                        that you have read and agree to our Privacy Policy.
                    </p>
                </div>

                <div class="pi-confirmation-checkbox">
                    <div class="pi-checkbox-row">
                        <input type="checkbox" id="piPrivacyCheckbox">
                        <div>
                            <label for="piPrivacyCheckbox" class="pi-checkbox-label">
                                I have read and agree to the Privacy Policy
                            </label>
                            <p class="pi-checkbox-description">
                                By checking this box, you acknowledge that you have reviewed
                                our Privacy Policy and consent to the collection and use of
                                your personal information as described therein.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="pi-confirmation-buttons">
                    <button id="piCancelBtn" class="pi-btn pi-btn-cancel">Cancel</button>
                    <button id="piProceedBtn" class="pi-btn pi-btn-proceed" disabled>
                        Proceed to Form
                    </button>
                </div>

                <div class="pi-policy-link">
                    <p>
                        Need to review the policy?
                        <a href="policy.html" target="_blank">Read our full Privacy Policy here</a>
                    </p>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

// ── Build Form Modal ───────────────────────────────────────────

function buildFormModal() {
    const modal = document.createElement("div");
    modal.id        = "piFormModal";
    modal.className = "pi-modal";
    modal.style.display = "none";

    modal.innerHTML = `
        <div class="pi-form-content" id="piFormContent">
            <div class="pi-form-body">
                <iframe
                    id="piFormFrame"
                    src=""
                    frameborder="0"
                    width="100%"
                    height="100%"
                    title="Product Inquiry Form"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

// ── Mobile / Tablet Back Button ────────────────────────────────
// MS Forms runs on a different origin, so cross-origin iframe DOM
// access is blocked. We use a fixed overlay button instead.

function ensureFontAwesome() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement("link");
        link.rel  = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
        document.head.appendChild(link);
    }
}

function addMobileBackButton(onClose) {
    // Only show on mobile / tablet (≤ 1024 px) — guard here too
    if (window.innerWidth > 1024) return;
    if (document.getElementById("pi-mobile-back-btn")) return;

    ensureFontAwesome();

    const btn = document.createElement("button");
    btn.id          = "pi-mobile-back-btn";
    btn.setAttribute("aria-label", "Close product inquiry form");
    btn.innerHTML   = '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>';

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        btn.remove();
    });

    // Append to form content so it scrolls with the modal on short screens
    const formContent = document.getElementById("piFormContent");
    if (formContent) formContent.appendChild(btn);
}

function removeMobileBackButton() {
    document.getElementById("pi-mobile-back-btn")?.remove();
}

// ── Inject ONE Product Inquiry button below the products grid ──
// Anchors to #Items > .container — outside every .item-holder loop.

function injectProductInquiryButtons(onButtonClick) {
    // Guard: only one instance ever
    if (document.getElementById("piCtaContainer")) return;

    // Target the section container, not individual product cards
    const sectionContainer = document.querySelector("#Items .container");
    if (!sectionContainer) return;

    const btn = document.createElement("button");
    btn.className = "product-inquiry-btn";
    btn.setAttribute("aria-label", "Open product inquiry form");
    btn.textContent = "Product Inquiry";
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        onButtonClick();
    });

    const wrapper = document.createElement("div");
    wrapper.id        = "piCtaContainer";
    wrapper.className = "product-inquiry-container";
    wrapper.appendChild(btn);

    // Appended after .items-wrapper — bottom of the section, in normal flow
    sectionContainer.appendChild(wrapper);
}

// ── Main IIFE ──────────────────────────────────────────────────

(function () {
    // ── Build modals ───────────────────────────────────────────
    const confirmationModal = buildConfirmationModal();
    const formModal         = buildFormModal();

    const privacyCheckbox = document.getElementById("piPrivacyCheckbox");
    const proceedBtn      = document.getElementById("piProceedBtn");
    const cancelBtn       = document.getElementById("piCancelBtn");

    // ── Proceed button state ───────────────────────────────────

    function syncProceedBtn() {
        const checked = privacyCheckbox.checked;
        proceedBtn.disabled       = !checked;
        proceedBtn.style.cursor   = checked ? "pointer" : "not-allowed";
    }

    // ── Show / Hide Confirmation ───────────────────────────────

    function showConfirmation() {
        privacyCheckbox.checked = false;
        syncProceedBtn();
        confirmationModal.style.display = "flex";
        preventBodyScroll(true);
    }

    function hideConfirmation() {
        confirmationModal.style.display = "none";
        preventBodyScroll(false);
    }

    // ── Open / Close Form Modal ────────────────────────────────

    function openFormModal() {
        loadProductInquiryForm();   // ← delegated to product-inquiry-form.js

        formModal.style.display = "flex";
        preventBodyScroll(true);

        // Optional auto-refresh — uncomment if needed:
        // startPIAutoRefresh();

        setTimeout(() => addMobileBackButton(closeFormModal), 500);
    }

    function closeFormModal() {
        formModal.style.display = "none";
        preventBodyScroll(false);
        resetProductInquiryForm(); // ← delegated to product-inquiry-form.js

        // Optional auto-refresh — uncomment if needed:
        // stopPIAutoRefresh();

        removeMobileBackButton();
    }

    // ── Inject CTA buttons ─────────────────────────────────────

    injectProductInquiryButtons(showConfirmation);

    // ── Event Listeners — Confirmation Modal ──────────────────

    privacyCheckbox.addEventListener("change", syncProceedBtn);

    proceedBtn.addEventListener("click", () => {
        if (privacyCheckbox.checked) {
            hideConfirmation();
            openFormModal();
        }
    });

    cancelBtn.addEventListener("click", hideConfirmation);

    // Close on backdrop click
    confirmationModal.addEventListener("click", (e) => {
        if (e.target === confirmationModal) hideConfirmation();
    });

    // ── Event Listeners — Form Modal ───────────────────────────

    formModal.addEventListener("click", (e) => {
        if (e.target === formModal) closeFormModal();
    });

    // ── Keyboard: Escape ───────────────────────────────────────

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (confirmationModal.style.display === "flex") hideConfirmation();
        else if (formModal.style.display === "flex")   closeFormModal();
    });

    // ── Orientation change ─────────────────────────────────────

    window.addEventListener("orientationchange", () => {
        setTimeout(() => {
            // Re-flash confirmation modal to avoid layout artifacts
            if (confirmationModal.style.display === "flex") {
                confirmationModal.style.display = "none";
                setTimeout(() => { confirmationModal.style.display = "flex"; }, 50);
            }

            // Refresh form + back button on rotate
            if (formModal.style.display === "flex") {
                formModal.style.display = "none";
                setTimeout(() => {
                    formModal.style.display = "flex";
                    loadProductInquiryForm();
                    removeMobileBackButton();
                    setTimeout(() => addMobileBackButton(closeFormModal), 300);
                }, 50);
            }
        }, 300);
    });

    // ── Resize: sync back button visibility ───────────────────

    window.addEventListener("resize", () => {
        if (formModal.style.display !== "flex") return;

        if (window.innerWidth > 1024) {
            // Desktop — ensure back button is gone
            removeMobileBackButton();
        } else {
            // Mobile / tablet — ensure back button is present
            if (!document.getElementById("pi-mobile-back-btn")) {
                addMobileBackButton(closeFormModal);
            }
        }
    });

    // ── Public API (optional external access) ─────────────────

    window.ProductInquiry = {
        open()  { showConfirmation(); },
        close() { hideConfirmation(); closeFormModal(); },
        isOpen() {
            return (
                confirmationModal.style.display === "flex" ||
                formModal.style.display === "flex"
            );
        },
    };

    console.log("Product Inquiry system loaded.");
})();