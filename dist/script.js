const toast = document.querySelector(".toast");
let toastTimer;

function showDemo(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelectorAll("[data-enroll]").forEach((button) => {
  button.addEventListener("click", () => showDemo("此為課程展示網站，報名功能尚未開放。"));
});

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => showDemo("此功能將在正式課程平台開放。"));
});

const expandButton = document.querySelector("[data-expand]");
const modules = [...document.querySelectorAll(".course-module")];

expandButton?.addEventListener("click", () => {
  const shouldOpen = modules.some((module) => !module.open);
  modules.forEach((module) => {
    module.open = shouldOpen;
  });
  expandButton.textContent = shouldOpen ? "全部收合" : "展開全部";
});
