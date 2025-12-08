document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("cookie-popup-overlay");
  const btnEssential = document.getElementById("cookie-popup-essential");
  const btnAll = document.getElementById("cookie-popup-accept-all");

  function loadTrackingScripts() {
    // Google Analytics Script
    const ga1 = document.createElement("script");
    ga1.async = true;
    ga1.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX";
    document.head.appendChild(ga1);

    const ga2 = document.createElement("script");
    ga2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXX');
    `;
    document.head.appendChild(ga2);

    // Adsense
    const ads = document.createElement("script");
    ads.async = true;
    ads.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX";
    ads.crossOrigin = "anonymous";
    document.head.appendChild(ads);
  }

  const saved = localStorage.getItem("cookie-choice");

  if (!saved) {
    overlay.classList.add("popup-visible");
    document.body.style.overflow = "hidden";
    document.body.classList.add("popup-open"); // ← NEW FIX
  } else {
    loadTrackingScripts();
  }

  function accept(choice) {
    localStorage.setItem("cookie-choice", choice);

    overlay.classList.remove("popup-visible");
    document.body.style.overflow = "";
    document.body.classList.remove("popup-open");  // ← NEW FIX

    loadTrackingScripts();
}

  btnEssential.addEventListener("click", () => accept("essential"));
  btnAll.addEventListener("click", () => accept("all"));
});
