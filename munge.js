var spells = require('./spells.json');

var munged = Object.keys(spells).map(function(name, i) {
	var spell = spells[name];

	return {
		id: i,
		name: name,
		school: spell.school,
		components: parseComponents(spell),
		level: spell.level,
		description: spell.description,
		range: parseRange(spell),
		duration: parseDuration(spell),
		castingTimme: parseTime(spell.casting_time)
	};
});

function parseComponents(spell) {
	var parts = spell.components.split(', ');
	var v = parts.indexOf('V') >= 0;
	var s = parts.indexOf('S') >= 0;
	var m = parts.filter(function(p) {
		return p[0] === 'M';
	})[0] + parts.slice(3).join(', ');
	
	return {
		v: v,
		s: s,
		m: m ? m.replace(/M \((.+)\)$/, '$1') : false
	};
}

function parseRange(spell) {
	var self = spell.range.match(/^Self( \((.+)\))?/);
	if(self) {
		return {
			type: 'self',
			shape: self[2] ? parseShape(self[2]) : false
		};
	}

	var m = spell.range.match(/^(\d+) feet/);
	if(m) {
		return {
			type: 'feet',
			size: parseInt(m[1])
		};;
	}

	return {type: spell.range.toLowerCase()};
}

function parseShape(shape) {
	var m = shape.match(/^(\d+)-foot (.+)$/);
	return m ? {
		size: parseInt(m[1]),
		type: m[2]
	} : false;
}

function parseDuration(spell) {
	var conc = spell.duration.match(/^Concentration, up to (.+)/);
	return {
		concentration: !!conc,
		time: parseTime(conc ? conc[1] : spell.duration)
	}
}

function parseTime(time) {
	if(time === 'Instantaneous') {
		return {
			type: 'instant'
		};
	}
	
	if(time === 'Until dispelled') {
		return {
			type: 'until_dispelled'
		};
	}

	var m = time.match(/(\d+) (\w+)/);
	return {
		type: parseInt(m[1]),
		size: m[2]
	};
}

require('fs').writeFile('spells-2.json', JSON.stringify(munged, null, 2), 'utf8');
