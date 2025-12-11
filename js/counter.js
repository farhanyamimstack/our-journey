// ===== Relationship Duration Target =====
// 2 years, 1 month, 21 days
const target = {
  years: 2,
  months: 1,
  days: 21
};

// ===== Animate the Counter =====
function animateCounter() {
  const yearsEl = document.getElementById("years");
  const monthsEl = document.getElementById("months");
  const daysEl = document.getElementById("days");

  let y = 0, m = 0, d = 0;

  const step = setInterval(() => {

    // Animate years first
    if (y < target.years) {
      y++;
      yearsEl.textContent = y;
      return;
    }

    // Then animate months
    if (m < target.months) {
      m++;
      monthsEl.textContent = m;
      return;
    }

    // Then animate days
    if (d < target.days) {
      d++;
      daysEl.textContent = d;
      return;
    }

    // Stop when finished
    clearInterval(step);

  }, 150); // speed (adjust if you want faster/slower)
}

// ===== Run animation when page loads =====
window.addEventListener("load", animateCounter);
