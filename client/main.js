// Connexion à socket.io
var socket = io.connect('http://localhost:8080');

// On demande le pseudo et on l'envoie au serveur
var pseudo = prompt('Quel est votre pseudo ?');
socket.emit('newClient', pseudo);

function createRoom() {
    var name = prompt('Quel est le nom de la salle ?');
    var maxPlayers = prompt('Combien de joueurs ?');
    socket.emit('create-room', name, maxPlayers);
    addRoom(name, 1, maxPlayers);
}

socket.on('new-room', function (data) {
    addRoom(data.name, data.nbPlayers, data.maxPlayers);
})

function addRoom(name, nbPlayers, maxPlayers) {
    $('#rooms').prepend('<div id="' + name + '">' + name + '<span id = nbPlayers>' + nbPlayers + '</span>' + "/" + '<span id = maxPlayers>' + maxPlayers + '</span>' + '<button onclick="joinRoom(\'' + name + '\')">JOINDRE SALLE</button>' + '<div>');
}

function joinRoom(name) {
    let nbPlayers = parseInt($("#rooms #" + name + " #nbPlayers").text());
    let maxPlayers = parseInt($("#rooms #" + name + " #maxPlayers").text());
    if (nbPlayers + 1 < maxPlayers)
        updateRoom(name, parseInt(nbPlayers) + 1);
    else
        removeRoom(name);
    socket.emit('join-room', name);
}

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
