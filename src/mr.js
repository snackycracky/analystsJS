var http = require("http"),
        rss_client = http.createClient(80, "aktiencheck.de"),
        xml2js = require('xml2js'),
        analyseParser = require("./analyseParser.js");

var bucketName = "analystsOpinions";
var db = require('riak-js').getClient({host:"127.0.0.1", port:"8091", debug:true })

db.add({ bucket:bucketName, key_filters:[
    ["ends_with", "99"]
] })
        .map(function (obj) {
            var data = Riak.mapValuesJson(obj)[0];

            var resultHash = {};

            resultHash["ISIN"] = data.content.match(new RegExp(/ISIN\s[A-Z0-9]*/g))
            resultHash["WKN"] = data.content.match(new RegExp(/WKN\s[A-Z0-9]*/g))

            //from http://de.selfhtml.org/javascript/objekte/regexp.htm

            //The [^;] is a character class, it matches everything but a semicolon.
            //http://stackoverflow.com/questions/2013124/regex-matching-up-to-the-first-occurrence-of-a-character
            var Ausdruck = (/\(aktiencheck\.de AG\) - (.*), Analyst([a-z]*) (vo[a-z]|d[a-z][a-z])(.*?)(?=,)/g)
            Ausdruck.exec(data.content);
            resultHash["analyst"] = RegExp.$1
            resultHash["analystCompany"] = RegExp.$4

            if (RegExp.$1 == "") {
                Ausdruck = (/\(aktiencheck\.de AG\) - Die (.*) (vo[a-z]|d[a-z][a-z]) (.*) (halten|raten|stuf[en|t]|empfehlen) (.*?)Aktie/g)
                Ausdruck.exec(data.content);
                resultHash["analystCompany"] = RegExp.$3.replace("\"", "").replace("\"", "");
            }
            if (RegExp.$1 == "") {
                Ausdruck = (/\(aktiencheck\.de AG\) - D([a-z][a-z])(.*?)(vo[a-z]|d[a-z][a-z])(.*?),(.*?),(.*?)Aktie/g)
                Ausdruck.exec(data.content);
                resultHash["analyst"] = RegExp.$5
                resultHash["analystCompany"] = RegExp.$4
            }
            if (RegExp.$1 == "") {
                Ausdruck = (/\(aktiencheck\.de AG\) - Laut d([a-z][a-z])(.*?)(vo[a-z]|d[a-z][a-z])(.*?)\"(.*?)\"/g)
                Ausdruck.exec(data.content);
                resultHash["analyst"] = ""
                resultHash["analystCompany"] = RegExp.$5
            }
            if (RegExp.$1 == "") {
                Ausdruck = (/\(aktiencheck\.de AG\) - (.*), CFA bei (.*?),/g)
                Ausdruck.exec(data.content);
                resultHash["analyst"] = RegExp.$1
                resultHash["analystCompany"] = RegExp.$2
            }
            if (RegExp.$1 == "") {
                Ausdruck = (/\\"(.*?)\\"/g)
                Ausdruck.exec(data.content);
                resultHash["analystCompany"] = RegExp.$1
            }


            Ausdruck = (/[Zz]iel(.*)(auf|bei|von) ((\d{1,3}(,\d\d)*)) ([A-Z]{3})/g)
            resultHash["ziel"] = RegExp.$3
            resultHash["currency"] = RegExp.$6
            Ausdruck.exec(data.content);

            Ausdruck = (/(outperform|buy|hold|accumulate|neutral|overweight|reduce|sell|underperform|equal-weight|market perform|add|strong buy|kaufen|verkaufen|halten)/g)
            Ausdruck.exec(data.content);
            resultHash["votum"] = RegExp.$1



            resultHash["ident"] = data.ident

            return [resultHash];
        })
        .run(function (err, data) {
            console.log(data);
        })

