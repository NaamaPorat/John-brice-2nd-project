// משתנים גלובליים
var allCoinsListArray = new Array();
var coinsListArray = new Array();
var moreInfoArray = new Array();
var coinsSymbols = new Array();
var toggledcoins = new Array();
var aboutHtml = "";

//On Load
$(function () {
  // גיף טעינה
  $("#upperDiv").show();
  // יצירת המערכים השונים והדפסה ראשונית
  // גם מדפיס את הכרטיסים הראשוניים
  fillArrays();

  // כפתור חיפוש
  $("#searchButton").on(`click`, function () {
    searchCoin();
  });
  $("#searchInput").on("keypress", function (e) {
    if (e.keyCode === 13) {
      searchCoin();
    }
  });
  // השלמה אוטומטית
  $("#searchInput").autocomplete({
    source: coinsSymbols,
  });
  // טעינת דף הבית בלחיצה
  $("#homeBtn").on(`click`, function () {
    goToHome();
  });
  // טעינת דף about בלחיצה
  $("#aboutBtn").on(`click`, function () {
    goToAbout();
  });
  // (ולידציה) העלאת הדוח בלחיצה
  $("#liveReportBtn").on(`click`, function () {
    if (toggledcoins.length === 0) {
      $(`#massageModalTitle`).html("Pick at least 1 coin ");
      $(`#massageModalDiv`).modal("show");
      goToHome();
    } else {
      goToLiveReport();
    }
  });

  // כפתור ניקוי רשמית הטוגלים

  $("#clearBtn").on(`click`, function () {
    clearToggleList();
  });
});

/***********/ ////////////////////////////////פונקציות כלליות///////////////////////////////////***********/
//   כללית AJAX פניית
function getAjax(url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      success: (data) => resolve(data),
      error: (err) => reject(err),
    });
  });
}

// הדפסת כרטיסים
function printCard(coinsArray) {
  let htmlToBe = "";
  coinsArray.forEach((coin) => {
    htmlToBe += `
    <div class="cardContainer">
    <div class="card text-center coinCard" >
    <div class="card-header">
    <h5 class="card-title">${coin.symbol}</h5>
    <div class="custom-control custom-switch ">
    <input type="checkbox"
      data-toggle="toggle" 
     data-onstyle="secondary"
     data-offstyle="light"
     data-width="30" 
     data-height="5"
     data-style="ios"
     class="toggleButton"
    id="toggle${coin.id}">

    </div>
    </div>
    <div class="card-body">
    <p class="card-text">${coin.name}</p>
    <p>
    <button
    class="btn btn-outline-secondary btn-sm moreInfoBtn"
    id="${coin.id}"
    onclick="showMoreInfo(this)"
    type="button"
    data-toggle="collapse"
    data-target="#coll${coin.id}"
    aria-expanded="false"
    aria-controls="coll${coin.id}"
    >
    More Info
    </button>
    <div class="collapse moreInfoCollapse" id="coll${coin.id}">
      <img id="${coin.id}Throbber" class= "cardThrobber" src="Utilities/unnamed.gif" />
    </div>
    </div>
    </div>
    </p>
    </div>`;
  });
  $("#cardDeck").html(htmlToBe);
  $("#upperDiv").hide();
  $("#cardDeck").show();
  for (let toggle of toggledcoins) {
    $(`#toggle${toggle.id}`).bootstrapToggle("on");
  }
  toggleDivFiller();
  toggle();
}

/***********/ ////////////////////////////פונקציות מפונקציית הטעינה/////////////////////////////***********/

// מלוי רשימת המטבעות להדפסה (50 נבחרים),
//  רשימת הסימבולים (בשביל השלמת החיפוש)
// ורשמית כל המטבעות בשביל פעולת החיפוש
// כדי שאפשר יהיה למצוא גם מטבעות שלא מופיעים כרגע
async function fillArrays() {
  const coinsFromApi = await getAjax(
    "https://api.coingecko.com/api/v3/coins/list"
  );

  coinsFromApi.forEach((coin) => {
    allCoinsListArray.push(coin);
    coinsSymbols.push(coin.symbol);
  });

  const apiResponse = await getAjax("https://api.coingecko.com/api/v3/coins");
  coinsListArray = apiResponse;
  printCard(coinsListArray);
}

// חיפוש///////////////////////////////////////////
// כפתור חיפוש (ולידציה לפני חיפוש)
function searchCoin() {
  let typedCoin = $("#searchInput").val().toLowerCase();
  //   ולידציה (שנכתבו אותיות ומספרים)
  if (typedCoin === "" || typedCoin.length === 0) {
    $(`#massageModalTitle`).html("You searched nothing!");
    $(`#massageModalDiv`).modal("show");
  } else {
    $("#cardDeck").hide();
    $("#upperDiv").html(`
    <img id="throbber" class= "throbber" src="Utilities/giphy.gif" />
    `);
    $("#upperDiv").show();
    $("#aboutDiv").hide();

    search(typedCoin);
  }
}

// פונקציית חיפוש
function search(typedCoin) {
  let searchedFilterArray = [];
  for (const coin of allCoinsListArray) {
    if (coin.symbol.includes(typedCoin)) {
      searchedFilterArray.push(coin);
    }
  }

  if (searchedFilterArray.length > 0) {
    printCard(searchedFilterArray);
    $("#searchInput").val("");
  } else {
    $("#massageModalTitle").html(`
    No results, try again
    `);
    $(`#massageModalDiv`).modal("show");
    $("#upperDiv").hide();
    $("#cardDeck").show();
  }
}
// טעינת דפים אחרים/////////////////////////////
//טעינת דף הבית
function goToHome() {
  cleanChart();

  $("#upperDiv").html(`
  <img id="throbber" class= "throbber" src="Utilities/giphy.gif" />
  `);
  $("#upperDiv").show();
  $("#aboutDiv").hide();
  $("#chartContainer").hide();
  $("#clearBtnDiv").show();

  printCard(coinsListArray);
}
// טעינת אודות
async function goToAbout() {
  cleanChart();
  toggleDivFiller();
  $("#upperDiv").html(`
  <img id="throbber" class= "throbber" src="Utilities/giphy.gif" />
  `);
  $("#upperDiv").show();
  $("#cardDeck").hide();
  $("#chartContainer").hide();
  $("#clearBtnDiv").show();

  if (aboutHtml === "") {
    aboutHtml = await getAjax("about.html");
  }
  $("#aboutDiv").html(aboutHtml);
  $("#aboutDiv").show();
  $("#upperDiv").hide();
}
// טעינת דוח
function goToLiveReport() {
  $("#upperDiv").html(`
  <img id="throbber" class= "throbber" src="Utilities/giphy.gif" />
  `);
  $("#upperDiv").show();
  $("#aboutDiv").hide();
  $("#cardDeck").hide();
  $("#clearBtnDiv").hide();
  $("#chartContainer").show();
  $(`#toggledCoins`).html("");
  liveReport();
}

// איפוס טוגלים
function clearToggleList() {
  toggledcoins = [];
  toggleDivFiller();
  $(`.toggleButton`).bootstrapToggle("off");

  console.log(toggledcoins);
}
/***********/ ////////////////////////////פונקציות נוספות/////////////////////////////***********/

//More info////////////////////////////////////

// הבאת המידע הנוסף (מופעלת בכפתור)ויסות פעולות
function showMoreInfo(thisBtn) {
  const thisId = thisBtn.id;
  let storedMoreInfoArray = localStorage.getItem("storedMoreInfoArray");
  // האם קיים משהו בסטורג
  storedMoreInfoArray === null
    ? (moreInfoArray = [])
    : (moreInfoArray = JSON.parse(storedMoreInfoArray));

  // האם המטבע הרלוונטי קיים כבר בסטורג
  const coinIndexInArray = moreInfoArray.findIndex(
    (coin) => coin.id === thisId
  );

  //  אם קיים אבל עברו 2 דקות - תמחק מה שקיים בזיכרון וצור חדש ותדפיס
  if (
    coinIndexInArray !== -1 &&
    isOverTwoMin(moreInfoArray[coinIndexInArray].timeCoinWasAdded) === true
  ) {
    removeCoinFromeStorage(coinIndexInArray);
    addCoinInfoToStorageAndPrint(thisId);
  }
  // אם המטבע לא קיים - וצור חדש ותדפיס
  else if (coinIndexInArray === -1) {
    addCoinInfoToStorageAndPrint(thisId);
  }
  // קיים ולא יותר מ-2 דקות - תדפיס מה שיש בזיכרון
  else {
    fillCollapseWithInfo(moreInfoArray[coinIndexInArray]);
  }

  // החלפת כיתוב הכפתור
  changeButtonText(thisBtn);

  // עדכון הסטורג
  newMoreInfoArray = JSON.stringify(moreInfoArray);
  localStorage.setItem("storedMoreInfoArray", newMoreInfoArray);
}
// הכנסת מטבע חדש לזיכרון ושליחה להדפסה
async function addCoinInfoToStorageAndPrint(id) {
  const coinInfo = await getAjax(
    `https://api.coingecko.com/api/v3/coins/${id}`
  );

  const newCoinToStorage = {
    id: id,
    coinInfo: coinInfo,
    timeCoinWasAdded: new Date().getTime(),
  };
  // הדפסה (לפני הוספה לסטורג, כדי שהמשתמש יחכה פחות)
  fillCollapseWithInfo(newCoinToStorage);

  moreInfoArray.push(newCoinToStorage);
  const newMoreInfoArray = JSON.stringify(moreInfoArray);
  localStorage.setItem("storedMoreInfoArray", newMoreInfoArray);
}
// מילוי הקולפס
function fillCollapseWithInfo(coinObject) {
  let MoreInfoHtmlToBe = `
    <div class="col-12">
    <img class="card-img-top moreInfoImg" 
    src="${coinObject.coinInfo.image.large}" alt="Card image cap">
    </div>
    <p class= "collapseP">
    <span>${coinObject.coinInfo.market_data.current_price.usd} $</span><br>
    <span>${coinObject.coinInfo.market_data.current_price.eur} €</span><br>
    <span>${coinObject.coinInfo.market_data.current_price.ils} ₪</span>
    </p>`;
  $(`#coll${coinObject.coinInfo.id}`).html(MoreInfoHtmlToBe);
}
// בדיקה האם עברו 2 דקות
function isOverTwoMin(timeCoinWasAdded) {
  const nowTime = new Date().getTime();
  const difference = nowTime - timeCoinWasAdded;
  const resultInMinutes = difference / 60000;
  return resultInMinutes >= 2 ? true : false;
}
// מחיקה מהסטורג
function removeCoinFromeStorage(coinIndexInArray) {
  moreInfoArray.splice(coinIndexInArray, 1);
}
// החלפת כיתוב הכפתור
function changeButtonText(btn) {
  if (btn.innerText === "More Info") {
    btn.innerText = "Less Info";
    btn.classList.remove("btn-outline-secondary");
    btn.classList.add("btn-secondary");
  } else {
    btn.innerText = "More Info";
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-outline-secondary");
  }
}

//טוגלים//////////////////////////////////////

function toggle() {
  allCoinsListArray.forEach((coin) => {
    const thisName = coin.name;
    const thisId = coin.id;
    const thisSymbol = coin.symbol;
    $(`#toggle${thisId}`).bootstrapToggle();
    $(`#toggle${thisId}`).on(`change`, function () {
      // כשמסמנים טוגל
      if ($(this).prop("checked")) {
        toggledcoins.push({
          id: thisId,
          name: thisName,
          symbol: thisSymbol,
        });
        toggleDivFiller();
        // כשמורידים סימון
      } else {
        toggleOff(thisId);
        toggleDivFiller();
      }
      // הגבלה לחמש - מילוי והקפצה של המודל
      if (toggledcoins.length > 5) {
        let modalHtmlToBe = "";
        for (let i = 0; i < toggledcoins.length; i++) {
          modalHtmlToBe += `
          <br>
          <div class="modalRow col-12">
          <h5 class=" modalH5">${toggledcoins[i].id} (${toggledcoins[i].symbol})</h5>
          <div class=" custom-control custom-switch modalInputDiv">
          <input type="checkbox" checked class="custom-control-input modaInput" onclick="toggleOffModal(this)" id="${toggledcoins[i].name}">
          <label class="custom-control-label" for="${toggledcoins[i].name}"></label>
          </div>
          </div>
    `;
        }

        $(`#toggleModal`).html(modalHtmlToBe);
        $("#modalDiv").modal({ backdrop: "static" });
        $(`#modalDiv`).modal("show");
      }
    });
  });
}

//  הורדה מהרשימה
function toggleOff(thisId) {
  const index = toggledcoins.findIndex(({ id }) => id === thisId);
  toggledcoins.splice(index, 1);
}

// הורדה מהרשימה דרך המודל
function toggleOffModal(btn) {
  const offObject = toggledcoins.find((Object) => btn.id === Object.name);
  $(`#toggle${offObject.id}`).bootstrapToggle("off");
  $(`#modalDiv`).modal("hide");
}

// מילוי דיב טוגלים
function toggleDivFiller() {
  let toggleDivHtmlToBe = ``;
  if (toggledcoins.length > 0) {
    toggleDivHtmlToBe = `Toggled Coins: <br> `;
  }

  for (let i = 0; i < toggledcoins.length; i++) {
    toggleDivHtmlToBe += `${i + 1}. <b>${toggledcoins[
      i
    ].symbol.toUpperCase()}</b>  `;
  }
  $("#toggledCoins").html(toggleDivHtmlToBe);
}
///דוח//////////////////////////////////////
var reportInterval = "";
function liveReport() {
  // יצירת הפנייה לאג'קס
  let coinString = "";
  for (let coin of toggledcoins) {
    coinString += coin.symbol + ",";
  }

  let currencyArr = [];
  async function currentPrice() {
    currencyArr = [];
    let api = await getAjax(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinString}&tsyms=USD`
    );
    try {
      let data = [];
      data.push(api);
      for (let coin of data) {
        for (let p in coin) {
          currencyArr.push(coin[p].USD);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  currentPrice();
  // נתוני הדוח
  var options = {
    zoomEnabled: true,
    title: { text: "Coin Comparison" },
    axisY: { prefix: "$" },
    toolTip: { shared: true },
    legend: {
      cursor: "pointer",
      verticalAlign: "top",
      fontSize: 22,
      fontColor: "dimGrey",
      itemclick: toggleDataSeries,
    },
    data: [],
  };
  var chart = new CanvasJS.Chart("chartContainer", options);

  for (coin of toggledcoins) {
    options.data.push({
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "$####.00",
      xValueFormatString: "hh:mm:ss",
      showInLegend: true,
      name: coin.id,
      dataPoints: [],
    });
  }

  function toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    chart.render();
  }

  async function updateChart() {
    let notReportableCoins = [];
    await currentPrice();
    for (let i = 0; i < toggledcoins.length; i++) {
      let coin = options.data[i].dataPoints;
      let currentTime = new Date().getTime();
      if (typeof currencyArr[i] === "number") {
        coin.push({
          y: currencyArr[i],
          x: currentTime,
        });
        // חלק מהסימבולים מחזירים אנדיפיינד - במקרה כזה, ליידע את המשתמש
      } else {
        notReportableCoins.push(toggledcoins[i].symbol.toUpperCase());
        $(`#upperDiv`).html(`Cannot show ${notReportableCoins} at the moment`);
        $(`#upperDiv`).show();
      }
    }
    $(`#throbber`).hide();
    chart.render();
  }
  chart.render();
  updateChart();

  // יציאת אינטרואל
  reportInterval = setInterval(() => updateChart(), 2000);
}
// עצירת אינטרואל
function cleanChart() {
  clearInterval(reportInterval);
}
