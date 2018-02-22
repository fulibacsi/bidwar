
var ASSETS = {
    'atk': window.asset_dir + "/atk.png",
    'def': window.asset_dir + "/def.png",
    'heal': window.asset_dir + "/heal.png",
    'buff': window.asset_dir + "/buff.png"
}

TURN = 1;

var PLAYER = {
    'name': 'player',
    'hp_element': 'p1-act-hp',
    'hp': 10,
    'atk': 1,
    'def': 1,
    'heal': 1,
    'buff': 0
}

var AI = {
    'name': 'ai',
    'hp_element': 'p2-act-hp',
    'hp': 10,
    'atk': 1,
    'def': 1,
    'heal': 1,
    'buff': 0
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function hide(target) {
    target.classList.add('invisible');
    target.classList.remove('visible');
}

function show(target) {
    target.classList.remove('invisible');
    target.classList.add('visible');
}

function cycle_visibility(target) {
    target.classList.toggle('invisible');
    target.classList.toggle('visible');
}

function get_new_id(base='') {
    var id = base;
    var i = 0;
    while (document.getElementById(id)) {
        i++;
        id = base + i;
    }
    return id;
}

function find_target() {
    if (document.getElementById('move-slot-1').childNodes[0].nodeType == 3) {
        return document.getElementById('move-slot-1');
    } else if (document.getElementById('move-slot-2').childNodes[0].nodeType == 3) {
        return document.getElementById('move-slot-2');
    } else {
        return null;
    }
}

function move(id) {
    var target = find_target();
    if (target != null) {
        var element = document.getElementById(id);
        var parent = element.parentNode;
        element.setAttribute('onclick', 'remove(id="' + id + '")')
        parent.removeChild(element);
        parent.innerHTML = "&nbsp;";

        target.innerHTML = '';
        target.appendChild(element);
    }
}

function remove(id) {
    var element = document.getElementById(id);
    var parent = element.parentNode;
    element.setAttribute('onclick', 'move(id="' + id + '")')
    parent.removeChild(element);
    parent.innerHTML = "&nbsp;";

    var target = document.getElementById(element.getAttribute('parent-node'));
    target.innerHTML = '';
    target.appendChild(element);
}

function create_move(type='', target, onclick=true) {
    var id = get_new_id(type + '-icon')
    var img = document.createElement('img');
    img.setAttribute('src', ASSETS[type]);
    img.setAttribute('type', type);
    img.setAttribute('class', 'move');
    img.setAttribute('id', id);
    img.setAttribute('width', 50);
    if (onclick) {
        img.setAttribute('onclick', 'move(id="' + id + '")');
    }
    img.setAttribute('parent-node', target);

    var target = document.getElementById(target);
    target.childNodes.forEach( function(child) { target.removeChild(child) });
    target.appendChild(img);
}

function select_move() {
    var choices = Object.keys(ASSETS);
    var result = choices[random(0, choices.length-1)];
    return result;
}

function select_ai_moves() {
    create_move(select_move(), 'move-slot-3', onclick=false);
    create_move(select_move(), 'move-slot-4', onclick=false);
}

function clear_moves() {
    var targets = Array.from(document.getElementsByClassName('move'));
    targets.forEach( function(element) {
        var parent = element.parentNode;
        element.remove();
        parent.innerHTML = "&nbsp;";
    });
}

function init_player_moves() {
    log('TURN #' + TURN + ':');
    for (i = 1; i < 9; i++) { 
        create_move(select_move(), 'p1-move-slot-' + i);
    }
}

function change_bid(amount, target, bp_element) {
    var act_bp = document.getElementById(bp_element);
    var act_bp_value = parseInt(act_bp.textContent);
    target = document.getElementById(target);
    var value = parseInt(target.textContent);
    if (act_bp_value - amount >= 0) {
        target.innerText = value + amount;
        act_bp.innerText = act_bp_value - amount;
    }
}

function set_ai_bids() {
    for (i = 0; i < 10; i++) {
        change_bid(amount=1, target="p2-bid-slot-" + random(1, 4), bp_element='p2-act-bp');
    }
}

function log(message) {
    var target = document.getElementById('log');
    var node = document.createElement("p");
    var textnode = document.createTextNode(message);
    node.appendChild(textnode);
    target.appendChild(node);
}

function execute_move(move) {
    var user = move['user'];
    var target = user['name'] == 'player' ? AI : PLAYER;
    var action = move['action'];
    switch(action){
        case 'buff': 
            user['buff']++;
            log(user['name'] + ' buffed itself. current buff level: ' + user['buff'] + '.');
            break;
        case 'atk' :
            damage = Math.max(0, 1 + user['atk'] + user['buff'] - target['def'] - target['buff']);
            target['hp'] -= damage;
            document.getElementById(target['hp_element']).innerText = target['hp'];
            user['buff'] = 0;
            target['buff'] = 0;
            target['def'] = 1;
            log(user['name'] + ' inflicted ' + damage + ' damage.');
            break;
        case 'def':
            defense = 1 + user['buff'];
            user['def'] += defense;
            user['buff'] = 0;
            log(user['name'] + ' boosted it\'s defense to ' + user['def']);
            break;
        case 'heal':
            heal = 1 + user['buff'];
            user['hp'] = Math.min(10, user['hp'] + heal);
            document.getElementById(user['hp_element']).innerText = user['hp'];
            user['buff'] = 0;
            log(user['name'] + ' healed itself by ' + heal + ' points.');
            break;
    }
}

function evaluate() {
    var moves = [];
    
    // PARSE MOVES AND BIDS
    for (i = 1; i < 5; i++) {
        var move = document.getElementById('move-slot-' + i).childNodes[0].getAttribute('type');
        var player_bid = parseInt(document.getElementById('p1-bid-slot-' + i).textContent);
        var ai_bid = parseInt(document.getElementById('p2-bid-slot-' + i).textContent);
        
        if (player_bid > ai_bid) {
            moves.push({'user': PLAYER, 'action': move});
        } else if (player_bid < ai_bid) {
            moves.push({'user': AI, 'action': move});
        } else {
            moves.push({'user': PLAYER, 'action': move});
            moves.push({'user': AI, 'action': move});
        }
    }

    // EXECUTE ACTIONS
    var number_of_moves = moves.length;
    for (i = 0; i < number_of_moves; i++) {
        console.log('i: ', i);
        console.log('before: ', moves)
        var index = random(0, moves.length - 1);
        var move = moves[index];
        moves.splice(index, 1);
        console.log('index: ', index);
        console.log('move: ', move);
        console.log('after: ', moves);
        console.log('---------------');

        execute_move(move);
        
        if (PLAYER['hp'] == 0) {
            log('player died. try again?');
            return 'death';
        }
        if (AI['hp'] == 0) {
            alert('ai died. play again?');
            return 'death';
        }
    }
    TURN++;
    return TURN;
}

function set_moves() {
    log('Moves setted!');

    select_ai_moves();
    
    var targets = Array.from(document.getElementsByClassName('bidding-interface'));
    targets.forEach( function(element) {
        cycle_visibility(element);
    });
    cycle_visibility(document.getElementById('p1-place-bids'));
    cycle_visibility(document.getElementById('p1-set-moves'));
    
    var moves = Array.from(document.getElementsByClassName('move'));
    moves.forEach( function(element) { element.removeAttribute('onclick'); });
}

function submit_bids() {
    log('Bids placed!');
    
    set_ai_bids();
    var result = evaluate();
    
    if (result == 'death') {
        reset_game();
    } else {
        var targets = Array.from(document.getElementsByClassName('bidding-interface'));
        targets.forEach( function(element) {
            cycle_visibility(element);
        });

        var bidslots = Array.from(document.getElementsByClassName('bid-slot'));
        bidslots.forEach( function(element) { element.innerText = 0; } );
        document.getElementById('p1-act-bp').innerText = 10
        document.getElementById('p2-act-bp').innerText = 10

        cycle_visibility(document.getElementById('p1-place-bids'));
        cycle_visibility(document.getElementById('p1-set-moves'));
        
        clear_moves();
        init_player_moves();
    }
}

function reset_game() { 
    TURN = 1;

    PLAYER['hp'] = 10;
    document.getElementById(PLAYER['hp_element']).innerText = PLAYER['hp'];
    document.getElementById('p1-act-bp').innerText = 10
    PLAYER['atk'] = 1;
    PLAYER['def'] = 1;
    PLAYER['heal'] = 1;
    PLAYER['buff'] = 0;
    
    AI['hp'] = 10;
    document.getElementById(AI['hp_element']).innerText = AI['hp'];
    document.getElementById('p2-act-bp').innerText = 10
    AI['atk'] = 1;
    AI['def'] = 1;
    AI['heal'] = 1;
    AI['buff'] = 0;

    clear_moves();
    init_player_moves();

    var targets = Array.from(document.getElementsByClassName('bidding-interface'));
    targets.forEach( function(element) { hide(element); });
    var bidslots = Array.from(document.getElementsByClassName('bid-slot'));
    bidslots.forEach( function(element) { element.innerText = 0; } );

    hide(document.getElementById('p1-place-bids'));
    show(document.getElementById('p1-set-moves'));
}