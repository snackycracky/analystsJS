var http = require("http");

var db = require('riak-js').getClient({host:"127.0.0.1", port:"8091"  })
var x = 0;
function get_analyse(urlArray) {
    urlArray.forEach(function (url) {
        url = url.replace("\"", "");
        var ident = url.match(new RegExp(/-([0-9])*/g))[1].replace("-", "")

        var checkExsistance = function () {

            db.exists('analystsOpinions', ident, function (err, exists, meta) {

                if (err != null) {
                    checkExsistance()
                    return;
                }
                if (!exists) {


                    var req = null;
                    console.log("new request for: " + url);
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
                            try {
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

                                db.save("analystsOpinions", ident, {
                                    title:title,
                                    ident:ident,
                                    link:url,
                                    time:time,
                                    content:analysenContent
                                });
                                if (new Date().getSeconds() % 10 == 0) {
                                    db.count('analystsOpinions', function (err, data) {
                                        console.log("---------------------------------------------------------------"+data)
                                    })
                                }
                            } catch (err) {
                                console.log(arrMatches)
                                console.log(err);
                            }
//                    } else{
//                        console.log("exsists");
//                    }
//                });
                        });

                    });
                }else{
                    console.warn("entry already exsists: "+url);
                }
            });
        }
        checkExsistance()
    });
}
exports.get_analyse = get_analyse;