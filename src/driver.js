var http = require("http"),
        rss_client = http.createClient(80, "aktiencheck.de"),
        xml2js = require('xml2js'),
        analyseParser = require("./analyseParser.js");

var bucketName = "anlystOpinions";
var db = require('riak-js').getClient({host:"127.0.0.1", port:"8098"})

function get_feeds(pageNr) {


    var req = rss_client.request("GET", "/analysen/DAX_MDAX?page=" + pageNr);
    req.end();

    req.on('response', function (response) {

        response.setEncoding("utf8");

        var body = "";
        response.addListener("data", function (data) {
            body += data;
        });

        response.addListener("end", function (data) {

            var rePattern = new RegExp(/\/analysen\/Artikel(.*)[0-9]"/g);

            var arrMatches = body.match(rePattern);

            arrMatches.forEach(function (link) {
                async_function(true, function (val) {
                    var ident = link.match(new RegExp(/-([0-9])*/g))[1].replace("-", "")

                    db.get('analystsOpinions', ident, function (err, entry, meta) {
                        if (entry == undefined) {
                            analyseParser.get_analyse(link.replace("\"", ""));
                        }
                    });
                });
            });
        });

    });
}
//
var async_function = function (val, callback) {
    process.nextTick(function () {
        callback(val);
    });
};


for (var i = 1; i < 3629; i++) {
    get_feeds(i)
    console.log("going to next i " + i)
}

db.count('analystsOpinions')