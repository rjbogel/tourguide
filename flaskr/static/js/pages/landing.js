const splide = new Splide(".splide", {
  width: "100%",
  height: "99vh",
});
const bar = splide.root.querySelector(".my-slider-progress-bar");

// Updates the bar width whenever the carousel moves:
splide.on("mounted move", function () {
  const end = splide.Components.Controller.getEnd() + 1;
  const rate = Math.min((splide.index + 1) / end, 1);
  console.log(bar);
  bar.style.width = String(100 * rate) + "%";
});
$(document).ready(function () {
  splide.mount();
  console.log("aaaaaaaa");
});
