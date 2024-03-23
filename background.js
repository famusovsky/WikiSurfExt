// Initialize storage if not already initialized
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({ 'wikiSurfPath': [] });
});
  
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.action) {
        case 'wikiSurfClick':
            if (message.url == chrome.storage.local.get('wikiSurfFinish')) {
                let currTime = new Date();
                let startTime = chrome.storage.local.get('wikiSurfStartTime');
                if (startTime) {
                    let length = currTime - startTime
                    // TODO do smth
                }
            }
            if (!message.referrerUrl.includes('wikipedia.org/wiki/')) {
                chrome.runtime.sendMessage({ action: 'wikiSurfEnd'});
                // TODO handle cheating
            } else {
                console.log(message.referrerUrl, message.url)
                chrome.storage.local.get('wikiSurfPath', function(data) {
                    const wikiSurfPath = data.wikiSurfPath || [];
                    wikiSurfPath.push(message.url);
                    chrome.storage.local.set({ 'wikiSurfPath': wikiSurfPath });
                });
            }
        break
        case 'wikiSurfBegin':
            chrome.storage.local.set({ 'wikiSurfStart': message.wikiSurfStart });
            chrome.storage.local.set({ 'wikiSurfFinish': string.wikiSurfFinish });
            chrome.storage.local.set({ 'wikiSurfPath': [] });
            chrome.storage.local.set({ 'wikiSurfStartTime': new Date()});
        break
        case 'wikiSurfEnd':
            chrome.storage.local.set({ 'wikiSurfStart': '' });
            chrome.storage.local.set({ 'wikiSurfFinish': '' });
            chrome.storage.local.set({ 'wikiSurfPath': [] });
            // TODO do smth
        break
    }
});  

