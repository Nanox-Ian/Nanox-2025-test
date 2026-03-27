document.addEventListener("scroll", () => {
    const chatLogo = document.querySelector(".chat-logo-container");
    if (!chatLogo) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    const isAtBottom = scrollTop + windowHeight >= docHeight - 1;

    if (isAtBottom) {
        chatLogo.style.transform = "translateY(-80px)";
    } else {
        chatLogo.style.transform = "translateY(0)";
    }
});

// ===== PORTABLE CHAT BUTTON & MODAL JAVASCRIPT =====
(function() {
    // Get DOM elements
    const chatLogo = document.getElementById('chatLogo');
    const chatLogoContainer = document.getElementById('chatLogoContainer');
    const inquiryModal = document.getElementById('inquiryModal');
    const notificationBadge = document.querySelector('.notification-badge');
    
    // Create confirmation modal elements
    const confirmationModal = document.createElement('div');
    confirmationModal.id = 'confirmationModal';
    confirmationModal.className = 'chat-modal';
    confirmationModal.style.display = 'none';
    
    const confirmationContent = document.createElement('div');
    confirmationContent.className = 'chat-modal-content confirmation-content';
    confirmationContent.style.maxWidth = '500px';
    confirmationContent.style.height = 'auto';
    
    const confirmationBody = document.createElement('div');
    confirmationBody.className = 'chat-modal-body confirmation-body';
    confirmationBody.style.padding = '30px';
    confirmationBody.style.textAlign = 'center';
    
    // Add confirmation modal content
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
    
    // Get confirmation modal elements
    const privacyCheckbox = document.getElementById('privacyPolicyCheckbox');
    const proceedButton = document.getElementById('proceedButton');
    const cancelButton = document.getElementById('cancelButton');
    
    // Prevent body scroll when modal is open
    let expandTimer;
    let isExpanded = false;
    let isHovering = false;
    
    // ===== STRICT FOOTER VISIBILITY BEHAVIOR (MOBILE ONLY) =====
    let footerElement = null;
    let isFooterAwareActive = false;
    
    // Function to find the footer element
    function findFooterElement() {
        footerElement = document.querySelector('.footer');
        return footerElement !== null;
    }
    
    // Check if footer is visible in the viewport
    function isFooterVisible() {
        if (!footerElement) return false;
        
        const footerRect = footerElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Check if ANY part of the footer is visible in the viewport
        const isFooterInViewport = footerRect.top < viewportHeight && footerRect.bottom > 0;
        
        // Also check if the footer's top is within the viewport (more precise)
        const isFooterTopVisible = footerRect.top >= 0 && footerRect.top <= viewportHeight;
        
        // Check if the button is overlapping or would overlap with footer
        if (chatLogoContainer && isFooterInViewport) {
            const buttonRect = chatLogoContainer.getBoundingClientRect();
            const footerTop = footerRect.top;
            
            // Only activate if footer is actually visible AND the button would overlap
            // or if footer top is within the button's proximity
            const buttonBottom = buttonRect.bottom;
            const gapToFooter = footerTop - buttonBottom;
            
            // Activate when footer is visible AND button is within 100px of footer or overlapping
            // This ensures we only move when footer is actually in view and button is near
            return isFooterInViewport && gapToFooter < 100;
        }
        
        return isFooterInViewport;
    }
    
    // Update button position based on footer visibility
    function updateButtonPosition() {
        // Only apply on mobile devices
        if (window.innerWidth > 768) {
            // Reset for desktop - ensure button is visible
            if (isFooterAwareActive) {
                if (chatLogoContainer) {
                    chatLogoContainer.classList.remove('footer-aware');
                }
                isFooterAwareActive = false;
            }
            return;
        }
        
        // Ensure footer element is found
        if (!footerElement) {
            if (!findFooterElement()) return;
        }
        
        // Check if footer is visible in viewport
        const footerVisible = isFooterVisible();
        
        if (footerVisible && !isFooterAwareActive) {
            // Activate footer-aware mode - move button up
            isFooterAwareActive = true;
            chatLogoContainer.classList.add('footer-aware');
        } 
        else if (!footerVisible && isFooterAwareActive) {
            // Deactivate footer-aware mode - return to default position
            isFooterAwareActive = false;
            chatLogoContainer.classList.remove('footer-aware');
        }
    }
    
    // Throttled scroll handler using requestAnimationFrame
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
    
    // Handle resize events
    function handleResize() {
        if (window.innerWidth <= 768) {
            // Re-find footer on resize (DOM might have changed)
            findFooterElement();
            updateButtonPosition();
        } else {
            // Reset for desktop
            if (isFooterAwareActive) {
                if (chatLogoContainer) {
                    chatLogoContainer.classList.remove('footer-aware');
                }
                isFooterAwareActive = false;
            }
        }
    }
    
    // Initialize footer-aware behavior on mobile
    function initFooterAwareBehavior() {
        if (window.innerWidth <= 768) {
            if (findFooterElement()) {
                // Initial position check
                setTimeout(updateButtonPosition, 100);
                
                // Add scroll listener
                window.addEventListener('scroll', handleScroll);
                window.addEventListener('resize', handleResize);
            }
        }
    }
    
    // Call initialization after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooterAwareBehavior);
    } else {
        initFooterAwareBehavior();
    }
    
    function preventBodyScroll(prevent) {
        if (prevent) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }
    
    // Function to expand the button
    function expandButton() {
        if (!isExpanded && !chatLogo.classList.contains('expanded')) {
            chatLogo.classList.add('expanded');
            isExpanded = true;
        }
    }
    
    // Function to shrink the button after delay
    function shrinkButton() {
        clearTimeout(expandTimer);
        expandTimer = setTimeout(function() {
            if (!isHovering) {
                chatLogo.classList.remove('expanded');
                isExpanded = false;
            }
        }, 2000);
    }
    
    // Toggle proceed button state based on checkbox
    function updateProceedButton() {
        if (privacyCheckbox.checked) {
            proceedButton.disabled = false;
            proceedButton.style.cursor = 'pointer';
            proceedButton.style.opacity = '1';
            proceedButton.style.backgroundColor = '#0a3b7c';
            proceedButton.style.color = 'white';
            proceedButton.style.border = '1px solid #0a3b7c';
        } else {
            proceedButton.disabled = true;
            proceedButton.style.cursor = 'not-allowed';
            proceedButton.style.opacity = '0.6';
            proceedButton.style.backgroundColor = '#0a3b7c';
            proceedButton.style.color = 'white';
            proceedButton.style.border = '1px solid #0a3b7c';
        }
    }
    
    // Show confirmation modal
    function showConfirmationModal() {
        privacyCheckbox.checked = false;
        updateProceedButton();
        confirmationModal.style.display = 'flex';
        preventBodyScroll(true);
    }
    
    // Hide confirmation modal
    function hideConfirmationModal() {
        confirmationModal.style.display = 'none';
        preventBodyScroll(false);
    }
    
    // Open Microsoft Forms modal
    function openInquiryModal() {
        inquiryModal.style.display = 'flex';
        preventBodyScroll(true);
        
        if (notificationBadge) {
            notificationBadge.style.display = 'none';
        }
        
        setTimeout(addMobileBackButton, 500);
    }
    
    // Function to get exact 3-dot menu dimensions
    function getThreeDotMenuDimensions(iframeDoc) {
        // Comprehensive selectors for 3-dot menu in Microsoft Forms
        const selectors = [
            // Microsoft Forms specific selectors
            'button[title="More options"]',
            'button[aria-label="More options"]',
            'button[aria-label="More options button"]',
            '[role="button"][aria-haspopup="menu"]',
            'button[aria-expanded="false"]',
            
            // Common icon button patterns
            '.ms-Button--icon',
            '.menu-button',
            '.three-dots-button',
            '.dot-menu-button',
            
            // Generic selectors with position-based detection
            'button:last-child',
            'header button:last-child',
            '.header button:last-child',
            '[class*="header"] button:last-child',
            '[class*="Header"] button:last-child',
            
            // SVG icon buttons
            'button svg[viewBox="0 0 24 24"]',
            'button svg[width="24"][height="24"]'
        ];
        
        let dotMenu = null;
        let dimensions = null;
        
        // Try each selector
        for (const selector of selectors) {
            try {
                const elements = iframeDoc.querySelectorAll(selector);
                for (const element of elements) {
                    // Check if it's likely the 3-dot menu
                    const rect = element.getBoundingClientRect();
                    const html = element.outerHTML || '';
                    const text = element.textContent || '';
                    
                    // Look for three dots in content or classes
                    if (html.includes('⋮') || 
                        html.includes('&#8942;') || 
                        text.includes('⋮') ||
                        element.classList.toString().includes('dot') ||
                        element.classList.toString().includes('menu') ||
                        (rect.width > 20 && rect.width < 60 && 
                         rect.height > 20 && rect.height < 60 &&
                         rect.right > iframeDoc.defaultView.innerWidth - 100)) {
                        
                        dotMenu = element;
                        dimensions = {
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            top: Math.round(rect.top),
                            right: Math.round(rect.right),
                            bottom: Math.round(rect.bottom),
                            left: Math.round(rect.left)
                        };
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
            if (dotMenu) break;
        }
        
        // If still not found, look for any icon button in top-right
        if (!dotMenu) {
            const allButtons = iframeDoc.querySelectorAll('button, [role="button"], .ms-Button');
            const viewportWidth = iframeDoc.defaultView.innerWidth;
            const viewportHeight = iframeDoc.defaultView.innerHeight;
            
            for (const element of allButtons) {
                try {
                    const rect = element.getBoundingClientRect();
                    // Button in top 80px and right side of screen
                    if (rect.top < 80 && rect.right > viewportWidth - 120) {
                        dotMenu = element;
                        dimensions = {
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            top: Math.round(rect.top),
                            right: Math.round(rect.right),
                            bottom: Math.round(rect.bottom),
                            left: Math.round(rect.left)
                        };
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        
        return dimensions;
    }
    
    // Function to add back button to Excel view on mobile
    function addMobileBackButton() {
        // Only add on mobile devices
        if (window.innerWidth > 768) return;
        
        const iframe = document.querySelector('.chat-modal-body iframe');
        if (!iframe) return;
        
        try {
            // Access iframe content
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Check if we already added the button
            if (iframeDoc.getElementById('mobile-excel-back-btn')) return;
            
            // Add Font Awesome to iframe if not present
            if (!iframeDoc.querySelector('link[href*="font-awesome"]')) {
                const fontAwesomeLink = iframeDoc.createElement('link');
                fontAwesomeLink.rel = 'stylesheet';
                fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
                iframeDoc.head.appendChild(fontAwesomeLink);
            }
            
            // Get exact dimensions of the 3-dot menu
            const dotMenuDimensions = getThreeDotMenuDimensions(iframeDoc);
            
            // Default dimensions (will be overridden if 3-dot menu found)
            let buttonWidth = 32;
            let buttonHeight = 32;
            let iconSize = 16;
            let topPosition = 12;
            
            if (dotMenuDimensions) {
                // Use exact dimensions from 3-dot menu
                buttonWidth = dotMenuDimensions.width;
                buttonHeight = dotMenuDimensions.height;
                topPosition = dotMenuDimensions.top;
                
                // Calculate icon size (typically 50-60% of button size for visual balance)
                iconSize = Math.round(Math.min(buttonWidth, buttonHeight) * 0.55);
                
                console.log(`3-dot menu dimensions: ${buttonWidth}x${buttonHeight}, icon size: ${iconSize}`);
            } else {
                // Fallback to common Microsoft Forms dimensions
                console.log('3-dot menu not found, using standard dimensions');
                
                // Microsoft Forms typically uses 32x32 buttons
                buttonWidth = 32;
                buttonHeight = 32;
                iconSize = 18;
                topPosition = 12;
            }
            
            // Ensure minimum touch target size
            buttonWidth = Math.max(buttonWidth, 32);
            buttonHeight = Math.max(buttonHeight, 32);
            iconSize = Math.max(iconSize, 16);
            
            // Create back button with EXACT same dimensions as 3-dot menu
            const backButton = iframeDoc.createElement('div');
            backButton.id = 'mobile-excel-back-btn';
            backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
            
            // Apply styles that match the 3-dot menu
            backButton.style.cssText = `
                position: fixed;
                top: ${topPosition}px;
                left: 15px;
                z-index: 10000;
                background-color: #4e5359;
                width: ${buttonWidth}px;
                height: ${buttonHeight}px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                -webkit-tap-highlight-color: transparent;
                transition: all 0.2s ease;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            `;
            
            // Add styles to ensure icon is perfectly centered and sized
            const style = iframeDoc.createElement('style');
            style.textContent = `
                #mobile-excel-back-btn i {
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
                #mobile-excel-back-btn:active {
                    transform: scale(0.95);
                    background-color: #3d4247;
                }
                #mobile-excel-back-btn:active i {
                    transform: translateX(-2px);
                }
                /* Match any hover effects the 3-dot menu might have */
                #mobile-excel-back-btn:hover {
                    background-color: #5d6268;
                }
            `;
            iframeDoc.head.appendChild(style);
            
            // Add click event
            backButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                inquiryModal.style.display = 'none';
                preventBodyScroll(false);
            });
            
            // Insert into iframe
            iframeDoc.body.appendChild(backButton);
            
            // Adjust content margin if needed
            const mainContent = iframeDoc.querySelector('main, .main-content, [role="main"], .content-wrapper');
            if (mainContent) {
                const currentMargin = parseInt(window.getComputedStyle(mainContent).marginTop) || 0;
                if (currentMargin < buttonHeight + 20) {
                    mainContent.style.marginTop = (buttonHeight + 20) + 'px';
                }
            }
            
            console.log('Mobile back button added with exact dimensions matching 3-dot menu');
        } catch (e) {
            console.log('Cannot access iframe directly, using fallback');
            addFallbackBackButton();
        }
    }
    
    // Fallback method using standard Microsoft Forms dimensions
    function addFallbackBackButton() {
        if (document.getElementById('mobile-excel-back-btn-fallback')) return;
        
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesomeLink = document.createElement('link');
            fontAwesomeLink.rel = 'stylesheet';
            fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesomeLink);
        }
        
        // Microsoft Forms standard button dimensions
        const buttonSize = 32; // Standard Microsoft Forms icon button size
        const iconSize = 18;    // Standard Microsoft Forms icon size
        
        const backButton = document.createElement('div');
        backButton.id = 'mobile-excel-back-btn-fallback';
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
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            -webkit-tap-highlight-color: transparent;
            transition: all 0.2s ease;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        `;
        
        const iconStyle = document.createElement('style');
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
            #mobile-excel-back-btn-fallback:active i {
                transform: translateX(-2px);
            }
            #mobile-excel-back-btn-fallback:hover {
                background-color: #5d6268;
            }
        `;
        document.head.appendChild(iconStyle);
        
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            inquiryModal.style.display = 'none';
            preventBodyScroll(false);
            this.remove();
        });
        
        const modalContent = document.querySelector('.chat-modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.appendChild(backButton);
        }
    }
    
    // Event Listeners
    privacyCheckbox.addEventListener('change', updateProceedButton);
    
    proceedButton.addEventListener('click', function() {
        if (privacyCheckbox.checked) {
            hideConfirmationModal();
            openInquiryModal();
        }
    });
    
    cancelButton.addEventListener('click', function() {
        hideConfirmationModal();
    });
    
    cancelButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    cancelButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    proceedButton.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(-2px)';
        }
    });
    
    proceedButton.addEventListener('mouseleave', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(0)';
        }
    });
    
    confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            hideConfirmationModal();
        }
    });
    
    chatLogo.addEventListener('mouseenter', function() {
        isHovering = true;
        clearTimeout(expandTimer);
        expandButton();
    });
    
    chatLogo.addEventListener('mouseleave', function() {
        isHovering = false;
        shrinkButton();
    });
    
    chatLogo.addEventListener('click', function(e) {
        e.stopPropagation();
        showConfirmationModal();
    });
    
    inquiryModal.addEventListener('click', function(e) {
        if (e.target === inquiryModal) {
            inquiryModal.style.display = 'none';
            preventBodyScroll(false);
            const fallbackBtn = document.getElementById('mobile-excel-back-btn-fallback');
            if (fallbackBtn) fallbackBtn.remove();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (confirmationModal.style.display === 'flex') {
                hideConfirmationModal();
            } else if (inquiryModal.style.display === 'flex') {
                inquiryModal.style.display = 'none';
                preventBodyScroll(false);
                const fallbackBtn = document.getElementById('mobile-excel-back-btn-fallback');
                if (fallbackBtn) fallbackBtn.remove();
            }
        }
    });
    
   const iframe = document.querySelector('.chat-modal-body iframe');
    
    chatLogo.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        this.style.transform = 'scale(0.95)';
    });

    chatLogo.addEventListener('touchend', function() {
        this.style.transform = '';
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            if (confirmationModal.style.display === 'flex') {
                confirmationModal.style.display = 'none';
                setTimeout(function() {
                    confirmationModal.style.display = 'flex';
                }, 50);
            }
            if (inquiryModal.style.display === 'flex') {
                inquiryModal.style.display = 'none';
                setTimeout(function() {
                    inquiryModal.style.display = 'flex';
                    if (window.innerWidth <= 768) {
                        addMobileBackButton();
                    }
                }, 50);
            }
            // Recalculate footer-aware position after orientation change
            if (window.innerWidth <= 768) {
                setTimeout(updateButtonPosition, 100);
            }
        }, 300);
    });
    
    window.addEventListener('resize', function() {
        if (inquiryModal.style.display === 'flex') {
            if (window.innerWidth <= 768) {
                addMobileBackButton();
            } else {
                const fallbackBtn = document.getElementById('mobile-excel-back-btn-fallback');
                if (fallbackBtn) fallbackBtn.remove();
            }
        }
        // Recalculate footer-aware position on resize
        if (window.innerWidth <= 768) {
            handleResize();
        } else {
            // Reset for desktop
            if (isFooterAwareActive) {
                if (chatLogoContainer) {
                    chatLogoContainer.classList.remove('footer-aware');
                }
                isFooterAwareActive = false;
            }
        }
    });
    
    window.ChatInquiry = {
        open: function() {
            showConfirmationModal();
        },
        close: function() {
            hideConfirmationModal();
            inquiryModal.style.display = 'none';
            preventBodyScroll(false);
            const fallbackBtn = document.getElementById('mobile-excel-back-btn-fallback');
            if (fallbackBtn) fallbackBtn.remove();
        },
        isOpen: function() {
            return confirmationModal.style.display === 'flex' || inquiryModal.style.display === 'flex';
        },
        setNotificationCount: function(count) {
            if (notificationBadge) {
                if (count > 0) {
                    notificationBadge.textContent = count > 99 ? '99+' : count;
                    notificationBadge.style.display = 'flex';
                } else {
                    notificationBadge.style.display = 'none';
                }
            }
        }
    };
    
    console.log('Chat inquiry system loaded successfully');
})();
