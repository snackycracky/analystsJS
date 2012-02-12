var http = require("http"),
        rss_client = http.createClient(80, "aktiencheck.de"),
        xml2js = require('xml2js'),
        analyseParser = require("./analyseParser.js"),
        mongodb = require('mongodb');


var server = new mongodb.Server("127.0.0.1", 27017, {});
var db = new mongodb.Db('analystsOpinions', server, {native_parser:true})
var bucketName = "anlystOpinions";

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
//                    var ident = link.match(new RegExp(/-([0-9])*/g))[1].replace("-", "")
//                    db.open(function (error, client) {
//                        if (error) {
//                            throw error
//                        }
//                        if (client != null) {
//                            var collection = new mongodb.Collection(client, 'analystsOpinions');
//
//                            collection.find({id:ident}, {limit:10}).toArray(function (err, foundDocs) {
//                                if (foundDocs.length == 0) {
                                    analyseParser.get_analyse(link.replace("\"", ""));
//                                }
//                            });
//                        }
//                    });
                });
            });
        });

    });
}

var async_function = function (val, callback) {
    process.nextTick(function () {
        callback(val);
    });
};


for (var i = 3000; i < 3629; i++) {//3629
    get_feeds(i)
    //console.log("going to next i " + i)
}


//new mongodb.Db('test', server, {}).open(function (error, client) {
//    if (error) throw error;
//    var collection = new mongodb.Collection(client, 'test_collection');
//    collection.insert({hello:'world'}, {safe:true},
//            function (err, objects) {
//                if (err) console.warn(err.message);
//                if (err && err.message.indexOf('E11000 ') !== -1) {
//                    console.log("this _id was already inserted in the database")
//                }
//            });
//    collection.find({hello:'world'}, {limit:10}).toArray(function (err, docs) {
//        console.dir(docs.length > 0);
//    });
//});