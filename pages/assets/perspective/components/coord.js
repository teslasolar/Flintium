// Coordinate container — places children with absolute positioning.

export const coord = {
  type: "ia.container.coord",
  render({ name, props, position }) {
    const el = document.createElement("div");
    el.dataset.name = name || "";
    el.dataset.type = "coord";
    if (position) {
      el.style.position = "absolute";
      el.style.left = position.x + "px";
      el.style.top = position.y + "px";
      el.style.width = position.width + "px";
      el.style.height = position.height + "px";
    } else {
      el.style.position = "relative";
      el.style.width = "100%";
      el.style.height = "100%";
    }
    Object.assign(el.style, props?.style || {});
    return el;
  },
};
