var game = new Phaser.Game(600, 600, Phaser.AUTO, 'game', { preload: preload, create: create, render: render });

var img;
var length = 20;
var tile = game.width / length;
var tiles = new Array(length);
var sprites = {};
var emptyX, emptyY;
var moves;
var moves_str, moves_text, text_style;

var continue_key;

var finished_style = { font: "36px Arial", fill: "#ffffff", align: "center" };
var continue_style = { font: "18px Arial", fill: "#ffffff", align: "center" };

var finished = false;
var finished_text;
var continue_text;

function preload() {
    game.load.spritesheet('picture', '/assets/img/02.png', tile, tile);
}

function create() {
    init();
    init_text();

    game.input.onDown.add(move, this);

    continue_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    continue_key.onDown.add(next, this);
}

function init() {
    moves = 0;
    for (i = 0; i < length; i++) {
        tiles[i] = new Array(length);
    }
    for (i = 0; i < length; i++) {
        for (j = 0; j < length; j++) {
            var s = game.add.sprite(j * tile, i * tile, 'picture', i * length + j);
            tiles[i][j] = i * length + j;
            sprites[i * length + j] = s;
            if (i == length - 1 && j == length - 1)
                s.kill();
        }
    }

    emptyX = length - 1;
    emptyY = length - 1;

    // set up a graphics object + line style, draw grid
    var graphics = game.add.graphics(0, 0);
    graphics.lineStyle(1, 0x000000);
    for (i = 0; i < length; i++) {
        graphics.moveTo(0, tile * i);
        graphics.lineTo(tile * length, tile * i);
    }
    for (i = 0; i < length; i++) {
        graphics.moveTo(tile * i, 0);
        graphics.lineTo(tile * i, tile * length);
    }
    // necessary? -> window.graphics = graphics;

    shuffle();
    find_empty();
    /*if (!is_solvable(length, length, emptyY + 1)) {
        if (emptyY == 0 && emptyX <= 1) {
            swap(length - 2, length - 1, length - 1, length - 1);
        } else {
            swap(0, 0, 1, 0);
        }
        find_empty();
    }*/
}

function init_text() {
    moves_str = "moves: ";
    text_style = { font: "20px Arial", fill: "#ffffff", align: "left" };

    moves_text = game.add.text(20, 20, moves_str + moves, text_style);
}

function restart() {
    // delete sprites
    for (i = 0; i < length * length; i++) {
        sprites[i].kill();
    }

    moves_text.destroy();
	finished_text.destroy();
    continue_text.destroy();

    init();
    init_text();
}

function find_empty() {
    for (i = 0; i < length; i++) {
        for (j = 0; j < length; j++) {
            if (tiles[i][j] == length * length - 1)
            {
                emptyX = j;
                emptyY = i;
            }
        }
    }
}

function shuffle() {
    /*var i = length * length - 1;
    while (i > 0) {
        var j = Math.floor(Math.random() * i);
        var xi = i % length;
        var yi = Math.floor(i / length);
        var xj = j % length;
        var yj = Math.floor(j / length);
        swap(xi, yi, xj, yj);
        --i;
    }*/
    for (var i = 0; i < 20 * Math.pow(length, 2); i++) {
        var xi, yi;
		var dir = Math.floor(Math.random() * 4);
		switch (dir) {
			case 0:
				xi = emptyX;
				yi = emptyY - 1;
				break;
			case 1:
				xi = emptyX;
				yi = emptyY + 1;
				break;
			case 2:
				xi = emptyX + 1;
				yi = emptyY;
				break;
			case 3:
				xi = emptyX - 1;
				yi = emptyY;
				break;
		}
		xi = Math.min(Math.max(0, xi), length - 1);
		yi = Math.min(Math.max(0, yi), length - 1);
        swap(emptyX, emptyY, xi, yi);
		find_empty();
    }
}

function parity() {
    return sum_inversions();
}

function count_inversions(i, j) {
    var inversions = 0;
    var tile_num = j * length + i;
    var tile_val = i * length + j;
    for (var q = tile_num + 1; q < length * length; ++q) {
        var k = q % length;
        var l = Math.floor(q / length);

        var comp_val = k * length + l;
        if (tile_val > comp_val && tile_val != (length * length - 1)) {
            ++inversions;
        }
    }
    return inversions;
}

function sum_inversions() {
    var inversions = 0;
    for (var j = 0; j < length; ++j) {
        for (var i = 0; i < length; ++i) {
            inversions += count_inversions(i, j);
        }
    }
    return inversions;
}

function is_solvable(width, height, emptyRow) {
    if (width % 2 == 1) {
        return (sum_inversions() % 2 == 0)
    } else {
        return ((sum_inversions() + height - emptyRow) % 2 == 0)
    }
}

function move() {
    if (!finished) {
        var mx = Math.floor(game.input.mousePointer.x / tile);
        var my = Math.floor(game.input.mousePointer.y / tile);

        // use swap to switch empty and the sprite
        if (Math.abs(mx - emptyX) == 1 && Math.abs(my - emptyY) == 0 ||
            Math.abs(my - emptyY) == 1 && Math.abs(mx - emptyX) == 0)
        {
            swap(mx, my, emptyX, emptyY);
            emptyX = mx;
            emptyY = my;

            moves++;
            moves_text.text = moves_str + moves;

            check();
        }
    }
}

function swap(x1, y1, x2, y2) {
    if (!(x1 == emptyX && y1 == emptyY)) {
        sprites[tiles[y1][x1]].x = x2 * tile;
        sprites[tiles[y1][x1]].y = y2 * tile;
    }
    if (!(x2 == emptyX && y2 == emptyY)) {
        sprites[tiles[y2][x2]].x = x1 * tile;
        sprites[tiles[y2][x2]].y = y1 * tile;
    }

    var temp = tiles[y1][x1];
    tiles[y1][x1] = tiles[y2][x2];
    tiles[y2][x2] = temp;
}

function check() {
    for (i = 0; i < length; i++) {
        for (j = 0; j < length; j++) {
            if (tiles[i][j] != i * length + j) {
                return;
            }
        }
    }

    finished = true;
    finished_text = game.add.text(game.world.centerX, game.world.centerY - 20, "complete!", finished_style);
    finished_text.anchor.x = 0.5; finished_text.anchor.y = 0.5;
    continue_text = game.add.text(game.world.centerX, game.world.centerY + 20, "press space to continue", continue_style);
    continue_text.anchor.x = 0.5; continue_text.anchor.y = 0.5;
}

function solve() {
    for (i = 0; i < length; i++) {
        for (j = 0; j < length; j++) {
            tiles[i][j] = i * length + j;
            sprites[i * length + j].x = j * tile;
            sprites[i * length + j].y = i * tile;
        }
    }
}

function next() {
    if (finished) {
        restart();
        finished = false;
    }
    else {
        solve();
        check();
    }
}

function render() {
    /*for (i = 0; i < length - 1; i++) {
        game.debug.geom(lines_h[i], 'black');
    }
    for (i = 0; i < length - 1; i++) {
        game.debug.geom(lines_v[i], 'black');
    }*/
}
