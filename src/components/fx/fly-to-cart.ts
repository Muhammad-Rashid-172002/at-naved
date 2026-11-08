/**
 * Animated add-to-cart: a copy of the product photo arcs into the cart button.
 * Uses the Web Animations API (compositor-only transforms). No-op for reduced motion.
 */
export function flyToCart(source: HTMLElement | null) {
  if (typeof window === "undefined" || !source) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).filter((t) => t.offsetParent !== null);
  const target = targets[targets.length - 1];
  if (!target) return;

  const img = source.querySelector("img") ?? source;
  const from = img.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 160);

  const ghost = document.createElement("div");
  const src = img instanceof HTMLImageElement ? img.currentSrc || img.src : "";
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "999px",
    backgroundImage: src ? `url("${src}")` : "",
    backgroundColor: "#FFC21A",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,.5), 0 0 0 3px #fff",
    zIndex: "120",
    pointerEvents: "none",
    willChange: "transform, opacity",
  } as CSSStyleDeclaration);
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const anim = ghost.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
      { transform: `translate3d(${dx * 0.45}px, ${dy * 0.45 - 120}px, 0) scale(.6) rotate(-12deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate3d(${dx}px, ${dy}px, 0) scale(.12) rotate(-24deg)`, opacity: 0.4 },
    ],
    { duration: 820, easing: "cubic-bezier(.45,.05,.3,1)" },
  );
  anim.onfinish = () => {
    ghost.remove();
    target.animate([{ transform: "scale(1)" }, { transform: "scale(1.22)" }, { transform: "scale(1)" }], { duration: 380, easing: "ease-out" });
  };
}
