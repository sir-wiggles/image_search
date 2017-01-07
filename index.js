var express = require("express");
var url_parser = require("url");
var request = require("request");

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};


var api = "https://www.googleapis.com/customsearch/v1";
var eid = "003166733332287088697:uxe_7xvdizg";
var key = "AIzaSyA0o0Dc_bcUK5UsKZbBltzqgDi-Ex-V6ao";

var app = express();

var latest = [];

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

app.get("/api/imagesearch/:query", function(req, res) {

    var url_parts = url_parser.parse(req.url, true);
    var query = req.params.query;

    var offset = 0;
    if (isNumeric(url_parts.query.offset)) {
        offset = url_parts.query.offset;
    }

    var url = "{0}?key={1}&cx={2}&q={3}&startPage={4}&searchType=image".format(
        api, key, eid, encodeURI(query), offset
    );


    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            data = parseBody(body);
            var search = {
                term: query,
                when: Date(),
            };
            latest.unshift(search);
            res.send(data);
            if (latest.length > 10) {
                latest.pop();
            }
        };
    })

});

function parseBody(body) {
    var filtered = [];
    var data = JSON.parse(body);
    console.log(data, typeof(data));
    for (i=0; i<data.items.length; i++) {
        var obj = {
            url: data.items[i].link,
            snippet: data.items[i].snippet,
            thumbnail: data.items[i].image.thumbnailLink,
            context: data.items[i].image.contextLink
        };
        filtered.push(obj);
    }
    return filtered;
}


app.get("/api/latest/imagesearch", function(req, res) {
   res.send(latest); 
});

app.listen(process.env.PORT || 8080, function() {
    console.log(process.env.PORT || 8080);
});
