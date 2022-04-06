function InputControl(layer_id, game_type, screen_width){
	self = this;
	this._layer_id = layer_id;
	this._game_type = game_type;
	this._screen_width = screen_width;
	this._position;
	this._offset;
	this._handle = null;
	this._key_down_array = [];

	this.Init = function(){
		var layer = $('#'+self._layer_id);
		self._offset = layer.offset();

		if(self._game_type == GAME_TYPE.DDR || self._game_type == GAME_TYPE.PIANO_TILE || self._game_type == GAME_TYPE.PUMP){
			document.addEventListener('keydown', self.PCKeyDown);
			document.addEventListener('keyup', self.PCKeyUp);
			layer.on('touchmove', function(e){
				e.preventDefault();
			});
			layer.on('touchstart', self.SmartDeviceTouchStart);
			layer.on('touchend', self.SmartDeviceTouchEnd);
		}else if(self._game_type == GAME_TYPE.GUN_FIRE){
			document.onmousemove = self.PCMouseMove;
			layer.on('touchmove', self.SmartDeviceTouchMove)
		}else if(self._game_type == GAME_TYPE.CRASH_NUTS){
			layer.on('mousedown', self.PCMouseDown);
		}

		return this;
	};

	this.InitHandle = function(center, base_line){
		self._handle = new DrawTouchHandle(window._renderer._ctx, center, base_line, 30, -1);
		window._renderer.AddDrawObject(9, self._handle);
	};

	this._prev_pc_key = 0;
	this._prev_pc_key_time = 0;
	this.PCKeyDown = function(e){
		var key_code = -1;

		if(e.keyCode == self._prev_pc_key){
			if((Date.now() - self._prev_pc_key_time) < 100){
				return;
			}
			self._prev_pc_key_time = Date.now();
		}
		self._prev_pc_key = e.keyCode;

		if(self._key_down_array[e.key] == true){
			return;
		}else{
			self._key_down_array[e.key] = true;
		}

		if(self._game_type == GAME_TYPE.DDR || self._game_type == GAME_TYPE.PIANO_TILE){
			switch(e.key){
				case '1'://숫자1
				case 'd'://d
					key_code = ARROW.LEFT;
					break;
				case '2'://숫자2
				case 'f'://f
					key_code = ARROW.DOWN;
					break;
				case '3'://숫자3
				case 'j'://j
					key_code = ARROW.UP;
					break;
				case '4'://숫자4
				case 'k'://k
					key_code = ARROW.RIGHT;
					break;
			}	
		}else if(self._game_type == GAME_TYPE.PUMP){
			switch(e.key){
				case '1'://숫자1
				case 'g'://g
					key_code = ARROW.LEFT;
					break;
				case '2'://숫자2
				case 'h'://h
					key_code = ARROW.DOWN;
					break;
				case '3'://숫자3
				case 'j'://j
					key_code = ARROW.CENTER;
					break;
				case '4'://숫자4
				case 'k'://k
					key_code = ARROW.UP;
					break;
				case '5'://숫자5
				case 'l'://l
					key_code = ARROW.RIGHT;
					break;
			}	
		}

		if(key_code != -1){
			e.preventDefault();
			var arrows = [key_code];
			window._game_control.HitByLaneAndTime(arrows);
		}
	};

	this.PCKeyUp = function(e){
		var key_code = -1;
		self._key_down_array[e.key] = false;

		if(self._game_type == GAME_TYPE.DDR || self._game_type == GAME_TYPE.PIANO_TILE){
			switch(e.key){
				case '1'://숫자1
				case 'd'://d
					key_code = ARROW.LEFT;
					break;
				case '2'://숫자2
				case 'f'://f
					key_code = ARROW.DOWN;
					break;
				case '3'://숫자3
				case 'j'://j
					key_code = ARROW.UP;
					break;
				case '4'://숫자4
				case 'k'://k
					key_code = ARROW.RIGHT;
					break;
			}	
		}else if(self._game_type == GAME_TYPE.PUMP){
			switch(e.key){
				case '1'://숫자1
				case 'g'://g
					key_code = ARROW.LEFT;
					break;
				case '2'://숫자2
				case 'h'://h
					key_code = ARROW.DOWN;
					break;
				case '3'://숫자3
				case 'j'://j
					key_code = ARROW.CENTER;
					break;
				case '4'://숫자4
				case 'k'://k
					key_code = ARROW.UP;
					break;
				case '5'://숫자5
				case 'l'://l
					key_code = ARROW.RIGHT;
					break;
			}	
		}
		if(key_code != -1){
			e.preventDefault();
			console.log('key up code ' + key_code);
			var key_code_arr = [];
			key_code_arr.push(key_code);
			window._game_control.KeyUpProcess(key_code_arr);
		}
	};

	this._prev_left_touch_ts = 0;
	this._prev_down_touch_ts = 0;
	this._prev_up_touch_ts = 0;
	this._prev_right_touch_ts = 0;
	this._prev_center_touch_ts = 0;

	this.SmartDeviceTouchStart = function(e){
		var beat_count = BEAT_TYPE_COUNT[self._game_type];
		var one_area_width = window.innerWidth / beat_count;
		var arrow_list = [];

		if(self._game_type == GAME_TYPE.PUMP){
			for(var i=0 ; i<e.originalEvent.touches.length ; i++){
				for(var a=1 ; a<=5 ; a++){
					if(e.originalEvent.touches[i].pageX < (one_area_width * a)){
						switch(a){
							case 1:
								if( (Date.now() - self._prev_left_touch_ts) > 100){
									arrow_list.push(ARROW.LEFT);
								}
								self._prev_left_touch_ts = Date.now();
								break;
							case 2:
								if( (Date.now() - self._prev_down_touch_ts) > 100){
									arrow_list.push(ARROW.DOWN);
								}
								self._prev_down_touch_ts = Date.now();
								break;
							case 3:
								if( (Date.now() - self._prev_center_touch_ts) > 100){
									arrow_list.push(ARROW.CENTER);
								}
								self._prev_center_touch_ts = Date.now();
								break;
							case 4:
								if( (Date.now() - self._prev_up_touch_ts) > 100){
									arrow_list.push(ARROW.UP);
								}
								self._prev_up_touch_ts = Date.now();
								break;
							case 5:
								if( (Date.now() - self._prev_right_touch_ts) > 100){
									arrow_list.push(ARROW.RIGHT);
								}
								self._prev_right_touch_ts = Date.now();
								break;
						}
						break;
					}
				}
			}	
		}else{
			for(var i=0 ; i<e.originalEvent.touches.length ; i++){
				for(var a=1 ; a<=4 ; a++){
					if(e.originalEvent.touches[i].pageX < (one_area_width * a)){
						switch(a){
							case 1:
								if( (Date.now() - self._prev_left_touch_ts) > 100){
									arrow_list.push(ARROW.LEFT);
								}
								self._prev_left_touch_ts = Date.now();
								break;
							case 2:
								if( (Date.now() - self._prev_down_touch_ts) > 100){
									arrow_list.push(ARROW.DOWN);
								}
								self._prev_down_touch_ts = Date.now();
								break;
							case 3:
								if( (Date.now() - self._prev_up_touch_ts) > 100){
									arrow_list.push(ARROW.UP);
								}
								self._prev_up_touch_ts = Date.now();
								break;
							case 4:
								if( (Date.now() - self._prev_right_touch_ts) > 100){
									arrow_list.push(ARROW.RIGHT);
								}
								self._prev_right_touch_ts = Date.now();
								break;
						}
						break;
					}
				}
			}
		}
		
		if(arrow_list.length > 0){
			window._game_control.HitByLaneAndTime(arrow_list);
		}
	};

	this.SmartDeviceTouchEnd = function(e){
		var beat_count = BEAT_TYPE_COUNT[self._game_type];
		var one_area_width = window.innerWidth / beat_count;
		var arrow_list = [];

		if(self._game_type == GAME_TYPE.PUMP){
			for(var i=0 ; i<e.originalEvent.touches.length ; i++){
				for(var a=1 ; a<=5 ; a++){
					if(e.originalEvent.touches[i].pageX < (one_area_width * a)){
						switch(a){
							case 1:
								// if( (Date.now() - self._prev_left_touch_ts) > 100){
									arrow_list.push(ARROW.LEFT);
								// }
								// self._prev_left_touch_ts = Date.now();
								break;
							case 2:
								// if( (Date.now() - self._prev_down_touch_ts) > 100){
									arrow_list.push(ARROW.DOWN);
								// }
								// self._prev_down_touch_ts = Date.now();
								break;
							case 3:
								// if( (Date.now() - self._prev_center_touch_ts) > 100){
									arrow_list.push(ARROW.CENTER);
								// }
								// self._prev_center_touch_ts = Date.now();
								break;
							case 4:
								// if( (Date.now() - self._prev_up_touch_ts) > 100){
									arrow_list.push(ARROW.UP);
								// }
								// self._prev_up_touch_ts = Date.now();
								break;
							case 5:
								// if( (Date.now() - self._prev_right_touch_ts) > 100){
									arrow_list.push(ARROW.RIGHT);
								// }
								// self._prev_right_touch_ts = Date.now();
								break;
						}
						break;
					}
				}
			}	
		}else{
			for(var i=0 ; i<e.originalEvent.touches.length ; i++){
				for(var a=1 ; a<=4 ; a++){
					if(e.originalEvent.touches[i].pageX < (one_area_width * a)){
						switch(a){
							case 1:
								// if( (Date.now() - self._prev_left_touch_ts) > 100){
									arrow_list.push(ARROW.LEFT);
								// }
								// self._prev_left_touch_ts = Date.now();
								break;
							case 2:
								// if( (Date.now() - self._prev_down_touch_ts) > 100){
									arrow_list.push(ARROW.DOWN);
								// }
								// self._prev_down_touch_ts = Date.now();
								break;
							case 3:
								// if( (Date.now() - self._prev_up_touch_ts) > 100){
									arrow_list.push(ARROW.UP);
								// }
								// self._prev_up_touch_ts = Date.now();
								break;
							case 4:
								// if( (Date.now() - self._prev_right_touch_ts) > 100){
									arrow_list.push(ARROW.RIGHT);
								// }
								// self._prev_right_touch_ts = Date.now();
								break;
						}
						break;
					}
				}
			}
		}
		
		if(arrow_list.length > 0){
			window._game_control.KeyUpProcess(arrow_list);
		}
	};

	this.PCMouseMove = function(event){
		var dot, eventDoc, doc, body, pageX, pageY;
		event = event || window.event; // IE-ism
		if (event.pageX == null && event.clientX != null) {
				eventDoc = (event.target && event.target.ownerDocument) || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY +
					(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
					(doc && doc.clientTop  || body && body.clientTop  || 0 );
		}

		self._position = {
				x: event.pageX - self._offset.left,
				y: event.pageY
		};

		if(self._position.x >= 0 && self._position.x <= self._screen_width){
			if(self._handle != null){
				self._handle.Move(self._position.x);
			}
		}
	};

	this.SmartDeviceTouchMove = function(e){
		e.preventDefault();
		for(var i=0 ; i<e.originalEvent.touches.length ; i++){
			self._position = {
				x: e.originalEvent.touches[i].pageX,
				y: e.originalEvent.touches[i].pageY
			};

			if(self._position.x >= 0 && self._position.x <= self._screen_width){
				if(self._handle != null){
					self._handle.Move(self._position.x);
				}
			}
		}
	};

	this.PCMouseDown = function(event){
		var dot, eventDoc, doc, body, pageX, pageY;
		event = event || window.event; // IE-ism
		if (event.pageX == null && event.clientX != null) {
				eventDoc = (event.target && event.target.ownerDocument) || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY +
					(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
					(doc && doc.clientTop  || body && body.clientTop  || 0 );
		}

		self._position = {
			x: event.pageX - self._offset.left,
			y: event.pageY - self._offset.top,
		};
		// console.log('position ' + self._position.x + ' ' + self._position.y);
		window._game_control.HitByXAndTime(self._position.x);
	};
}