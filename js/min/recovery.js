"use strict";var globalEvent,sourceWindow,globalButtonSet={},recoveryTabs={},forms={},element={},currentTab="tab-main",tabHistory=[],tabHistoryIndex=-1,actions=[],finishedActs=0;function updateWebMP(source){switchTo("tab-update"),actions.push("update"),sourceWindow=source}function switchTo(target,dontAddToHistory){Array.from(document.getElementsByClassName("tab")).forEach(e=>{e.id!=target?e.style.display="":e.style.display="block"}),currentTab=target,dontAddToHistory||(tabHistory.push(target),tabHistoryIndex++),tabHistoryIndex>0&&(globalButtonSet.prev.className="universal-button")}function switchBack(target){tabHistoryIndex>0&&(Array.from(document.getElementsByClassName("tab")).forEach(e=>{e.id!=tabHistory[tabHistoryIndex-1]?e.style.display="":e.style.display="block"}),currentTab=tabHistory[tabHistoryIndex-1],tabHistoryIndex--),tabHistoryIndex<=0&&(globalButtonSet.prev.className="universal-button-disabled")}function actActions(){actions.forEach((e,i,a)=>{switch(e){case"update":{let keys=[];for(let c=0;c<localStorage.length;c++)keys.push(localStorage.key(c));keys.forEach(e=>{if(0==e.indexOf("WEBMPF:")){let object=JSON.parse(localStorage.getItem(e));object.currentVolume&&(object.currentVolume=void 0),localStorage.setItem(e,JSON.stringify(object))}}),localStorage.setItem("WEBMPS:versionString","1.0"),element.output.innerHTML+="Data structure update OK.<br/>";break}}element.progress.style.width=(100/a.length*(i+1)).toString()+"%"}),element.output.innerHTML+="Operations finished. Click next to close recovery and refresh WebMP.<br/>"}addEventListener("message",event=>{switch(globalEvent=event,console.log("MSG_RCVED"),event.data.action.toLowerCase()){case"update":updateWebMP(event.source)}}),document.addEventListener("readystatechange",function(){"interactive"==this.readyState.toLowerCase()&&(globalButtonSet.prev=document.querySelector("#btn-prev"),globalButtonSet.next=document.querySelector("#btn-next"),forms.mainAct=document.querySelector("#f-action"),self.element.output=document.querySelector("#final-out"),element.progress=document.querySelector(".progress-inner"),switchTo("tab-main"),new Promise(resolve=>{globalButtonSet.next.onclick=function(){switch(currentTab){case"tab-update":switchTo("tab-finalize"),actActions();break;case"tab-main":{let chosenAction=null;switch(Array.from(forms.mainAct.elements).forEach(e=>{e.checked&&(chosenAction=e.id)}),chosenAction){case"i-main-update":switchTo("tab-update"),actions.push("update")}break}case"tab-finalize":sourceWindow.postMessage({action:"reload"},"*"),window.close()}},globalButtonSet.prev.onclick=switchBack,resolve()}))});