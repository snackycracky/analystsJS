var http = require("http"),
        events = require("events"),
        rss_client = http.createClient(80, "aktiencheck.de"),
        xml2js = require('xml2js');

var rssItems_emitter = new events.EventEmitter();

function get_feeds() {

    console.log("making request now");
    var req = rss_client.request("GET", "/rss/analysen.rss2");
    req.end();

    console.log("request sent");
    req.on('response', function (response) {

        console.log("response recieved");
        response.setEncoding("utf8");


        var body = "";
        response.addListener("data", function (data) {
            body += data;
        });

        response.addListener("end", function () {
            console.log("parsing response now")
            var parser = new xml2js.Parser();
            parser.addListener('end', function (result) {

                result.channel.item.forEach(function (item) {
                    console.log(item.title)
                })

                console.log('Done.');
            });
            parser.parseString(body);

        });
    });
}
get_feeds();
//setInterval(get_feeds, 100000);