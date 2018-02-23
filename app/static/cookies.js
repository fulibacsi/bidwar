function bake_cookie(name, value) {
    document.cookie = [name, '=', JSON.stringify(value), ';'].join('');
}

function read_cookie(name) {
    var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
    result && (result = JSON.parse(result[1]));
    return result;
}

function load_values_from_cookie() {
    console.log('Loading from cookie...');
    ['hp', 'bp', 'atk', 'def', 'heal', 'buff'].forEach(function(stat) {
        pl_stat = parseInt(read_cookie('p1-' + stat));
        if (!isNaN(pl_stat)) { 
            PLAYER[stat] = pl_stat; 
            PLAYER['def_' + stat] = pl_stat; 
        }
    
        ai_stat = parseInt(read_cookie('p2-' + stat));
        if (!isNaN(ai_stat)) { 
            AI[stat] = ai_stat; 
            AI['def_' + stat] = ai_stat;
        }
    
        if (stat != 'hp' && stat != 'bp') {
            mv_stat = parseInt(read_cookie('m-' + stat));
            if (!isNaN(mv_stat)) { MOVES[stat] = mv_stat; }
        }
    })
}

function save_to_cookie() {
    console.log('Saving to cookie...');
    var targets = Array.from(document.getElementsByClassName('form-control'));
    targets.forEach( function(element) {
        bake_cookie(element.getAttribute('id'), element.value);
    })
}

function load_to_form() {
    ['hp', 'bp', 'atk', 'def', 'heal', 'buff'].forEach(function(stat) {
        console.log('p1-' + stat);
        console.log(document.getElementById('p1-' + stat));
        document.getElementById('p1-' + stat).value =  read_cookie('p1-' + stat);
        document.getElementById('p2-' + stat).value = read_cookie('p2-' + stat);
        if (stat != 'hp' && stat != 'bp') {
            document.getElementById('m-' + stat).value = read_cookie('m-' + stat);
        }
    })
}