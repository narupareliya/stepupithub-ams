var path = require('path'),
    http = require('http'),
    compression = require('compression'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    flash = require('connect-flash'),
    schema = require('./app/model/model'),
    routes = require('./app/routes/routes');


var app = module.exports = express();

mongoose.connect('mongodb://nalin123:nalin123@ds051595.mlab.com:51595/heroku_31p7qr07');


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressValidator());
app.use(bodyParser.json({limit:'100mb'}));
app.use(cookieParser());
app.use(methodOverride());
app.use(compression());
app.use(flash());


if(process.env.NODE_ENV == 'developement') {
    app.use(express.static(path.join(__dirname, 'public')));
} else {
    app.use(express.static(path.join(__dirname, 'public'), {
        maxAge: '7d'
    }));
}

app.use('/', routes);


var server = http.createServer(app);
server.listen(process.env.PORT || 3000, function() {
	console.log("Express server listening on port 3000");
});