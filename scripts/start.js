document.currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();

chrome.runtime.sendMessage({
    action: 'wikiSurfBegin',
    wikiSurfStart: document.currentScript.getAttribute('start'),
    wikiSurfFinish: document.currentScript.getAttribute('finish'),
    wikiSurfId: document.currentScript.getAttribute('rid')});

chrome.tabs.create({active: true, url: document.currentScript.getAttribute('start')});