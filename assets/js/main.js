// SEARCH FUNCTION (home page only)
function searchTools() {
  const inputEl = document.getElementById("search-input");
  if (!inputEl) return;

  const input = inputEl.value.toLowerCase();
  const cards = document.getElementsByClassName("card");

  for (let i = 0; i < cards.length; i++) {
    const text = cards[i].innerText.toLowerCase();
    cards[i].style.display = text.includes(input) ? "block" : "none";
  }
}

/* ---------------------------------------
   NAVBAR DROPDOWN – after navbar loads
--------------------------------------- */

function initNavbarDropdowns() {
  const dropBtn = document.querySelector(".drop-btn");
  const mainMenu = document.querySelector(".dropdown-menu");
  const submenuItems = document.querySelectorAll(".submenu-item");
  const submenus = document.querySelectorAll(".submenu-panel");
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  let mainOpen = false;

  if (!dropBtn || !mainMenu || !hamburger || !navMenu) return;

  // MAIN MENU
  dropBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mainOpen = !mainOpen;

    mainMenu.classList.toggle("show", mainOpen);

    submenus.forEach((s) => s.classList.remove("show"));
  });

  // CATEGORY SUBMENU
  submenuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = item.dataset.submenu;

      submenus.forEach((panel) => {
        panel.classList.toggle(
          "show",
          panel.id === targetId && !panel.classList.contains("show")
        );
      });
    });
  });

  // CLICK OUTSIDE
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      mainMenu.classList.remove("show");
      submenus.forEach((s) => s.classList.remove("show"));
      mainOpen = false;
    }
  });

  // MOBILE MENU
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("show");
    hamburger.classList.toggle("open");

    if (!navMenu.classList.contains("show")) {
      mainMenu.classList.remove("show");
      submenus.forEach((s) => s.classList.remove("show"));
      mainOpen = false;
    }
  });
}

/* ---------------------------------------
   SCROLL TO TOP BUTTON
--------------------------------------- */

const scrollTopBtn = document.getElementById("scrollTopBtn");

if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add("show");
      scrollTopBtn.classList.remove("hide");
    } else {
      scrollTopBtn.classList.add("hide");
      scrollTopBtn.classList.remove("show");
    }
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ---------------------------------------
   BODY LOAD FADE-IN
--------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("ready");
});

/* ---------------------------------------
   REVEAL-ON-SCROLL ANIMATIONS
--------------------------------------- */

(function setupScrollReveal() {
  const revealEls = document.querySelectorAll(
    ".reveal-on-scroll, .page-reveal"
  );

  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealEls.forEach((el) => {
    observer.observe(el);
  });
})();

/* backup reveal */
setTimeout(() => {
  const unrevealed = document.querySelectorAll(
    ".reveal-on-scroll:not(.visible), .page-reveal:not(.visible)"
  );
  unrevealed.forEach((el) => el.classList.add("visible"));
}, 1200);

window.addEventListener("scroll", () => {
  const revealEls = document.querySelectorAll(
    ".reveal-on-scroll:not(.visible), .page-reveal:not(.visible)"
  );

  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add("visible");
    }
  });
});

document.addEventListener("touchstart", (e) => {
  const card = e.target.closest(".card");
  if (card) {
    card.classList.add("tap-active");
    setTimeout(() => card.classList.remove("tap-active"), 200);
  }
});

/* ---------------------------------------
   LOAD NAV + FOOTER, THEN INIT DROPDOWN
--------------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const navReq = await fetch("/components/navbar.html");
    document.getElementById("global-navbar").innerHTML = await navReq.text();
  } catch (err) {
    console.error("Navbar load failed", err);
  }

  // attach dropdown handlers NOW
  initNavbarDropdowns();

  try {
    const ftReq = await fetch("/components/footer.html");
    document.getElementById("global-footer").innerHTML = await ftReq.text();
  } catch (err) {
    console.error("Footer load failed", err);
  }
});
