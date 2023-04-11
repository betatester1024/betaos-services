"use strict";
function onLoad() {
  document.getElementById("header").innerHTML = "Support: #" + document.URL.match("\\?room=(.*)")[1];
  ROOMNAME = document.URL.match("\\?room=(.*)")[1];
}
function sendMsg() {
  let inp = document.getElementById("msgInp");
  let match = inp.value.match("!alias @(.+)");
  if (match)
    send(JSON.stringify({ action: "realias", data: { alias: match[1] } }), (res) => {
      if (res.status != "SUCCESS")
        alertDialog("ERROR: " + res.data.error, () => {
        });
      else
        alertDialog("Updated alias!", () => {
        });
    });
  else
    send(JSON.stringify({ action: "sendMsg", data: { msg: inp.value, room: ROOMNAME } }), () => {
    });
  inp.value = "";
}
let LOADEDQ2 = false;
const rmvReg = /(>|^)\-(.+)\([0-9]\)>/gm;
const addReg = /(>|^)\+(.+)\([0-9]\)>/gm;
const classStr = ["error", "user", "admin", "superadmin"];
async function initClient() {
  try {
    console.log("Starting client.");
    const source = new EventSource("/stream?room=" + document.URL.match("\\?room=([0-9a-zA-Z\\-_]{1,20})$")[1]);
    source.addEventListener("message", (message) => {
      console.log("Got", message);
      ele = document.getElementById("userList");
      let modif = message.data;
      let removed = rmvReg.exec(modif);
      let added = addReg.exec(modif);
      while (removed || added) {
        if (removed) {
          ele.innerText = ele.innerText.replace(removed[2] + "\n", "");
        }
        if (added) {
          ele.innerText += added[2] + "\n";
        }
        modif = modif.replaceAll(rmvReg, "");
        modif = modif.replaceAll(addReg, "");
        removed = modif.match(rmvReg);
        added = modif.match(addReg);
      }
      ele = document.getElementById("msgArea");
      let scrDistOKQ = ele.scrollTop >= ele.scrollHeight - ele.offsetHeight - 100;
      let msgs = modif.split(">");
      for (let i = 0; i < msgs.length; i++) {
        let matches = msgs[i].match(/\[(.+)\]\(([0-9])\)(.*)/);
        if (!matches)
          continue;
        let newMsgBody = document.createElement("p");
        let newMsgSender = document.createElement("b");
        newMsgSender.innerText = matches[1];
        newMsgSender.className = classStr[matches[2]];
        ele.appendChild(newMsgSender);
        newMsgBody.className = classStr[matches[2]];
        let msg = matches[3];
        for (let i2 = 0; i2 < replacements.length; i2++) {
          msg = msg.replaceAll(`:${replacements[i2].from}:`, ">EMOJI" + replacements[i2].to + ">");
        }
        let split = msg.split(">");
        let out = "";
        for (let i2 = 0; i2 < split.length; i2++) {
          if (i2 % 2 == 0) {
            let fragment = document.createElement("p");
            fragment.className = classStr[matches[2]];
            fragment.innerText = split[i2].replaceAll("&gt;", ">");
            ele.appendChild(fragment);
          } else {
            let pref = split[i2].match("^(EMOJI|LINK)")[1];
            let post = split[i2].match("^(EMOJI|LINK)(.+)")[2];
            if (pref == "EMOJI") {
              let replaced = document.createElement("span");
              replaced.title = ":" + findReplacement(post) + ":";
              replaced.className = "material-symbols-outlined supportMsg " + classStr[matches[2]];
              replaced.innerText = post;
              ele.appendChild(replaced);
            }
          }
        }
        ele.appendChild(document.createElement("br"));
        document.getElementById("placeholder").style.display = "none";
      }
      if (!LOADEDQ2 || scrDistOKQ) {
        ele.scrollTop = ele.scrollHeight;
        LOADEDQ2 = true;
      }
    });
  } catch (e) {
    console.log("Restartng client (" + e + ")");
    setTimeout(initClient, 0);
  }
}
const replacements = [
  { from: "one", to: "counter_1" },
  { from: "two", to: "counter_2" },
  { from: "three", to: "counter_3" },
  { from: "four", to: "counter_4" },
  { from: "five", to: "counter_5" },
  { from: "six", to: "counter_6" },
  { from: "seven", to: "counter_7" },
  { from: "eight", to: "counter_8" },
  { from: "nine", to: "counter_9" },
  { from: "zero", to: "counter_0" },
  { from: "white_check_mark", to: "check_circle" },
  { from: "active", to: "check_circle" },
  { from: "info", to: "info" },
  { from: "confirm", to: "check" },
  { from: "warn", to: "warning" },
  { from: "error", to: "error" },
  { from: "egg", to: "egg_alt" }
];
function findReplacement(thing) {
  for (let i = 0; i < replacements.length; i++) {
    if (replacements[i].to == thing)
      return replacements[i].from;
  }
}
//# sourceMappingURL=support.js.map
