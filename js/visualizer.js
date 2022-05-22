function Visualizer(){
	var self = this;
	this._cb_on_data_loaded;
	this._data = null;
	this._canvas = null;
	this._ctx = null;
	this._is_playing = false;
	this._time_flow = 0;
	this._youtube_time_flow = 0;
	this._data_index = 0;
	this._width = 0;
	this._height = 0;
	this._buffer_length = 128;
	this._bar_width = 0;
	this._h_unit = 0;

	this.Init = function(canvas_id, cb_on_data_loaded){
		self._cb_on_data_loaded = cb_on_data_loaded;
		$('#'+canvas_id).on('resize', self.OnResize);

		self._canvas = document.getElementById(canvas_id);
		self._ctx = self._canvas.getContext("2d");
		return this;
	};

	this.OnResize = function(){
		console.log('OnResize ');
		self.SetLayout();
	};

	this.SetLayout = function(){
		self._width = self._canvas.getBoundingClientRect().width;
		self._height = self._canvas.getBoundingClientRect().height;
		self._canvas.width = self._width;
		self._canvas.height = self._height;
		console.log('self._width ' + self._width + ' self._height ' + self._height);
		self._h_unit = self._height / 256;
		console.log('self._h_unit ' + self._h_unit);
		self._bar_width = (self._width / self._buffer_length) * 1.5;
		console.log('self._bar_width ' + self._bar_width);
		// self._bar_width = 4;
		self._ctx.scale(1, 1);
	};

	this.SetCallBack = function(cb_on_data_loaded){
		self._cb_on_data_loaded = cb_on_data_loaded;
	};

	this.LoadData = function(game_id){
		var path_to_song = '/upload/vis/'+game_id+'.vis';
		$.ajax({
			url: path_to_song,
			type:"GET",
			success: function(res){
				var b64_decoded = atob(res);

				var array_buffer = new Uint8Array(b64_decoded.length);
				for(var i=0 ; i<b64_decoded.length ; i++){
					array_buffer[i] = b64_decoded[i].charCodeAt(0);
				}
				var decompressed = pako.inflate(array_buffer);
				var restored = self.Uint8ArrayToUTF8(decompressed);
				self._data = JSON.parse(restored);
				// console.log('self._data ' + JSON.stringify(self._data));
				if(self._cb_on_data_loaded){
					console.log('visualizer data loaded ');
					self._cb_on_data_loaded(true);
				}

				{
					// if(self._data != null){
					// 	if(self._data.length > 0){
					// 		self._buffer_length = self._data[0].data_array.length;
					// 		console.log('self._buffer_length ' + self._buffer_length);
					// 		// self._bar_width = (self._width / self._buffer_length) * 1.5;
					// 		self._bar_width = (self._width / self._buffer_length);
					// 		console.log('self._bar_width ' + self._bar_width);
					// 	}
					// }
				}
			},
			error: function(){
				if(self._cb_on_data_loaded){
					self._cb_on_data_loaded(false);
				}
			}
		});
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

	this.Play = function(){
		self._is_playing = true;
		self._time_flow = 0;
		self._youtube_time_flow = 0;
		self._data_index = 0;
		self.Loop();
	};

	this.Stop = function(){
		self._is_playing = false;
	};

	this.AdjustTime = function(t){
		self._youtube_time_flow = t;
	};

	this.Loop = function(){
		if(self._is_playing == false){
			return;
		}

		self._time_flow += window._timer._delta;
		self._youtube_time_flow += window._timer._delta;
		// console.log('self._time_flow ' + self._time_flow);

		//youtube와 시간차 보정
		{
			if(self._time_flow > self._youtube_time_flow){
				var diff = self._time_flow - self._youtube_time_flow;
				self._time_flow -= diff / 20;
			}else if(self._time_flow < self._youtube_time_flow){
				var diff = self._youtube_time_flow - self._time_flow;
				self._time_flow += diff / 20;
			}
		}

		self._time_flow += 80;

		for(var i=self._data_index ; i<self._data.length ; i++){
			if(self._time_flow < self._data[i].ms){
				continue;
			}
			self.RenderDataArray(self._data[i].data_array);
			self._data_index = i+1;
			break;
		}

		requestAnimationFrame(self.Loop);
	};

	this.RenderDataArray = function(data_array){
		// console.log('RenderDataArray ' + ' self._buffer_length ' + self._buffer_length);
		self._ctx.fillStyle = "#000";
		self._ctx.fillRect(0, 0, self._width, self._height);

		// console.log('data_array[0] ' + data_array[0]);

		var x = 0;
		var y = 0;
		var bar_height = 0;
		for (var i = 0; i < self._buffer_length; i++) {
			if(data_array[i] == 0){
				continue;
			}
			
			bar_height = data_array[i] * self._h_unit;
			x = i * self._bar_width;
			y = self._height - bar_height;
			
			var r = bar_height + (25 * (i/self._buffer_length));
			var g = 250 * (i/self._buffer_length);
			var b = 50;

			self._ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
			self._ctx.fillRect(x, y, self._bar_width, bar_height);
		}
	}
}