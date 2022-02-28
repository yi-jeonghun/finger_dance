$('document').ready(function(){
	window._db_control = new DBControl().Init();
});
function DBControl(){
	var self = this;
	/**
		"game_id": 344,
		"title": "Roly Poly",
		"artist": "T-ARA",
		"game_type": 0
	*/
	this._total_list_dictionary = [];
	/**
		game_id: 123,
		is_complete: true|false,
		progress_percent: 1
	*/
	this._game_result_list_dictionary = {};
	this._latest_list_arr = [];
	this._my_played_game_list_arr = [];

	this.Init = function(){
		return this;
	};

	this.LoadGames = function(callback){
		console.log('Load Games ' );
		self.LoadGameResultList();
		$.getJSON("db/total_list_dictionary.json", function(total_list_dictionary) {
			self._total_list_dictionary = total_list_dictionary;

			$.getJSON("db/latest_list_arr.json", function(latest_list_arr){
				self._latest_list_arr = latest_list_arr;
				var music_list = [];
				for(var i=0 ; i<self._latest_list_arr.length ; i++){
					var idx = self._latest_list_arr[i];
					console.log('idx ' + idx);
					var game_info = self._total_list_dictionary[idx];
					music_list.push(game_info);
				}
				if(callback){
					callback(music_list);
				}
			});
		});
	};

	this.GetMyPlayedGameList = function(){
		var music_list = [];
		for(var i=0 ; i<self._my_played_game_list_arr.length ; i++){
			var idx = self._my_played_game_list_arr[i];
			console.log('idx ' + idx);
			var game_info = self._total_list_dictionary[idx];
			music_list.push(game_info);
		}
		return music_list;
	};

	this.LoadGameResultList = function(){
		console.log('load game result list ');
		var str = localStorage.getItem('game_result_list_dictionary');
		if(str != null && str != ''){
			self._game_result_list_dictionary = JSON.parse(str);
		}

		str = localStorage.getItem('my_played_game_list_arr');
		if(str != null && str != ''){
			self._my_played_game_list_arr = JSON.parse(str);
		}
	};

	this.SaveGameResult = function(game_result){
		console.log('SaveGameResult ');
		
		{
			var found = false;
			var item = self._game_result_list_dictionary[game_result.game_id];
			if(item !== undefined){
				self._game_result_list_dictionary[game_result.game_id] = game_result;
			}
			if(found == false){
				self._game_result_list_dictionary[game_result.game_id] = game_result;
			}
			localStorage.setItem('game_result_list_dictionary', JSON.stringify(self._game_result_list_dictionary));
		}

		{
			var idx = self._my_played_game_list_arr.indexOf(game_result.game_id);
			if(idx > -1){
				self._my_played_game_list_arr.splice(idx, 1);
			}
			self._my_played_game_list_arr.unshift(game_result.game_id);
			localStorage.setItem('my_played_game_list_arr', JSON.stringify(self._my_played_game_list_arr));
		}
	};

	this.GetGameResult = function(game_id){
		var game_result = self._game_result_list_dictionary[game_id];
		if(game_result !== undefined){
			return game_result;
		}
		return null;
	};
}