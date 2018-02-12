
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


function change_bid(amount, target) {
    // TODO : implement!
}
