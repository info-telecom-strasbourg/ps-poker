const { env } = require('process');

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'); // Protects against html inserts

app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/public'));

var id_room = new Uint16Array(1);
id_room[0] = 0;

// Array of rooms
let rooms = [];

// Load the page index.html
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

// Load the page index.html
app.get('/room', function(req, res) {
    res.sendFile(__dirname + '/client/room.html');
});


function listPlayers(room) {
    let players = [];
    for (let i = 0; i < room.players.length; i++)
        players.push(room.players[i].pseudo);
    return players;
}


// Handle a client connection
io.sockets.on('connection', function(socket) {
    /* Listener to get the client pseudo and gives him all the
    rooms that already exist */

    for (let i = 0; i < rooms.length; i++) {
        app.get('/'.concat(i.toString()), function(req, res) {
            res.sendFile(__dirname + '/client/room.html');
        });
    }


    socket.on('newClient', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        for (let i = 0; i < rooms.length; i++)
            socket.emit('new-room', { name: rooms[i].name, nbPlayers: rooms[i].players.length, maxPlayers: rooms[i].maxPlayers });
    });

    /* Listener to validate a room name (check that this room name is not in the
       array of rooms) and communicate it to the creator */
    socket.on('validate-room-name', function(room) {
        for (let i = 0; i < rooms.length; i++)
            if (rooms[i].name == room.name) {
                socket.emit('response-room-name', { response: false });
                return;
            }
        var name = ent.encode(room.name);
        maxPlayers = ent.encode(room.nbPlayer);
        let players = [socket];
        var room = { id: id_room[0], name: name, maxPlayers: maxPlayers, players: players };
        rooms.push(room);
        socket.emit('response-room-name', { response: true, nbPlayers: players.length, maxPlayers: maxPlayers });
        socket.broadcast.emit('new-room', { name: name, nbPlayers: players.length, maxPlayers: maxPlayers });
        socket.emit('new-room', { name: name, nbPlayers: players.length, maxPlayers: maxPlayers });
    });


    // Listener to add a client in a room in the array of rooms and communicate it to the other clients
    socket.on('join-room', function(name) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name == name) {
                rooms[i].players.push(socket);
                if (rooms[i].players.length < rooms[i].maxPlayers) {
                    socket.broadcast.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });
                    socket.emit('update-room', { name: name, nbPlayers: rooms[i].players.length });

                } else {
                    let players = listPlayers(rooms[i]);
                    rooms[i].players.forEach(element => element.emit('redirect', { players: players }));
                    rooms.splice(i, 1);
                    socket.broadcast.emit('remove-room', { name: name });
                    socket.emit('remove-room', { name: name });
                    Player1 = new Player('Elnegrillo', 100, 0, false);
                    Player2 = new Player('Isildur1', 100, 1, false);
                    Player3 = new Player('CrownUpGuy', 100, 2, false);
                    Player4 = new Player('durrrr', 100, 3, false);
                    Player5 = new Player('Alexonmoon', 100, 4, false);
                    dealer = new Environment([Player1, Player2, Player3, Player4, Player5], deck_cards, 0.5, 1);
                }

                return;
            }
        }
    });

    // Listener to remove a client in a room in the array of rooms and communicate it to the other clients
    socket.on('leave-room', function(name) {
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
    socket.on('destroy-room', function(name) {
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
    socket.on('disconnect', function() {
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

    socket.on('do_check', function() {
        // check
    });

    socket.on('do_bet', function() {
        // bet
    });

    socket.on('do_pass', function() {
        // pass
    });

    socket.on('do_follow', function() {
        // follow
    });

    socket.on('do_rising', function() {
        // rising
    });


});

// Declaration of objects 
class Player {
    constructor(nick, stack, position, is_bot) {
        this.nick = nick; //Player's nickname , string
        this.stack = stack; //Player's stack, int 
        this.position = position; //Position at the table, int
        this.hand = [0, 0]; //Player's hand , list
        this.bet = 0; //Player's current bet  ,  float
        this.is_playing = false; //True if the player is playing , bool
        this.as_played = false; // True if the played at least one time
        this.is_allin = false; // True if the player is all in
        this.btn = false; // True if the player is at the button
        this.gain_pot = 0; // potentiel gain of the player
        this.is_bot = is_bot; // True if the player is a bot
    }
}

class Environment {
    constructor(players, deck, sb, bb) {
        this.board = [];
        this.pot = 0;
        this.side_pot = 0;
        this.deck_ini = deck;
        this.players = players;
        this.sb = sb;
        this.bb = bb;
        this.current_deck = [];
        this.btn = 0;
    }
}

deck_cards = [{ name: '2d', color: 'd', value: 2 }, { name: '3d', color: 'd', value: 3 }, { name: '4d', color: 'd', value: 4 }, { name: '5d', color: 'd', value: 5 }, { name: '6d', color: 'd', value: 6 }, { name: '7d', color: 'd', value: 7 }, { name: '8d', color: 'd', value: 8 }, { name: '9d', color: 'd', value: 9 }, { name: 'Td', color: 'd', value: 10 }, { name: 'Jd', color: 'd', value: 11 }, { name: 'Qd', color: 'd', value: 21 }, { name: 'Kd', color: 'd', value: 13 }, { name: 'Ad', color: 'd', value: 14 }];
deck_cards = deck_cards.concat([{ name: '2h', color: 'h', value: 2 }, { name: '3h', color: 'h', value: 3 }, { name: '4h', color: 'h', value: 4 }, { name: '5h', color: 'h', value: 5 }, { name: '6h', color: 'h', value: 6 }, { name: '7h', color: 'h', value: 7 }, { name: '8h', color: 'h', value: 8 }, { name: '9h', color: 'h', value: 9 }, { name: 'Th', color: 'h', value: 10 }, { name: 'Jh', color: 'h', value: 11 }, { name: 'Qh', color: 'h', value: 21 }, { name: 'Kh', color: 'h', value: 13 }, { name: 'Ah', color: 'h', value: 14 }]);
deck_cards = deck_cards.concat([{ name: '2s', color: 's', value: 2 }, { name: '3s', color: 's', value: 3 }, { name: '4s', color: 's', value: 4 }, { name: '5s', color: 's', value: 5 }, { name: '6s', color: 's', value: 6 }, { name: '7s', color: 's', value: 7 }, { name: '8s', color: 's', value: 8 }, { name: '9s', color: 's', value: 9 }, { name: 'Ts', color: 's', value: 10 }, { name: 'Js', color: 's', value: 11 }, { name: 'Qs', color: 's', value: 21 }, { name: 'Ks', color: 's', value: 13 }, { name: 'As', color: 's', value: 14 }]);
deck_cards = deck_cards.concat([{ name: '2c', color: 'c', value: 2 }, { name: '3c', color: 'c', value: 3 }, { name: '4c', color: 'c', value: 4 }, { name: '5c', color: 'c', value: 5 }, { name: '6c', color: 'c', value: 6 }, { name: '7c', color: 'c', value: 7 }, { name: '8c', color: 'c', value: 8 }, { name: '9c', color: 'c', value: 9 }, { name: 'Tc', color: 'c', value: 10 }, { name: 'Jc', color: 'c', value: 11 }, { name: 'Qc', color: 'c', value: 21 }, { name: 'Kc', color: 'c', value: 13 }, { name: 'Ac', color: 'c', value: 14 }]);

// Declaration of functions

function copy(array) { //Return a copy of array in res
    res = [];
    for (i in array) {
        res.push(array[i]);
    }
    return res;
}

function sort_cards(cards) //Sort cards
{
    cards_copy = copy(cards);
    return cards_copy.sort(function(a, b) {
        return a.value - b.value;
    });
}

function hands_list(hand, board) { // Return all combinations of 5 cards betwenn hand and board
    list_cards = hand.concat(board);
    result = [];
    length = list_cards.length;
    for (let i = 0; i < length - 1; i++) {
        for (let j = i + 1; j < length; j++) {
            temp = copy(list_cards);
            temp.splice(temp.indexOf(list_cards[i]), 1);
            temp.splice(temp.indexOf(list_cards[j]), 1);
            result.push(sort_cards(temp));
        }
    }
    return result;
}

function get_value(cards) { // return values of a card list
    values = []
    for (i in cards) {
        values.push(cards[i].value);
    }
    return values;

}

function is_highest_cards(cards1, cards2) { //Return true if cards1 is strictly higher than cards2 ,else return false
    values1 = get_value(cards1);
    values2 = get_value(cards2);
    if (values1 == values2) {
        return true;
    }
    for (let i = cards1.length - 1; i > -1; i--) {
        if (values1[i] > values2[i]) {
            return true;
        } else if (values2[i] > values1[i]) {
            return false;

        }

    }
    return false;

}

function same_array(array1, array2) { //Return true is array1 and array2 are the same
    if (array1.length != array2.length) {
        return false
    }
    for (i in array1) {
        if (array1[i] != array2[i]) {
            return false;
        }

    }
    return true
}

function find_highest_cards(cards_list) { //Return the highest hand in terms of 
    maximum = [cards_list[0]];
    for (j = 1; j < cards_list.length; j++) {
        if (same_array(get_value(maximum[0]), get_value(cards_list[j]))) {
            maximum.push(cards_list[j])
        } else if (is_highest_cards(cards_list[j], maximum[0])) {
            maximum = [cards_list[j]]

        }
    }
    return maximum;

}

function find_best_straigth(cards_list) { //Return the best straigth
    maximum = [cards_list[0]];
    for (j = 1; j < cards_list.length; j++) {
        if (same_array(get_value(maximum[0]), get_value(cards_list[j]))) {
            maximum.push(cards_list[j])
        } else if (cards_list[j][3].value > maximum[0][3].value) {
            maximum = [cards_list[j]]

        }
    }
    return maximum;

}



function is_flush(cards) { // Return true if cards is a flush
    ref = cards[0].color;
    for (i in cards) {
        if (ref != cards[i].color) {
            return false;
        }
    }
    return true;
}

function is_straigth(cards) { // Return true if cards is a straigth
    values = get_value(cards);
    if (values[0] == 2 && values[1] == 3 && values[2] == 4 && values[3] == 5 && values[4] == 14) {
        return true;
    }
    for (i = 0; i < cards.length - 1; i++) {
        if (values[i] + 1 != values[i + 1]) {
            return false;
        }
    }
    return true;
}

function is_straigth_flush(cards) { // Return true if cards is a straigth flush
    return is_straigth(cards) && is_flush(cards);
}

function unilist(list) { //Return true if every element of list is the same
    ref = list[0]
    for (i in list) {
        if (list[i] != ref) {
            return false
        }
    }
    return true
}

function is_quad(cards) {
    values = get_value(cards);
    return unilist(values.slice(1, values.length)) || unilist(values.slice(0, values.length - 1));
}

function is_full_house(cards) {
    values = get_value(cards);
    return (unilist(values.slice(0, 3)) && unilist(values.slice(3, values.length))) || (unilist(values.slice(0, 2)) && unilist(values.slice(2, values.length)));
}

function is_trips(cards) {
    values = get_value(cards);
    return unilist(values.slice(0, 3)) || unilist(values.slice(1, 4)) || unilist(values.slice(2, 5));
}

function is_two_pairs(cards) {
    values = get_value(cards);
    return (unilist(values.slice(0, 2)) && unilist(values.slice(2, 4))) || (unilist(values.slice(0, 2)) && unilist(values.slice(3, 5))) || (unilist(values.slice(1, 3)) && unilist(values.slice(3, 5)));
}

function is_pair(cards) {
    values = get_value(cards);
    return unilist(values.slice(0, 2)) || unilist(values.slice(1, 3)) || unilist(values.slice(2, 4)) || unilist(values.slice(3, 5));

}

function sort_quad(quad) {
    values = get_value(quad);
    if (unilist(values.slice(1, values.length))) {
        return quad;
    } else {
        return [quad[4]].concat(quad.slice(0, 4));
    }
}

function sort_trips(trips) {
    values = get_value(trips);
    if (unilist(values.slice(2, 5))) {
        return trips;
    } else if (unilist(values.slice(1, 4))) {
        return [trips[0], trips[4]].concat(trips.slice(1, 4));
    } else if (unilist(values.slice(0, 3))) {
        return [trips[3], trips[4]].concat(trips.slice(0, 3));
    }
}

function sort_two_pairs(two_pairs) {
    values = get_value(two_pairs);
    if ((unilist(values.slice(0, 2)) && unilist(values.slice(2, 4)))) {
        return [two_pairs[4]].concat(two_pairs.slice(0, 4));
    } else if (unilist(values.slice(0, 2)) && unilist(values.slice(3, 5))) {
        return ([two_pairs[2]].concat(two_pairs.slice(0, 2))).concat(two_pairs.slice(3, 5));
    } else if (unilist(values.slice(1, 3)) && unilist(values.slice(3, 5))) {
        return two_pairs;
    }

}

function sort_pair(pair) {
    values = get_value(pair);
    if (unilist(values.slice(0, 2))) {
        return [pair[2], pair[3], pair[4], pair[0], pair[1]];
    } else if (unilist(values.slice(1, 3))) {
        return [pair[0], pair[3], pair[4], pair[1], pair[2]];
    } else if (unilist(values.slice(2, 4))) {
        return [pair[0], pair[1], pair[4], pair[2], pair[3]];
    } else if (unilist(values.slice(3, 5))) {
        return pair;
    }
}

function sort_specific_hands(hands, sort_func) {
    for (i in hands) {
        hands[i] = sort_func(hands[i])
    }
    return hands;
}





function best_hand(hands) { //Return an array containing the bests hands in list "hands"
    list_straigth_flush = [];
    list_quad = [];
    list_full_house = [];
    list_flush = [];
    list_straigth = [];
    list_trips = [];
    list_two_pairs = [];
    list_pair = [];
    list_high_card = [];
    for (i in hands) {
        combination = hands[i];
        if (is_straigth_flush(combination)) {
            list_straigth_flush.push(combination);
        } else if (is_quad(combination)) {
            list_straigth_flush.push(combination);
        } else if (is_straigth_flush(combination)) {
            list_quad.push(combination);
        } else if (is_full_house(combination)) {
            list_full_house.push(combination);
        } else if (is_flush(combination)) {
            list_flush.push(combination);
        } else if (is_straigth(combination)) {
            list_straigth.push(combination);
        } else if (is_trips(combination)) {
            list_trips.push(combination);
        } else if (is_two_pairs(combination)) {
            list_two_pairs.push(combination);
        } else if (is_pair(combination)) {
            list_pair.push(combination);
        } else {
            list_high_card.push(combination);

        }

    }
    if (list_straigth_flush.length != 0) {
        return find_best_straigth(list_straigth_flush);
    }
    if (list_quad.length != 0) {
        return find_highest_cards(sort_specific_hands(list_quad, sort_quad));
    }
    if (list_full_house.length != 0) {
        return find_highest_cards(sort_specific_hands(list_full_house, sort_trips));;
    }
    if (list_flush.length != 0) {
        return find_highest_cards(list_flush);
    }
    if (list_straigth.length != 0) {
        return find_best_straigth(list_straigth);
    }
    if (list_trips.length != 0) {
        return find_highest_cards(sort_specific_hands(list_trips, sort_trips));
    }
    if (list_two_pairs.length != 0) {
        return find_highest_cards(sort_specific_hands(list_two_pairs, sort_two_pairs));
    }
    if (list_pair.length != 0) {
        return find_highest_cards(sort_specific_hands(list_pair, sort_pair));
    }
    if (list_high_card.length != 0) {
        return find_highest_cards(list_high_card);
    }
}

function shuffle(a) { //Shuffle array a
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


function deal(env) { //deal two cards to every players 
    env.current_deck = shuffle(env.current_deck);
    for (i in env.players) {
        env.players[i].is_playing = true;
        env.players[i].hand[0] = env.current_deck.pop();
        env.players[i].hand[1] = env.current_deck.pop();
    }

}

function betting(env, idx, amount) {
    size_bet = Math.min(amount, env.players[idx].stack);
    env.players[idx].bet = env.players[idx].bet + size_bet;
    env.pot = env.pot + size_bet;
    env.players[idx].stack = env.players[idx].stack - size_bet;
    env.players[idx].as_played = true;
}

function checking(env, idx) {
    env.players[idx].as_played = true;
}


function action(env, idx) {
    player = env.players[idx];

}

function draw(env) {
    env.board.push(env.current_deck.pop);
}

function street(env, starting_position, street_idx) {
    if (street_idx > 0) {
        draw(env);
    }
    for (i in env.players.length) {
        idx = i + starting_position;
        if (env.players[idx].is_playing && !(env.players[idx].is_allin)) {
            action(env, idx);
        }
    }
}


function play(env) {
    env.board = [];
    env.pot = env.side_pot;
    env.side_pot = 0;
    env.btn = (env.btn + 1) % (env.players.length);
    for (i in env.players) {
        env.players[i].hand = [0, 0];
        env.players[i].is_allin = false;
        env.players[i].is_as_played = false;
        env.players[i].gain_pot = 0;
        env.players[i].bet = 0;
        if (env.players[i].position == env.btn) {
            env.players[i].btn = true;
        } else {
            env.players[i].btn = false;
        }
    }

    if (env.players.length == 2) {
        sb = env.btn;
    } else {
        sb = (env.btn + 1) % (env.players.length);
    }

    betting(env, sb, env.sb) //Small blind
    betting(env, (sb + 1) % env.players.length, env.bb); //Big blind
    //PREFLOP

    env.current_deck = copy(env.deck_ini);
    deal(env);

}

// 




// Test

// Player1 = new Player('Elnegrillo', 100, 0, false);
// Player2 = new Player('Isildur1', 100, 1, false);
// Player3 = new Player('CrownUpGuy', 100, 2, false);
// Player4 = new Player('durrrr', 100, 3, false);
// Player5 = new Player('Alexonmoon', 100, 4, false);
// dealer = new Environment([Player1, Player2, Player3, Player4, Player5], deck_cards, 0.5, 1);
// play(dealer);

// hand = [{ name: '2h', color: 'h', value: 2 }, { name: '3h', color: 'h', value: 3 }];

// board1 = [{ name: '4s', color: 's', value: 4 }, { name: '4d', color: 'd', value: 4 }, { name: '5h', color: 'h', value: 5 }, { name: '6c', color: 'c', value: 6 }, { name: 'As', color: 's', value: 14 }];
// board2 = [{ name: '4s', color: 's', value: 4 }, { name: '5d', color: 'd', value: 5 }, { name: '5h', color: 'h', value: 5 }, { name: 'Kc', color: 'c', value: 13 }, { name: 'As', color: 's', value: 14 }];
// board3 = [{ name: '2s', color: 's', value: 2 }, { name: '3d', color: 'd', value: 3 }, { name: '4h', color: 'h', value: 4 }, { name: '5c', color: 'c', value: 5 }, { name: '5s', color: 's', value: 5 }];

// combination1 = [{ color: 's' }, { color: 'd' }, { color: 's' }, { color: 's' }, { color: 's' }];
// combination2 = [{ value: 4, color: 's' }, { value: 5, color: 's' }, { value: 6, color: 's' }, { value: 8, color: 's' }, { value: 9, color: 's' }];

<<
<<
<< < HEAD
// toast = [sort_cards(board1), sort_cards(board2), sort_cards(board3)];

// //console.log(best_hand(hands_list(hand,board3)));
// console.log();
    ===
    ===
    =
    toast = [sort_cards(board1), sort_cards(board2), sort_cards(board3)];
draw(dealer);
//console.log(best_hand(hands_list(hand,board3)));
console.log(dealer.board); >>>
>>>
> 7 f8a7b7edef2387712b7c15a7fd0f4eba09c0fb9
// The server listen on the 8080 port
server.listen(8080);