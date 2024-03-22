// Initialize storage if not already initialized
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({ 'clickHistory': [] });
});
  
  // Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'trackClick') {
        console.log(message.referrerUrl, message.url)

        chrome.storage.local.get('clickHistory', function(data) {
            const clickHistory = data.clickHistory || [];
            clickHistory.push(message.url);
            chrome.storage.local.set({ 'clickHistory': clickHistory });
        });
    }
});  

