$('document').ready(function(){
	console.log('document ready ');
	window._index_control = new IndexControl().Init();
});

function IndexControl(){
	var self = this;
	this._game_list = [];
	this._db_control = null;

	this.Init = function(){
		self._db_control = new DBControl();
		self._db_control.LoadGames(self.OnLoadGameList);
		return this;
	};

	this.OnLoadGameList = function(list){
		self._game_list = list;
		console.log('list ' + JSON.stringify(list));
		self.DISP_GameList();
	};

	this.OpenGame = function(game_id){
		console.log('game_id ' + game_id);
		window.open(`./player_ddr.html?id=${game_id}`);
	};

	this.DISP_GameList = function(){
		var h = '';
		for(var i=0 ; i<self._game_list.length ; i++){
			var game = self._game_list[i];
			h += self.DISP_GetItem(game);
		}
		$('#id_div_game_list').html(h);
	};

	this.DISP_GetItem = function(game){
		var on_click = `window._index_control.OpenGame('${game.game_id}')`;
		var game_result = window._db_control.GetGameResult(game.game_id);
		console.log('game result ' + game_result);
		var percent = 0;
		var percent_str = '0%';
		var score_str = '0';
		var complete_visibility = 'complete-hide';
		var difficulty_str = '';
		if(game_result != null){
			percent = game_result.progress_percent * 100;
			percent_str = Math.round(percent, 1) + '%';
			score_str = game_result.score;
			if(game_result.is_complete){
				complete_visibility = 'complete-show';
			}

			if(game_result.difficulty){
				switch(game_result.difficulty){
					case DIFFICULTY.EASY:
						difficulty_str = '<span class="badge badge-primary">Easy</span>';
						break;
					case DIFFICULTY.NORMAL:
						difficulty_str = '<span class="badge badge-primary">Normal</span>';
						break;
					case DIFFICULTY.HARD:
						difficulty_str = '<span class="badge badge-primary">Hard</span>';
						break;
				}
			}
		}

		var img = '';
		switch(game.game_type){
			case GAME_TYPE.DDR:
				img = `<img src="../img/icon_game_type_ddr.png" style="width:50px; height:auto">`;
				break;
			case GAME_TYPE.PUMP:
				img = `<img src="../img/icon_game_type_pump.png" style="width:50px; height:auto">`;
				break;
			case GAME_TYPE.PIANO_TILE:
				img = `<img src="../img/icon_game_type_tile.png" style="width:50px; height:auto">`;
				break;
			case GAME_TYPE.GUN_FIRE:
				img = `<img src="../img/icon_game_type_fire.png" style="width:50px; height:auto">`;
				break;
		}

		var h = `
			<div class="col-3" onclick="${on_click}" style="margin-bottom:4em; cursor:pointer">
				<div>
					<image style="width:100%; height:auto" src="https://img.youtube.com/vi/${game.video_id}/0.jpg"></image>
					<div id="id_game_complete-${game.game_id}" class="${complete_visibility}" style="position:absolute; top:10%; left:10%; width:100%; height:100%; color:red;">
						<i class="fas fa-check" style="font-size:5em;"></i>
					</div>
				</div>
				<div class="" style="margin-top: 5px">
					<div class="d-flex">
						<div>
							${img}
						</div>
						<div class="w-100">
							<div class="text-right" style="margin-left:5px; margin-top:5px; font-size:1.1em">${game.title}</div>
							<div class="text-right" style="margin-left:5px; margin-top:5px; font-size:0.9em">${game.artist}</div>
						</div>
					</div>
					<div class="container" style="margin-top:5px">
						<div class="row" style="">
							<div class="col-6" style="padding-left:5px; font-size:0.7em">
								Score 
								<span id="id_game_score-${game.game_id}">${score_str}</span>
							</div>
							<div class="col-6 text-right" style="font-size:0.7em">
								<span id="id_game_percent-${game.game_id}">${percent_str}<span>
								<span id="id_game_difficulty-${game.game_id}">${difficulty_str}</span>
							</div>
						</div>
					</div>
					<div id="id_game_percent_bar-${game.game_id}" 
						style="position:absolute; bottom:0px; width:${percent}%; height:2px; background-color:blue"></div>
					</div>
				</div>
			</div>
		`;
		return h;
	};
}