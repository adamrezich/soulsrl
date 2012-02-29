////
// state - game state machine
////

function state() { }

state.list = [];

state.current = function () {
	if (this.list.length > 0) {
		return this.list[this.list.length - 1];
	}
	else {
		return null;
	}
}

state.add = function (s, options) {
	state.list.push(s);
	if (options) {
		if (options.clear) $rle.clear();
	}
	state.current().first_draw();
	state.current().draw();
}

state.replace = function(s, options) {
	state.list.pop();
	state.add(s, options);
}

state.reset = function () {
	state.list = [];
}

state.pop = function () {
	state.list.pop();
	$rle.clear();
	state.current().first_draw();
	state.current().draw();
}

state.prototype.keys = { }

state.prototype.draw = function () { }

state.prototype.first_draw = function () { }


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
		action: function () { state.current().confirm(); }
	}
}

state_mainMenu.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 3, " .oooooo..o                       oooo           ooooooooo.   ooooo       ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 4, "d8P'    `Y8                       `888           `888   `Y88. `888'       ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 5, "Y88bo.       .ooooo.  oooo  oooo   888   .oooo.o  888   .d88'  888        ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 6, " `\"Y8888o.  d88' `88b `888  `888   888  d88(  \"8  888ooo88P'   888        ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 7, "     `\"Y88b 888   888  888   888   888  `\"Y88b.   888`88b.     888        ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 8, "oo     .d8P 888   888  888   888   888  o.  )88b  888  `88b.   888       o", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 9, "8\"\"88888P'  `Y8bod8P'  `V88V\"V8P' o888o 8\"\"888P' o888o  o888o o888ooooood8", { align: 'center', fg: $rle.color.system.white });
	$rle.put(52, 3, "ooooooooo.   ooooo       ", { fg: $rle.color.system.red });
	$rle.put(52, 4, "`888   `Y88. `888'       ", { fg: $rle.color.system.red });
	$rle.put(52, 5, " 888   .d88'  888        ", { fg: $rle.color.system.red });
	$rle.put(52, 6, " 888ooo88P'   888        ", { fg: $rle.color.system.red });
	$rle.put(52, 7, " 888`88b.     888        ", { fg: $rle.color.system.red });
	$rle.put(52, 8, " 888  `88b.   888       o", { fg: $rle.color.system.red });
	$rle.put(52, 9, "o888o  o888o o888ooooood8", { fg: $rle.color.system.red });
	$rle.put(40, 21, 'arrows, numpad, vi keys: choose', { fg: $rle.color.system.charcoal, align: 'center' });
	$rle.put(40, 22, 'enter: select', { fg: $rle.color.system.charcoal, align: 'center' });
	$rle.put(40, 24, 'Copyright (C) 2012 Adam Rezich', { fg: $rle.color.system.cyan, align: 'center' });
	for (var i = 0; i < state_mainMenu.entries.length; i++) {
		$rle.put(40, 14 + i, (this.cursor == i ? '> ' : '  ') + state_mainMenu.entries[i].text + (this.cursor == i ? ' <' : '  '), { align: 'center', fg: (this.cursor == i ? $rle.color.system.white : (state_mainMenu.entries[i].disabled ? $rle.color.system.charcoal : $rle.color.system.gray)) });
	}
	$rle.flush();
}

state_mainMenu.prototype.move_cursor = function (amount) {
	do {
		this.cursor += amount;
		if (this.cursor < 0) this.cursor += state_mainMenu.entries.length;
		if (this.cursor > state_mainMenu.entries.length - 1) this.cursor -= state_mainMenu.entries.length;
		this.draw();
	} while (state_mainMenu.entries[this.cursor].disabled);
}

state_mainMenu.prototype.confirm = function () {
	state_mainMenu.entries[this.cursor].action();
}

state_mainMenu.entries = [
	{
		text: "New game",
		action: function () { state.replace(new state_inputName()); }
	},
	{
		text: "Continue",
		disabled: true,
		action: function () {  }
	},
	{
		text: "Settings",
		disabled: true,
		action: function () {  }
	},
	{
		text: "Manual",
		action: function () {
			state.add(new state_loading(), { clear: true });
			$.ajax({
				url: 'manual.txt',
				dataType: 'text',
				cache: false,
				success: function (data) {
					state.pop();
					state.add(new state_help(data), { clear: true });
				}
			});
		}
	}
];


////
// state_loading - just a fat loading screen
////

function state_loading(options) {
	if (options) {
		if (options.action) options.action();
	}
}

state_loading.prototype = new state();

state_loading.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 13, 'L O A D I N G . . .', { align: 'center' });
	$rle.flush();
}


////
// state_help - documentation and such
////

function state_help(data) {
	this.text = data.split('\n');
	this.scroll_position = 0;
}

state_help.prototype = new state();

state_help.prototype.keys = {
	back: {
		keys: $rle.keys.escape,
		action: function () { state.pop(); }
	},
	page_up: {
		keys: $rle.keys.page_up,
		action: function () { state.current().scroll_position = Math.max(state.current().scroll_position - 23, 0); state.current().draw(); }
	},
	page_down: {
		keys: $rle.keys.page_down,
		action: function () { state.current().scroll_position = Math.min(state.current().scroll_position + 23, state.current().text.length - 23); state.current().draw(); }
	},
	up: {
		keys: $rle.keys.arrow_n,
		action: function () { state.current().scroll_position = Math.max(state.current().scroll_position - 1, 0); state.current().draw(); }
	},
	down: {
		keys: $rle.keys.arrow_s,
		action: function () { state.current().scroll_position = Math.min(state.current().scroll_position + 1, state.current().text.length - 23); state.current().draw(); }
	}
}

state_help.prototype.draw = function () {
	$rle.clear();
	if (this.text) {
		for (var i = 0; i < 23; i++) {
			if (this.scroll_position + i > this.text.length) break;
			$rle.put(0, i, this.text[this.scroll_position + i]);
		}
	}

	$rle.put(40, 23, "arrows, numpad, vi keys, page up/down: scroll", { align: 'center', fg: $rle.color.system.charcoal });
	$rle.put(40, 24, "escape: return", { align: 'center', fg: $rle.color.system.charcoal });
	$rle.flush();
}


////
// state_inputName - self-explanatory
////

function state_inputName() {
	this.name = 'Stebbins';
}

state_inputName.prototype = new state();

state_inputName.prototype.keys = {
	a: {
		keys: $rle.keys.a,
		action: function () { state.current().type_char('a'); }
	},
	b: {
		keys: $rle.keys.b,
		action: function () { state.current().type_char('b'); }
	},
	c: {
		keys: $rle.keys.c,
		action: function () { state.current().type_char('c'); }
	},
	d: {
		keys: $rle.keys.d,
		action: function () { state.current().type_char('d'); }
	},
	e: {
		keys: $rle.keys.e,
		action: function () { state.current().type_char('e'); }
	},
	f: {
		keys: $rle.keys.f,
		action: function () { state.current().type_char('f'); }
	},
	g: {
		keys: $rle.keys.g,
		action: function () { state.current().type_char('g'); }
	},
	h: {
		keys: $rle.keys.h,
		action: function () { state.current().type_char('h'); }
	},
	i: {
		keys: $rle.keys.i,
		action: function () { state.current().type_char('i'); }
	},
	j: {
		keys: $rle.keys.j,
		action: function () { state.current().type_char('j'); }
	},
	k: {
		keys: $rle.keys.k,
		action: function () { state.current().type_char('k'); }
	},
	l: {
		keys: $rle.keys.l,
		action: function () { state.current().type_char('l'); }
	},
	m: {
		keys: $rle.keys.m,
		action: function () { state.current().type_char('m'); }
	},
	n: {
		keys: $rle.keys.n,
		action: function () { state.current().type_char('n'); }
	},
	o: {
		keys: $rle.keys.o,
		action: function () { state.current().type_char('o'); }
	},
	p: {
		keys: $rle.keys.p,
		action: function () { state.current().type_char('p'); }
	},
	q: {
		keys: $rle.keys.q,
		action: function () { state.current().type_char('q'); }
	},
	r: {
		keys: $rle.keys.r,
		action: function () { state.current().type_char('r'); }
	},
	s: {
		keys: $rle.keys.s,
		action: function () { state.current().type_char('s'); }
	},
	t: {
		keys: $rle.keys.t,
		action: function () { state.current().type_char('t'); }
	},
	u: {
		keys: $rle.keys.u,
		action: function () { state.current().type_char('u'); }
	},
	v: {
		keys: $rle.keys.v,
		action: function () { state.current().type_char('v'); }
	},
	w: {
		keys: $rle.keys.w,
		action: function () { state.current().type_char('w'); }
	},
	x: {
		keys: $rle.keys.x,
		action: function () { state.current().type_char('x'); }
	},
	y: {
		keys: $rle.keys.y,
		action: function () { state.current().type_char('y'); }
	},
	z: {
		keys: $rle.keys.z,
		action: function () { state.current().type_char('z'); }
	},
	confirm: {
		keys: $rle.keys.enter,
		action: function () { state.current().confirm(); }
	},
	backspace: {
		keys: $rle.keys.backspace,
		action: function () { state.current().delete_char(); }
	}
}

state_inputName.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 11, 'What is your name?', { align: 'center', fg: $rle.color.system.cyan });
	$rle.put(40, 13, this.name, { align: 'center' });
	$rle.put(40 + Math.floor(this.name.length / 2), 13, ' ', { bg: $rle.color.system.white });
	$rle.put(40, 23, 'enter: confirm', { align: 'center', fg: $rle.color.system.charcoal });
	$rle.put(40, 24, 'escape: return', { align: 'center', fg: $rle.color.system.charcoal });
	$rle.flush();
}

state_inputName.prototype.type_char = function (chr) {
	this.name = this.name + ($rle.shift ? chr.toUpperCase() : chr);
	this.draw();
}

state_inputName.prototype.delete_char = function () {
	if (this.name == '') return;
	this.name = this.name.substring(0, this.name.length - 1);
	this.draw();
}

state_inputName.prototype.confirm = function () {
	if (this.name) game.current.preload({ player_name: this.name });
	else {
		$rle.put(40, 15, 'Please try again.', { align: 'center', fg: $rle.color.system.red });
		$rle.flush();
	}
}


////
// state_game - main game state
////

function state_game(player_name) {
	game.current.init(player_name);
	this.in_game = true;
}

state_game.prototype = new state();

state_game.prototype.keys = {
	north: {
		keys: $rle.keys.arrow_n,
		action: function () { game.current.player.move($rle.dir.n); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	east: {
		keys: $rle.keys.arrow_e,
		action: function () { game.current.player.move($rle.dir.e); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	west: {
		keys: $rle.keys.arrow_w,
		action: function () { game.current.player.move($rle.dir.w); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	south: {
		keys: $rle.keys.arrow_s,
		action: function () { game.current.player.move($rle.dir.s); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	northwest: {
		keys: $rle.keys.arrow_nw,
		action: function () { game.current.player.move($rle.dir.nw); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	northeast: {
		keys: $rle.keys.arrow_ne,
		action: function () { game.current.player.move($rle.dir.ne); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	southwest: {
		keys: $rle.keys.arrow_sw,
		action: function () { game.current.player.move($rle.dir.sw); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	southeast: {
		keys: $rle.keys.arrow_se,
		action: function () { game.current.player.move($rle.dir.se); state.current().draw(); now.updatePlayer(game.current.player.position.x, game.current.player.position.y); }
	},
	wait: {
		keys: [90, 101],
		action: function () { }
	}
}

state_game.prototype.draw = function () {
	$rle.clear();
	var ents = game.current.current_room.entities;
	for (var i in ents) {
		ents[i].lit = false;
	}
	ents = ents.concat(_PLAYERS);
	fieldOfView(game.current.player.position.x, game.current.player.position.y, game.current.current_room.visibility, game.visit, game.blocked);
	for (var i in ents) {
		ents[i].draw();
	}
	game.current.player.draw();
	game.current.messages.draw();
	game.current.drawUI();
	$rle.flush();
}

state_game.prototype.first_draw = function () {
}