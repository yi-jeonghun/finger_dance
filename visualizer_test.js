$('document').ready(function(){
	window._visualizer = new Visualizer().Init();
});

function Visualizer(){
	var self = this;
	this._file;
	this._autio;
	this._ctx;
	this._canvas;
	this._width;
	this._height;
	this._analyser;
	this._buffer_length;
	this._data_array;
	this._bar_width;
	this._is_playing = false;
	this._is_recording = false;
	this._timer;
	this._interval_ms = 10;//ms

	this.Init = function(){
		self._timer = new Timer().Init();

		self.InitHandle();
		self._audio = document.getElementById("audio");	

		self._width = 1000;
		self._height = 300;

    self._canvas = document.getElementById("visualizer_canvas");
    self._canvas.width = self._width;
    self._canvas.height = self._height;
    self._ctx = self._canvas.getContext("2d");

		return this;
	};

	this.InitHandle = function(){
		$('#id_audio_file').on('change', self.OnFileChange);
		$('#id_btn_play').on('click', self.Play);
		$('#id_btn_stop_play').on('click', self.StopPlay);
		$('#id_btn_record').on('click', self.Record);
		$('#id_btn_stop_record').on('click', self.StopRecord);
		$('#id_btn_test').on('click', self.Test);
		$('#id_btn_stop_test').on('click', self.StopTest);
	};

	this.OnFileChange = function(){
    var files = this.files;
    self._audio.src = URL.createObjectURL(files[0]);
    self._audio.load();
	};

	this.Play = function(){
		self._is_playing = true;
		self._is_recording = false;
		self.SetupAanlyser();
    self._audio.play();
    self.AudioLoop();
	};

	this.StopPlay = function(){
		self._is_playing = false;
		self._is_recording = false;
    self._audio.pause();
		self._audio.currentTime = 0;
	};

	this.Record = function(){
		self._tick = 0;
		self._frequency_data_list = [];
		self._is_playing = true;
		self._is_recording = true;
		self.SetupAanlyser();
    self._audio.play();
    self.AudioLoop();
	};

	this._compressed_data;
	this.StopRecord = function(){
		self._is_recording = false;
		self.StopPlay();
		var json_str = JSON.stringify(self._frequency_data_list);
		console.log('json_str len ' + json_str.length);
		var compressed_str = pako.deflate(json_str);
		console.log('compressed_str ' + compressed_str.length);
		console.log('size ' + json_str.length / compressed_str.length);

		$('#id_textarea_result').val(compressed_str);
		self._compressed_data = compressed_str;
	};

	this._audio_connected = false;
	this.SetupAanlyser = function(){
		if(self._audio_connected){
			return;
		}
		self._audio_connected = true;
    var audio_context = new AudioContext();
    var src = audio_context.createMediaElementSource(self._audio);
    self._analyser = audio_context.createAnalyser();

    src.connect(self._analyser);
    self._analyser.connect(audio_context.destination);
    self._analyser.fftSize = 256;

    self._buffer_length = self._analyser.frequencyBinCount;
    self._data_array = new Uint8Array(self._buffer_length);
		self._bar_width = (self._width / self._buffer_length) * 1.5;
	};

	this.AudioLoop = function() {
		if(self._is_playing == false){
			return;
		}

		self._analyser.getByteFrequencyData(self._data_array);
		self.RenderDataArray(self._data_array);

		if(self._is_recording){
			self.RecordData(self._data_array);
		}

		requestAnimationFrame(self.AudioLoop);
	}

	this.RenderDataArray = function(data_array){
		self._ctx.fillStyle = "#000";
		self._ctx.fillRect(0, 0, self._width, self._height);

		var x = 0;
		for (var i = 0; i < self._buffer_length; i++) {
			var bar_height = data_array[i];
			
			var r = bar_height + (25 * (i/self._buffer_length));
			var g = 250 * (i/self._buffer_length);
			var b = 50;

			self._ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
			self._ctx.fillRect(x, self._height - bar_height, self._bar_width, bar_height);

			x += self._bar_width;
		}
	}

	this._tick = 0;
	this._record_time_lapse = 0;
	this._frequency_data_list = [];
	this.RecordData = function(data_array){
		var now = Date.now();
		self._record_time_lapse += self._timer._delta;

		if(self._tick > 0){
			if((now - self._tick) < self._interval_ms){
				return;
			}
		}

		var arr = [];
		for(var i=0 ; i<data_array.length ; i++){
			arr.push(data_array[i]);
		}
		self._frequency_data_list.push({
			ms: self._record_time_lapse,
			data_array: arr
		});

		self._tick = now;
	};

	this._is_testing = false;
	this.Test = function(){
		self._is_testing = true;
		self._index = 0;
		self._test_time_lapse = 0;
    self._audio.play();

		{
			self._frequency_data_list = [];
			var decompressed_data = pako.inflate(self._compressed_data);
			var restored = self.Uint8ArrayToUTF8(decompressed_data);
			self._frequency_data_list = JSON.parse(restored);
			$('#id_textarea_result').text(JSON.stringify(self._frequency_data_list));
		}

		self.TestLoop();
	};

	this.StopTest = function(){
		self._is_testing = false;
		self.StopPlay();
	};

	this._index = 0;
	this._test_time_lapse = 0;
	this.TestLoop = function(){
		if(self._is_testing == false){
			return;
		}

		self._test_time_lapse += self._timer._delta;

		for(var i=self._index ; i<self._frequency_data_list.length ; i++){
			if(self._test_time_lapse < self._frequency_data_list[i].ms){
				continue;
			}
			self.RenderDataArray(self._frequency_data_list[i].data_array);
			self._index = i+1;
			break;
		}

		// self.RenderDataArray(data_array);

		requestAnimationFrame(self.TestLoop);
	};

	this.Uint8ArrayToUTF8 = function(data){
		const extraByteMap = [ 1, 1, 1, 1, 2, 2, 3, 0 ];
		var count = data.length;
		var str = "";

		for(var index = 0;index < count;){
			var ch = data[index++];
			if (ch & 0x80){
				var extra = extraByteMap[(ch >> 3) & 0x07];
				if (!(ch & 0x40) || !extra || ((index + extra) > count))
					return null;

				ch = ch & (0x3F >> extra);
				for (;extra > 0;extra -= 1)	{
					var chx = data[index++];
					if ((chx & 0xC0) != 0x80)
						return null;

					ch = (ch << 6) | (chx & 0x3F);
				}
			}
			str += String.fromCharCode(ch);
		}
		return str;
	};
}
