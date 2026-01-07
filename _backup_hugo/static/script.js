// Simple Typewriter Effect
document.addEventListener('DOMContentLoaded', () => {
    const typewriters = document.querySelectorAll('.typewriter');

    typewriters.forEach(el => {
        const text = el.getAttribute('data-text');
        if (text) {
            el.textContent = '';
            let i = 0;
            const speed = 100; // ms per char

            function type() {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }

            // Start typing after a small delay
            setTimeout(type, 500);
        }
    });

    // Console greeting
    console.log(
        "%c[ fractal - web ]\n%cwelcome to the source.",
        "color: #2e8b57; font-weight: bold; font-size: 16px;",
        "color: #1a1a1a; font-family: monospace;"
    );

    /* Dynamic Gallery Loading */
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        fetch('./data.json')
            .then(response => {
                if (!response.ok) throw new Error("No data found");
                return response.json();
            })
            .then(data => {
                // Clear any static placeholders if present (optional, but good for clean slate)
                galleryGrid.innerHTML = '';

                // Add new items
                data.reverse().forEach(item => { // Show newest first
                    const div = document.createElement('div');
                    div.className = 'gallery-item';
                    div.innerHTML = `<img src="${item.src}" alt="${item.caption}" loading="lazy">`;
                    galleryGrid.appendChild(div);
                });
            })
            .catch(err => console.log('Static mode or no data yet:', err));
    }

    /* Lightbox Logic */
    const modal = document.getElementById('lightbox');
    if (modal) {
        const modalImg = document.getElementById("lightbox-img");
        const captionText = document.getElementById("caption");
        const closeBtn = document.getElementsByClassName("close")[0];

        // Event Delegation for dynamically added images
        document.body.addEventListener('click', function (e) {
            if (e.target.tagName === 'IMG' && e.target.closest('.gallery-item')) {
                modal.style.display = "block";
                modalImg.src = e.target.src;
                captionText.innerHTML = e.target.alt;
            }
        });

        // Close scenarios
        closeBtn.onclick = function () {
            modal.style.display = "none";
        }

        modal.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }
    }

    /* URL Handling (Clean URLs vs Local File Support) */
    const isLocal = window.location.protocol === 'file:';
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        if (isLocal) {
            // Local file system: Ensure index.html is present
            if (!href.endsWith('index.html') && !href.endsWith('.txt')) {
                // Remove trailing slash if exists to avoid double slash
                const cleanHref = href.replace(/\/$/, '');
                link.href = cleanHref + '/index.html';
            }
        } else {
            // Web Server: Ensure index.html is REMOVED for clean URLs
            if (href.endsWith('index.html')) {
                const cleanURL = href.replace('index.html', '');
                // Remove trailing slash if simple folder link preference
                link.href = cleanURL;
            }
        }
    });
});
