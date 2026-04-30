// Markdown / HTML display component.

export const markdown = {
  type: "ia.display.markdown",
  render({ name, props, position }) {
    const el = document.createElement("div");
    el.dataset.name = name || "";
    el.dataset.type = "markdown";
    if (position) {
      el.style.position = "absolute";
      el.style.left = position.x + "px";
      el.style.top = position.y + "px";
      el.style.width = position.width + "px";
      el.style.height = position.height + "px";
    }
    // Build views currently emit `props.html` — render that directly so the
    // browser preview matches what Perspective shows after evaluating its
    // markdown component.
    el.innerHTML = props?.html ?? props?.markdown ?? "";
    Object.assign(el.style, props?.style || {});
    return el;
  },
};
