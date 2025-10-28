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
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
});

// Gallery lightbox
class Lightbox {
    constructor() {
        this.createLightbox();
        this.bindEvents();
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
        this.images = [];
    }

    bindEvents() {
        document.querySelectorAll('.gallery-grid img').forEach((img, index) => {
            img.addEventListener('click', () => this.open(index));
            this.images.push(img.src);
        });

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

// Initialize lightbox for gallery
if (document.querySelector('.gallery-grid')) {
    new Lightbox();
}

// Interactive timeline
class Timeline {
    constructor(container) {
        this.container = container;
        this.createTimeline();
    }

    createTimeline() {
        const milestones = [
            { year: 2000, title: 'Company Incorporation', description: 'BSWL was incorporated.' },
            { year: 2008, title: 'Production Commenced', description: 'Started operations at Sonari with 14.5 MW power plant.' },
            { year: 2011, title: 'Vihal Expansion', description: 'Added 12 MW power generation at Vihal unit.' },
            { year: 2013, title: 'Lavangi Power Plant', description: 'Established 14.5 MW plant at Lavangi.' },
            { year: 2014, title: 'Mechanized Harvesting', description: 'Introduced mechanized harvesters for efficiency.' },
            { year: 2025, title: 'Current Operations', description: '5 units with 12,250 TCD capacity and ~53.5 MW power.' }
        ];

        const timelineHTML = milestones.map(milestone => `
            <div class="mile" data-year="${milestone.year}">
                <div class="mile-content">
                    <h3>${milestone.year}</h3>
                    <h4>${milestone.title}</h4>
                    <p>${milestone.description}</p>
                </div>
                <div class="mile-point"></div>
            </div>
        `).join('');

        this.container.innerHTML = timelineHTML;
        
        // Add animation on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });

        this.container.querySelectorAll('.mile').forEach(mile => {
            observer.observe(mile);
        });
    }
}

// Initialize timeline if container exists
const timelineContainer = document.getElementById('timeline');
if (timelineContainer) {
    new Timeline(timelineContainer);
}