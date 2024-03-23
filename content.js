document.addEventListener('click', function(event) {
    if (event.target.tagName === 'A' && event.target.href.includes('wikipedia.org/wiki/')) {
        const url = event.target.href;
        const referrerUrl = document.referrer; 
        chrome.runtime.sendMessage({ action: 'wikiSurfClick', url: url, referrerUrl: referrerUrl});
    }
});
  