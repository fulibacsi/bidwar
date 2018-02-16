
function get_new_id(base='') {
    var id = base;
    var i = 0;
    while (document.getElementById(id)) {
        i++;
        id = base + i;
    }
    return id;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    var parent = document.getElementById(ev.target.id).parentNode
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("parent", parent.id);
}

function drop(ev) {
    ev.preventDefault();

    var data = ev.dataTransfer.getData("text");
    var element = document.getElementById(data);
    element.setAttribute('onclick', 'remove(id="' + data + '")');
    var parent_id = ev.dataTransfer.getData("parent");
    var parent = document.getElementById(parent_id);

    if (ev.target.childNodes.length == 1) {
        ev.target.appendChild(element);
    } else {
        parent.appendChild(document.getElementById(data));
    }

}

function remove(id) {
    var element = document.getElementById(id);
    var original = document.getElementById(element.getAttribute('parent-node'));
    element.parentNode.removeChild(element);
    element.removeAttribute('onclick');
    original.appendChild(element);
}

function create_move(type='', src='', target) {
    var img = document.createElement('img');
    img.setAttribute('src', src);
    img.setAttribute('id', get_new_id(type + '-icon'));
    img.setAttribute('width', 50);
    img.setAttribute('draggable', "true");
    img.setAttribute('ondragstart', "drag(event)");
    img.setAttribute('parent-node', target);

    var target = document.getElementById(target);
    target.childNodes.forEach( function(child) { target.removeChild(child) });
    target.appendChild(img);
}

function set_moves() {
    console.log('Moves setted!');
    cycle_visibility('p1-place-bids');
    cycle_visibility('p1-set-moves');
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
    target = document.getElementById(target);
    target.classList.toggle('invisible');
    target.classList.toggle('visible');
}

function submit_bids() {
    console.log('Bids placed!');
    cycle_visibility('p1-place-bids');
    cycle_visibility('p1-set-moves');
}
