chrome.storage.local.get('wikiSurfStart', async function(data) {
    var start = document.getElementById("sprintStart");
    start.innerHTML = data.wikiSurfStart;
});

chrome.storage.local.get('wikiSurfFinish', async function(data) {
    var end = document.getElementById("sprintEnd");
    end.innerHTML = data.wikiSurfFinish;
});

const ending = document.getElementById("ending");
ending.addEventListener('click', function(event) {
    if(!confirm('Are you sure?')) {
        event.preventDefault();
    }
    chrome.runtime.sendMessage({ action: 'wikiSurfEnd', msg: ''});
    window.location.href = 'main.html';
});
