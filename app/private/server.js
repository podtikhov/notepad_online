var express = require('express');
var app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

var fs = require('fs');

var mysql = require('mysql2');

var cookieParser = require('cookie-parser');
app.use(cookieParser());

/*var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());*/


var session = require('cookie-session');
app.use(session({keys: ['secret']}));

var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

var consolidate = require('consolidate');

app.engine('hbs', consolidate.handlebars);	//движком для шоблонов с расширением .hbs будет handlebars
app.set('view engine', 'hbs');	//чтобы не указывать расширение .hbs
app.set('views', './templates/');

app.use('/', express.static('../public/'));






var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '54321Qwerty',
	database: 'notepad_online'
});
connection.connect();








var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
	function(username, password, done) {	
		connection.query("SELECT username, password FROM users WHERE (username = '" + username + "') AND (password = '" + password + "');", function (error, results, fields) {
			if (error) throw error;

			if (results.length == 0) {
				return done(null, false);
			} else {
				return done(null, {username: results[0].username});
			}
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(id, done) {
	done(null, {username: id});
});

var auth = passport.authenticate(
	'local', {
		successRedirect: '/notes', 
        failureRedirect: '/again'
	}
);

var mustBeAuthenticated = function (req, res, next) {
	req.isAuthenticated() ? next() : res.redirect('/login');
};










app.get('/', function(req, res){
	fs.ReadStream('../public/main.html').pipe(res);
});





app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
});









app.get('/registration', function(req, res){
    fs.ReadStream('../public/registration.html').pipe(res);
});

app.post('/registration', function(req, res){
	connection.query("SELECT username FROM users WHERE (username = '" + req.body.username + "')", function (error, results, fields) {
		if (error) throw error;

		if (results.length != 0) {
			fs.ReadStream('../public/reg_again.html').pipe(res);
		} else {
			add_user(req.body.username, req.body.password);
			fs.ReadStream('../public/success_registration.html').pipe(res);
		}
	});
});

function add_user(username, password){
	connection.query("INSERT INTO `users` (`username`, `password`) VALUES ('" + username + "', '" + password + "')", function (error, results, fields) {
		if (error) throw error;
	});
};









app.get('/login', function(req, res){
    fs.ReadStream('../public/login.html').pipe(res);
});

app.post('/login', auth);

app.get('/again', function(req, res){
    fs.ReadStream('../public/again.html').pipe(res);
});








app.get('/notes', mustBeAuthenticated, function(req, res) {
    fs.ReadStream('../public/notes.html').pipe(res);
});

app.post('/notes_loading', mustBeAuthenticated, function(req, res){
	//console.log("/notes, POST," + req.user.username);

	var notes = {
		username: req.user.username,
		notes_list: []
	};

	connection.query("SELECT id, note_value, tag FROM notes WHERE(owner = '" + req.user.username + "')", function(error, result){
		if (error) throw error;

		for(var i=(result.length-1); i>=0; i--)
		{
			notes.notes_list.push({
				id : result[i].id,
				note_value : result[i].note_value,
				tag : result[i].tag
			});
		}	

		res.jsonp(notes);
	});
});



/*app.post('/note_loading', mustBeAuthenticated, function(req, res){
	res.jsonp({
		username : req.user.username
	});
})*/



app.post('/search_by_tag', mustBeAuthenticated, function(req, res){
	var notes = {
		username: req.user.username,
		notes_list: []
	};

	connection.query("SELECT id, note_value, tag FROM notes WHERE(tag = ?)", [req.body.tag] , function(error, result){
		if (error) throw error;

		for(var i=(result.length-1); i>=0; i--)
		{
			notes.notes_list.push({
				id : result[i].id,
				note_value : result[i].note_value,
				tag : result[i].tag
			});
		}	

		res.jsonp(notes);
	});
});








app.get('/add', mustBeAuthenticated, function(req, res){
	fs.ReadStream('../public/add.html').pipe(res);
})

app.post('/add', mustBeAuthenticated, function(req, res){
	connection.query("INSERT INTO `notes` (`owner`, `note_value`, `tag`) VALUES ('" + req.user.username + "', '" + req.body.note_value + "', '" + req.body.tag + "')", function (error, results, fields) {
		if (error) throw error;
	});

	res.redirect('/');
})


var note_id_for_change = "";

app.post('/note_id_for_change', mustBeAuthenticated, function(req, res){
	note_id_for_change = req.body.note_id_for_change;
	res.send(200);
});

app.get('/note', mustBeAuthenticated, function(req, res){
	connection.query("SELECT note_value, tag FROM notes WHERE (id = '" + note_id_for_change + "')", function (error, results, fields){
		if (error) throw error;

		res.render('change', {
			note_value : results[0].note_value,
			tag : results[0].tag
		})
	});
});


app.post('/change', mustBeAuthenticated, function(req, res){
	connection.query("UPDATE notes SET note_value = '" + req.body.note_value + "', tag = '" + req.body.tag + "' WHERE (id = '" + note_id_for_change + "')", function (error, results, fields){
		if (error) throw error;

		res.redirect('/');
	});
});



app.get('/delete', mustBeAuthenticated, function(req, res){
	connection.query("DELETE FROM notes WHERE (id = '" + note_id_for_change + "')", function (error, results, fields){
		if (error) throw error;

		res.redirect('/');
	});
});





app.listen(3030, function () {
  console.log('Example app listening on port 3030!');
});
