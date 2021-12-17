function DrumPlayer(){
	var self = this;
	this._audioContext = null;
	this._player = null;
	this._onLoadingFinishedCallback = null;
	this._drum_info_list = [
		{
			file:'',
			var:'',
			pitch:0
		},
		{
			file:'',
			var:'',
			pitch:0
		},
		{
			file:'',
			var:'',
			pitch:0
		},
		{
			file:'',
			var:'',
			pitch:0
		}
	];
	
	this.Init = function(){
		var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
		self._audioContext = new AudioContextFunc();
		self._player = new WebAudioFontPlayer();
		self.LoadDefaultDrum();
		return this;
	};

	this.LoadDefaultDrum = function(){
		var drum_info = {
			file:'',
			var:'',
			pitch:0
		};

		var key = DEFAULT_SOUND_KEY;
		for(var i=0 ; i<DRUMS.length ; i++){
			if(DRUMS[i].file == DEFAULT_SOUND_KEY){
				drum_info.file = key;
				drum_info.var = DRUMS[i].var;
				drum_info.pitch = DRUMS[i].pitch;
				break;
			}
		}

		for(var i=0 ; i<self._drum_info_list.length ; i++){
			self._drum_info_list[i] = drum_info;
		}

		var path = 'lib/webaudiofontdata/sound/' + key;
		self._player.loader.startLoad(self._audioContext, path, drum_info.var);
		self._player.loader.waitLoad(function(){
			console.log('Default Drum Loading Finished');
		});
	};

	this.LoadDrum = function(idx, key){
		var drum_info = {
			file:'',
			var:'',
			pitch:0
		};

		for(var i=0 ; i<DRUMS.length ; i++){
			if(DRUMS[i].file == key){
				drum_info.file = key;
				drum_info.var = DRUMS[i].var;
				drum_info.pitch = DRUMS[i].pitch;
				break;
			}
		}
		self._drum_info_list[idx] = drum_info;

		var path = 'lib/webaudiofontdata/sound/' + key;
		self._player.loader.startLoad(self._audioContext, path, drum_info.var);
		self._player.loader.waitLoad(function(){
			console.log('Drum Loading Finished');
			if(self._onLoadingFinishedCallback != null){
				self._onLoadingFinishedCallback();
			}
		});
	};

	this.Hit = function(arrow){
		var idx = 0;
		switch(arrow){
			case ARROW.LEFT:
				idx = 0;
				break;
			case ARROW.DOWN:
				idx = 1;
				break;
			case ARROW.UP:
				idx = 2;
				break;
			case ARROW.RIGHT:
				idx = 3;
				break;
		}

		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(self._drum_info_list[idx].var), 0, self._drum_info_list[idx].pitch, 0.2, 0.1);
	};
}
