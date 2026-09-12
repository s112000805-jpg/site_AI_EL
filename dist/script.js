const pad = (value) => String(Math.max(0, value)).padStart(2, "0");
const timer = document.querySelector("[data-deadline]");

function updateCountdown() {
  if (!timer) return;
  const remaining = Math.max(0, new Date(timer.dataset.deadline).getTime() - Date.now());
  const seconds = Math.floor(remaining / 1000);
  timer.querySelector("[data-days]").textContent = pad(Math.floor(seconds / 86400));
  timer.querySelector("[data-hours]").textContent = pad(Math.floor((seconds % 86400) / 3600));
  timer.querySelector("[data-minutes]").textContent = pad(Math.floor((seconds % 3600) / 60));
  timer.querySelector("[data-seconds]").textContent = pad(seconds % 60);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const toast = document.querySelector(".toast");
document.querySelectorAll("[data-enroll]").forEach((button) => {
  button.addEventListener("click", () => {
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2400);
  });
});

const heroImage = document.querySelector(".course-cover img");
if (heroImage) {
  heroImage.addEventListener("load", () => {
    heroImage.hidden = false;
    document.querySelector(".cover-fallback")?.remove();
  });
}
