var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var router = express.Router();
var mongoOp = require("./models/userModel");
var mongoPo = require("./models/postModel");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": false }));

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();

});

router.route('/users')
    .get(function (req, res) {
        var response = {};
        mongoOp.find({}, function (err, document) {
            if (err) {
                response = {
                    "Error": true,
                    "Message": "Error fetching data"
                }
                return res.json(response);
            }
            res.json(document);
        })
    })

router.route('/signup')
    .post(function (req, res) {

        var response = {};
        var Data = new mongoOp({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            token: 0
        });
        Data.save(function (err) {
            if (err) {
                response = {
                    "Error": true,
                    "Message": "Error, code: " + err.code
                };
                if (err.code === "1100") {
                    response = {
                        "Error": true,
                        "Message": "Duplicate ID, CODE: " + err.code
                    };
                }
            } else {
                response = {
                    "Error": false,
                    "Message": "User added with success"
                }
            }
            res.json(response);
        })
    })


router.route('/me')
    .get(ensureAuthorized, function (req, res) {
        var response = {};
        mongoOp.findOne({ token: req.body.token }, function (err, document) {
            if (err) {
                res.status(401).end();
                return
            }
            response = {
                'Error': 'false',
                'username': document.username,
                'bd_id': document._id,
                'token': document.token
            }

            return res.status(200).json(response);

        })
    })

function ensureAuthorized(req, res, next) {
    var bearerToken;
    console.log(req.headers);
    var bearerHeader = req.headers["authorization"];
    console.log(bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

router.route('/login')
    .post(function (req, res) {
        var response = {};
        var username = req.body.username;
        var password = req.body.password;
        var secret = "f4d3t0bl";
        mongoOp.findOne({ username: username }, function (err, document) {
            if (document === undefined || document === null) {
                res.status(401).end();
                return
            }

            if (err) {
                res.json(401, { 'Error': 'Error em with the auth, please contact the adm, erro code: ' + err.code })
                return
            }

            document.verifyPassword(password, function (isMatch) {
                if (!isMatch) {
                    res.status(401).end();
                    return
                }
                var tk = jwt.sign({
                    iss: document.username,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60)
                }, secret);

                response = {
                    "Error": false,
                    "Message": "Success",
                    token: tk
                }

                mongoOp.update({ _id: document._id }, { $set: { token: tk } });

                res.json(response).status(200);

            })
        })

    })
router.route('/addPost')
    .post(ensureAuthorized, function (req, res) {

        var response = {};

        var Data = mongoPo({
            title: req.body.title,
            text: req.body.text,
            data: Date.now(),
            user_id: req.body._id
        })

        Data.save(function (err) {
            if (err) {
                response = {
                    "Error": true,
                    "Message": err
                }

                return res.status(200).json(response);
            }

            response = {
                "Error": false,
                "Message": "Post added with success"
            }

            return res.status(200).json(response);
        })
    })

app.use('/', router);

app.listen(3000);
console.log("Listening to PORT 3000");
