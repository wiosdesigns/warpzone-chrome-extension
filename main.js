window.addEventListener("load",init);
function _$(selector){
  return document.querySelector(selector);
}
function _$$(selector){
  return document.querySelectorAll(selector);
}


function init(){
  searchText = "";
  bookmarkResults = [];
  historyResults = [];
  topSites = [];
  
  chrome.topSites.get((results)=>{
    topSites = results;
    renderResults();
  });
  
  //createContextMenuItem("warpzone","Add to WarpZone");
  
  _$(".search-screen input").addEventListener("input",onSearchInput);
  _$(".search-screen input").addEventListener("keydown",onSearchBarKeyDown);
  _$(".search-screen form").addEventListener("submit",onSearchSubmit)  
}


function createContextMenuItem(id,title,parentId,onclick){
  var properties = {
    contexts:["all"],
    title: title,
    id: id
  }
  if(parentId){
    properties.parentId = parentId;
  } 
  if(onclick){
    properties.onclick = onclick;
  }
  chrome.contextMenus.create(properties, ()=>{
    console.log("Context Item Created");
  });
}

function onSearchBarKeyDown(e){
  if(e.key=="ArrowDown"){ 
    e.preventDefault();
    var current = _$(".results .result.active");
    if(current){
      var next = _$(".results .result.active ~ .result");
      if(next){
        current.classList.remove("active");
        next.classList.add("active");
        next.scrollIntoViewIfNeeded();
      }
    }
    else{
      var next = _$(".results .result");
      if(next) {      
        next.classList.add("active");
        next.scrollIntoViewIfNeeded();
      }
    }
  }
  if(e.key=="ArrowUp"){ 
    e.preventDefault();
    var results = _$$(".result");
    for (var i=1;i<results.length;i++){
      if(results[i].classList.contains("active")){
        results[i].classList.remove("active");
        results[i-1].classList.add("active");
        results[i-1].scrollIntoViewIfNeeded();
      }
    }
  }
}

function onSearchInput(e){
  renderResults();
  
  searchText = e.target.value.trim();
  chrome.bookmarks.search(searchText, (results) => {
    bookmarkResults = [];
    if(searchText) bookmarkResults = results;
    chrome.history.search({maxResults:20,text: searchText}, (results) => {
      historyResults = [];
      if(searchText) historyResults = results;
      renderResults();
    });
  });  
}

function onSearchSubmit(e){
  e.preventDefault();
  var currentLink = _$(".result.active a");
  if(currentLink) currentLink.click();
}

function renderResultLink(obj){
  return `<div class="result"><a href="${obj.url}"><p>${obj.title}</p><p>${obj.url}</p></a></div>`;
}

function renderResults(){
  var html = "";
  if(bookmarkResults.length){
    html += "<h3>Bookmarks</h3>";
    bookmarkResults.slice(0,10).forEach((r) => {
      html += renderResultLink(r);
    });
  }
  if(historyResults.length){
    html += "<h3>History</h3>";
    historyResults.slice(0,10).forEach((r) => {
      html += renderResultLink(r);
    });
  }
  if(!(bookmarkResults.length + historyResults.length)){
    if(topSites){    
      html += "<h3>Top Sites</h3>";
      topSites.slice(0,10).forEach((r) => {
        html += renderResultLink(r);
      });
    }
  }
  _$(".results").innerHTML = html;
  _$(".results .result").classList.add("active");
}




