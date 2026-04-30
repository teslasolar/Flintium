// Table component — renders a column-driven data grid.

export const table = {
  type: "ia.display.table",
  render({ name, props, position }) {
    const wrap = document.createElement("div");
    wrap.dataset.name = name || "";
    wrap.dataset.type = "table";
    if (position) {
      wrap.style.position = "absolute";
      wrap.style.left = position.x + "px";
      wrap.style.top = position.y + "px";
      wrap.style.width = position.width + "px";
      wrap.style.height = position.height + "px";
    }
    wrap.style.background = "#161b22";
    wrap.style.border = "1px solid #2a313c";
    wrap.style.borderRadius = "8px";
    wrap.style.overflow = "auto";

    const data = Array.isArray(props?.data) ? props.data : [];
    const columns = props?.columns || inferColumns(data);

    const tbl = document.createElement("table");
    tbl.style.width = "100%";
    tbl.style.borderCollapse = "collapse";
    tbl.style.color = "#e6edf3";
    tbl.style.fontSize = "13px";

    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    for (const col of columns) {
      const th = document.createElement("th");
      th.textContent = col.header || col.field;
      th.style.padding = "8px 10px";
      th.style.textAlign = "left";
      th.style.background = "#1c232c";
      th.style.borderBottom = "1px solid #2a313c";
      th.style.position = "sticky";
      th.style.top = "0";
      trh.appendChild(th);
    }
    thead.appendChild(trh);
    tbl.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const row of data) {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.addEventListener("mouseenter", () => (tr.style.background = "rgba(56,181,249,0.05)"));
      tr.addEventListener("mouseleave", () => (tr.style.background = ""));
      for (const col of columns) {
        const td = document.createElement("td");
        const v = row?.[col.field];
        td.textContent = v == null ? "" : String(v);
        td.style.padding = "6px 10px";
        td.style.borderBottom = "1px solid rgba(42,49,60,0.5)";
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    tbl.appendChild(tbody);
    wrap.appendChild(tbl);
    if (data.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No data.";
      empty.style.padding = "16px";
      empty.style.color = "#8b949e";
      wrap.appendChild(empty);
    }
    return wrap;
  },
};

function inferColumns(data) {
  if (!data.length) return [];
  return Object.keys(data[0]).map((k) => ({ field: k, header: k }));
}
