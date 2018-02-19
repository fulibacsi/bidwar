
var ASSETS = {
    'atk': window.asset_dir + "/atk.png",
    'def': window.asset_dir + "/def.png",
    'heal': window.asset_dir + "/heal.png",
    'buff': window.asset_dir + "/buff.png"
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

function create_move(type='', target) {
    var id = get_new_id(type + '-icon')
    var img = document.createElement('img');
    img.setAttribute('src', ASSETS[type]);
    img.setAttribute('id', id);
    img.setAttribute('width', 50);
    img.setAttribute('onclick', 'move(id="' + id + '")')
    img.setAttribute('parent-node', target);

    var target = document.getElementById(target);
    target.childNodes.forEach( function(child) { target.removeChild(child) });
    target.appendChild(img);
}

function change_bid(amount, target) {
    var act_bp = document.getElementById('p1-act-bp');
    var act_bp_value = parseInt(act_bp.textContent);
    target = document.getElementById(target);
    var value = parseInt(target.textContent);
    if (act_bp_value - amount >= 0) {
        target.innerText = value + amount;
        act_bp.innerText = act_bp_value - amount;
    }
}

function cycle_visibility(target) {
    target.classList.toggle('invisible');
    target.classList.toggle('visible');
}

function set_moves() {
    console.log('Moves setted!');
    var targets = Array.from(document.getElementsByClassName('bidding-interface'));
    targets.forEach( function(element) {
        cycle_visibility(element);
    });
    cycle_visibility(document.getElementById('p1-place-bids'));
    cycle_visibility(document.getElementById('p1-set-moves'));

}

function submit_bids() {
    console.log('Bids placed!');
    var targets = Array.from(document.getElementsByClassName('bidding-interface'));
    targets.forEach( function(element) {
        cycle_visibility(element);
    });
    cycle_visibility(document.getElementById('p1-place-bids'));
    cycle_visibility(document.getElementById('p1-set-moves'));
}
