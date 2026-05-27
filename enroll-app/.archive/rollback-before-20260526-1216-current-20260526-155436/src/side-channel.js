/**
 * Side-channel polyfill for WeChat Mini Program
 * Based on the original side-channel module but adapted for WeChat environment
 * Using ES6 export instead of CommonJS to avoid __esModule error
 */

function getSideChannel() {
  // Use a simple object to store the channel data
  const channelData = {};
  
  // Create the channel object with the required methods
  const channel = {
    assert: function(key) {
      if (!channel.has(key)) {
        throw new TypeError('Side channel does not contain ' + key);
      }
    },
    
    delete: function(key) {
      if (channelData[key] !== undefined) {
        delete channelData[key];
        return true;
      }
      return false;
    },
    
    get: function(key) {
      return channelData[key];
    },
    
    has: function(key) {
      return channelData[key] !== undefined;
    },
    
    set: function(key, value) {
      channelData[key] = value;
    }
  };
  
  return channel;
}

// Export using ES6 export format instead of CommonJS module.exports
export default getSideChannel;