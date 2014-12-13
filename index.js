/**
 * Created by Andriy on 04.12.2014.
 */
var express = require('express');
var morgan = require('morgan');
var app = express();
var fs = require('fs');
var PORT = 20020;

var imageMagick = require('gm').subClass({imageMagick: true});


app.set('view engine', 'ejs');
app.use(morgan('dev'));

function redirectUrl(lang) {
    if (lang == "uk" || lang == "ru") {
        return "http://4enjoy.com/" + lang + "/tap-top-color-dot/";
    } else {
        return "http://4enjoy.com/tap-top-color-dot/";
    }
}

function facebookResponse(req, res) {
    var fullUrl = req.protocol + '://' + req.get('host') + ":" + PORT + req.originalUrl;
    fullUrl = fullUrl.split('index.html').join('');
    console.log(fullUrl);

    res.render("facebook", {
        params: req.params,
        fullUrl: fullUrl
    });
}

function userResponse(req, res) {
    var lang = req.params.lang;
    res.redirect(redirectUrl(lang));
}

function sharePage(req, res) {
    var isFacebook = !!req.headers['user-agent'].match(/facebookexternalhit/);


    if (isFacebook) {
        facebookResponse(req, res);
    } else {
        userResponse(req, res);
    }
}

app.get('/', function (req, res) {
    res.send('OK')
});

app.get('/share/:lang/:score/index.html', sharePage);

app.get('/share/:lang/index.html', sharePage);

app.get('/share/:lang/image.png', function (req, res) {
    fs.createReadStream('images/main.png').pipe(res);
});

app.get('/share/:lang/:score/image.png', function (req, res, next) {

    var score = parseInt(req.params.score);

    var size = 70;
    var x = 0;
    var y = -120;

    if (score < 10) {
        size = 300;
    } else if (score < 100) {
        size = 200;
    } else if (score < 1000) {
        size = 150;
    } else if (score < 10000) {
        size = 125;
    } else if (score < 100000) {
        size = 110;
    } else if (score < 1000000) {
        size = 90;
    }

    console.log("Draw score", score);
    imageMagick("images/main.png")
        .gravity('Center')
        .font('images/Fredoka One.ttf')
        .fill('#ffffff')
        .fontSize(size)
        .drawText(x, y, score)
        .stream(function (err, stdout, stderr) {
            if (err) return next(err);


            stdout.pipe(res); //pipe to response

            stdout.on('error', next);
        });


});


var server = app.listen(PORT, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);

});