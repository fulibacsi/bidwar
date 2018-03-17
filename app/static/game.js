var GAMESTATE = "MOVE SELECTION";

var ASSETS = {
    'atk': window.asset_dir + "/atk.png",
    'def': window.asset_dir + "/def.png",
    'heal': window.asset_dir + "/heal.png",
    'buff': window.asset_dir + "/buff.png"
}

var TURN = 1;

var PLAYER = {
    'name': 'player',
    'hp_element': 'p1-act-hp',
    'hp': 10,
    'bp': 10,
    'atk': 1,
    'def': 1,
    'heal': 1,
    'buff': 0,
    'def_hp': 10,
    'def_bp': 10,
    'def_atk': 1,
    'def_def': 1,
    'def_heal': 1,
    'def_buff': 0
}

var AI = {
    'name': 'ai',
    'hp_element': 'p2-act-hp',
    'hp': 10,
    'bp': 10,
    'atk': 1,
    'def': 1,
    'heal': 1,
    'buff': 0,
    'def_hp': 10,
    'def_bp': 10,
    'def_atk': 1,
    'def_def': 1,
    'def_heal': 1,
    'def_buff': 0
}

var MOVES = {
    'atk': 1,
    'def': 1,
    'heal': 1,
    'buff': 1
}

var LOGMESSAGES = [];
var PROGRESSBARS = {};
var ai_timeout = null;


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
        parent.setAttribute('allowed', "true");
        parent.setAttribute('evaluated', "false");
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
    var move_number = parseInt(target.id.substr(target.id.length - 1));
    if (document.getElementById('move-slot-' + move_number).getAttribute('allowed') == "true") {
        var bar = PROGRESSBARS['bid-progressbar-' + move_number];
        var value = parseInt(target.textContent);
        if (act_bp_value - amount >= 0) {
            target.innerText = value + amount;
            act_bp.innerText = act_bp_value - amount;

            if (ai_timeout != null) { 
                window.clearTimeout(ai_timeout);
                set_ai_bids();
                ai_timeout = null;
            }
            
            bar.set(1.0);
            bar.animate(0.0, {}, function() {
                var move_slot = document.getElementById('move-slot-' + move_number);
                move_slot.setAttribute('allowed', "false");
                console.log('move-slot-' + move_number + ':', move_slot.childNodes[0]);
                move_slot.childNodes[0].removeAttribute('onclick');
                evaluate(move_number);
            });
        }
    }
    
}

function set_ai_bids() {
    for (i = 0; i < 10; i++) {
        setTimeout(function(){
            // REPLACE WITH SKYNET 
            change_bid(amount=1, 
                       target="p2-bid-slot-" + random(1, 4), 
                       bp_element='p2-act-bp'); 
        }, 750 * (i+1));
    }
}

function log(message) {
    var node = document.createElement("p");
    node.innerHTML = message;
    var logdiv = document.getElementById('log');
    logdiv.insertBefore(node, logdiv.firstChild);
}

function execute_move(move) {
    var user = move['user'];
    var target = user['name'] == 'player' ? AI : PLAYER;
    var action = move['action'];
    switch(action){
        case 'buff':
            user['buff'] += MOVES['buff'];
            log(user['name'] + ' buffed itself. current buff level: ' + user['buff'] + '.');
            break;
        case 'atk' :
            damage = Math.max(0, MOVES['atk'] + user['atk'] + user['buff'] - target['def'] - target['buff']);
            target['hp'] -= damage;
            document.getElementById(target['hp_element']).innerText = target['hp'];
            user['buff'] = user['def_buff'];
            target['buff'] = target['def_buff'];
            target['def'] = target['def_def'];
            log(user['name'] + ' inflicted ' + damage + ' damage.');
            break;
        case 'def':
            defense = MOVES['def'] + user['buff'];
            user['def'] += defense;
            user['buff'] = user['def_buff'];
            log(user['name'] + ' boosted it\'s defense to ' + user['def']);
            break;
        case 'heal':
            heal = MOVES['heal'] + user['buff'];
            user['hp'] = Math.min(user['def_hp'], user['hp'] + heal);
            document.getElementById(user['hp_element']).innerText = user['hp'];
            user['buff'] = user['def_buff'];
            log(user['name'] + ' healed itself by ' + heal + ' points.');
            break;
    }
}

function evaluate(slot) {
    console.log('evaluating move-slot-' + i + '...')
    var slot_element = document.getElementById('move-slot-' + slot);
    if (slot_element.getAttribute('evaluated') == "true") {
        check_evaluation();
        return TURN;
    }

    var moves = [];

    // PARSE MOVES AND BIDS
    var move = slot_element.childNodes[0].getAttribute('type');
    var player_bid = parseInt(document.getElementById('p1-bid-slot-' + slot).textContent);
    var ai_bid = parseInt(document.getElementById('p2-bid-slot-' + slot).textContent);

    if (player_bid > ai_bid) {
        moves.push({'user': PLAYER, 'action': move});
    } else if (player_bid < ai_bid) {
        moves.push({'user': AI, 'action': move});
    } else {
        moves.push({'user': PLAYER, 'action': move});
        moves.push({'user': AI, 'action': move});
    }

    slot_element.setAttribute('evaluated', "true");

    // EXECUTE ACTIONS
    var number_of_moves = moves.length;
    for (i = 0; i < number_of_moves; i++) {
        var index = random(0, moves.length - 1);
        var move = moves[index];
        moves.splice(index, 1);

        execute_move(move);

        if (PLAYER['hp'] <= 0) {
            alert('player died. try again?');
            reset_game();
        }
        if (AI['hp'] <= 0) {
            alert('ai died. play again?');
            reset_game();
        }
    }
    console.log('evaluation done.')
    check_evaluation();
}

function check_evaluation() {
    console.log('checking evaluation status...');
    var evaluated = 0;
    for (i = 1; i < 5; i++) {
        var slot_element = document.getElementById('move-slot-' + i);
        if (slot_element.getAttribute('evaluated') == "true") { evaluated++; }
    }

    var user_bp = parseInt(document.getElementById('p1-act-bp').textContent);
    var ai_bp = parseInt(document.getElementById('p2-act-bp').textContent);
    
    if (evaluated == 4 | user_bp == 0 & ai_bp == 0) {
        TURN++;
        cycle_visibility(document.getElementById('next-round'));
    }
    console.log('evaluation status check done.')
}


function set_moves() {
    if (!find_target()) {
        GAMESTATE = "BIDDING";
        log('Moves setted!');

        select_ai_moves();

        var targets = Array.from(document.getElementsByClassName('bidding-interface'));
        targets.forEach( function(element) {
            cycle_visibility(element);
        });
        cycle_visibility(document.getElementById('p1-set-moves'));

        var moves = Array.from(document.getElementsByClassName('move'));
        moves.forEach( function(element) {
            element.removeAttribute('onclick');
            
            if (!element.parentElement.id.includes('p1')) {
                var target = "p1-bid-slot-" + element.parentElement.id.substr(element.parentElement.id.length - 1);
                console.log("handling: ", element.id, " - ", target);
                element.setAttribute('onclick', "change_bid(amount=1, target='" + target + "', bp_element='p1-act-bp');");
            }
            
        });

        ai_timeout = window.setTimeout(function(){ 
            console.log("ALL HELL BROKEN  LOOOSE!!!");
            set_ai_bids(); 
        }, 2000);
        console.log('TIMEOUT: ', ai_timeout);
    }
}


function next_round() {
    GAMESTATE = "MOVE SELECTION";
    var targets = Array.from(document.getElementsByClassName('bidding-interface'));
    targets.forEach( function(element) {
        cycle_visibility(element);
    });

    var bidslots = Array.from(document.getElementsByClassName('bid-slot'));
    bidslots.forEach( function(element) { element.innerText = 0; } );
    document.getElementById('p1-act-bp').innerText = PLAYER['bp'];
    document.getElementById('p2-act-bp').innerText = AI['bp'];

    cycle_visibility(document.getElementById('next-round'));
    cycle_visibility(document.getElementById('p1-set-moves'));

    clear_moves();
    init_player_moves();
}

function reset_game() {
    GAMESTATE = "MOVE SELECTION";
    if (ai_timeout != null) { 
        window.clearTimeout(ai_timeout);
        ai_timeout = null;
    }

    document.getElementById('log').innerHTML = '';

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

    set_game_values();

    clear_moves();
    init_player_moves();
    // init_progress_bars();

    var targets = Array.from(document.getElementsByClassName('bidding-interface'));
    targets.forEach( function(element) { hide(element); });
    var bidslots = Array.from(document.getElementsByClassName('bid-slot'));
    bidslots.forEach( function(element) { element.innerText = 0; } );

    show(document.getElementById('p1-set-moves'));
}

function set_game_values() {
    load_values_from_cookie();

    document.getElementById('p1-act-hp').innerText = PLAYER['def_hp'];
    document.getElementById('p1-max-hp').innerText = PLAYER['def_hp'];
    document.getElementById('p1-act-bp').innerText = PLAYER['def_bp'];
    document.getElementById('p1-max-bp').innerText = PLAYER['def_bp'];

    document.getElementById('p2-act-hp').innerText = AI['def_hp'];
    document.getElementById('p2-max-hp').innerText = AI['def_hp'];
    document.getElementById('p2-act-bp').innerText = AI['def_bp'];
    document.getElementById('p2-max-bp').innerText = AI['def_bp'];

}

function init_progress_bars() {
    PROGRESSBARS = {};
    for (i = 1; i < 5; i++) {
        var container = document.getElementById("bid-progressbar-" + i);
        PROGRESSBARS["bid-progressbar-" + i] = (
            new ProgressBar.Line(container, {
                strokeWidth: 4,
                easing: 'easeInOut',
                duration: 1500,
                color: '#009933',
                trailColor: '#eee',
                trailWidth: 1,
                svgStyle: {height: '100%'},
                from: {color: '#ff0000'},
                to: {color: '#009933'},
                step: (state, bar) => {
                    bar.path.setAttribute('stroke', state.color);
                }
            })
        );
    }
}


var gamestate = {

    init: function() {
        init_player_moves();
        set_game_values();
        init_progress_bars();
    },

    state: "MOVE_SELECTION"
}