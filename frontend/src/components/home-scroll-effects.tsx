import { useEffect } from "react";

export function HomeScrollEffects() {
  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const parallaxTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    for (const target of revealTargets) {
      revealObserver.observe(target);
    }

    let rafId = 0;

    const updateParallax = () => {
      const viewportHeight = window.innerHeight || 1;
      for (const target of parallaxTargets) {
        const rect = target.getBoundingClientRect();
        const speed = Number(target.dataset.speed ?? "0.08");
        const progress = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
        target.style.setProperty("--parallax-y", `${progress * speed * -120}px`);
      }
      rafId = 0;
    };

    const requestUpdate = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return null;
}
