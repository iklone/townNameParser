const fs = require('fs');
const fetch = require("node-fetch");

const inFile = "test.csv"
const sleepTime = 2000;

const ID = 0;
const NAME = 1;
const COUNTY = 2;
const NATION = 3;
const LAT = 4;
const LNG = 5;

var apiKey;

//pause for ms milliseconds
function sleep() {
    return new Promise(resolve => setTimeout(resolve, sleepTime));
}

//round to precision dp
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

//export to csv
function exportCSV(list) {
    csv = "";

    for (town in list) {
        townObj = list[town];
        townString = townObj[ID] + "," + townObj[NAME] + "," + townObj[COUNTY] + "," + townObj[NATION] + "," + townObj[LAT] + "," + townObj[LNG] + "\n";
        csv = csv + townString;
    }
    csv = csv.substr(0, csv.length - 1);

    fs.writeFile("output.csv", csv, function (err) {
        if (err) throw err;
    });
}

//query single town
async function getCoords(query) {
    url = "https://maps.googleapis.com/maps/api/geocode/json?key=" + apiKey + "&address=" + query;
    response = await fetch(url);
    data = await response.json();

    loc = data["results"][0]["geometry"]["location"];
    loc["lat"] = round(loc["lat"], 3);
    loc["lng"] = round(loc["lng"], 3);

    return loc;
}

//get batch of coords from gmaps
async function getCoordBatch(list) {
    for (town in list) {
        townObj = list[town];
        query = townObj[NAME] + ", " + townObj[COUNTY] + ", " + townObj[NATION]; //eg - Warwick, Warwickshire, England
        query = query.replace(/’/g, "%27");
        loc = await getCoords(query);
        townObj.push(loc["lat"], loc["lng"]);

        townString = townObj[ID] + "," + townObj[NAME] + "," + townObj[COUNTY] + "," + townObj[NATION] + "," + townObj[LAT] + "," + townObj[LNG];
        console.log(townString);

        await sleep();
    }

    exportCSV(list)
}

//get town list from csv file
//format: id, name, county, nation
function getList(filename) {
    fs.readFile(filename, function(err, data) {
        if (err) {
            return console.error(err);
        }

        list = [];
        rawList = data.toString().split("\n");
        for (item in rawList) {
            newEntry = rawList[item].split(",");
            list.push(newEntry);
        }

        getCoordBatch(list);
    });
}

function initialise() {
    getList(inFile);
}

fs.readFile('password.config', function(err, data) {
    apiKey = data.toString();
    initialise();
});