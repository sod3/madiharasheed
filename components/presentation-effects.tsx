"use client";

import { useEffect } from "react";

export function PresentationEffects({ route }: { route: string }) {
  useEffect(() => {
    const pageHeader = document.querySelector<HTMLElement>("[data-site-header]");
    const progress = pageHeader?.querySelector<HTMLElement>(".site-progress");
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const animations = new Set<number>();
    let scrollFrame = 0;

    function updateScroll() {
      scrollFrame = 0;
      const extent = document.documentElement.scrollHeight - window.innerHeight;
      const percent = extent > 0 ? Math.max(0, Math.min(1, window.scrollY / extent)) : 0;
      progress?.style.setProperty("--page-progress", String(percent));
      pageHeader?.toggleAttribute("data-scrolled", window.scrollY > 12);
    }

    function scheduleScroll() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
    }

    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        if (!motion.matches) continue;
        target.classList.add("revealed");
        const value = target.querySelector<HTMLElement>("[data-count]");
        const final = value?.dataset.count?.match(/^(\d+)(\+?)$/);
        if (!value || !final) continue;
        const goal = Number(final[1]);
        const started = performance.now();
        let frame = 0;
        function tick(time: number) {
          animations.delete(frame);
          const elapsed = Math.min((time - started) / 650, 1);
          if (!motion.matches || elapsed >= 1) {
            value!.textContent = final![0];
            return;
          }
          const eased = 1 - (1 - elapsed) ** 3;
          value!.textContent = Math.round(goal * eased) + final![2];
          frame = requestAnimationFrame(tick);
          animations.add(frame);
        }
        frame = requestAnimationFrame(tick);
        animations.add(frame);
      }
    }, { threshold: 0.13 });
    document.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));

    const interactive = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    function followPointer(event: PointerEvent) {
      if (!motion.matches || !finePointer.matches || event.pointerType !== "mouse") return;
      const element = event.currentTarget as HTMLElement;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      element.style.setProperty("--shift-x", x * 12 + "px");
      element.style.setProperty("--shift-y", y * 12 + "px");
    }
    function resetPointer(event: PointerEvent) {
      const element = event.currentTarget as HTMLElement;
      element.style.removeProperty("--shift-x");
      element.style.removeProperty("--shift-y");
    }
    for (const element of interactive) {
      element.addEventListener("pointermove", followPointer);
      element.addEventListener("pointerleave", resetPointer);
    }
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
    scheduleScroll();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(scrollFrame);
      animations.forEach((frame) => cancelAnimationFrame(frame));
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      for (const element of interactive) {
        element.removeEventListener("pointermove", followPointer);
        element.removeEventListener("pointerleave", resetPointer);
      }
    };
  }, [route]);
  return null;
}
