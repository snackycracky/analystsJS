var http = require("http"),
        rss_client = http.createClient(80, "aktiencheck.de"),
        xml2js = require('xml2js'),
        mongodb = require('mongodb');

var server = new mongodb.Server("127.0.0.1", 27017, {});
var db = new mongodb.Db('analystsOpinions', server, {native_parser:true})
var x = 0;
function get_analyse( url) {

    try {
        var req = null;
        var ident = url.match(new RegExp(/-([0-9])*/g))[1].replace("-", "")

        req = http.createClient(80, "aktiencheck.de").request("GET", url);

        req.end();

        //console.log("request sent");
        req.on('response', function (response) {

            //console.log("response recieved");

            var body = "";
            response.addListener("data", function (data) {

                body += data;
            });

            response.addListener("end", function (data) {

                //http://stackoverflow.com/questions/1068280/javascript-regex-multiline-flag-doesnt-work

                var arrMatches = body.match(new RegExp(/h2([\s\S]*)content_right/i));

                var time = arrMatches[0].match(new RegExp(/([0-2]{0,1}[0-9]|30|31)\.([01]{0,1}[0-9])\.([0-9]{2})\s([0-9]{2}):([0-9]{2})/g))[0]
                if (arrMatches == null) {
                    console.log("err");
                }
                var analysenContent = arrMatches[0].match(new RegExp(/analysen_content">(.*)<\/span>/g))
                if (analysenContent == null) {
                    console.log("err");
                }
                analysenContent = analysenContent[0]

                var title = arrMatches[0].match(new RegExp(/h2>(.*)<\/h2/g))[0]

                var ident = url.match(new RegExp(/-([0-9])*/g))[1].replace("-", "")

                db.open(function (error, client) {
                    if (client != null) {
                        var collection = new mongodb.Collection(client, 'analystsOpinions');
                        try {
                            var insert = function () {
                                collection.insert(
                                        {id:ident, title:title, link:url, time:new Date(time), content:analysenContent});
                                console.log("insert: " + ident)
                            }
                            insert();
                            collection.find({id:ident}, {limit:10}).toArray(function (err, foundDocs) {
                                if (foundDocs == null || foundDocs.length == 0) {
                                    console.log("inserting: " + ident + " was not successful")
                                    insert();
                                }
                            });

                        } catch (x) {
                            console.log("ERROR");
                        }
                    }
                });


            });

        });
    } catch (x) {
        console.log("ERROR");
    }
}
exports.get_analyse = get_analyse;