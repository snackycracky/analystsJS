var fs = require("fs");

fs.readFile('./testAnalyse.html','utf8',function(error, data) {


    var rePattern = new RegExp(/content_left(.*)content_right/g);

    //http://stackoverflow.com/questions/1068280/javascript-regex-multiline-flag-doesnt-work
    var arrMatches = data.match(new RegExp(/h2([\s\S]*)content_right/i));
    var time = arrMatches[0].match(new RegExp(/([0-2]{0,1}[0-9]|30|31)\.([01]{0,1}[0-9])\.([0-9]{2})\s([0-9]{2}):([0-9]{2})/g))
    var analysenContent = arrMatches[0].match(new RegExp(/analysen_content">(.*)<i>/g))
    console.log(analysenContent);
});