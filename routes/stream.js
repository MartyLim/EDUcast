var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET users listing. */
router.get('/:id', function(req, res, next) {
    const id = req.params.id;
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
    res.status(400).send("Requires Range header");
    }

    const videoPath = __dirname + `/../videos/${id}.mp4`;
    const videoSize = fs.statSync(__dirname + `/../videos/${id}.mp4`).size;

    // Parse range
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

module.exports = function (io) {
    //Socket.IO
    io.on('connection', function (socket) {
        console.log('User has connected');
        // Parse video ID from socket url
        var socketUrl = String(socket.handshake.headers.referer);
        var startIdx = socketUrl.lastIndexOf("/")+1;
        var endIdx = startIdx;
        for (var i = startIdx; i < socketUrl.length; i++) {
            var c = socketUrl.charAt(i);
            if (c <= '0' || c >= '9') {
                endIdx = i;
                break;
            }
            endIdx += 1; 
        }
        var vidId = socketUrl.substring(startIdx, endIdx);

        socket.on(`${vidId}seek`, function(seekTime) {
            io.emit(`${vidId}seek`, seekTime);
        });
    });
    return router;
};

