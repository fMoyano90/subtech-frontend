"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function ScrollReveal({ children, className }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;

    const ctx = gsap.context(() => {
      const targets = Array.from(node.querySelectorAll<HTMLElement>("[data-reveal]"));
      const heroTargets = Array.from(node.querySelectorAll<HTMLElement>("[data-reveal-hero]"));

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduced = !!context.conditions?.reduced;
          const yOffset = reduced ? 0 : 24;
          const duration = reduced ? 0.25 : 0.7;

          if (heroTargets.length) {
            gsap.set(heroTargets, { autoAlpha: 0, y: yOffset });
            gsap.to(heroTargets, {
              autoAlpha: 1,
              y: 0,
              duration,
              ease: "power2.out",
              stagger: 0.08,
              delay: 0.1,
            });
          }

          if (targets.length) {
            gsap.set(targets, { autoAlpha: 0, y: yOffset });
            ScrollTrigger.batch(targets, {
              start: "top 88%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration,
                  ease: "power2.out",
                  stagger: 0.08,
                  overwrite: true,
                }),
            });
          }

          ScrollTrigger.refresh();
        },
      );
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
