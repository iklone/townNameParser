var fs = require('fs');

const inFile = "coords.csv"

const ID = 0;
const NAME = 1;
const COUNTY = 2;
const NATION = 3;
const LAT = 4;
const LNG = 5;

const SUFFIX = 0;
const PREFIX = 1;
const CONTAINS = 2;
const WORD = 3;

//custom print
function printTowns(list) {
    for (town in list) {
        town = list[town];
        out = town[NAME] + ", " + town[COUNTY];
        console.log(out);
    }
}

//export to csv
function exportCSV(list, filename) {
    csv = "Name,Latitude,Longitude\n";

    for (town in list) {
        townObj = list[town];
        townString = townObj[NAME] + "," + townObj[LAT] + "," + townObj[LNG] + "\n";
        csv = csv + townString;
    }
    csv = csv.substr(0, csv.length - 1);

    fs.writeFile(filename + ".csv", csv, function (err) {
        if (err) throw err;
    });
}

//test for rule
function test(list, out, regex) {
    for (town in list) {
        nameSplit = list[town][NAME].split(" ");

        for (word in nameSplit) {
            if (regex.test(nameSplit[word])) {
                out.push(list[town]);
            }
        }
    }

    return out;
}

//rule at end of name
function suffix(list, out, rule) {
    regex = new RegExp("^.*" + rule + "$", "i");
    return test(list, out, regex);
}

//rule at start of name
function prefix(list, out, rule) {
    regex = new RegExp("^" + rule + ".*$", "i");
    return test(list, out, regex);
}

//rule anywhere in name (superset of suffix and prefix)
function contains(list, out, rule) {
    regex = new RegExp("^.*" + rule + ".*$", "i");
    return test(list, out, regex);
}

//rule separate word in name
function fullWord(list, out, rule) {
    regex = new RegExp("^" + rule + "$", "i");
    return test(list, out, regex);
}

//run tests on list
function basic(list) {
    function addTest(type, rule) {
        if (type == SUFFIX) {
            suffix(list, out, rule);
        }
        if (type == PREFIX) {
            prefix(list, out, rule);
        }
        if (type == CONTAINS) {
            contains(list, out, rule);
        }
        if (type == WORD) {
            fullWord(list, out, rule);
        }
        return out;
    }
    out = [];

    //place rules here
    //eg: addTest(SUFFIX, "chester");
    addTest(SUFFIX, "ley");

    printTowns(out);
}

//run bulk tests
function bulk(list, ruleset, name) {
    out = [];

    for (rule in ruleset) {
        ruleSplit = ruleset[rule].split("-");
        
        if (ruleSplit[0] == '') { //if starts with -, suf or con
            if (ruleSplit[2] == '') { //if ends with -, con
                contains(list, out, ruleSplit[1]);
            } else { // else suf
                suffix(list, out, ruleSplit[1]);
            }
        } else { //else pre or word
            if (ruleSplit[1] == '') { //if ends with -, pre
                prefix(list, out, ruleSplit[0]);
            } else { // else word
                fullWord(list, out, ruleSplit[0]);
            }
        }
    }

    console.log("\n" + name.toUpperCase() + ":\n");
    //printTowns(out);
    exportCSV(out, name);
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

        //Roman
        ruleset = ["-chester", "-cester", "-caster", "-xeter", "chester", "magna"];
        bulk(list, ruleset, "Roman");

        //Anglo Saxon
        ruleset = ["-ham", "-hurst", "-ley", "leigh", "lea", "-bury", "-borough", "-burgh", "-brough", "-ford", "-port", "-mere", "-stead", "-ton", "-tun", "-stow", "-wick", "-wich", "-mere", "ac-", "-ock", "ash-", "ast-", "bex-", "-bourn-", "-burn", "-chip-", "-den", "-dean", "-field", "-forth", "hay-", "-hurst", "-minster", "-mouth", "-pool", "shep-", "stan-", "swin-"];
        bulk(list, ruleset, "Anglo-Saxon");

        //Norse
        ruleset = ["-by", "-bie", "-thorpe", "kirk", "-thwaite", "-thorp", "-firth-", "-gate", "-kirk-"];
        bulk(list, ruleset, "Norse");

        //Celtic
        ruleset = ["aber-", "-avon-", "-afon-", "auch-", "bal-", "ban-", "blen-", "bre-", "-card-", "-combe", "-coed-", "-cot", "cwm-", "cum-", "drum-", "d(u|o)(n|m)-", "dub-", "-glen-", "inver-", "kil-", "-lyn-", "-more", "pe(n|m)-", "p(o|w)l-", "tre-"];
        bulk(list, ruleset, "Celtic");

        //Holy
        ruleset = ["st", "bishop-", "saint", "don-", "-minster", "-lan-", "-kirk", "kil-", "ecc-", "egl-"];
        bulk(list, ruleset, "Holy");
    });
}

getList(inFile);