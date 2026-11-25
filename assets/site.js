/* ctrlg.studio — petites interactions, sans dépendance */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Apparition douce des cartes et médias */
  const fadeTargets = document.querySelectorAll(".card, .g-item, .proj-cover, .about-img, .xp");
  if (!reduce && "IntersectionObserver" in window) {
    const fadeObs = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add("in"); fadeObs.unobserve(en.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    fadeTargets.forEach((el) => { el.classList.add("fade"); fadeObs.observe(el); });
  }

  /* Texte de présentation qui s'allume mot par mot au scroll */
  const reveal = document.querySelector(".reveal");
  if (reveal) {
    const words = [...reveal.querySelectorAll("span")];
    const update = () => {
      const r = reveal.getBoundingClientRect();
      const vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("lit", i < n));
    };
    if (reduce) words.forEach((w) => w.classList.add("lit"));
    else { addEventListener("scroll", update, { passive: true }); addEventListener("resize", update); update(); }
  }

  /* Images qui défilent dans "get in touch" */
  const imgs = [...document.querySelectorAll(".touch-img img")];
  if (imgs.length > 1 && !reduce) {
    let i = 0;
    setInterval(() => {
      imgs[i].classList.remove("on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("on");
    }, 1400);
  }

  /* Filtres de la page work */
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.toggle("on", c === chip));
    const f = chip.dataset.filter;
    document.querySelectorAll("#work-grid .card").forEach((card) => {
      card.hidden = f !== "all" && !card.dataset.tags.split("|").includes(f);
    });
  }));

  /* Vidéos : lecture seulement quand elles sont visibles (économise la batterie et la bande passante) */
  const vids = document.querySelectorAll("video");
  if ("IntersectionObserver" in window) {
    const vObs = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) { if (!reduce) en.target.play().catch(() => {}); }
        else en.target.pause();
      }
    }, { threshold: 0.15 });
    vids.forEach((v) => { v.removeAttribute("autoplay"); v.pause(); vObs.observe(v); });
  }
})();
