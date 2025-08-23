document.addEventListener('DOMContentLoaded', function() {
    // Category elements
    const categoryContainer = document.getElementById('categoryContainer');
    const categoryTrack = document.getElementById('categoryTrack');
    const navDots = document.querySelectorAll('#navDots .dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const categoryDotsWrapper = document.getElementById('navDots');
    const categoryNavButtons = document.getElementById('categoryNavButtons');

    // Items elements
    const itemsContainer = document.getElementById('itemsContainer');
    const itemsTrack = document.getElementById('itemsTrack');
    const itemsDots = document.getElementById('itemsDots');
    const itemsPrevBtn = document.getElementById('itemsPrevBtn');
    const itemsNextBtn = document.getElementById('itemsNextBtn');
    const itemsNavButtons = document.getElementById('itemsNavButtons');
    const backBtn = document.getElementById('backBtn');

    // Section title
    const sectionTitle = document.getElementById('sectionTitle');

    let currentPage = 0;
    let totalPages = document.querySelectorAll('#categoryTrack .swipe-page').length;

    // ============= CATEGORY FUNCTIONS =============
    function updateCategoryNav() {
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages - 1;

        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });

        categoryTrack.style.transform = `translateX(-${currentPage * 100}%)`;
    }

    function goToCategoryPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < totalPages) {
            currentPage = pageIndex;
            updateCategoryNav();
        }
    }

    // Swipe handler (generic)
    function attachSwipe(container, onSwipe) {
        let start = 0;
        let current = 0;
        let dragging = false;

        container.addEventListener('touchstart', e => {
            start = e.touches[0].clientX;
            current = start;
            dragging = true;
        });

        container.addEventListener('touchmove', e => {
            if (!dragging) return;
            current = e.touches[0].clientX;
            if (Math.abs(current - start) > 10) e.preventDefault();
        });

        container.addEventListener('touchend', () => {
            if (!dragging) return;
            const diff = current - start;
            if (Math.abs(diff) > 50) onSwipe(diff > 0 ? -1 : 1);
            dragging = false;
        });

        container.addEventListener('mousedown', e => {
            start = e.clientX;
            current = start;
            dragging = true;
            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            current = e.clientX;
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            const diff = current - start;
            if (Math.abs(diff) > 50) onSwipe(diff > 0 ? -1 : 1);
            dragging = false;
            container.style.cursor = 'grab';
        });
    }

    // Category swipe
    attachSwipe(categoryContainer, dir => goToCategoryPage(currentPage + dir));

    // Nav button events
    prevBtn.addEventListener('click', () => goToCategoryPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToCategoryPage(currentPage + 1));
    navDots.forEach(dot => {
        dot.addEventListener('click', () => goToCategoryPage(parseInt(dot.dataset.index)));
    });

    // ============= ITEM FUNCTIONS =============
    function buildItemsView(items) {
        // Show items navigation, hide category navigation
        itemsDots.classList.remove('hidden');
        itemsNavButtons.classList.remove('hidden');
        categoryDotsWrapper.classList.add('hidden');
        categoryNavButtons.classList.add('hidden');

        // Clear old
        itemsTrack.innerHTML = "";
        itemsDots.innerHTML = "";

        const pages = [];
        for (let i = 0; i < items.length; i += 2) {
            const pageItems = items.slice(i, i + 2);
            const page = document.createElement('div');
            page.classList.add('swipe-page');

            page.innerHTML = `
                <div class="grid-container">
                    ${pageItems.map(p => `
                        <div class="grid-item">
                            <div class="product-image">
                                <img src="${p.img}" alt="${p.name}">
                            </div>
                            <h3>${p.name}</h3>
                            <p>Price: ${p.price}</p>
                        </div>
                    `).join("")}
                </div>
            `;

            itemsTrack.appendChild(page);
            pages.push(page);
        }

        let itemPage = 0;
        const totalItemPages = pages.length;

        // Build dots
        for (let i = 0; i < totalItemPages; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            itemsDots.appendChild(dot);

            dot.addEventListener('click', () => {
                itemPage = i;
                updateItemsNav();
            });
        }

        function updateItemsNav() {
            itemsPrevBtn.disabled = itemPage === 0;
            itemsNextBtn.disabled = itemPage === totalItemPages - 1;

            itemsDots.querySelectorAll('.dot').forEach((d, idx) => {
                d.classList.toggle('active', idx === itemPage);
            });

            itemsTrack.style.transform = `translateX(-${itemPage * 100}%)`;
        }

        function goToItemPage(newPage) {
            if (newPage >= 0 && newPage < totalItemPages) {
                itemPage = newPage;
                updateItemsNav();
            }
        }

        // Attach swipe
        attachSwipe(itemsContainer, dir => goToItemPage(itemPage + dir));

        // Nav buttons
        itemsPrevBtn.onclick = () => goToItemPage(itemPage - 1);
        itemsNextBtn.onclick = () => goToItemPage(itemPage + 1);

        updateItemsNav();
    }

        // ============= CATEGORY PREVIEW ROTATION =============
    function startCategoryPreviews() {
        const gridItems = document.querySelectorAll('#categoryTrack .grid-item');

        gridItems.forEach(item => {
            const data = JSON.parse(item.getAttribute('data-items') || "[]");
            if (data.length === 0) return;

            let idx = 0;
            const imgEl = item.querySelector('.category-preview img');

            setInterval(() => {
                idx = (idx + 1) % data.length;
                imgEl.src = data[idx].img;
                imgEl.alt = data[idx].name;
            }, 2000); // change every 2 seconds
        });
    }

    // Grid item click → show items view
    const gridItems = document.querySelectorAll('#categoryTrack .grid-item');
    gridItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryName = this.querySelector('h3').textContent;
            const items = JSON.parse(this.getAttribute('data-items') || "[]");

            buildItemsView(items);

            // Update title
            sectionTitle.textContent = categoryName;

            categoryContainer.classList.add('hidden');
            itemsContainer.classList.remove('hidden');
        });
    });

    // Back button
    backBtn.addEventListener('click', () => {
        itemsContainer.classList.add('hidden');
        itemsDots.classList.add('hidden');
        itemsNavButtons.classList.add('hidden');

        // Show category view + nav again
        categoryContainer.classList.remove('hidden');
        categoryDotsWrapper.classList.remove('hidden');
        categoryNavButtons.classList.remove('hidden');

        // Reset title
        sectionTitle.textContent = "STORE PRODUCTS";

        goToCategoryPage(0);
    });

    // Initialize categories
    updateCategoryNav();

        // Start category previews 🔥
    startCategoryPreviews();
});
