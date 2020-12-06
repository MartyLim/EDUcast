var express = require('express');
var formidable = require('formidable');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('upload');
});

router.post('/submit', function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        const count = fs.readdirSync(__dirname + '/../videos').length;
        var newpath = __dirname + `/../videos/${count}.mp4`;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            res.render('uploadsubmit', {vidName:files.filetoupload.name, vidID:count});
        });     
    });
});

module.exports = router;
