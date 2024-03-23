// Initialize storage if not already initialized
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({ 'wikiSurfPath': [] });
    chrome.storage.local.set({ 'wikiSurfStart': '' });
    chrome.storage.local.set({ 'wikiSurfFinish': '' });
    chrome.storage.local.set({ 'wikiSurfId': '' });
    chrome.storage.local.set({ 'wikiSurfStartTime': ''});
});

// Logging for tests
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );
    }
});
  
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    console.log(message);
    switch (message.action) {
        case 'wikiSurfClick':
            let currTime = new Date();
            const data = await new Promise(resolve => {
                chrome.storage.local.get('wikiSurfFinish', resolve);
            });
            if (!message.referrerUrl.includes('wikipedia.org/wiki/')) {
                chrome.runtime.sendMessage({ action: 'wikiSurfEnd'});
                // TODO handle cheating: going backward also is cheating
            } else {
                console.log(message.referrerUrl, message.url);
                chrome.storage.local.get('wikiSurfPath', function(data) {
                    const wikiSurfPath = data.wikiSurfPath || [];
                    wikiSurfPath.push(message.url);
                    chrome.storage.local.set({ 'wikiSurfPath': wikiSurfPath });
                });

                if (message.url == data.wikiSurfFinish) {
                    chrome.storage.local.get('wikiSurfStartTime', async function(data) {
                        if (data.wikiSurfStartTime != "") {
                            const startTime = new Date(data.wikiSurfStartTime.substring(1, data.wikiSurfStartTime.length-1));                        
                            const length = currTime.getTime() - startTime.getTime();
    
                            const id = await new Promise(resolve => {
                                chrome.storage.local.get('wikiSurfId', resolve);
                            });
                            const path = await new Promise(resolve => {
                                chrome.storage.local.get('wikiSurfPath', resolve);
                            });
                            fetch('http://127.0.0.1:8080/ext/sprint', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    route_id: parseInt(id.wikiSurfId),
                                    success: true,
                                    start_time: startTime,
                                    length_time: length,
                                    path: path.wikiSurfPath,
                                })
                            }).then(response => {
                                // TODO handle response
                            }).catch(error => {
                                // TODO handle error
                            });
                        }
                    });
                }
            }
        break
        case 'wikiSurfBegin':
            chrome.storage.local.set({ 'wikiSurfPath': [] });
            chrome.storage.local.set({ 'wikiSurfStart': message.wikiSurfStart });
            chrome.storage.local.set({ 'wikiSurfFinish': message.wikiSurfFinish });
            chrome.storage.local.set({ 'wikiSurfId': message.wikiSurfId });
            chrome.storage.local.set({ 'wikiSurfStartTime': JSON.stringify(new Date())});
        break
        case 'wikiSurfEnd':
            chrome.storage.local.set({ 'wikiSurfStart': '' });
            chrome.storage.local.set({ 'wikiSurfFinish': '' });
            chrome.storage.local.set({ 'wikiSurfId': '' });
            chrome.storage.local.set({ 'wikiSurfPath': [] });
            // FIXME
        break
    }
});  

