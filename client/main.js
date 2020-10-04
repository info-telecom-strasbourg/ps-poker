// Connection to socket.io
var socket = io.connect('http://localhost:8080');

// Pseudo of the client
var pseudo;

// Room in which the client is
var roomName = "";


/**
 * Validate the pseudo and emit a signal to communicate there is a new client
 */
function validatePseudo() {
    var inputPseudo = document.getElementById('pseudo');
    pseudo = nl2br(htmlEntities(inputPseudo.value));

    if (pseudo.length < 2) {
        document.getElementById('pseudo-error').style.display = "block";
        return;
    }
    document.getElementById('connection').style.display = "none";

    socket.emit('newClient', pseudo);
}

/**
 * Emit a signal to validate the room name during the creation of a room
 */
function validateRoom() {
    document.getElementById('room-modal-name-error2').style.display = "none";
    var inputRoom = document.getElementById('room-modal-name');
    var maxPlayers = document.getElementById('room-modal-nb').value;
    if(inputRoom.value.length < 2) {
      document.getElementById('room-modal-name-error').style.display = "block";
      return;
    }
    else
      document.getElementById('room-modal-name-error').style.display = "none";

    socket.emit('validate-room-name', {name: inputRoom.value,
                                       nbPlayer: maxPlayers});
}

// Listener to validate a room name if it can be used, emit a signal to communicate that the room
// is created and puts the client on hold
socket.on('response-room-name', function (data) {
    if (!data.response)
        document.getElementById('room-modal-name-error2').style.display="block";
    else
    {
      document.getElementById('room-modal').style.display = "none";
      waitingRoom(data.nbPlayers, data.maxPlayers);
    }
})

/**
 * Create a room
 */
function createRoom() {
    document.getElementById('room-modal').style.display = "block";
}

/**
 * Puts the client on hold
 */
function waitingRoom(nbPlayers, maxPlayers) {
    document.getElementById('waiting-modal').style.display = "block";
    document.getElementById('waiting-nbPlayers').innerHTML = nbPlayers;
    document.getElementById('waiting-maxPlayers').innerHTML = maxPlayers;
}

/**
 * Cancel the creation of a room
 */
function cancelRoom() {
    document.getElementById('room-modal').style.display = "none";
}

function parseName(name) {
    var name = name.split(' ').join('_');
    name = name.split('\"').join('\\\"');
    name = name.split('\'').join('\\\'');
    return name;
}

/**
 * Takes the client out of the room and emit a signal to communicate it to the others
 */
function leaveRoom() {
    var correctedName = parseName(roomName);
    document.getElementById('waiting-modal').style.display = "none";
    let nbPlayers = parseInt($("#rooms #" + correctedName + " #nbPlayers").text());
    if (nbPlayers - 1 == 0)
        socket.emit('destroy-room', roomName);
    else
        socket.emit('leave-room', roomName);
}


// Listener to add a room in the list of rooms if a new room has been created
socket.on('new-room', function (data) {
    addRoom(data.name, data.nbPlayers, data.maxPlayers);
})

/**
 * Add a room in the list of rooms
 *
 * @param name: name of the room
 * @param nbPlayers: current number of players in the room
 * @param maxPlayers: number of players to start the game
 */
function addRoom(name, nbPlayers, maxPlayers) {
    var correctedName = parseName(name);
    $('#rooms').prepend('<div id="' + correctedName + '">' + name + '<span id = nbPlayers>' + nbPlayers + '</span>' + "/" + '<span id = maxPlayers>' + maxPlayers + '</span>' + '<button onclick="joinRoom(\'' + name + '\')">JOINDRE SALLE</button>' + '<div>');
}

/**
 * Join a room in the list of rooms
 *
 * @param name: name of the room
 */
function joinRoom(name) {
    roomName = name;
    var correctedName = parseName(name);
    let nbPlayers = parseInt($("#rooms #" + correctedName + " #nbPlayers").text());
    let maxPlayers = parseInt($("#rooms #" + correctedName + " #maxPlayers").text());
    if (nbPlayers + 1 < maxPlayers) {
        updateRoom(name, parseInt(nbPlayers) + 1);
        waitingRoom(nbPlayers + 1, maxPlayers);
    }
    else
        removeRoom(name);
    socket.emit('join-room', name);
}

// Listerner to update a room if someone entered or left a room
socket.on('update-room', function (data) {
    updateRoom(data.name, data.nbPlayers);
})

/**
 * Update a room if someone entered or left a room
 *
 * @param name: name of the room
 * @param nbPlayers: current number of players in the room
 */
function updateRoom(name, nbPlayers) {
    var correctedName = parseName(name);
    $("#rooms #" + correctedName + " #nbPlayers").html(nbPlayers);
    if (document.getElementById('waiting-modal').style.display == "block" && name == roomName)
        document.getElementById('waiting-nbPlayers').innerHTML = nbPlayers;
}

// Listerner to supress a room in the list of rooms
socket.on('remove-room', function (data) {
    removeRoom(data.name);
})

/**
 * Supress a room in the list of rooms
 *
 * @param name: name of the room
 */
function removeRoom(name) {
    var correctedName = parseName(name);
    if (document.getElementById('waiting-modal').style.display == "block" && name == roomName)
        document.getElementById('waiting-modal').style.display = "none";
    $("#rooms #" + correctedName).remove();
}

/**
 * Convert all "\n" or "\r\n" or "\r" to "<br>" in a string.
 *
 * @param str: the string that will be modified
 * @return the string without the characters specified and with the <br>
 */
function nl2br(str) {
    return str.replace(/(\r\n|\r|\n)/g, '<br>');
}

/**
 * Protects against html inserts
 *
 * @param str: the string that will be modified
 * @return the string without the html inserts
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
