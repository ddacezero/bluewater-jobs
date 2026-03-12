# UI Features Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Implement 6 UI features: remove global search, notification bell dropdown, NQ button red, modernized scrollbar, scroll-to-top button, and persistent dark/light mode toggle.

**Architecture:** ThemeContext wraps the app, writes to localStorage and `data-theme` on `<html>`. Dark mode overrides CSS variables via `[data-theme="dark"]` selector. ScrollToTopButton is a single component in App.tsx root layout. Notification dropdown is local state in Layout component.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, CSS custom properties

---

## Files

**Create:**
- `src/context/ThemeContext.tsx` — theme state, localStorage, `data-theme` toggle
- `src/components/ScrollToTopButton.tsx` — scroll-to-top button watching `#main-scroll` div

**Modify:**
- `src/index.css` — dark mode CSS var overrides, bg-white override, scrollbar styles, body dark bg
- `src/components/icons/index.tsx` — add SunIcon, MoonIcon
- `src/App.tsx` — remove search, add notif bell dropdown, add theme toggle, add ScrollToTopButton, id main-scroll, wrap with ThemeProvider
- `src/context/AppContext.tsx` — remove search state/action/reducer
- `src/pages/Candidates.tsx` — remove search input + filtering
- `src/pages/TalentPool.tsx` — remove search input + filtering
- `src/pages/Pipeline.tsx` — NQ button → red

---

## Task 1: ThemeContext

- [ ] Create `src/context/ThemeContext.tsx` with useTheme hook, localStorage persistence, data-theme attribute

## Task 2: CSS — Dark Mode + Scrollbar

- [ ] Add dark mode CSS variable overrides to `src/index.css` under `[data-theme="dark"]`
- [ ] Add `bg-white` dark mode override
- [ ] Add modernized scrollbar styles
- [ ] Add dark body background override

## Task 3: Icons — SunIcon + MoonIcon

- [ ] Add SunIcon and MoonIcon to `src/components/icons/index.tsx`

## Task 4: ScrollToTopButton component

- [ ] Create `src/components/ScrollToTopButton.tsx`

## Task 5: AppContext — remove search

- [ ] Remove `search` from AppState, initialState, AppAction, reducer

## Task 6: App.tsx — all topbar changes

- [ ] Remove search input, import ThemeProvider + useTheme + SunIcon + MoonIcon + ScrollToTopButton
- [ ] Add notification bell dropdown with 5 sample notifications
- [ ] Add theme toggle button
- [ ] Add id="main-scroll" to content div
- [ ] Mount ScrollToTopButton
- [ ] Wrap app with ThemeProvider

## Task 7: Candidates.tsx — remove search

- [ ] Remove search input and filtering

## Task 8: TalentPool.tsx — remove search

- [ ] Remove search input and filtering

## Task 9: Pipeline.tsx — NQ button red

- [ ] Change NQ button from orange to red
