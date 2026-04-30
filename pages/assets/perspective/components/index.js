// Component registry. Adding a new component = drop a file under components/
// and register it here.

import { coord } from "./coord.js";
import { label } from "./label.js";
import { table } from "./table.js";
import { markdown } from "./markdown.js";

const list = [coord, label, table, markdown];

export const COMPONENTS = Object.fromEntries(list.map((c) => [c.type, c]));
