import { JsCon } from 'https://cdn.jsdelivr.net/npm/@chcs1013/jscon@0.1.1/jscon.js'
const con = new JsCon();
export { con as default };
con.registerConsoleAPI(globalThis.console);
con.addErrorHandler();

// usage: import("https://cdn.jsdelivr.net/npm/@chcs1013/jscon@0.1.1/loader-external.js")
