// ============================================================
// inquiry.js — UI / Button Logic ONLY
// Responsibilities:
//   - Button click events
//   - Opening / closing modals (confirmation + inquiry)
//   - UI states (show/hide, expand/shrink, scroll lock)
//   - Mobile footer-aware positioning
//   - Mobile back button overlay
// ============================================================

import { loadInquiryForm, resetInquiryForm } from "./inquiry-embedded-form.js";

// ─── Scroll: Chat Button Translation ─────────────────────

document.addEventListener("scroll", () => {
    const chatLogo = document.querySelector(".chat-logo-container");
    if (!chatLogo) return;

    const scrollTop    = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight    = document.documentElement.scrollHeight;

    chatLogo.style.transform =
        scrollTop + windowHeight >= docHeight - 1
            ? "translateY(-80px)"
            : "translateY(0)";
});

// ─── IIFE: Modal & Button Logic ───────────────────────────

(function () {
    // ── DOM References ──────────────────────────────────────
    const chatLogo           = document.getElementById("chatLogo");
    const chatLogoContainer  = document.getElementById("chatLogoContainer");
    const inquiryModal       = document.getElementById("inquiryModal");
    const notificationBadge  = document.querySelector(".notification-badge");

    // ── Confirmation Modal (Privacy Policy) ────────────────

    const confirmationModal = document.createElement("div");
    confirmationModal.id        = "confirmationModal";
    confirmationModal.className = "chat-modal";
    confirmationModal.style.display = "none";

    const confirmationContent = document.createElement("div");
    confirmationContent.className = "chat-modal-content confirmation-content";
    confirmationContent.style.maxWidth = "500px";
    confirmationContent.style.height   = "auto";

    const confirmationBody = document.createElement("div");
    confirmationBody.className = "chat-modal-body confirmation-body";
    confirmationBody.style.cssText = "padding: 30px; text-align: center;";

    confirmationBody.innerHTML = `
        <div class="confirmation-header" style="margin-bottom: 20px;">
            <h3 style="color: #0b192a; margin-bottom: 15px; font-weight: 600;">Privacy Policy Acknowledgement</h3>
            <p style="color: #5A6D7E; margin-bottom: 20px; line-height: 1.5;">
                Before proceeding to the inquiry form, please acknowledge that you have read and agree to our Privacy Policy.
            </p>
        </div>

        <div class="confirmation-checkbox" style="margin: 25px 0; text-align: left; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <input type="checkbox" id="privacyPolicyCheckbox" style="margin-top: 3px; width: 18px; height: 18px; cursor: pointer;">
                <div>
                    <label for="privacyPolicyCheckbox" style="cursor: pointer; font-weight: 500; color: #0b192a; margin-bottom: 5px; display: block;">
                        I have read and agree to the Privacy Policy
                    </label>
                    <p style="color: #5A6D7E; font-size: 14px; line-height: 1.4; margin: 0;">
                        By checking this box, you acknowledge that you have reviewed our Privacy Policy and consent to the collection and use of your personal information as described therein.
                    </p>
                </div>
            </div>
        </div>

        <div class="confirmation-buttons" style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
            <button id="cancelButton" class="btn" style="
                padding: 10px 25px;
                background-color: #dc3545;
                color: white;
                border: 1px solid #dc3545;
                border-radius: 5px;
                font-weight: 500;
                cursor: pointer;
                transition: transform 0.3s ease;
            ">Cancel</button>
            <button id="proceedButton" class="btn" style="
                padding: 10px 25px;
                background-color: #0a3b7c;
                color: white;
                border: 1px solid #0a3b7c;
                border-radius: 5px;
                font-weight: 500;
                cursor: not-allowed;
                opacity: 0.6;
                transition: all 0.3s ease;
            " disabled>Proceed to Form</button>
        </div>

        <div class="policy-link" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #5A6D7E; font-size: 14px; margin: 0;">
                Need to review the policy?
                <a href="policy.html" target="_blank" style="color: #0a3b7c; text-decoration: underline; font-weight: 500;">
                    Read our full Privacy Policy here
                </a>
            </p>
        </div>
    `;

    confirmationContent.appendChild(confirmationBody);
    confirmationModal.appendChild(confirmationContent);
    document.body.appendChild(confirmationModal);

    const privacyCheckbox = document.getElementById("privacyPolicyCheckbox");
    const proceedButton   = document.getElementById("proceedButton");
    const cancelButton    = document.getElementById("cancelButton");

    // ── State ───────────────────────────────────────────────
    let expandTimer = null;
    let isExpanded  = false;
    let isHovering  = false;

    // ── Footer-Aware Positioning (Mobile Only) ──────────────
    let footerElement        = null;
    let isFooterAwareActive  = false;

    function findFooterElement() {
        footerElement = document.querySelector(".footer");
        return footerElement !== null;
    }

    function isFooterVisible() {
        if (!footerElement) return false;

        const footerRect   = footerElement.getBoundingClientRect();
        const viewportH    = window.innerHeight;
        const isInViewport = footerRect.top < viewportH && footerRect.bottom > 0;

        if (chatLogoContainer && isInViewport) {
            const buttonBottom = chatLogoContainer.getBoundingClientRect().bottom;
            const gapToFooter  = footerRect.top - buttonBottom;
            return isInViewport && gapToFooter < 100;
        }

        return isInViewport;
    }

    function updateButtonPosition() {
        if (window.innerWidth > 768) {
            if (isFooterAwareActive) {
                chatLogoContainer?.classList.remove("footer-aware");
                isFooterAwareActive = false;
            }
            return;
        }

        if (!footerElement && !findFooterElement()) return;

        const footerVisible = isFooterVisible();

        if (footerVisible && !isFooterAwareActive) {
            isFooterAwareActive = true;
            chatLogoContainer.classList.add("footer-aware");
        } else if (!footerVisible && isFooterAwareActive) {
            isFooterAwareActive = false;
            chatLogoContainer.classList.remove("footer-aware");
        }
    }

    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateButtonPosition();
                ticking = false;
            });
            ticking = true;
        }
    }

    function handleResize() {
        if (window.innerWidth <= 768) {
            findFooterElement();
            updateButtonPosition();
        } else {
            if (isFooterAwareActive) {
                chatLogoContainer?.classList.remove("footer-aware");
                isFooterAwareActive = false;
            }
        }
    }

    function initFooterAwareBehavior() {
        if (window.innerWidth <= 768 && findFooterElement()) {
            setTimeout(updateButtonPosition, 100);
            window.addEventListener("scroll", handleScroll);
            window.addEventListener("resize",  handleResize);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFooterAwareBehavior);
    } else {
        initFooterAwareBehavior();
    }

    // ── Body Scroll Lock ────────────────────────────────────

    function preventBodyScroll(prevent) {
        document.body.style.overflow                = prevent ? "hidden" : "";
        document.documentElement.style.overflow     = prevent ? "hidden" : "";
    }

    // ── Button Expand / Shrink ──────────────────────────────

    function expandButton() {
        if (!isExpanded && !chatLogo.classList.contains("expanded")) {
            chatLogo.classList.add("expanded");
            isExpanded = true;
        }
    }

    function shrinkButton() {
        clearTimeout(expandTimer);
        expandTimer = setTimeout(() => {
            if (!isHovering) {
                chatLogo.classList.remove("expanded");
                isExpanded = false;
            }
        }, 2000);
    }

    // ── Proceed Button State ────────────────────────────────

    function updateProceedButton() {
        const checked = privacyCheckbox.checked;
        proceedButton.disabled           = !checked;
        proceedButton.style.cursor       = checked ? "pointer"     : "not-allowed";
        proceedButton.style.opacity      = checked ? "1"           : "0.6";
        proceedButton.style.backgroundColor = "#0a3b7c";
        proceedButton.style.color           = "white";
        proceedButton.style.border          = "1px solid #0a3b7c";
    }

    // ── Modal: Confirmation ─────────────────────────────────

    function showConfirmationModal() {
        privacyCheckbox.checked = false;
        updateProceedButton();
        confirmationModal.style.display = "flex";
        preventBodyScroll(true);
    }

    function hideConfirmationModal() {
        confirmationModal.style.display = "none";
        preventBodyScroll(false);
    }

    // ── Modal: Inquiry (MS Form) ────────────────────────────

    /**
     * Opens the inquiry modal and triggers a fresh form load.
     * The actual iframe src assignment lives in inquiry-embedded-form.js.
     */
    function openInquiryModal() {
        loadInquiryForm();          // ← delegated to inquiry-embedded-form.js

        inquiryModal.style.display = "flex";
        preventBodyScroll(true);

        if (notificationBadge) {
            notificationBadge.style.display = "none";
        }

        // Optional auto-refresh — uncomment if needed:
        // startAutoRefresh();

        setTimeout(addMobileBackButton, 500);
    }

    /**
     * Closes the inquiry modal and cleans up UI state.
     */
    function closeInquiryModal() {
        inquiryModal.style.display = "none";
        preventBodyScroll(false);

        // Optional auto-refresh — uncomment if needed:
        // stopAutoRefresh();

        document.getElementById("mobile-excel-back-btn-fallback")?.remove();
    }

    // ── Mobile Back Button ──────────────────────────────────
    // MS Forms runs on a different origin (forms.office.com), so direct iframe
    // DOM access via contentDocument always throws a cross-origin SecurityError.
    // We use a fallback overlay button positioned over the modal instead.

    function addMobileBackButton() {
        if (window.innerWidth > 768) return;
        addFallbackBackButton();
    }

    function addFallbackBackButton() {
        if (document.getElementById("mobile-excel-back-btn-fallback")) return;

        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement("link");
            link.rel   = "stylesheet";
            link.href  = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
            document.head.appendChild(link);
        }

        const buttonSize = 32;
        const iconSize   = 18;

        const backButton = document.createElement("div");
        backButton.id = "mobile-excel-back-btn-fallback";
        backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
        backButton.style.cssText = `
            position: fixed;
            top: 12px;
            left: 15px;
            z-index: 10001;
            background-color: #4e5359;
            width: ${buttonSize}px;
            height: ${buttonSize}px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            -webkit-tap-highlight-color: transparent;
            transition: all 0.2s ease;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        `;

        const iconStyle = document.createElement("style");
        iconStyle.textContent = `
            #mobile-excel-back-btn-fallback i {
                font-size: ${iconSize}px;
                color: white;
                transition: transform 0.2s ease;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }
            #mobile-excel-back-btn-fallback:active {
                transform: scale(0.95);
                background-color: #3d4247;
            }
            #mobile-excel-back-btn-fallback:active i { transform: translateX(-2px); }
            #mobile-excel-back-btn-fallback:hover   { background-color: #5d6268; }
        `;
        document.head.appendChild(iconStyle);

        backButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeInquiryModal();
            this.remove();
        });

        const modalContent = document.querySelector(".chat-modal-content");
        if (modalContent) {
            modalContent.style.position = "relative";
            modalContent.appendChild(backButton);
        }
    }

    // ── Event Listeners ─────────────────────────────────────

    privacyCheckbox.addEventListener("change", updateProceedButton);

    proceedButton.addEventListener("click", function () {
        if (privacyCheckbox.checked) {
            hideConfirmationModal();
            openInquiryModal();
        }
    });

    cancelButton.addEventListener("click",      () => hideConfirmationModal());
    cancelButton.addEventListener("mouseenter", function () { this.style.transform = "translateY(-2px)"; });
    cancelButton.addEventListener("mouseleave", function () { this.style.transform = "translateY(0)"; });

    proceedButton.addEventListener("mouseenter", function () {
        if (!this.disabled) this.style.transform = "translateY(-2px)";
    });
    proceedButton.addEventListener("mouseleave", function () {
        if (!this.disabled) this.style.transform = "translateY(0)";
    });

    confirmationModal.addEventListener("click", (e) => {
        if (e.target === confirmationModal) hideConfirmationModal();
    });

    chatLogo.addEventListener("mouseenter", function () {
        isHovering = true;
        clearTimeout(expandTimer);
        expandButton();
    });
    chatLogo.addEventListener("mouseleave", function () {
        isHovering = false;
        shrinkButton();
    });
    chatLogo.addEventListener("click", (e) => {
        e.stopPropagation();
        showConfirmationModal();
    });
    chatLogo.addEventListener("touchstart", function (e) {
        e.stopPropagation();
        this.style.transform = "scale(0.95)";
    });
    chatLogo.addEventListener("touchend", function () {
        this.style.transform = "";
    });

    inquiryModal.addEventListener("click", (e) => {
        if (e.target === inquiryModal) closeInquiryModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (confirmationModal.style.display === "flex") hideConfirmationModal();
            else if (inquiryModal.style.display === "flex") closeInquiryModal();
        }
    });

    window.addEventListener("orientationchange", () => {
        setTimeout(() => {
            if (confirmationModal.style.display === "flex") {
                confirmationModal.style.display = "none";
                setTimeout(() => { confirmationModal.style.display = "flex"; }, 50);
            }
            if (inquiryModal.style.display === "flex") {
                inquiryModal.style.display = "none";
                setTimeout(() => {
                    inquiryModal.style.display = "flex";
                    loadInquiryForm();          // ← delegated to inquiry-embedded-form.js
                    if (window.innerWidth <= 768) addMobileBackButton();
                }, 50);
            }
            if (window.innerWidth <= 768) setTimeout(updateButtonPosition, 100);
        }, 300);
    });

    window.addEventListener("resize", () => {
        if (inquiryModal.style.display === "flex") {
            if (window.innerWidth <= 768) {
                addMobileBackButton();
            } else {
                document.getElementById("mobile-excel-back-btn-fallback")?.remove();
            }
        }
        if (window.innerWidth <= 768) {
            handleResize();
        } else {
            if (isFooterAwareActive) {
                chatLogoContainer?.classList.remove("footer-aware");
                isFooterAwareActive = false;
            }
        }
    });

    // ── Public API ──────────────────────────────────────────

    window.ChatInquiry = {
        open()  { showConfirmationModal(); },
        close() { hideConfirmationModal(); closeInquiryModal(); },
        isOpen() {
            return (
                confirmationModal.style.display === "flex" ||
                inquiryModal.style.display === "flex"
            );
        },
        refreshForm() { loadInquiryForm(); },           // ← delegated
        setNotificationCount(count) {
            if (!notificationBadge) return;
            if (count > 0) {
                notificationBadge.textContent    = count > 99 ? "99+" : count;
                notificationBadge.style.display  = "flex";
            } else {
                notificationBadge.style.display  = "none";
            }
        },
    };

    console.log("Chat inquiry system loaded. Form logic delegated to inquiry-embedded-form.js.");
})();
