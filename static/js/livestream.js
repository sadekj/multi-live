const WEBSOCKET_URL = "wss://ws.tzevaadom.co.il/socket?platform=WEB";
const NOTIFICATIONS_API_URL = "https://api.tzevaadom.co.il/notifications?";
const LISTS_VERSIONS_URL = "https://api.tzevaadom.co.il/lists-versions?";
const DEFAULT_CITIES_VERSION = 5;

function getThreatDrillTitle(t, isDrill) {
  const key = String(t) + "|" + String(isDrill);
  return {
    "-1|false": "דוגמה בלבד [שם האיום]",
    "-1|true": "דוגמה בלבד [שם האיום]",

    "0|false": "צופר - צבע אדום",
    "0|true": "תרגיל צבע אדום",

    "1|false": "אירוע חומרים מסוכנים",
    "1|true": "תרגיל חומרים מסוכנים",

    "2|false": "חשש לחדירת מחבלים",
    "2|true": "תרגיל חדירת מחבלים",

    "3|false": "רעידת אדמה",
    "3|true": "תרגיל רעידת אדמה",

    "4|false": "חשש לצונאמי",
    "4|true": "תרגיל צונאמי",

    "5|false": "חדירת כלי טיס עוין",
    "5|true": "תרגיל חדירת כלי טיס",

    "6|false": "חשש לאירוע רדיולוגי",
    "6|true": "תרגיל אירוע רדיולוגי",

    "7|false": "ירי בלתי קונבנציונלי",
    "7|true": "תרגיל ירי לא קונבנציונלי",

    "8|false": "התרעה",
    "8|true": "תרגיל התרעה",

    "9|false": "תרגיל פיקוד העורף",
    "9|true": "תרגיל פיקוד העורף",

    
    "-2|false": "צפויות להתקבל התרעות",
    "-2|true":"צפויות להתקבל התרעות" 
  }[key];
}
let MAX_ITEMS = Number(localStorage.getItem("LIVE_maxItems") || 12);

const maxAlertsElem = document.getElementById("maxAlerts");
maxAlertsElem.value = MAX_ITEMS;
maxAlertsElem.onchange = () => {
  MAX_ITEMS = Number(maxAlertsElem.value);
  localStorage.setItem("LIVE_maxItems", MAX_ITEMS);
  document.getElementById("main-alert-container").style.height = 44 + 6 + 30.5 * MAX_ITEMS + "px";
};
maxAlertsElem.onchange();

const transparentElem = document.getElementById("transparent");
transparentElem.onclick = () => {
  document.querySelector("html").style.background = transparentElem.checked
    ? "transparent"
    : "rgb(0, 255, 0)";
  localStorage.setItem("LIVE_transparent", transparentElem.checked);
};
const transparentSaved = localStorage.getItem("LIVE_transparent");
if (transparentSaved == "true" || (!transparentSaved && window.obsstudio)) {
  transparentElem.checked = true;
  transparentElem.onclick();
}

let isExampleAlertRuning = false;
async function exampleAlert() {
  if (isExampleAlertRuning) return;
  isExampleAlertRuning = true;

  // alert(
  //  "בעוד מספר שניות יופיעו בצד התרעות המשמשות לבדיקה ודוגמה בלבד המדמות התרעת אמת.\nמשך הבדיקה כדקה וחצי. הבדיקה תסתיים כאשר חלון ההתרעות יתנקה"
  // );

  await sleep(1000);

  getAlerts({
    threat: -1,
    cities: ["כפר עזה", "נחל עוז", "סעד"],
  });

  await sleep(10_000);

  getAlerts({
    threat: -1,
    cities: ["זמרת, שובה"],
  });

  await sleep(4000);

  getAlerts({
    threat: -1,
 //   cities: ["בית הגדי", "כפר מימון ותושיה", "נתיבות", "שוקדה", "תקומה", "תקומה וחוות יזרעם"],
//    cities: ["בית הגדי", "כפר מימון ותושיה", "נתיבות", "שוקדה", "תקומה", "תקומה וחוות יזרעם"],
     cities: ["בית הגדי", "כפר מימון ותושיה", "נתיבות", "שוקדה", "תקומה", "חוות יזרעם"],


 });

  await sleep(14000);

  getAlerts({
    threat: -1,
    cities: [
      "אשקלון - דרום",
      "אשקלון - צפון",
      "באר גנים",
      "ברכיה",
      "הודיה",
      "משען",
      "נגבה",
      "ניר ישראל",
    ],
  });

  await sleep(6000);

  getAlerts({
    threat: -1,
    cities: [
      "אזור תעשייה עד הלום",
      "אמונים",
      "בית עזרא",
      "גן יבנה",
      "חצור",
      "ניצן",
      "עזר",
      "עזריקם",
      "שדה עוזיהו",
      "שתולים",
    ],
  });

  isExampleAlertRuning = false;
}

var citiesList = { cities: {}, areas: {} };

const fetchAndCheckLists = async () => {
  const data = await fetch(LISTS_VERSIONS_URL).then(async (r) => r.json());
  return data;
};
const loadCities = async (listsVersions) => {
  if (!listsVersions) listsVersions = await fetchAndCheckLists().catch((z) => null);
  const citiesVersion = listsVersions.cities || DEFAULT_CITIES_VERSION;

  citiesList = JSON.parse(localStorage.getItem("citiesJSON") || "{}");
  if (
    (localStorage.getItem("citiesVersion") || -1) == citiesVersion &&
    citiesList != null &&
    citiesList != undefined &&
    typeof citiesList === "object" &&
    Object.keys(citiesList).length > 0
  ) {
    console.log("cities was loaded successfully from localStorge.");
  } else {
    // Load from server
    citiesList = await fetch("https://www.tzevaadom.co.il/static/cities.json?v=" + citiesVersion)
      .then((r) => r.json())
      .catch(() => {
        return {};
      });
    if (Object.keys(citiesList).length > 0) {
      localStorage.setItem("citiesJSON", JSON.stringify(citiesList));
      localStorage.setItem("citiesVersion", citiesVersion);
      console.log("cities was loaded successfully from server.");
    }
  }
};

//array util
function chunkArrayInGroups(arr, size) {
  var myArray = [];
  for (var i = 0; i < arr.length; i += size) {
    myArray.push(arr.slice(i, i + size));
  }
  return myArray;
}
function equalArrays(one, two) {
  if ((one.length == 0 && two.length == 0) || one.length != two.length) return false;
  var same = true;
  one.forEach((a, i) => {
    if (a != two[i]) same = false;
  });
  return same;
}
//array util

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const container = document.getElementById("ul-container");

function createRow(content, animate) {
  const rowid = Math.random();
  container.innerHTML += ` <li class="area-container ${
    animate ? "animate" : ""
  }" id="container-row-${rowid}" style="width: 100%; opacity: 1">
                            <div
                              class="area-text ${animate ? "animate" : ""}"
                              id="row-${rowid}"
                              style="opacity: 1; transform: translateY(0%) translateZ(0px)"
                            >${content}</div>`;
  setTimeout(
    (rowid) => {
      document.getElementById("container-row-" + rowid).className = "area-container";
      document.getElementById("row-" + rowid).className = "area-text";
    },
    500,
    Number(rowid)
  );
  return rowid;
}

function editRow(rowid, content, animated = true) {
  const elem = document.getElementById(`row-${rowid}`);
  if (elem.innerHTML == content) return;
  elem.innerHTML = content;
  document.getElementById(`row-${rowid}`).classList.add("animate");
  if (animated)
    setTimeout(() => {
      document.getElementById(`row-${rowid}`).classList.remove("animate");
    }, 500);
}

//function removeRow(rowid) {
//  const ele = document.getElementById(`container-row-${rowid}`);
//  ele.className = "area-container dismiss-animate";
//  setTimeout(() => ele.parentNode.removeChild(ele), 500);
//}

function removeRow(rowid) {
    let ele = document.getElementById(`container-row-${rowid}`);
    ele.className = "area-container dismiss-animate";
    setTimeout( () => {
        ele = document.getElementById(`container-row-${rowid}`);
        ele.remove()
    }, 500);
}

let prevDisplayed = {};
let activeRowIds = [];
var lastAreas = [];
let isRuningEmergency = false;
let emergencyInterval;

const headerElement = document.getElementById("header");
function hideHeader() {
  headerElement.classList.remove("show");
  headerElement.classList.add("dismiss");

  const now = Date.now();
  //fix leading
  setTimeout(() => {
    if (lastRecvAlertTime > now) return;
    container.innerHTML = "";
  }, 1100);
}

function showHeader() {
  headerElement.classList.remove("dismiss");
  headerElement.classList.add("show");
}
const runEmergencyMode = async () => {
  for (let index = activeRowIds.length; index < MAX_ITEMS; index++) {
    activeRowIds.push(createRow("", true));
  }

  const chunks = chunkArrayInGroups(lastAreas, MAX_ITEMS);
  for (const chunk of chunks) {
    if (!isRuningEmergency) return;

    activeRowIds.slice(0, chunk.length).forEach((rid, idx) => editRow(rid, chunk[idx].cityHE));
    await sleep(2000);
  }
  if (!isRuningEmergency) return;
  runEmergencyMode();
};

function updateHeaderTitle(c) {
  document.getElementById("header-title").innerHTML = c
    .map((z, idx) => (c.length == 2 && idx == 0 ? z + " /" : z))
    .join("<br>");
}

function sendAlert(areas) {
  lastAreas = areas;

  if (areas.length > MAX_ITEMS) {
    if (!isRuningEmergency) {
      showHeader();
      isRuningEmergency = true;
      runEmergencyMode();
    }
    return;
  } else if (isRuningEmergency) {
    isRuningEmergency = false;
    if (areas.length == 0) {
      activeRowIds.forEach((rid) => removeRow(rid));
      activeRowIds = [];
      prevDisplayed = {};
      hideHeader();
      return;
    }

    prevDisplayed = {};

    const toRemove = activeRowIds.length - areas.length;
    if (toRemove > 0) {
      for (let index = 0; index < toRemove; index++) {
        removeRow(activeRowIds[activeRowIds.length - 1]);
        activeRowIds.pop();
      }
    }

    for (let index = 0; index < areas.length; index++) {
      editRow(activeRowIds[index], areas[index].cityHE);
      prevDisplayed[areas[index].key] = activeRowIds[index];
    }
  }

  for (const a of areas) {
    if (!prevDisplayed.hasOwnProperty(a.key)) {
      prevDisplayed[a.key] = createRow(a.cityAR, true);
      activeRowIds.push(prevDisplayed[a.key]);
    } else {
    }
  }

  for (const a in prevDisplayed) {
    if (!areas.find((z) => z.key == a)) {
      removeRow(prevDisplayed[a]);
      //activeRowIds.splice(activeRowIds.indexOf(prevDisplayed[a], 1));
      activeRowIds = activeRowIds.filter((w) => w !== prevDisplayed[a]);
      delete prevDisplayed[a];
    }
  }

  if (activeRowIds.length != 0) {
    showHeader();
  } else {
    hideHeader();
  }
}

function updateServerStatus(s) {
  document.getElementById("server-status").innerHTML = s;
}

let runBackupAPI = false;

async function backupAPI() {
  if (!runBackupAPI) return;
  const result = await fetch(NOTIFICATIONS_API_URL)
    .then(async (r) => await r.json())
    .catch(() => {
      if (!runBackupAPI) return;

      updateServerStatus("שגיאה בחיבור לשרת משני");
      return null;
    });

  if (result == null || !runBackupAPI) return;

  result.forEach((r) => getAlerts(r));
  updateServerStatus("מחובר לשרת משני");
  setTimeout(backupAPI, 3000);
}

function WSConnection() {
  var ws = new WebSocket(WEBSOCKET_URL);

  ws.onmessage = (m) => {
    if (typeof m.data != "string") return;
    const { type, data } = JSON.parse(m.data);
    switch (type) {
      case "ALERT":
        getAlerts(data);
        break;
      case "LISTS_VERSIONS":
        loadCities(data);
        break;
      case "SYSTEM_MESSAGE":
        handleSystemMessage(data);
        break;
    }
  };

  let isReconnecting = false;
  const handleReconnect = () => {
    ws.close();
    if (isReconnecting) return;
    isReconnecting = true;

    if (!runBackupAPI) {
      runBackupAPI = true;

      backupAPI();
    }
    setTimeout(WSConnection, 5000);
  };

  ws.onopen = (e) => {
    console.log("ws connected");
    runBackupAPI = false;
    updateServerStatus("מחובר לשרת ראשי");
  };

  ws.onclose = (e) => {
    console.log("ws closed");
    handleReconnect();
  };
  ws.onerror = (e) => {
    console.log("ws errored");
    handleReconnect();
  };
}

class City {
  constructor(cityValue, threat = 0, isDrill = false, timestamp = 0) {
    this.value = cityValue;
    this.threat = threat;
    if (!(this.threat >= -1 && this.threat <= 9) && !this.threat == -2) {
      this.threat = 8;
    }

    if (
      this.threat != -1 &&
      this.threat != 0 &&
      this.threat != 9 &&
      this.threat != 7 &&
      this.threat != -2 &&
      this.threat != 8
    ) {
      this.countdown = 60;
    }

    if (this.threat == -2)
      this.countdown = 3 * 60;

    this.isDrill = isDrill || false;
    this.timestamp = timestamp;
    var item;
    try {
      item = citiesList.cities[cityValue] || null;
    } catch (error) {}
    if (!item) {
      this.cityHE = cityValue;
      this.cityEN = cityValue;
      this.cityES = cityValue;
      this.cityAR = cityValue;
      this.cityRU = cityValue;
      this.countdown = 45;
      this.lat = 0;
      this.lng = 0;
      this.id = -1;
      this.areaID = -1;
      this.key = Math.random();
    } else {
      this.cityHE = item.he;
      this.cityEN = item.en;
      this.cityES = item.es;
      this.cityAR = item.ar;
      this.cityRU = item.ru;
      if (!this.countdown) this.countdown = item.countdown;
      this.lat = item.lat;
      this.lng = item.lng;
      this.id = item.id;
      this.areaID = item.area;
      this.key = Math.random();
    }

    this.title = getThreatDrillTitle(this.threat, this.isDrill);

    this.getCountdown = function () {
      var nowTime = Math.floor(Date.now() / 1000);
      return Math.max(
        (this.countdown == 0 ? 15 : this.countdown) + 10 - (nowTime - this.timestamp),
        0
      );
    };
  }
}

var currentCities = [];
var rcvNotificationIds = [];
function getAlerts({ cities, isDrill, threat, notificationId }) {
  if (!notificationId) notificationId = String(Math.random());
  if (!isDrill) isDrill = false;
  if (typeof threat == "undefined") threat = 8;

  if (rcvNotificationIds.includes(notificationId)) return;
  rcvNotificationIds.push(notificationId);
  if (rcvNotificationIds.length > 100) rcvNotificationIds.shift();

  lastRecvAlertTime = Date.now();

  const cities_ = cities.map(
    (cityValue) => new City(cityValue, threat, isDrill, Math.floor(Date.now() / 1000))
  );
  currentCities = currentCities.concat(cities_);

  updateData(cities_);
}




function handleSystemMessage(data){
    if (!data.instruction || !data.areasIds) return;


  const areasNames = []
  for (let id of data.areasIds) {
    if (citiesList.areas[id])
      areasNames.push("אזור " + citiesList.areas[id].he)
  }

  if (!areasNames.length) return;

  getAlerts({cities: areasNames, threat: -2})
}

let lastRecvAlertTime = 0;
var lastData = [];
var interval;
var titles = [];
var threatsChangeingInterval = false;

async function updateThreats() {
  const chunks = chunkArrayInGroups(titles, 2);
  for (let index = 0; index < chunks.length; index++) {
    const element = chunks[index];
    if (!threatsChangeingInterval) return;
    updateHeaderTitle(element, titles.length);
    if (index != chunks.length - 1) await sleep(2000);
  }

  if (!threatsChangeingInterval) return;

  setTimeout(updateThreats, 2000);
}

async function updateData() {
  // Filter list by countdown & alert's timestamp
  titles = [];
  currentCities = currentCities.filter((city) => {
    if (!titles.includes(city.title)) titles.push(city.title);
    return city.getCountdown() > 0;
  });

  if (titles.length <= 2) {
    updateHeaderTitle(titles, titles.length);
    threatsChangeingInterval = false;
  } else if (titles.length > 2) {
    if (!threatsChangeingInterval) {
      threatsChangeingInterval = true;
      updateThreats();
    }
  }

  if (currentCities.length == 0) {
    sendAlert([]);
    titles = [];
    threatsChangeingInterval = false;
    clearInterval(interval);
    interval = null;
    return;
  }

  if (interval == null)
    interval = setInterval(() => {
      updateData(false);
    }, 1000);

  if (!equalArrays(currentCities, lastData)) {
    sendAlert(currentCities);
  }

  lastData = currentCities;
}

async function main() {
  await loadCities().catch((z) => z);
  WSConnection();
}

document.onkeypress = function (e) {
  e = e || window.event;
  // use e.keyCode
  if (e.keyCode == 13) {
    exampleAlert();
  }
};

main();
