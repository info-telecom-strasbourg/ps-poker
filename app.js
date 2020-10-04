var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'); // Protects against html inserts

app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/public'));
// Load the page index.html
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});



// Array of rooms
let rooms = [];

// Handle a client connection
io.sockets.on('connection', function (socket) {
    /* Listener to get the client pseudo and gives him all the
    rooms that already exist */
    socket.on('newClient', function (pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        for (let i = 0; i < rooms.length; i++)
            socket.emit('new-room', {name: rooms[i].name, nbPlayers: rooms[i].players.length, maxPlayers: rooms[i].maxPlayers});
    });

    /* Listener to validate a room name (check that this room name is not in the
       array of rooms) and communicate it to the creator */
    socket.on('validate-room-name', function (room) {
        for (let i = 0; i < rooms.length; i++)
            if (rooms[i].name == room.name) {
                socket.emit('response-room-name', { response: false });
                return;
            }
        var name = ent.encode(room.name);
        maxPlayers = ent.encode(room.nbPlayer);
        let players = [socket];
        var room = { name: name, maxPlayers: maxPlayers, players: players };
        rooms.push(room);
        socket.emit('response-room-name', { response: true, nbPlayers: players.length, maxPlayers: maxPlayers });
        socket.broadcast.emit('new-room', { name: name, nbPlayers: players.length, maxPlayers: maxPlayers });
        socket.emit('new-room', { name: name, nbPlayers: players.length, maxPlayers: maxPlayers });
    });

    // Listener to add a client in a room in the array of rooms and communicate it to the other clients
    socket.on('join-room', function (name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                rooms[i].players.push(socket);
                if (rooms[i].players.length < rooms[i].maxPlayers) {
                    socket.broadcast.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });
                    socket.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });

                }
                else {
                    rooms.splice(i, 1);
                    socket.broadcast.emit('remove-room', { name: name });
                    socket.emit('remove-room', { name: name });
                }

                return;
            }
        }
    });

    // Listener to remove a client in a room in the array of rooms and communicate it to the other clients
    socket.on('leave-room', function (name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                let index = rooms[i].players.indexOf(socket);
                if (index > -1) {
                    rooms[i].players.splice(index, 1);
                }

                socket.broadcast.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });
                socket.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });

                break;
            }
        }
    });

    // Listener to remove a room from the array of rooms and communicate to the other clients
    socket.on('destroy-room', function (name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                rooms.splice(i, 1);

                socket.broadcast.emit('remove-room', { name: name });
                socket.emit('remove-room', { name: name });

                break;
            }
        }
    });

    // Listener to remove a client in a room in the array of rooms because of a disconnection and communicate it to the other clients
    socket.on('disconnect', function () {
        for (let i = 0; i < rooms.length; i++) {
            let index = rooms[i].players.indexOf(socket);
            if (index > -1) {
                rooms[i].players.splice(index, 1);
                if (rooms[i].players.length != 0)
                    socket.broadcast.emit('update-room', { name: rooms[i].name, nbPlayers: rooms[i].players.length });
                else {
                    socket.broadcast.emit('remove-room', { name: rooms[i].name });
                    rooms.splice(i, 1);
                }
            }

        }
    });
});

// The server listen on the 8080 port
server.listen(8080);
