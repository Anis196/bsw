// Enhanced interactive features for BSWL website

// Smooth scroll to section
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Lazy loading with blur effect
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    let loadedCount = 0;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);

                loadedCount++;
                if (loadedCount === lazyImages.length && lightboxInstance) {
                    lightboxInstance.bindImages();
                }
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    if (lazyImages.length === 0 && lightboxInstance) {
        lightboxInstance.bindImages();
    }
});

// Gallery lightbox
class Lightbox {
    constructor() {
        this.createLightbox();
        this.images = [];
    }

    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close">&times;</button>
                <button class="lightbox-prev" aria-label="Previous image">&lt;</button>
                <button class="lightbox-next" aria-label="Next image">&gt;</button>
                <img src="" alt="" class="lightbox-image">
            </div>
        `;
        document.body.appendChild(lightbox);
        this.lightbox = lightbox;
        this.currentIndex = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.next());

        document.addEventListener('keydown', (e) => {
            if (this.lightbox.classList.contains('active')) {
                if (e.key === 'Escape') this.close();
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            }
        });
    }

    bindImages() {
        const galleryImages = document.querySelectorAll('.gallery-grid img');
        this.images = [];

        galleryImages.forEach((img, index) => {
            const src = img.dataset.src || img.src;
            this.images.push(src);
            img.addEventListener('click', () => this.open(index));
        });
    }

    open(index) {
        this.currentIndex = index;
        this.lightbox.classList.add('active');
        this.updateImage();
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    updateImage() {
        const img = this.lightbox.querySelector('.lightbox-image');
        img.src = this.images[this.currentIndex];
    }
}

let lightboxInstance = null;
if (document.querySelector('.gallery-grid')) {
    lightboxInstance = new Lightbox();
}

// Animate timeline items on scroll
document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline');
    if (timelineContainer) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });

        timelineContainer.querySelectorAll('.mile').forEach(mile => {
            observer.observe(mile);
        });
    }
});