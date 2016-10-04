
var currencyParamsObject = {
    callback : "proceedCurrencyData",
    source : "USD"
}

var currenciesMultipliers;
var currentMultiplier = 1;
var conversionOutputWindow;
var numberOfDecimals = 2;

window.onload = function() {
    conversionOutputWindow = document.getElementById("conversionResult");
}

function loadCurrencies() {
    var url = "http://www.apilayer.net/api/live?access_key=21ce29940e9ea8ebb6fb15f517bf2b71&format=1&callback=" + currencyParamsObject.callback + "&source=" + currencyParamsObject.source;

    var newScriptElem = document.createElement("script");
    newScriptElem.setAttribute("src", url);
    newScriptElem.setAttribute("id", "jsonpCurrency");

    var oldScriptElem = document.getElementById("jsonpCurrency");
    var head = document.getElementsByTagName("head")[0];
    if (oldScriptElem) {
        head.replaceChild(newScriptElem, oldScriptElem);
    } else {
        head.appendChild(newScriptElem);
    }
}

function proceedCurrencyData(data) {  
    if (data.success == false) {
        alert ("Problem with fetching data")
    } else {
    var upDateElem = document.getElementById("currUpdateDate");
    upDateElem.innerHTML = unixToDate(data.timestamp);
    currenciesMultipliers = data.quotes;
    populateCurrencyList(currenciesMultipliers);
    }    
}

function populateCurrencyList (currencyListObj) {
    var listAnch = document.getElementById("currencyTo");
    var currLength = currencyListObj.length;
    for(var key in currencyListObj) {
        var optElem = document.createElement("option");
        optElem.innerHTML = key.substr(3);
        listAnch.appendChild(optElem);
    }
}

function changeCurrencyTo(e) {
    currentMultiplier = currenciesMultipliers[currencyParamsObject.source + e.target.value];
    var valueToConvert = document.getElementById("valueToConvert");
    conversionOutputWindow.value = (valueToConvert.value * currentMultiplier).toFixed(numberOfDecimals);
}

// Fires when the user is typing value in the textbox.
function calculateCurrency (e) {
    conversionOutputWindow.value = (e.target.value * currentMultiplier).toFixed(numberOfDecimals);
}

// === Helper functions === //

function unixToDate(unixTime) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unixTime * 1000);

    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();

    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

