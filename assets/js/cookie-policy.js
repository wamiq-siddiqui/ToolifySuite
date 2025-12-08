// Page reveal
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".cookie-policy-page");
  if (page) requestAnimationFrame(() => page.classList.add("cp-visible"));
});

// Scroll reveal blocks
const cpBlocks = document.querySelectorAll(".cookie-policy-block");

if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("cp-show");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  cpBlocks.forEach((b) => obs.observe(b));
} else {
  cpBlocks.forEach((b) => b.classList.add("cp-show"));
}
