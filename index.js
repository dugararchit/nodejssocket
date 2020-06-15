const express = require("express");
const socketio = require("socket.io");
const http = require("http");
var app = express();
const { addUsers, getUsers, removeUsers, getUsersInRoom, addNotificationtouser, removeNotificationtouser } = require("./users");
const PORT = process.env.PORT || 5000;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var server = http.createServer(app);
var io = socketio(server);
var multer = require('multer');
var cors = require('cors');
app.use(cors());
app.use(express.static('public'));
io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("join", ({ name, room }, callback) => {

        const { error, user } = addUsers({ id: socket.id, name, room });
        if (error) {
            return callback({ error });
        }
        socket.emit("message", { "user": "admin", "text": `${user.name}, Welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { "user": "admin", "text": `${user.name} has joined` });
        socket.join(user.room);
        var allUsers = getUsersInRoom(room);
        console.log(allUsers, " all users");
        //socket.broadcast.to(room).emit("recentusers", { users: allUsers });
        io.to(room).emit("recentusers", { users: allUsers });
        io.to(room).emit("useradded", { user: user });
        callback({ user });
    })
    socket.on("disconnect", () => {
        console.log("Disconnecting");
        var user = removeUsers(socket.id);
        console.log(user);
        if (user) {
            io.to(user.room).emit("message", { user: "admin", text: `${user.name} has left the room.` });
            var allUsers = getUsersInRoom(user.room);
            socket.broadcast.to(user.room).emit("recentusers", { users: allUsers });
        }
        console.log("server disconnected");
    });

    socket.on("sendMessage", (message, callback) => {
        const user = getUsers(socket.id);
        console.log(user, " user");
        var callbackmsg = "User not found";
        if (user) {
            callbackmsg = "User Found";
            io.to(user.room).emit("message", { user: user.name, text: message });
        }
        callback(callbackmsg);
    })

    socket.on("sendfile", (message, callback) => {
        const user = getUsers(socket.id);
        console.log(message);
        if (user) {
            callbackmsg = "User Found";
            filepath = `<a target="_blank" download="${message.filename.filename}" href='https://virtualchatsocket.herokuapp.com/${message.filename.filename}'>Download</a>`;
            io.to(user.room).emit("messagefile", { user: user.name, file: filepath, text: "Please check attachment:-" });
        }
        callback();
    })

    socket.on("sendmessagetoserver", ({ from, to, msg }, callback) => {
        console.log(from, to, msg);
        var user = addNotificationtouser({ from, to });
        console.log(user);
        io.to(to).emit('receivemsg', { from, msg, user });
        callback();
    });

    socket.on("notificatioremoval", ({ to, from }, callback) => {
        removeNotificationtouser({ to, from });
        callback();
    });
});

app.post("/upload", (req, res) => {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname)
        }
    });
    var upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).json({ file: req.file })

    })
})
server.listen(PORT);
