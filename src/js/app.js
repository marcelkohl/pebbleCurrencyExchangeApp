var UI = require('ui');
var Feature = require('platform/feature');
var curAvailable = ["AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"]
var curAvailableDescr = ["Australian Dollar", "Bulgarian Lev", "Brazilian Real", "Canadian Dollar", "Swiss Franc", "Chinese Yuan", "Czech Koruna", "Danish Krone", "Euro", "British Pound", "Hong Kong Dollar", "Croatian Kuna", "Hungarian Forint", "Indonesian Rupiah", "Israeli New Sheqel", "Indian Rupee", "Icelandic Krona", "Japanese Yen", "South Korean Won", "Mexican Peso", "Malaysian Ringgit", "Norwegian Krone", "New Zealand Dollar", "Philippine Peso", "Polish Zloty", "Romanian Leu", "Russian Ruble", "Swedish Krona", "Singapore Dollar", "Thai Baht", "Turkish Lira", "United States Dollar", "South African Rand"];
var gItemToRemove = null;
const { requestCurrencies } = require('./currency-api');

var splash = new UI.Card({
  title: 'Currency Exchange',
  titleColor: 'white',
  icon: 'images/currency32.png',
  subtitle: '\nMulti Currency Converter',
  body: 'Loading...',
  backgroundColor: Feature.color('0x0055FF', 'gray'),
  style: 'small'
});

splash.show();

var menuCurrency = new UI.Menu();
var menuListBaseCurr = new UI.Menu();

var removeItem = new UI.Card({
  action: {
    up: 'images/check.png',
    down: 'images/cancel.png'
  },
  title: 'Remove',
  body: 'Remove selected currency?',
  backgroundColor: Feature.color('0xFF0000', 'white')
});

removeItem.on('click', 'down', function(e) {
  removeItem.hide();
});

removeItem.on('click', 'up', function(e) {
  deleteItemCurr();
});

function loadCurrencies(){
  splash.body('Requesting data...');
  splash.backgroundColor(Feature.color('0x0055FF', 'gray'));

  var idxToAdd, currSymb, currValue, idxBase;
  var currBase = localStorage.getItem('currBase');

  if (currBase === null){
    localStorage.setItem('currBase', 'USD');
    currBase = localStorage.getItem('currBase');
  }

  let myCurrencies = getMyCurrenciesArray()
  if (myCurrencies.length == 0) {
    myCurrencies.push("USD")
  }

  requestCurrencies(
    currBase,
    myCurrencies,
    function (res) {
      var menuItems = [];
      idxBase = curAvailable.indexOf(currBase);
      menuItems.push({ title: "Currency Base", subtitle: currBase + " - " + curAvailableDescr[idxBase] });

      for (const [currName, value] of Object.entries(res.data)) {
        idxToAdd = curAvailable.indexOf(currName);
        if (idxToAdd >= 0) {
          currSymb = curAvailable[idxToAdd];
          currValue = (currSymb === currBase ? 1 : value);
          menuItems.push({ title: currSymb + ": " + currValue, subtitle: curAvailableDescr[idxToAdd], icon: 'images/' + currSymb + '.png' });
        }
      }

      menuItems.push({ title: "+", subtitle: "Add New" });

      var sections = { highlightBackgroundColor: Feature.color('0x0055FF', 'black'), sections: [{ items: menuItems }] };
      menuCurrency = new UI.Menu(sections);
      setMenuCurrencyActs();

      menuCurrency.show();
      splash.hide();
      removeItem.hide();
      menuListBaseCurr.hide();
    },
    function (error) {
      splash.body('Failed to query currencies');
      splash.backgroundColor(Feature.color('0x0055FF', 'gray'));
      setTimeout(function () { loadCurrencies(); }, 3000);
    }
  )
}

setTimeout(function() {
  loadCurrencies();
}, 400);

function deleteItemCurr(){
  var lMyCurrencies = getMyCurrenciesArray();
  var idxToDel = (gItemToRemove.itemIndex-1);

  lMyCurrencies.splice(idxToDel, 1);

  menuCurrency.hide();
  saveMyCurrenciesArray(lMyCurrencies);
  loadCurrencies();
}

function getMyCurrenciesArray(){
  var lMyCurrencies = JSON.parse(localStorage.getItem("myCurrencies"));

  if (lMyCurrencies === null){ lMyCurrencies = []; }

  return lMyCurrencies;
}

function AddToMyCurrenciesArray(pCurrency){
  var lMyCurrencies = getMyCurrenciesArray();
  var isOnMyCurrencies = lMyCurrencies.indexOf(pCurrency);
  var idxToAdd = curAvailable.indexOf(pCurrency);

  if (isOnMyCurrencies >= 0){
    return
  }

  if(idxToAdd >= 0) {
    lMyCurrencies.push(curAvailable[idxToAdd]);
    saveMyCurrenciesArray(lMyCurrencies);
  }
}

function saveMyCurrenciesArray(pCurrArray){
   localStorage.setItem("myCurrencies", JSON.stringify(pCurrArray));
}

function listCurrencies(pColorMenu){
  var menuItems = [];

  curAvailable.forEach(function(item, index){
    menuItems.push({title:item, subtitle:curAvailableDescr[index], icon: 'images/'+item+'.png'});
  });

  var sections = {highlightBackgroundColor: Feature.color(pColorMenu, 'black'), sections:[{items:menuItems}]};
  menuListBaseCurr = new UI.Menu(sections);
}

function listBaseCurrencies(){
  listCurrencies('0xFF5500');
  menuListBaseCurr.on('select', function(e){ setBaseCurrency(e); });

  menuListBaseCurr.show();
}

function listAddCurrencies(){
  listCurrencies('0x00AA00');
  menuListBaseCurr.on('select', function(e){ addCurrency(e); });

  menuListBaseCurr.show();
}

function addCurrency(e){
  var idxNewCurr = curAvailable.indexOf(e.item.title);
  if (idxNewCurr >= 0){
    AddToMyCurrenciesArray(e.item.title);

    menuCurrency.hide();
    loadCurrencies();
  }
}

function setBaseCurrency(e){
  var idxNewCurr = curAvailable.indexOf(e.item.title);
  if (idxNewCurr >= 0){
    menuCurrency.hide();
    localStorage.setItem('currBase', curAvailable[idxNewCurr]);
    loadCurrencies();
  }
}

function setMenuCurrencyActs(){
  menuCurrency.on('select', function(e) {
    if (e.itemIndex === 0){
      listBaseCurrencies();
    } else if(e.item.title === "+"){
      listAddCurrencies();
    } else {
      gItemToRemove = e;
      removeItem.show();
    }
  });
}
