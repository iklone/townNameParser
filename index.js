var fs = require('fs');

const inFile = "input.csv"

const ID = 0;
const NAME = 1;
const COUNTY = 2;
const NATION = 3;

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

    console.log(name.toUpperCase() + ":\n");
    printTowns(out);
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

        //basic(list);

        ruleset = ["-ham", "-hurst", "-ley", "-bury", "-ford", "-port", "-mere", "-stead", "-ton", "-stow", "-wick", "-wich", "-mere"];
        bulk(list, ruleset, "Anglo-Saxon");
    });
}

getList(inFile);