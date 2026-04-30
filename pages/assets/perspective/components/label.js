// Label component — displays text. If wired to onClick event, becomes clickable.

import { dispatchEvent } from "../events.js";

export const label = {
  type: "ia.display.label",
  render({ name, props, position, events }) {
    const el = document.createElement("div");
    el.dataset.name = name || "";
    el.dataset.type = "label";
    if (position) {
      el.style.position = "absolute";
      el.style.left = position.x + "px";
      el.style.top = position.y + "px";
      el.style.width = position.width + "px";
      el.style.height = position.height + "px";
    }
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.boxSizing = "border-box";
    el.textContent = props?.text ?? "";
    Object.assign(el.style, props?.style || {});
    const onClick = events?.dom?.onClick;
    if (onClick) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => dispatchEvent(onClick));
    }
    return el;
  },
};
