(function() {
  'use strict';
  
  const JSCON_VERSION = '0.1.5';
  const PACKAGE_NAME = '@chcs1013/jscon';
  
  const CDN_PROVIDERS = [
    `https://unpkg.com/${PACKAGE_NAME}@${JSCON_VERSION}/loader-external.js`,
    `https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${JSCON_VERSION}/loader-external.js`,
    `https://fastly.jsdelivr.net/npm/${PACKAGE_NAME}@${JSCON_VERSION}/loader-external.js`,
  ];
  
  const MAX_RETRIES = CDN_PROVIDERS.length;
  const BASE_DELAY = 100;
  
  async function loadJsCon() {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const url = CDN_PROVIDERS[i];
      const hostname = new URL(url).hostname;
      
      try {
        const module = await import(url);
        
        if (module && module.default && typeof module.default.open === 'function') {
          module.default.open();
          return module;
        } else {
          throw new Error('loader-es5.js Module init failed');
        }
      } catch (error) {
        if (i === MAX_RETRIES - 1) {
          throw new Error('loader-es5.js Failed');
        }
        
        await new Promise(resolve => setTimeout(resolve));
      }
    }
  }
  
  loadJsCon()
    .then(module => {
      if (typeof window.jscon === 'undefined') {
        window.jscon = module.default;
      }
    })
    .catch(error => {
      
      if (typeof window.console === 'undefined') {
        window.console = {
          log: () => {},
          warn: () => {},
          error: () => {},
          info: () => {},
          debug: () => {}
        };
      }
    });

})();
