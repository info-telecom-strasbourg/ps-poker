// Connexion à socket.io
var socket = io.connect('http://localhost:8080');

// Ask the user his/her pseudo
var pseudo = prompt('Quel est votre pseudo ?');
socket.emit('newClient', pseudo);

// Called when the user want to create a room
function createRoom() {
    var name = prompt('Quel est le nom de la salle ?');
    var maxPlayers = prompt('Combien de joueurs ?');
    socket.emit('create-room', name, maxPlayers);
}
// When a new room is created, display it on the list
socket.on('new-room', function (data) {
    addRoom(data.name, data.players.length, data.maxPlayers);
})

// Add a room to the list
function addRoom(name, nbPlayers, maxPlayers) {
    $('#rooms').prepend('<div id="' + name + '">' + name +
                          ' : <span id = nbPlayers>' + nbPlayers + '</span>/' +
                            '<span id = maxPlayers>' + maxPlayers + '</span>' +
                            '<button onclick="joinRoom(\'' + name + '\')">' +
                            'JOINDRE SALLE</button>' +
                        '<div>');
}

// When the client want to join the room
function joinRoom(name) {
    let nbPlayers = parseInt($("#rooms #" + name + " #nbPlayers").text());
    let maxPlayers = parseInt($("#rooms #" + name + " #maxPlayers").text());
    if (nbPlayers + 1 < maxPlayers)
        updateRoom(name, parseInt(nbPlayers) + 1);
    else
        removeRoom(name);
    socket.emit('join-room', name);
}

// Whe, a rrom is updated
socket.on('update-room', function (data) {
    updateRoom(data.name, data.nbPlayers);
})

function updateRoom(name, nbPlayers) {
    $("#rooms #" + name + " #nbPlayers").html(nbPlayers);
}

socket.on('remove-room', function (data) {
    removeRoom(data.name);
})

function removeRoom(name) {
    $("#rooms #" + name).remove();
}

console.log("Fuck");
