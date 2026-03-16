/**
 * ScrollToTopButton — fixed bottom-right button that appears after scrolling
 * past a threshold in the main content area (#main-scroll).
 */

import { useState, useEffect, type FC } from "react";

const THRESHOLD = 300;
const CONTAINER_ID = "main-scroll";

const ScrollToTopButton: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;
    const onScroll = () => setVisible(el.scrollTop > THRESHOLD);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    document.getElementById(CONTAINER_ID)?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Scroll to top"
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] shadow-[var(--shadow-btn)] flex items-center justify-center cursor-pointer border-none transition-all duration-200 hover:bg-[var(--color-btn-primary-hover)] hover:scale-110 animate-fade-in"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
