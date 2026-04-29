// Re-export all "misc" tool namespaces from one entry.
import { dbTools } from "./tools-db.js";
import { alarmTools } from "./tools-alarm.js";
import { gwTools } from "./tools-gw.js";
import { troubleshootTools } from "./tools-troubleshoot.js";

export const miscTools = { ...dbTools, ...alarmTools, ...gwTools, ...troubleshootTools };
