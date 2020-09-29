var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

let rooms = [];


io.sockets.on('connection', function (socket) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('newClient', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        for (let i = 0; i < rooms.length; i++)
            socket.emit('new-room', {name: rooms[i].name, nbPlayers: rooms[i].players.length, maxPlayers: rooms[i].maxPlayers});
    });


    socket.on('create-room', function (name, maxPlayers) {
        name = ent.encode(name);
        maxPlayers = ent.encode(maxPlayers);
        let players = [socket];
        var room = {name: name, maxPlayers: maxPlayers, players: players};
        rooms.push(room);
        socket.broadcast.emit('new-room', {name: name, nbPlayers: players.length, maxPlayers: maxPlayers});
    }); 

    socket.on('new-room', function (info) {
        info = ent.encode(info);
        socket.broadcast.emit('info', {pseudo: socket.pseudo, info: info});
    }); 

    socket.on('join-room', function(name) {
        for(let i = 0; i < rooms.length; i++)
        {
            if (rooms[i].name == name)
            {
                rooms[i].players.push(socket);
                if (rooms[i].players.length + 1 < rooms[i].maxPlayers)
                    socket.broadcast.emit('update-room', {name: name, nbPlayers: rooms[i].players.length});
                else
                    socket.broadcast.emit('remove-room', {name: name});

                console.log(rooms[i].players.length);
                break;
            }
        }
    });
});

server.listen(8080);