let result = document.querySelector('.result');
let convertCurrency = document.querySelector('#convertCurrency');
let inputAmount = document.querySelector('#amount');
let inputCurrency = document.getElementById('inputCurrency');
let outputCurrency = document.querySelector('#outputCurrency');

window.onload = () => {
    GetData(inputCurrency);
    GetData(outputCurrency);
}

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js', { scope: '/' }).then(function (reg) {
        if (reg.installing) {
            console.log('installing')
        } else if (reg.waiting) {
            console.log('waiting')
        } else if (reg.active) {

        }
    }).catch(function (err) {
        console.log('not registered', err)
    })
}

function showConverted() {
    let x = inputCurrency.selectedIndex;
    let y = outputCurrency.selectedIndex;
    let fromCurrency = encodeURIComponent(document.getElementsByTagName("option")[x].value);
    let toCurrency = encodeURIComponent(document.getElementsByTagName("option")[y].value);
    let currencyPair = fromCurrency + '_' + toCurrency;
    let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${currencyPair}&compact=y`;
    let { conversionRate } = getExchangeRate(currencyPair);
    if (conversionRate == undefined) {
        fetch(url)
            .then(function (response) {
                return response.json();
            }).then(function (newresponse) {
                let conversionRate = newresponse[currencyPair].val;
                let outputAmount = conversionRate * inputAmount.value;
                let conversionResult = `${fromCurrency}${inputAmount.value} equals ${toCurrency}${outputAmount}`;
                insertData(currencyPair, conversionRate);
                result.innerHTML = conversionResult;
            })
    } else {
        let outputAmount = conversionRate * inputAmount.value;
        let conversionResult = `${fromCurrency}${inputAmount.value} equals ${toCurrency}${outputAmount}`;
        result.innerHTML = conversionResult;
    }
}


function GetData(data) {
    fetch('https://free.currencyconverterapi.com/api/v5/countries')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            let results = myJson.results;
            for (let val in results) {
                let child = document.createElement('option');
                child.setAttribute('value', results[val].currencyId);
                child.innerHTML = `${results[val].currencyName} - ${results[val].currencyId}`;
                data.appendChild(child);

            }
        })
}


function insertData(currencyPair, conversionRate) {
    var request = this.indexedDB.open("converter", 4);
    request.onerror = function (event) {
        console.log('unsuccessful')
    };
    request.onsuccess = function (event) {
        let db = event.target.result;
        let tx = db.transaction("currencyConverter", "readwrite");
        let store = tx.objectStore("currencyConverter")
        store.put({ currencyPair: currencyPair, conversionRate: conversionRate })
    }
}



function getExchangeRate(currencyPair) {
            
    let request = this.indexedDB.open("converter", 4);
    request.onerror = function (event) {
        console.log('unsuccessful')
    };
    request.onupgradeneeded = function (event) {
        // Save the IDBDatabase interface 
        let db = event.target.result;

    }
    request.onsuccess = function (event) {
        let db = event.target.result;
        let tx = db.transaction("currencyConverter", "readonly");
        let store = tx.objectStore("currencyConverter");
        let object = store.get(currencyPair);
        object.onsuccess = function () {
        let data = object.result;
        return data;
        }
    

    }
    return { conversionRate: null }
}