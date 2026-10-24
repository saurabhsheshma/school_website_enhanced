"use strict";

document.querySelectorAll("[data-current-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
});

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
    const slides = [...carousel.querySelectorAll("[data-slide]")];
    const previousButton = carousel.querySelector("[data-previous]");
    const nextButton = carousel.querySelector("[data-next]");
    const toggleButton = carousel.querySelector("[data-toggle]");
    const slideButtons = carousel.querySelector("[data-slide-buttons]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeIndex = 0;
    let timer;
    let isPaused = prefersReducedMotion.matches;

    const buttons = slides.map((_, index) => {
        const button = document.createElement("button");
        button.className = "carousel-dot";
        button.type = "button";
        button.setAttribute("aria-label", `Show photo ${index + 1} of ${slides.length}`);
        button.addEventListener("click", () => showSlide(index));
        slideButtons.append(button);
        return button;
    });

    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.hidden = slideIndex !== activeIndex;
            buttons[slideIndex].setAttribute("aria-current", String(slideIndex === activeIndex));
        });
    }

    function stopTimer() {
        window.clearInterval(timer);
    }

    function startTimer() {
        stopTimer();
        if (!isPaused && !document.hidden) {
            timer = window.setInterval(() => showSlide(activeIndex + 1), 6000);
        }
    }

    previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
    nextButton.addEventListener("click", () => showSlide(activeIndex + 1));
    toggleButton.addEventListener("click", () => {
        isPaused = !isPaused;
        toggleButton.textContent = isPaused ? "Play slideshow" : "Pause slideshow";
        toggleButton.setAttribute("aria-pressed", String(isPaused));
        startTimer();
    });
    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    carousel.addEventListener("focusin", stopTimer);
    carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
            startTimer();
        }
    });
    document.addEventListener("visibilitychange", startTimer);
    prefersReducedMotion.addEventListener("change", (event) => {
        if (event.matches) {
            isPaused = true;
            toggleButton.textContent = "Play slideshow";
            toggleButton.setAttribute("aria-pressed", "true");
            stopTimer();
        }
    });

    showSlide(activeIndex);
    startTimer();
}

const updateGrid = document.querySelector("[data-updates]");

if (updateGrid) {
    const cards = [...updateGrid.querySelectorAll("[data-category]")];
    const filters = [...document.querySelectorAll("[data-filter]")];
    const search = document.querySelector("#update-search");
    const emptyState = document.querySelector("[data-empty]");
    let activeCategory = "all";

    function filterUpdates() {
        const query = search.value.trim().toLocaleLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
            const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
            const matchesSearch = !query || `${card.textContent} ${card.dataset.search}`.toLocaleLowerCase().includes(query);
            card.hidden = !(matchesCategory && matchesSearch);
            visibleCount += Number(!card.hidden);
        });

        emptyState.hidden = visibleCount > 0;
    }

    filters.forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.filter;
            filters.forEach((filter) => {
                const isActive = filter === button;
                filter.classList.toggle("is-active", isActive);
                filter.setAttribute("aria-pressed", String(isActive));
            });
            filterUpdates();
        });
    });

    search.addEventListener("input", filterUpdates);
}
