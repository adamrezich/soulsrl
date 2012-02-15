$(document).ready(function() {
	$rle.setup();
	new game();
});

function game() {
	game.current = this;

	state.reset();
	state.add(new state_mainMenu());
	state.current().draw();

	//this.commands = game.cmds_game;

	/*this.messages = new messages();
	this.messages.write("Welcome to SoulsRL!");
	this.current_room = this.generateDungeon();

	// begin temp code
	this.player = new creature();
	this.player.position = { x: 8, y: 8};
	this.player.character = '@';
	for (var t in this.current_room.terrain) {
		this.current_room.terrain[t].draw();
	}
	this.player.draw();
	this.redraw();*/
	// end temp code

	$(document).keydown(game.handleInput);
}

game.current = null;

game.viewport_offset = {
	x: 0,
	y: 3
}

// main game commands
game.cmds_game = {
	north: {
		keys: $rle.keys.arrow_n,
		action: function () { game.current.player.move($rle.dir.n); game.current.redraw(); }
	},
	east: {
		keys: $rle.keys.arrow_e,
		action: function () { game.current.player.move($rle.dir.e); game.current.redraw(); }
	},
	west: {
		keys: $rle.keys.arrow_w,
		action: function () { game.current.player.move($rle.dir.w); game.current.redraw(); }
	},
	south: {
		keys: $rle.keys.arrow_s,
		action: function () { game.current.player.move($rle.dir.s); game.current.redraw(); }
	},
	northwest: {
		keys: $rle.keys.arrow_nw,
		action: function () { game.current.player.move($rle.dir.nw); game.current.redraw(); }
	},
	northeast: {
		keys: $rle.keys.arrow_ne,
		action: function () { game.current.player.move($rle.dir.ne); game.current.redraw(); }
	},
	southwest: {
		keys: $rle.keys.arrow_sw,
		action: function () { game.current.player.move($rle.dir.sw); game.current.redraw(); }
	},
	southeast: {
		keys: $rle.keys.arrow_se,
		action: function () { game.current.player.move($rle.dir.se); game.current.redraw(); }
	},
	wait: {
		keys: [90, 101],
		action: function () { }
	}
}

game.handleInput = function (e) {
	if (!game.current) {
		alert('no game!');
		return;
	}
	if (state.list.length == 0 ) {
		$rle.put(0, 0, 'no state provided');
		return;
	}
	var commands = state.current().keys
	for (var command in commands) {
		var keys = commands[command].keys;
		for (var key in keys) {
			if (keys[key] == e.keyCode) {
				commands[command].action();
				return false;
			}
		}
	}
}

game.prototype.redraw = function () {
	//this.player.draw();
	this.messages.draw();
	this.drawUI();
}

game.prototype.redraw_tile = function (position) {
	for (var t in this.current_room.terrain) {
		if (this.current_room.terrain[t].position.x == position.x && this.current_room.terrain[t].position.y == position.y) this.current_room.terrain[t].draw();
	}
}

game.prototype.generateDungeon = function () {
	var r = new room();

	// TODO: Y'know, procedural stuff :P

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 80; j++) {
			r.add_terrain({x: j, y: i}, terrain.kind.floor);
		}
	}

	for (var i = 0; i < 10; i++) {
		r.add_terrain({x: 14, y: 4 + i}, terrain.kind.wall);
	}

	return r;
}

game.prototype.drawUI = function () {

	// UI line 1
	var name = "Adam";
	$rle.put(0, 23, name, { fg: $rle.color.brightCyan });
	$rle.put(name.length + 1, 23, "HP:", { fg: $rle.color.gray });
	var hp = "10/10";
	$rle.put(name.length + 4, 23, hp, { fg: $rle.color.red });
	$rle.put(name.length + 5 + hp.length, 23, "STM:", { fg: $rle.color.gray });
	var stm = "100%";
	$rle.put(name.length + 9 + hp.length, 23, stm, { fg: $rle.color.cyan });

	// UI line 2
	$rle.put(0, 24, "DLVL:", { fg: $rle.color.gray });
	var dlvl = "0";
	$rle.put(5, 24, dlvl, { fg: $rle.color.white });
	$rle.put(6 + dlvl.length, 24, "LVL:", { fg: $rle.color.green });
	var lvl = "1";
	$rle.put(10 + dlvl.length, 24, lvl, { fg: $rle.color.brightGreen });
	$rle.put(11 + dlvl.length + lvl.length, 24, "NXT:", { fg: $rle.color.green });
	var nxt = "100";
	$rle.put(15 + dlvl.length + lvl.length, 24, nxt, { fg: $rle.color.brightGreen });
}

////
// state - game state machine
////

function state() { }

state.list = [];

state.current = function () {
	return state.list.peek();
}

state.add = function (s) {
	state.list.push(s);
}

state.replace = function(s) {
	state.list.pop();
	state.add(s);
}

state.reset = function () {
	state.list = [];
}

state.prototype.keys = { }

state.prototype.draw = function () { }


////
// state_mainMenu - main menu state
////

function state_mainMenu() {
	this.cursor = 0;
}

state_mainMenu.prototype = new state();

state_mainMenu.prototype.keys = {
	north: {
		keys: $rle.keys.arrow_n,
		action: function () { state.current().move_cursor(-1); /* TODO: Find a better way to do this? */ }
	},
	east: {
		keys: $rle.keys.arrow_e,
		action: function () {  }
	},
	west: {
		keys: $rle.keys.arrow_w,
		action: function () {  }
	},
	south: {
		keys: $rle.keys.arrow_s,
		action: function () { state.current().move_cursor(1); /* TODO: Find a better way to do this? */ }
	},
	confirm: {
		keys: [13],
		action: function () {  }
	}
}

state_mainMenu.prototype.draw = function () {
	$rle.clear();
	$rle.put(0, 0, 'SoulsRL');
	for (var i = 0; i < state_mainMenu.entries.length; i++) {
		$rle.put(0, 2 + i, (this.cursor == i ? '>' : ' ') + state_mainMenu.entries[i].text);
	}
}

state_mainMenu.prototype.move_cursor = function (amount) {
	this.cursor += amount;
	if (this.cursor < 0) this.cursor += state_mainMenu.entries.length - 1;
	if (this.cursor > state_mainMenu.entries.length - 1) this.cursor -= state_mainMenu.entries.length;
	this.draw();
}

state_mainMenu.entries = [
	{
		text: "New game",
		action: function () { console.log('TODO: new game'); }//state.replace(new state_game())); }
	},
	{
		text: "Continue",
		action: function () {  }
	},
	{
		text: "Help",
		action: function () {  }
	}
];


////
// messages - message history
////

function messages() {
	this.lines = [];
	this.lastLine = -1;
	this.cleared = false;
}

messages.prototype.write = function (text, options) {
	this.lines.push({ text: text });
}

messages.prototype.draw = function () {
	var diff = this.lines.length - 1 - this.lastLine;
	if (diff == 0) {
		this.clear();
		return;
	}
	this.clear();
	this.cleared = false;
	if (diff > 0) $rle.put(0, 3 - diff, this.lines[this.lastLine + 1].text);
	if (diff > 1) $rle.put(0, 4 - diff, this.lines[this.lastLine + 2].text);
	if (diff > 2) {
		if (diff > 3) {
		}
		else {
			$rle.put(0, 5 - (this.lines.length - 1 - this.lastLine), this.lines[this.lastLine + 3].text);
		}
	}
	this.lastLine = this.lastLine + Math.min(this.lines.length - 1 - this.lastLine, 3);
}

messages.prototype.clear = function (override) {
	if (!this.cleared || override) {
		this.cleared = true;
		$rle.put(0, 0, '                                                                                ');
		$rle.put(0, 1, '                                                                                ');
		$rle.put(0, 2, '                                                                                ');
	}
}


////
// room - basically, the floor of a roguelike dungeon
////

function room() {
	this.terrain = [];
}

room.prototype.add_terrain = function (position, kind) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) this.terrain.splice(t, 1);
	}
	this.terrain.push(new terrain(position, kind));
}

room.prototype.solid_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t].solid;
	}
	return true;
}


////
// entity - general-purpose "game object," covers anything that need to be displayed on-screen, pretty much
////

function entity() {
	this.position = { x: 0, y: 0 };
	this.character = '?';
	this.fg = $rle.color.white;
}

entity.prototype.draw = function () {
	$rle.put(this.position.x + game.viewport_offset.x, this.position.y + game.viewport_offset.y, this.character, { fg: this.fg });
}


////
// creature - anything that has hit points, can be killed, etc.
////

function creature() { }

creature.prototype = new entity();

creature.prototype.move = function (direction) {
	var endpos = { x: this.position.x, y: this.position.y };
	var lastpos = { x: this.position.x, y: this.position.y };
	switch (direction) {
		case $rle.dir.e:
			endpos.x++;
			break;
		case $rle.dir.ne:
			endpos.x++;
			endpos.y--;
			break;
		case $rle.dir.n:
			endpos.y--;
			break;
		case $rle.dir.nw:
			endpos.x--;
			endpos.y--;
			break;
		case $rle.dir.w:
			endpos.x--;
			break;
		case $rle.dir.sw:
			endpos.x--;
			endpos.y++;
			break;
		case $rle.dir.s:
			endpos.y++;
			break;
		case $rle.dir.se:
			endpos.x++;
			endpos.y++;
			break;
	}
	if (!game.current.current_room.solid_at(endpos)) {
		this.position = endpos;
		game.current.redraw_tile(lastpos);
		this.draw();
	}
	else {
		if (this == game.current.player) game.current.messages.write("Something is blocking the way.")
	}
}


////
// terrain - static stuff, walls and floors and so forth
////

function terrain(pos, k) {
	this.position = pos;
	this.kind = k;
	this.solid = false;
	switch (k) {
		case terrain.kind.floor:
			this.character = '.';
			this.fg = $rle.color.charcoal;
			this.solid = false;
			break;
		case terrain.kind.wall:
			this.character = '#';
			this.fg = $rle.color.gray;
			this.solid = true;
			break;
	}
}

terrain.prototype = new entity();

terrain.kind = {
	floor: 0,
	wall: 1
}
