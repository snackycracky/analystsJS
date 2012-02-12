var http = require("http"),
        rss_client = http.createClient(80, "aktiencheck.de"),
        xml2js = require('xml2js');

var db = require('riak-js').getClient({host:"127.0.0.1", port:"8098", debug:true })

function get_analyse( url) {

    console.log("request sent: "+url);
    var req = http.createClient(80, "aktiencheck.de").request("GET", url);
    req.end();

    //console.log("request sent");
    req.on('response', function (response) {

        //console.log("response recieved");
        response.setEncoding("utf8");

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


//            db.exists('analystsOpinions', ident, function (exists) {
//                console.log(exists);
//            });
            db.save("analystsOpinions", ident, {
                title:title,
                ident:ident,
                link:url,
                time:time,
                content:analysenContent
            })

        });
    });
    return ""
}
exports.get_analyse = get_analyse;