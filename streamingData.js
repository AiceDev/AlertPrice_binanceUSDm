//to stop while
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//alarm function
var player = require('play-sound')(opts = {})
function Alarm() {
    player.play("./sound/soundAlarmTv.mp3", function(err) {
        if (err) throw err
    })
}

const ccxt = require("ccxt").pro;
const exchange = new ccxt.binanceusdm({  });

//where the datas from various alerts is stocked
let data = {}

//the function who updates datas
async function webSocketData_tickerPrice_Alert(symbol, ts) {
    console.log("h")

    let isFirstPriceRegistered = true
    while (data[`${symbol}_${ts}`].alaram_notYet_triggered) {
        try {
            const ticker = await exchange.watchTicker(`${symbol}/USDT:USDT`);

            if(isFirstPriceRegistered) {
                data[`${symbol}_${ts}`].priceAlertStart = ticker.last
                isFirstPriceRegistered = false
            };

            data[`${symbol}_${ts}`].lastPrice = ticker.last;
            console.log(new Date(), `${symbol}/USDT`, ticker.last)

        } catch (err) {
            console.log(err)
            return
        }
    }

    delete data[`${symbol}_${ts}`]
}

//the function who triggers Alarm from datas
async function AlertPrice_check(symbol, priceAlert, ts) {
    while(data[`${symbol}_${ts}`].alaram_notYet_triggered) {
        if(!(data[`${symbol}_${ts}`].priceAlertStart === undefined)) {

            if(data[`${symbol}_${ts}`].priceAlertStart > priceAlert) {
                if(data[`${symbol}_${ts}`].lastPrice <= priceAlert) {
                    Alarm();
                    console.log(`__${symbol} is below ${priceAlert}$`)
                    data[`${symbol}_${ts}`].alaram_notYet_triggered = false
                }
            } else {
                if(data[`${symbol}_${ts}`].lastPrice >= priceAlert) {
                    Alarm();
                    console.log(`__${symbol} is above ${priceAlert}$`)
                    data[`${symbol}_${ts}`].alaram_notYet_triggered = false
                }
            }
        }

        await sleep(100);
    }
}

//the function who launche l'alert
async function Alert(symbol, priceAlert) {
    let ts = Date.now();

    //build the data alarm
    data[`${symbol}_${ts}`] = {
        lastPrice: undefined,
        priceAlertStart: undefined,
        alaram_notYet_triggered: true
    }

    webSocketData_tickerPrice_Alert(symbol, ts);
    AlertPrice_check(symbol, priceAlert, ts);
}

//exemple
Alert("BTC", 121690.2)
Alert("BTC", 121619.3)

//check
setInterval(() => {
    console.log(data)
}, 10000)