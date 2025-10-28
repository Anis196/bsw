// Note: Theme toggle removed. Contrast handling remains and will run on load.

// Back to top functionality
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Translations container (populated from JSON at startup)
const translations = { en: {}, hi: {}, mr: {} };

// Keep originals so translations are reversible
window.__i18nOriginals = window.__i18nOriginals || new WeakMap();
window.__i18nAttrOriginals = window.__i18nAttrOriginals || new WeakMap();
window.__i18nMissing = window.__i18nMissing || [];

// Load translations JSON and merge into `translations`
function loadTranslationsJson() {
    return fetch('assets/i18n/i18n-all.json')
        .then(resp => {
            if (!resp.ok) throw new Error('Failed to load i18n JSON');
            return resp.json();
        })
        .then(data => {
            ['en','hi','mr'].forEach(lang => {
                if (!data[lang]) return;
                translations[lang] = Object.assign({}, translations[lang] || {}, data[lang]);
            });
            return true;
        })
        .catch(err => {
            console.warn('[i18n] Could not load i18n JSON:', err.message);
            return false;
        });
}

// Contact form validation and submission
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm(form)) {
            try {
                const formData = new FormData(form);
                // Add your form submission logic here
                // For example, sending to an API endpoint
                
                // Show success message
                showMessage('Message sent successfully!', 'success');
                form.reset();
            } catch (error) {
                showMessage('Failed to send message. Please try again.', 'error');
            }
        }
    });
}

function validateForm(form) {
    let isValid = true;
    
    // Clear previous error messages
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Validate each required field
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        }
    });
    
    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(field, message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    field.parentNode.appendChild(error);
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    const form = document.querySelector('.contact-form');
    form.insertAdjacentElement('beforebegin', messageDiv);
    
    setTimeout(() => messageDiv.remove(), 5000);
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
    initContactForm();

    // Load translations then initialize language selector and set language
    const initialLang = localStorage.getItem('site-lang') || document.documentElement.lang || 'en';
    loadTranslationsJson().then(() => {
        initLanguageSelector();
        // run contrast adjustments before translating so computed styles are more stable
        applyInverseForDarkBackgrounds();
        setLanguage(initialLang);
    }).catch(() => {
        // If JSON load fails, still wire up selector and run translation scan
        initLanguageSelector();
        applyInverseForDarkBackgrounds();
        setLanguage(initialLang);
    });
});

// -------------------------
// Language / i18n helpers
// -------------------------

function initLanguageSelector() {
    // Find language buttons inside any .lang-select containers or standalone buttons
    const buttons = Array.from(document.querySelectorAll('.lang-select [data-lang], .lang-btn[data-lang], [data-lang].lang'));
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang');
            if (lang) setLanguage(lang);
        });
    });

    // Reflect stored choice in UI (add .active)
    const stored = localStorage.getItem('site-lang');
    if (stored) {
        buttons.forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === stored));
    }
}

function setLanguage(lang) {
    if (!lang) return;
    // normalize
    lang = String(lang).toLowerCase();
    document.documentElement.lang = lang;
    localStorage.setItem('site-lang', lang);

    // Ensure we capture any visible English phrases before translating
    scanAndRegisterEnglishKeys();

    translateAll(lang);

    // Update .active states for buttons
    document.querySelectorAll('.lang-select [data-lang], .lang-btn[data-lang], [data-lang].lang').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
}

function translateAll(lang) {
    // Translate elements with explicit keys first
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = (translations[lang] && translations[lang][key]) || translations.en[key];
        if (translated != null) {
            // store original for reversal
            if (!window.__i18nOriginals.has(el)) window.__i18nOriginals.set(el, el.textContent);
            el.textContent = translated;
        }
    });

    // Translate text nodes across the document (best-effort): look up full-string matches
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            // ignore script/style and noscript
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (['script','style','noscript','code','pre'].includes(tag)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const toReplace = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        const txt = node.nodeValue.trim();
        const key = txt;
        const translated = (translations[lang] && translations[lang][key]) || translations.en[key];
        if (translated != null && translated !== txt) {
            toReplace.push({ node, translated });
        }
    }

    toReplace.forEach(({node, translated}) => {
        // store original
        if (!window.__i18nOriginals.has(node)) window.__i18nOriginals.set(node, node.nodeValue);
        node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), translated);
    });

    // Attributes (placeholder, alt, title)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        // expected format: data-i18n-attr="placeholder:contact_placeholder;title:whatever"
        const map = el.getAttribute('data-i18n-attr');
        map.split(';').forEach(pair => {
            const [attr, key] = pair.split(':').map(s => s && s.trim());
            if (!attr || !key) return;
            const translated = (translations[lang] && translations[lang][key]) || translations.en[key];
            if (translated != null) {
                if (!window.__i18nAttrOriginals.has(el)) window.__i18nAttrOriginals.set(el, {});
                const store = window.__i18nAttrOriginals.get(el);
                if (!(attr in store)) store[attr] = el.getAttribute(attr);
                el.setAttribute(attr, translated);
            }
        });
    });
}

function scanAndRegisterEnglishKeys() {
    // Scan data-i18n keys + visible text nodes and register missing english keys
    const missing = [];

    // explicit data-i18n keys: nothing to extract, but ensure key exists in en map
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const value = (el.textContent || '').trim();
        if (value && !(key in translations.en)) {
            translations.en[key] = value;
            translations.hi[key] = translations.hi[key] || value;
            translations.mr[key] = translations.mr[key] || value;
            missing.push({ key, value });
        }
    });

    // Scan visible full-text nodes
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (['script','style','noscript','code','pre'].includes(tag)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.nodeValue.trim();
        if (!text) continue;
        // Use the full text as the temporary key
        if (!(text in translations.en)) {
            translations.en[text] = text;
            translations.hi[text] = translations.hi[text] || text;
            translations.mr[text] = translations.mr[text] || text;
            missing.push({ key: text, value: text });
        }
    }

    if (missing.length) {
        console.info('[i18n] Auto-registered', missing.length, 'phrases.');
        window.__i18nMissing = (window.__i18nMissing || []).concat(missing);
    }

    return missing;
}

// -------------------------
// Contrast helpers
// -------------------------

function luminanceFromRgbString(rgb) {
    if (!rgb) return 1;
    const m = rgb.match(/rgba?\(([^)]+)\)/);
    if (!m) return 1;
    const parts = m[1].split(',').map(p => parseFloat(p.trim()));
    const r = parts[0] / 255, g = parts[1] / 255, b = parts[2] / 255;
    const srgb = [r,g,b].map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
    return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}

function applyInverseForDarkBackgrounds() {
    // Walk elements and compute computed background color luminance; if dark, add .ui-inverse
    const all = Array.from(document.querySelectorAll('body *'));
    all.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return;
        const lum = luminanceFromRgbString(bg);
        if (lum < 0.25) {
            el.classList.add('ui-inverse');
        } else {
            el.classList.remove('ui-inverse');
        }
    });
}