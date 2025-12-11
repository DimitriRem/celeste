/**
 * Initializes scripts that depend on the header being loaded.
 * This function is called from index.html after the header content is fetched.
 */

/**
 * Smooth scroll animation fallback (for browsers that don't support scroll-behavior: smooth)
 */
function smoothScroll(targetPosition, duration = 1000) {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const easeInOutQuad = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const animation = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutQuad(progress);
        window.scrollY = startPosition + distance * ease;
        window.scroll(0, startPosition + distance * ease);

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    };

    requestAnimationFrame(animation);
}

/**
 * Smooth scrolling for anchor links.
 * Uses event delegation to work with dynamically loaded content (header/footer).
 */
document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    
    // Special case: scroll to top for href="#"
    if (targetId === '#') {
        e.preventDefault();
        console.log('Scroll to top triggered');
        smoothScroll(0, 800);
        return;
    }

    const targetElement = document.querySelector(targetId);

    // Only handle smooth scroll if the target element exists on this page
    if (!targetElement) return;

    e.preventDefault();
    const mainNav = document.querySelector('.main-nav'); // Ensure mainNav is queried here
    const headerHeight = mainNav ? mainNav.offsetHeight : 0; // Fallback to 0 if nav not found
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

    console.log('Smooth scroll triggered for:', targetId, 'Target position:', targetPosition);
    
    // Use custom smooth scroll animation
    smoothScroll(targetPosition, 800);
}, true);


/**
 * Hamburger menu functionality.
 * Toggles the mobile navigation menu.
 */
// Expose an init function that attaches header-dependent event handlers.
// This allows pages to load the header asynchronously then call this function.
window.initHeaderScripts = function initHeaderScripts() {
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const body = document.body;
    const navLinks = document.querySelectorAll('.main-nav-links a');

    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', () => {
            body.classList.toggle('nav-open');
            const isExpanded = body.classList.contains('nav-open');
            hamburgerButton.setAttribute('aria-expanded', isExpanded);
        });
    }

    navLinks.forEach(link => link.addEventListener('click', () => {
        body.classList.remove('nav-open');
        if (hamburgerButton) {
            hamburgerButton.setAttribute('aria-expanded', 'false');
        }
    }));
};

// Backwards-compatible: if the header is already present when this script runs,
// initialize immediately so the hamburger still works on pages that injected
// their header synchronously.
if (document.querySelector('.hamburger-menu')) {
    window.initHeaderScripts();
}


document.addEventListener('DOMContentLoaded', () => {



    /**
     * Synchronized currency toggle functionality.
     * Updates all currency displays and persists the choice in localStorage.
     */
    function updateAllCurrencyDisplays(selectedCurrency) {
        document.querySelectorAll('.currency-toggle').forEach(toggleContainer => {
            toggleContainer.querySelectorAll('.currency-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.currency === selectedCurrency);
            });
        });
        document.querySelectorAll('.service-list').forEach(list => {
            list.dataset.currencyView = selectedCurrency;
        });
        localStorage.setItem('selectedCurrency', selectedCurrency);
    }

    document.querySelectorAll('.currency-btn').forEach(button => {
        button.addEventListener('click', () => {
            updateAllCurrencyDisplays(button.dataset.currency);
        });
    });

    // Initialize currency on page load
    const storedCurrency = localStorage.getItem('selectedCurrency') || 'ZAR';
    updateAllCurrencyDisplays(storedCurrency);

    /**
     * Information popup logic.
     */
    const popupOverlay = document.getElementById('popup-overlay');
    const infoIcons = document.querySelectorAll('.info-icon');
    const closePopupButtons = document.querySelectorAll('.close-popup');

    function closeAllPopups() {
        document.querySelectorAll('.info-popup.active').forEach(popup => popup.classList.remove('active'));
        if (popupOverlay) popupOverlay.style.display = 'none';
    }

    infoIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const popup = document.getElementById(icon.dataset.popupId);
            if (popup) {
                closeAllPopups();
                popup.classList.add('active');
                if (popupOverlay) popupOverlay.style.display = 'block';
            }
        });
    });

    closePopupButtons.forEach(btn => btn.addEventListener('click', closeAllPopups));
    if (popupOverlay) popupOverlay.addEventListener('click', closeAllPopups);

    /**
     * Newsletter form submission handling.
     */
    const newsletterForm = document.getElementById('newsletter-form');
    const contactForm = document.getElementById('contact-form');
    const submissionPopup = document.getElementById('submission-popup'); // Re-use existing popups
    const errorPopup = document.getElementById('error-popup');

    if (newsletterForm && submissionPopup && errorPopup) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            // IMPORTANT: Replace with your actual Formspree endpoint for the newsletter
            fetch('https://formspree.io/f/xyzbnowr', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    submissionPopup.classList.add('active'); // Show success message
                    if (popupOverlay) popupOverlay.style.display = 'block';
                    newsletterForm.reset();
                } else {
                    // Don't hide the form on error, so the user can try again
                    errorPopup.classList.add('active');
                    if (popupOverlay) popupOverlay.style.display = 'block';
                }
            }).catch(() => {
                // Also show error on network failure
                errorPopup.classList.add('active');
                if (popupOverlay) popupOverlay.style.display = 'block';
            });
        });
    }

    /**
     * Contact form submission handling.
     */
   
    if (contactForm && submissionPopup) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            fetch('https://formspree.io/f/xyzbnowr', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    submissionPopup.classList.add('active');
                    if (popupOverlay) popupOverlay.style.display = 'block';
                    contactForm.reset();
                } else {
                    if (errorPopup) {
                        errorPopup.classList.add('active');
                        if (popupOverlay) popupOverlay.style.display = 'block';
                    }
                }
            }).catch(() => {
                if (errorPopup) {
                    errorPopup.classList.add('active');
                    if (popupOverlay) popupOverlay.style.display = 'block';
                }
            });
        });
    }

    /**
     * Pre-select service in the contact form based on URL query params or button click.
     */
    const serviceSelect = document.getElementById('service-selection');

    // Check if service is passed via URL query parameter (from services.html cross-page navigation)
    if (serviceSelect) {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceFromUrl = urlParams.get('service');
        if (serviceFromUrl) {
            serviceSelect.value = decodeURIComponent(serviceFromUrl);
        }
    }

    // Also handle buttons on the same page (for backwards compatibility)
    const bookButtons = document.querySelectorAll('.cta-btn[href="#form"][data-service]');
    if (serviceSelect) {
        bookButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const serviceName = e.currentTarget.dataset.service;
                if (serviceName) {
                    serviceSelect.value = serviceName;
                }
            });
        });
    }

    /**
     * Testimonial carousel functionality.
     */
    const carousel = document.querySelector('.testimonial-carousel');
    if (carousel) {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        // Button navigation
        if (prevBtn && nextBtn) {
            const scrollAmount = () => {
                // Calculate the width of a card including its gap
                const card = carousel.querySelector('.testimonial-card');
                if (!card) return 0;
                const cardStyle = window.getComputedStyle(card);
                const cardGap = parseFloat(cardStyle.marginRight); // Assuming gap is consistent
                return card.offsetWidth + cardGap;
            };

            nextBtn.addEventListener('click', () => {
                // Find the currently centered card and scroll to the next one
                const currentScroll = carousel.scrollLeft;
                const amount = scrollAmount();
                const targetScroll = Math.round(currentScroll / amount) * amount + amount;
                carousel.scrollTo({ left: targetScroll, behavior: 'smooth' });
            });

            prevBtn.addEventListener('click', () => {
                const currentScroll = carousel.scrollLeft;
                const amount = scrollAmount();
                const targetScroll = Math.round(currentScroll / amount) * amount - amount;
                carousel.scrollTo({ left: targetScroll, behavior: 'smooth' });
            });
        }

        // --- Active Testimonial Logic ---
        const cards = carousel.querySelectorAll('.testimonial-card');
        let scrollTimeout;

        const updateActiveCard = () => {
            // Calculate the horizontal center of the carousel's viewport
            const carouselCenter = carousel.getBoundingClientRect().left + carousel.offsetWidth / 2;

            let closestCard = null;
            let minDistance = Infinity;

            cards.forEach(card => {
                // Calculate the horizontal center of the card
                const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
                const distance = Math.abs(carouselCenter - cardCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            });

            // Update active class
            cards.forEach(card => {
                card.classList.remove('active-testimonial');
            });

            if (closestCard) {
                closestCard.classList.add('active-testimonial');
            }
        };

        // Update on scroll, with a debounce to avoid performance issues
        carousel.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveCard, 50); // A short delay
        }, { passive: true });

        // Initial check on load
        setTimeout(updateActiveCard, 100); // Delay to ensure rendering is complete
    }
});
