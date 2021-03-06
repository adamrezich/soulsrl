////
// room - basically, the floor of a roguelike dungeon
////

function room(area, floor) {
	this.terrain = [];
	this.creatures = [];
	this.items = [];
	this.decals = [];
	this.players = [];
	this.area = area;
	this.floor = floor;
	this.visibility = 10;
	game.current.rooms.push(this);
}

room.prototype = {
	get entities() {
		return this.terrain.concat(this.players).concat(this.items).concat(this.creatures);
	},
	get name() {
		return this.area + (this.floor ? '-' + this.floor : '');
	}
}

room.data = {}

room.area = {
	prison: 'PRISON',
	castle: 'CASTLE',
	belltower: 'BELLTOWR',
	sewers: 'SEWERS',
	blight: 'BLIGHT',
	caves: 'CAVES'
};

room.prototype.add_terrain = function (position, kind) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) this.terrain.splice(t, 1);
	}
	this.terrain.push(new terrain({ x: position.x, y: position.y }, this, kind));
	return this.terrain[this.terrain.length - 1];
}

room.prototype.add_creature = function (position, data) {
	this.creatures.push(new creature({ x: position.x, y: position.y }, this, data));
	return this.creatures[this.creatures.length - 1];
}

room.prototype.add_item = function (position, data) {
	this.items.push(new item({ x: position.x, y: position.y }, this, data));
	return this.items[this.items.length - 1];
}

room.prototype.add_decal = function (position, data) {
	this.decal.push(new item({ x: position.x, y: position.y }, this, data));
	return this.decals[this.decals.length - 1];
}

room.prototype.solid_at = function (position, all) {
	var solid = false;
	var anything = false;
	var ents = (all ? this.entities : this.terrain);
	for (var i in ents) {
		if (ents[i].position.x == position.x && ents[i].position.y == position.y) {
			anything = true;
			solid = solid || ents[i].solid;
		}
	}
	if (anything) return solid;
	return true;
}

room.prototype.blocks_light_at = function (position) {
	var blocks = false;
	var anything = false;
	var ents = this.entities;
	for (var i in ents) {
		if (ents[i].position.x == position.x && ents[i].position.y == position.y) {
			anything = true;
			blocks = blocks || ents[i].blocks_light;
		}
	}
	if (anything) return blocks;
	return true;
}

room.prototype.terrain_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t];
	}
	return null;
}

room.prototype.creature_at = function (position) {
	for (var t in this.creatures) {
		if (this.creatures[t].position.x == position.x && this.creatures[t].position.y == position.y) return this.creatures[t];
	}
	return null;
}

room.prototype.item_at = function (position) {
	for (var i in this.items) {
		if (this.items[i].position.x == position.x && this.items[i].position.y == position.y) return this.items[i];
	}
	return null;
}

room.prototype.visit = function (x, y) {
	var ents = this.entities;
	for (var i in ents) {
		if (ents[i].position.x == x && ents[i].position.y == y) {
			ents[i].visited = true;
			ents[i].lit = true;
		}
	}
	return null;
}

room.prototype.blocked = function (x, y) {
	return this.blocks_light_at({ x: x, y: y });
}