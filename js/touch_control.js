function TouchControl(){
	self = this;
	this._position;
	this._offset;
	this._screen_width;
	this._handle = null;
	this._is_initialized = false;

	this.Init = function(layer_id, screen_width){
		self._screen_width = screen_width;
		self._offset = $('#'+layer_id).offset();
		document.onmousemove = self.HandleMouseMove;

		$('#'+layer_id).on('touchmove', self.HandleTouchMove)
		return this;
	};

	this.InitHandle = function(center, base_line){
		self._handle = new DrawTouchHandle(window._renderer._ctx, center, base_line, 30, -1);
		window._renderer.AddDrawObject(9, self._handle);
		self._is_initialized = true;
	};

	this.HandleMouseMove = function(event){
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

	this.HandleTouchMove = function(e){
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

	this.TouchDetect = function(){
		if(self._is_initialized == false)
			return;
	};
}