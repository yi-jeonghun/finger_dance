const ARROW = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
};

const DIMENSION = {
	_2D: 0,
	_3D: 1
};

const LEFT_BIT = 1;
const UP_BIT = 2;
const RIGHT_BIT = 4;
const DOWN_BIT = 8;

const DEFAULT_SOUND_KEY = '12844_0_Chaos_sf2_file.js';

const LAYOUT = {
	INFO:0,
	PLAY:1,
	RECORD:2
};

const MOVE_DIRECTION = {
	UPWARD:0,
	DOWNWARD:1
}

const RENDER_MODE = {
	PLAY:0,
	RECORD:1
};

const GAME_TYPE = {
	DDR:0,
	PIANO_TILE:1,//
	GUN_FIRE:2
};

const GAME_TYPE_STR = {
	[GAME_TYPE.DDR]: 'DDR',
	[GAME_TYPE.PIANO_TILE]: 'PIANO TILE',
	[GAME_TYPE.GUN_FIRE]: 'GUN FIRE',
}

const BEAT_TYPE_COUNT = {
	[GAME_TYPE.DDR]:4,
};

const BG_TYPE = {
	IMG:'IMG',
	STYLE:'STYLE'
};

const BG_SELECT_TYPE = {
	FIXED: 'FIXED',
	RANDOM: 'RANDOM',
	SEQUENCE: 'SEQUENCE'
};
