const loadingState = document.querySelector("#loading-state");
const readyState = document.querySelector("#ready-state");

window.setTimeout(() => {
  loadingState.hidden = true;
  readyState.hidden = false;
  readyState.setAttribute("role", "status");
  readyState.setAttribute("aria-live", "polite");
}, 2800);
