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
   NAVBAR DROPDOWN (DESKTOP + MOBILE)  
--------------------------------------- */

// Elements
const dropBtn = document.querySelector(".drop-btn");
const mainMenu = document.querySelector(".dropdown-menu");
const submenuItems = document.querySelectorAll(".submenu-item");
const submenus = document.querySelectorAll(".submenu-panel");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

let mainOpen = false;

// Guard: if nav missing for some reason, skip
if (dropBtn && mainMenu && hamburger && navMenu) {
  // MAIN MENU (Tools → categories)
  dropBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mainOpen = !mainOpen;

    if (mainOpen) {
      mainMenu.classList.add("show");
    } else {
      mainMenu.classList.remove("show");
    }

    // Close all submenus when toggling main
    submenus.forEach((s) => s.classList.remove("show"));
  });

  // CATEGORY → TOOLS LIST
  submenuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = item.dataset.submenu;

      submenus.forEach((panel) => {
        if (panel.id === targetId) {
          panel.classList.toggle("show");
        } else {
          panel.classList.remove("show");
        }
      });
    });
  });

  // CLICK OUTSIDE → CLOSE EVERYTHING
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      mainMenu.classList.remove("show");
      submenus.forEach((s) => s.classList.remove("show"));
      mainOpen = false;
    }
  });

  /* ---------------------------------------  
     MOBILE HAMBURGER MENU  
  --------------------------------------- */
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("show");
    hamburger.classList.toggle("open"); // animated burger

    // When toggling mobile menu, collapse dropdown + submenus
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

// SHOW/HIDE BUTTON
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

  // CLICK → SCROLL TO TOP
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

  // If IntersectionObserver not supported → just show everything
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

/* ----------------------------------------------------  
   MOBILE/TABLET ANIMATION FIX LAYER (NON-DESTRUCTIVE)  
   ---------------------------------------------------- */

// 1. Backup fix: reveal all after small delay (mobile sometimes misses IO events)
setTimeout(() => {
  const unrevealed = document.querySelectorAll(
    ".reveal-on-scroll:not(.visible), .page-reveal:not(.visible)"
  );
  unrevealed.forEach((el) => el.classList.add("visible"));
}, 1200);

// 2. Force reveal-on-scroll when user scrolls by touch
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

// 3. Tap-friendly hover simulation for touch screens
document.addEventListener("touchstart", (e) => {
  const card = e.target.closest(".card");
  if (card) {
    card.classList.add("tap-active");
    setTimeout(() => card.classList.remove("tap-active"), 200);
  }
});

/* ---------------------------------------
   LOAD HEAD
--------------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  // HEAD (analytics + favicon)
  try {
    const headReq = await fetch("/components/head-common.html");
    document
      .getElementById("global-head")
      .insertAdjacentHTML("afterbegin", await headReq.text());
  } catch (err) {
    console.error("Head load failed", err);
  }
});
