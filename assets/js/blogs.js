document.addEventListener("DOMContentLoaded", () => {
  // Page fade-in
  const container = document.querySelector(".blog-container");
  container.classList.add("pg-visible");

  // Card reveal on scroll
  const cards = document.querySelectorAll(".blog-card");

  function revealCards() {
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        card.classList.add("reveal");
      }
    });
  }

  revealCards();
  document.addEventListener("scroll", revealCards);

  // MOBILE TAP FEEDBACK FIXED HERE
  cards.forEach((card) => {
    card.addEventListener(
      "touchstart",
      () => {
        card.classList.add("tap-active");
      },
      { passive: true }
    );

    card.addEventListener("touchend", () => {
      card.classList.remove("tap-active");
    });

    card.addEventListener("touchcancel", () => {
      card.classList.remove("tap-active");
    });
  });
});