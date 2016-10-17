var express = require('express');
var exphbs  = require('express-handlebars');

var app = express();

var hbs = exphbs.create({
	defaultLayout: 'main',
	extname: '.hb',
	layoutsDir: 'build/views/layouts',
	partialsDir: 'build/views/partials'
});

app.engine('hb', hbs.engine);
app.set('view engine', '.hb');
app.set('views', './build/views')

app.use(express.static('build/public'));

app.get('/', function (req, res) {
    res.render('index'); 
});

app.listen(8080);

console.log("Listening on port 8080");