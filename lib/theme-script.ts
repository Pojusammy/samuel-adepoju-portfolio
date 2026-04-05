export const themeScript = `
(() => {
  const storageKey = "samuel-theme";
  const root = document.documentElement;
  const saved = localStorage.getItem(storageKey);
  const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  const theme = saved === "light" || saved === "dark" ? saved : preferred;
  root.dataset.theme = theme;
})();
`;
