var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

// Chargement de la page index.html
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

let rooms = [];


io.sockets.on('connection', function (socket) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('newClient', function (pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        for (let i = 0; i < rooms.length; i++)
            socket.emit('new-room', { name: rooms[i].name, nbPlayers: rooms[i].players.length, maxPlayers: rooms[i].maxPlayers });
    });

    socket.on('validate-room-name', function (name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                socket.emit('response-room-name', { response: false });
                return;
            }
        }
        socket.emit('response-room-name', { response: true });
    });

    socket.on('create-room', function (name, maxPlayers) {
        name = ent.encode(name);
        maxPlayers = ent.encode(maxPlayers);
        let players = [socket];
        var room = { name: name, maxPlayers: maxPlayers, players: players };
        rooms.push(room);
        socket.broadcast.emit('new-room', { name: name, nbPlayers: players.length, maxPlayers: maxPlayers });
    });


    socket.on('join-room', function (name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                rooms[i].players.push(socket);
                if (rooms[i].players.length < rooms[i].maxPlayers)
                    socket.broadcast.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });
                else {
                    rooms.splice(i, 1);
                    socket.broadcast.emit('remove-room', { name: name });
                }

                break;
            }
        }
    });


    socket.on('leave-room', function (name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                let index = rooms[i].players.indexOf(socket);
                if (index > -1) {
                    rooms[i].players.splice(index, 1);
                }

                socket.broadcast.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });

                break;
            }
        }
    });

    socket.on('destroy-room', function (name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                rooms.splice(i, 1);

                socket.broadcast.emit('remove-room', { name: name });

                break;
            }
        }
    });

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

server.listen(8080);