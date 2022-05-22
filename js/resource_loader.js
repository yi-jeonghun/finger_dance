function ResourceLoader(){
	var self = this;
	this._image_list = [];
	this._is_youtube_loaded = false;
	this._total_count = 1; //Youtube video를 위해 기본 1개로 함.
	this._cb_on_loaded = null;
	this._is_visualizer_loaded = false;

	this.SetCallback = function(cb){
		self._cb_on_loaded = cb;
	};

	this.AddVisualizer = function(game_id){
		console.log('AddVisualizer game_id ' + game_id);
		self._total_count++;
		window._visualizer.SetCallBack(self.OnVisualizerLoaded);
		window._visualizer.LoadData(game_id);
	};

	this.OnVisualizerLoaded = function(result){
		self._is_visualizer_loaded = true;
		self.CheckLoadingFinished();
	};

	this.AddImage = function(image_path){
		// console.log('AddImage ' + image_path);
		for(var i=0 ; i<self._image_list.length ; i++){
			if(self._image_list[i].image_path == image_path){
				// console.log('already added ');
				return;
			}
		}

		var image_resource = {
			image_path: image_path,
			image: new Image(),
			is_loaded: false,
		};
		image_resource.image.src = image_path;
		image_resource.image.onload = self.OnImageLoaded;
		self._image_list.push(image_resource);
		self._total_count++;
		// console.log('self._total_count ' + self._total_count);
	};

	this.GetImage = function(image_path){
		for(var i=0 ; i<self._image_list.length ; i++){
			if(self._image_list[i].image_path == image_path){
				return self._image_list[i].image;
			}
		}
		return null;
	};

	this.OnImageLoaded = function(){
		// console.log('OnImageLoaded ');
		for(var i=0 ; i<self._image_list.length ; i++){
			if(self._image_list[i].image == this){
				self._image_list[i].is_loaded = true;
				// console.log('found ' + i);
				// console.log(this.src);
			}
		}
		self.CheckLoadingFinished();
	};

	this.OnYoutubeLoaded = function(){
		self._is_youtube_loaded = true;
		self.CheckLoadingFinished();
	};

	this.CheckLoadingFinished = function(){
		var loaded_count = 0;

		if(self._is_youtube_loaded){
			loaded_count++;
		}

		if(self._is_visualizer_loaded){
			loaded_count++;
		}

		for(var i=0 ; i<self._image_list.length ; i++){
			if(self._image_list[i].is_loaded){
				loaded_count++;
			}
		}

		var percent = loaded_count/self._total_count;
		// console.log('loaded_count ' + loaded_count);
		// console.log('percent ' + percent);
		if(self._cb_on_loaded){
			self._cb_on_loaded(percent);
		}
	};
}
