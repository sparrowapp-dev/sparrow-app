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
    // Add a small delay to ensure DOM is updated
    setTimeout(() => {
      navigation?.scrollTo({
        left: navigation.scrollWidth,
        behavior: "smooth",
      });
    }, 500);
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

/**
 * Scrolls the tab bar so that the tab with the given request id is visible.
 * @param requestId The id of the request tab to scroll into view.
 */
export const scrollToTab = (requestId: string) => {
  const navigation = document.getElementById("tab-scroller");
  const tabElement = document.getElementById(requestId);
  if (navigation && tabElement) {
    tabElement.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  } else {
    moveNavigation("right");
  }
};
