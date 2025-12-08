// Page reveal
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".cs-page-container");
  if (page) requestAnimationFrame(() => page.classList.add("cs-visible"));
});

// Block reveal
const csBlock = document.querySelector(".cs-card");
if (csBlock) {
  setTimeout(() => csBlock.classList.add("cs-show"), 200);
}

// Mobile tap animation
document.querySelectorAll(".cs-btn").forEach((btn) => {
  btn.addEventListener("touchstart", () => btn.classList.add("cs-tap"));
  btn.addEventListener("touchend", () => btn.classList.remove("cs-tap"));
});
