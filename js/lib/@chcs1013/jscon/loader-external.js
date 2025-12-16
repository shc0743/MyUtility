import { JsCon } from 'cdn.jsdelivr.net/npm/@chcs1013/jscon@0.1.0/jscon.js'
const con = new JsCon();
export { con as default };
con.registerConsoleAPI(globalThis.console);
con.addErrorHandler();

// usage: import("cdn.jsdelivr.net/npm/@chcs1013/jscon@0.1.0/loader-external.js")