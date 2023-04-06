"use strict";
function globalOnload() {
  document.onkeydown = keydown;
}
function send(params, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "server", true);
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (failureTimeout)
        clearTimeout(failureTimeout);
      else
        closeAlert(true);
      failureTimeout = null;
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send(params);
  if (failureTimeout)
    clearTimeout(failureTimeout);
  failureTimeout = setTimeout(() => alertDialog(`This is taking longer than expected.`, () => {
  }, 1, params), 1e3);
}
let failureTimeout;
let dialogQ = false;
let cbk = () => {
};
let BLOCKCALLBACK = false;
function alertDialog(str, callback, button = -1, failedReq = "") {
  let ele = document.getElementById("overlay");
  let p = document.getElementById("alerttext");
  if (!ele || !p) {
    console.log("ERROR: Alert dialogs not enabled in this page.");
    return;
  }
  ele.style.top = "0vh";
  dialogQ = true;
  cbk = callback;
  p.innerText = str;
  if (button == 1) {
    p.innerHTML += `<button class='btn szThird fssml' onclick='location.reload()'>Refresh?
    <div class="anim"></div></button>`;
    console.log("Failed request: " + failedReq);
    BLOCKCALLBACK = true;
  } else if (button == 2) {
    p.innerHTML += `<br>
    <p class="fssml gry nohover"> [Press any key or click 'Continue' below to confirm] </p>
    <button class='btn szFull red fssml cancel' onclick='closeAlert(true)'>
    <span class="material-symbols-outlined">cancel</span>Cancel
    <div class="anim"></div></button>`;
    console.log("Confirm speedbump");
  }
  if (failureTimeout)
    clearTimeout(failureTimeout);
  failureTimeout = null;
}
function closeAlert(overrideCallback = false) {
  let ele = document.getElementById("overlay");
  ele.style.top = "500vh";
  dialogQ = false;
  if (cbk && !overrideCallback && !BLOCKCALLBACK)
    cbk();
}
function keydown() {
  if (dialogQ) {
    console.log("CLOSED DIALOG");
    if (BLOCKCALLBACK)
      console.log("CALLBACK HAS BEEN BLOCKED");
    else
      closeAlert();
    BLOCKCALLBACK = false;
  }
}
function toTime(ms) {
  let day = Math.floor(ms / 1e3 / 60 / 60 / 24);
  ms = ms % (1e3 * 60 * 60 * 24);
  let hr = Math.floor(ms / 1e3 / 60 / 60);
  ms = ms % (1e3 * 60 * 60);
  let min = Math.floor(ms / 1e3 / 60);
  ms = ms % (1e3 * 60);
  let sec = Math.floor(ms / 1e3);
  if (ms < 0)
    return "00:00:00";
  return (day > 0 ? day + "d " : "") + padWithZero(hr) + ":" + padWithZero(min) + ":" + padWithZero(sec);
}
function padWithZero(n) {
  return n < 10 ? "0" + n : n;
}
//# sourceMappingURL=utils.js.map