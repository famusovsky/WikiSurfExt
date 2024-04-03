// Initialize storage if not already initializedFIXME normal domain
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({ 'wikiSurfPath': [] });
    chrome.storage.local.set({ 'wikiSurfStart': '' });
    chrome.storage.local.set({ 'wikiSurfFinish': '' });
    chrome.storage.local.set({ 'wikiSurfId': '' });
    chrome.storage.local.set({ 'wikiSurfStartTime': ''});
});

// FIXME it is possible to start from non wikipedia webpage.

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    switch (message.action) {
        case 'wikiSurfClick':
            let currTime = new Date();

            var path = await new Promise(resolve => {
                chrome.storage.local.get('wikiSurfPath', resolve);
            });
            path = path.wikiSurfPath;

            if (path === undefined) {
                path = []
            }

            if (!message.referrerUrl.includes('wikipedia.org/wiki/') || !message.url.includes('wikipedia.org/wiki/')) {
                end('Cheating: You have gone through non wikipedia webpage.')
            } else if (path.length != 0 && path[path.length-1] != message.referrerUrl) {
                end('Cheating: You came to current article not from the previous one.')
            } else {
                path.push(message.url);
                chrome.storage.local.set({'wikiSurfPath': path});

                var finish = await new Promise(resolve => {
                    chrome.storage.local.get('wikiSurfFinish', resolve);
                });
                finish = finish.wikiSurfFinish;

                if (message.url == finish) {
                    chrome.storage.local.get('wikiSurfStartTime', async function(data) {
                        const start = data.wikiSurfStartTime;
                        if (start != "") {
                            const startTime = new Date(start.substring(1, start.length-1));
                            const length = currTime.getTime() - startTime.getTime();
                            var id = await new Promise(resolve => {
                                chrome.storage.local.get('wikiSurfId', resolve);
                            });
                            id = id.wikiSurfId;

                            // FIXME normal domain
                            fetch('http://127.0.0.1:8080/ext/sprint', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    route_id: parseInt(id),
                                    success: true,
                                    start_time: startTime,
                                    length_time: length,
                                    path: path,
                                })
                            }).then(async response => {
                                const txt = await response.text()
                                chrome.tabs.create({active: true, url: txt});
                                end('Success');
                            }).catch(error => {
                                end('An error have occured:\n' + error);
                            });
                        }
                    });
                }
            }
        break
        case 'wikiSurfBegin':
            begin(message.wikiSurfStart, message.wikiSurfFinish, message.wikiSurfId);
        break
        case 'wikiSurfEnd':
            end()
        break
    }
});

function begin(start, finish, id) {
    console.log("begin");

    chrome.storage.local.set({ 'wikiSurfPath': [start] });
    chrome.storage.local.set({ 'wikiSurfStart': start });
    chrome.storage.local.set({ 'wikiSurfFinish': finish });
    chrome.storage.local.set({ 'wikiSurfId': id });
    chrome.storage.local.set({ 'wikiSurfStartTime': JSON.stringify(new Date())});

    chrome.action.setPopup({popup: "sprint.html"});

    chrome.notifications.create({
        type: "basic",
        iconUrl: "./icon-512.png",
        title: "WikiSurf Start",
        message: "Sprint from " + start + " to " + finish + " is started"
    });
}

function end(msg) {
    console.log("end");

    chrome.storage.local.set({ 'wikiSurfPath': [] });
    chrome.storage.local.set({ 'wikiSurfStart': '' });
    chrome.storage.local.set({ 'wikiSurfFinish': '' });
    chrome.storage.local.set({ 'wikiSurfId': '' });

    chrome.action.setPopup({popup: "main.html"});

    chrome.notifications.create({
        type: "basic",
        iconUrl: "./icon-512.png",
        title: "WikiSurf End",
        message: "Sprint is ended:\n" + msg
    });
}

