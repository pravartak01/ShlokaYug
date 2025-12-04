const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Configure Metro to handle symbolication errors gracefully
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Suppress InternalBytecode.js errors
      if (req.url && req.url.includes('symbolicate')) {
        const originalWrite = res.write;
        const originalEnd = res.end;
        
        res.write = function(chunk, ...args) {
          try {
            return originalWrite.call(this, chunk, ...args);
          } catch (err) {
            console.warn('Symbolication warning suppressed');
            return true;
          }
        };
        
        res.end = function(chunk, ...args) {
          try {
            return originalEnd.call(this, chunk, ...args);
          } catch (err) {
            console.warn('Symbolication warning suppressed');
            return;
          }
        };
      }
      return middleware(req, res, next);
    };
  },
};

// Reset cache on startup
config.resetCache = true;
 
module.exports = withNativeWind(config, { input: './global.css' });