export const tabBarScroller = (direction: string) => {
  const navigation = document.getElementById("tab-scroller");
  if (direction === "left") {
    sideScroll(navigation, "left", 25, 100, 50);
  } else {
    sideScroll(navigation, "right", 25, 100, 10);
  }
};
export const moveNavigation = (direction: string) => {
  const navigation = document.getElementById("tab-scroller");
  if (direction === "left") {
    sideScroll(navigation, "left", 25, 100, 50);
  } else {
    let count = 0;
    let scroll = setInterval(() => {
      count++;
      if (count === 5){
        clearInterval(scroll)
      } 
      navigation?.scrollTo({
        left : navigation.scrollWidth,
        behavior : "smooth",
      })
    }, 50)
  }
};
/* eslint-disable @typescript-eslint/no-explicit-any */
const sideScroll = (
  element: any,
  direction: string,
  speed: number,
  distance: number,
  step: number,
) => {
  let scrollAmount = 0;
  const slideTimer = setInterval(function () {
    if (element) {
      if (direction == "left") {
        element.scrollLeft -= step;
      } else {
        element.scrollLeft += step;
      }
      scrollAmount += step;
      if (scrollAmount >= distance) {
        window.clearInterval(slideTimer);
      }
    }
  }, speed);
};

