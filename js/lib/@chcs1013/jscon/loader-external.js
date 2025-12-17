import { JsCon } from './dist/bundle.js'
const con = new JsCon();
export { con as default };
con.registerConsoleAPI(globalThis.console);
con.addErrorHandler();

// usage: 
// import("https://cdn.jsdelivr.net/npm/@chcs1013/jscon@0.1.3/loader-external.js").then(m => (m.default.open(), m))
// or use unpkg:
// import("https://unpkg.com/@chcs1013/jscon@0.1.3/loader-external.js").then(m => (m.default.open(), m))

