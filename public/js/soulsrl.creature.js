////
// creature - anything that has hit points, can be killed, etc.
////

function creature(pos, room, data) {
	this.position = pos;
	this.room = room;

	this.maxHP = 1;
	this.souls = 0;

	this.name = '<NAME MISSING>';

	this.respawns = true;

	// TODO: Improve this copy code if creature data is ever going to
	// contain arrays or objects that'll be modified in the copy

	if (data) {
		for (var key in data) {
			if (key == 'HP') this['maxHP'] = data[key];
        	else this[key] = data[key];
    	}
	}
	
	this.hitpoints = this.maxHP;

	Object.defineProperties(this, {
		"HP": {
			"get": function () {
				return this.hitpoints;
			},
			"set": function (val) {
				this.hitpoints = val;
				if (this.hitpoints < 1) this.kill();
			}
		},
		"attack_dice": {
			"get": function () {
				return {
					multiplier: 1,
					die: 4,
					bonus: 1
				}
			}
		}
	})
}

creature.prototype = new entity();

creature.prototype.should_draw = function () {
	return this.lit;
}

creature.prototype.move = function(direction) {
	this.move_to($rle.add_dir(this.position, direction));
}

creature.prototype.move_to = function (position) {
	var lastpos = { x: this.position.x, y: this.position.y };
	var ter = game.current.current_room.terrain_at(position);
	if (ter) {
		// there is terrain of some kind (including floor)
		if (ter.solid) {
			// it's solid, though
			ter.interact_with(this);
			this.draw();
			return;
		}
		var cre = game.current.current_room.creature_at(position);
		if (cre) {
			// there's a creature there! attack it!
			this.attack(cre);
		}
		else {
			// see if there's traps or anything on the terrain
			if (ter.interact_with(this)) {
				this.position = position;
				game.current.redraw_tile(lastpos);
				this.draw();
			}
		}
	}
	else {
		// there's no terrain there
		terrain.path_blocked();
		return;
	}
}

creature.prototype.attack = function (other) {
	var amount = this.attack_roll();
	var missed = false;
	if (!missed) {
		if (this == game.current.player) {
			game.current.messages.write('You attack the ' + other.name + ' for ' + amount + ' damage!');
		}
		other.HP -= amount;
		if (other.HP < 1) {
			if (this == game.current.player) {
				game.current.messages.write('You kill the ' + other.name + ', gaining ' + other.souls + ' souls!');
				this.souls += other.souls;
			}
			if (other == game.current.player) {
				game.current.messages.write('The ' + other.name + ' kills you!');
				game.current.messages.write('Y O U  D I E D.');
			}
		}
	}
	else {
		if (this == game.current.player) {
			game.current.messages.write('You miss the ' + other.name + '!');
		}
		if (other == game.current.player) {
			game.current.messages.write('The ' + other.name + ' misses you!');
		}
	}
}

creature.prototype.wander = function () {
	var possibilities = [];
	for (var d in $rle.dir) {
		var pos = $rle.add_dir(this.position, $rle.dir[d]);
		if (!this.room.solid_at(pos)) possibilities.push(pos); // say that ten times fast
	}
	console.log(possibilities);
}

creature.prototype.attack_roll = function () {
	return game.roll(this.attack_dice.multiplier, this.attack_dice.die) + this.attack_dice.bonus;
}

creature.prototype.kill = function () {
	for (var i in this.room.creatures) {
		if (this.room.creatures[i] == this) {
			this.room.creatures.splice(i, 1);
			break;
		}
	}
}

creature.behavior = {
	none: {},
	basic_melee: {},
	basic_ranged: {},
	firebomber: {}
}

creature.data = {
	// A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
	//   #                 #             #                
	// a b c d e f g h i j k l m n o p q r s t u v w x y z
	// # #           #   # #             #     #          

	////
	// HOLLOW - decrepit, weak zombies
	////

	hollow_unarmed: {				// undead, decrepit, just stands around and waits to be killed
		name: 'hollow',
		character: 'h',
		HP: 8,
		behavior: creature.behavior.none,
		souls: 20
	},
	hollow_archer: {				// early ranged enemy
		name: 'hollow archer',
		character: 'h',
		behavior: creature.behavior.basic_ranged,
		souls: 20
	},
	hollow_sword: {					// lightly armored hollow with a sword
		name: 'hollow swordsman',
		character: 'h',
		behavior: creature.behavior.basic_melee,
		souls: 20
	},
	hollow_firebomb: {				// super-annoying enemy that throws firebombs at regular intervals
		name: 'hollow firebomber',
		character: 'h',
		behavior: creature.behavior.firebomber,
		souls: 20
	},


	////
	// UNDEAD - more skeletal-looking than hollow, and actually dangerous
	////

	undead_sword: {					// basically stronger hollow_sword
		name: 'undead warrior',
		character: 'u',
		behavior: creature.behavior.basic_melee,
		souls: 50
	},
	undead_spear: {					// has a spear and small shield, dangerous early enemy
		name: 'undead warrior',
		character: 'u',
		behavior: creature.behavior.basic_melee,
		souls: 50
	},
	undead_crossbow: {				// stronger hollow_archer, basically
		name: 'undead archer',
		character: 'u',
		behavior: creature.behavior.basic_ranged,
		souls: 50,
	},
	undead_assassin: {				// throwing knives, counters, and backstabs make this a worthy enemy
		name: 'undead assassin',
		character: 'a',
		behavior: creature.behavior.rogue,
		souls: 100
	},
	undead_dog: {					// fast pack animal, so, super dangerous in groups
		name: 'undead dog',
		character: 'd',
		behavior: creature.behavior.basic_melee,
		souls: 100
	},


	////
	// SKELETON - about on par with undead, strength-wise, but a bit more agile
	////

	skeleton_axe: {					// average enemy
		character: 's'
	},
	skeleton_giant: {				// giant four-armed skeleton swordsman
		character: 'S',
		respawns: false
	},


	////
	// KNIGHT - stronger, mostly solo enemies
	////

	knight_sword: {					// burly melee dude
		character: 'k'
	},
	knight_mace: {					// another burly melee dude
		character: 'k'
	},
	knight_black: {					// this guy will rip your shit up
		character: 'K',
		respawns: false
	},


	////
	// JELLY - amorphous blobs of surprise death
	////

	jelly_black: {
		character: 'j'				// lurks in damp and watery areas and attacks with pseudopodia
	},


	////
	// RAT - disgusting, poisonous vermin of varying size and strength
	////

	rat_small: {					// size of a small dog
		character: 'r'
	},
	rat_large: {					// size of a small bear
		character: 'R'
	},


	////
	// MISC - unique creatures without "class groupings"
	////

	basilisk: {						// worst creature in game, will curse you, comes in small groups
		character: 'b'
	},

	butcher: {						// slow, tough solo creature with a butcher's knife and meat hook
		character: 'B',
		respawns: false
	},


	////
	// PLAYER - durr, it's the player
	////

	player: {
		character: '@',
		HP: 10,
		level: 1,
		XP: 0,
		humanity: 0,
		lit: true
	},


	////
	// GHOST - player ghosts
	////

	ghost: {
		character: '@',
		fg: { r: 96, g: 96, b: 96 },
		lit: true,
		solid: false
	}
}