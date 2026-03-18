const filterBtns = document.querySelectorAll(".filter-buttons .btn");
const galleryContainer = document.querySelector(".gallery-container");
const uploadBtn = document.querySelector(".button");

if (!galleryContainer) {
  console.error("Gallery container was not found.");
} else {
  let currentIndex = 0;
  let activeFilter = "all";

  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.innerHTML = `
      <button class="close-btn" type="button" aria-label="Close image viewer">&times;</button>
      <button class="nav-btn prev-btn" type="button" aria-label="Previous image">&#10094;</button>
      <div class="lightbox-content">
          <img class="lightbox-img" src="" alt="Expanded image preview" />
          <h3 class="lightbox-title"></h3>
      </div>
      <button class="nav-btn next-btn" type="button" aria-label="Next image">&#10095;</button>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector(".lightbox-img");
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const closeBtn = lightbox.querySelector(".close-btn");
  const nextBtn = lightbox.querySelector(".next-btn");
  const prevBtn = lightbox.querySelector(".prev-btn");

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "file";
  hiddenInput.accept = "image/*";
  hiddenInput.style.display = "none";
  document.body.appendChild(hiddenInput);

  function getGalleryItems() {
    return Array.from(galleryContainer.querySelectorAll(".gallery-item"));
  }

  function getVisibleItems() {
    return getGalleryItems().filter(
      (item) => !item.classList.contains("is-hidden"),
    );
  }

  function setActiveFilterButton(btn) {
    filterBtns.forEach((filterBtn) => filterBtn.classList.remove("active"));
    if (btn) btn.classList.add("active");
  }

  function applyFilter(filterValue) {
    activeFilter = filterValue;

    getGalleryItems().forEach((item) => {
      const isVisible =
        filterValue === "all" ||
        item.getAttribute("data-category") === filterValue;

      item.classList.toggle("is-hidden", !isVisible);
      item.setAttribute("aria-hidden", String(!isVisible));

      if (isVisible) {
        item.classList.remove("fade-in");
        requestAnimationFrame(() => item.classList.add("fade-in"));
      }
    });
  }

  function normalizeIndex(index, length) {
    return ((index % length) + length) % length;
  }

  function updateLightbox(index) {
    if (!lightboxImg || !lightboxTitle) return;

    const items = getVisibleItems();
    if (items.length === 0) return;

    currentIndex = normalizeIndex(index, items.length);
    const currentItem = items[currentIndex];
    const imageEl = currentItem.querySelector("img");
    const titleEl = currentItem.querySelector("h3");

    if (!imageEl) return;

    lightboxImg.src = imageEl.src;
    lightboxImg.alt = imageEl.alt || "Expanded gallery image";
    lightboxTitle.textContent = titleEl ? titleEl.textContent : "Untitled";
  }

  function openLightbox(index) {
    updateLightbox(index);
    if (!lightboxImg.src) return;
    lightbox.classList.add("is-open");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  }

  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveFilterButton(btn);
        applyFilter(btn.getAttribute("data-filter") || "all");
      });
    });
  }

  galleryContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item || item.classList.contains("is-hidden")) return;

    const visibleItems = getVisibleItems();
    currentIndex = visibleItems.indexOf(item);
    if (currentIndex < 0) return;

    openLightbox(currentIndex);
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => updateLightbox(currentIndex + 1));
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => updateLightbox(currentIndex - 1));
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      closeLightbox();
      return;
    }

    if (e.key === "ArrowRight") {
      updateLightbox(currentIndex + 1);
      return;
    }

    if (e.key === "ArrowLeft") {
      updateLightbox(currentIndex - 1);
    }
  });

  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => hiddenInput.click());
  }

  hiddenInput.addEventListener("change", (e) => {
    const input = e.target;
    const [file] = input.files || [];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target && event.target.result;
      if (typeof src !== "string") return;

      const uploadCategory = activeFilter === "all" ? "uploads" : activeFilter;

      const newItem = document.createElement("div");
      newItem.className = "gallery-item fade-in";
      newItem.setAttribute("data-category", uploadCategory);
      newItem.innerHTML = `
          <img src="${src}" alt="Uploaded image" />
          <div class="overlay">
              <span>Uploaded</span>
              <h3>New Discovery</h3>
          </div>
      `;

      newItem.classList.remove("is-hidden");
      newItem.setAttribute("aria-hidden", "false");
      galleryContainer.prepend(newItem);
    };

    reader.readAsDataURL(file);
    input.value = "";
  });

  const defaultActiveBtn = document.querySelector(
    ".filter-buttons .btn.active",
  );
  if (defaultActiveBtn) {
    activeFilter = defaultActiveBtn.getAttribute("data-filter") || "all";
  }
  applyFilter(activeFilter);
}
