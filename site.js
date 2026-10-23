const reviewToggle = document.querySelector('.review-toggle');
const reviewMobile = document.querySelector('#review-mobile');
function closeReviewMenu() {
  reviewMobile.hidden = true;
  reviewToggle.setAttribute('aria-expanded', 'false');
}
reviewToggle.addEventListener('click', () => {
  const open = reviewToggle.getAttribute('aria-expanded') !== 'true';
  reviewMobile.hidden = !open;
  reviewToggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.review-header details').forEach((group) => {
  group.addEventListener('toggle', () => {
    if (group.open)
      document.querySelectorAll('.review-header details').forEach((other) => {
        if (other !== group) other.open = false;
      });
  });
});
document.querySelector('.review-header').addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    document.querySelectorAll('.review-header details').forEach((group) => (group.open = false));
    closeReviewMenu();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.review-header')) {
    document.querySelectorAll('.review-header details').forEach((group) => (group.open = false));
    closeReviewMenu();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const open = document.querySelector('.review-header details[open]');
    if (open) {
      open.open = false;
      open.querySelector('summary').focus();
    } else if (!reviewMobile.hidden) {
      closeReviewMenu();
      reviewToggle.focus();
    }
  }
});
document.querySelectorAll('.review-header details').forEach((group) => {
  group.querySelector('summary').addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      group.open = true;
      group.querySelector('a').focus();
    }
  });
  group.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !group.contains(event.relatedTarget)) group.open = false;
  });
});
