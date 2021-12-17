$('document').ready(function(){
	new IndexControl().Init();
});

function GoToPlayer(game_id){
	console.log('game_id ' + game_id);
	$('#id_game_id'+game_id).css('background-color', 'gray');
	window.location.href = "/play_game.vu?id="+game_id;
}

function GoToArtist(artist){
	console.log('artist ' + artist);
	window.location.href = "/artist_game_list.vu?l=artist&n="+artist;
}

function IndexControl(){
	var self = this;
	this._page = 1;
	this._loading_more = false;
	this._list_type = 'p';//기본이 p
	this._artist = '';
	this._is_mobile_device = (window.innerWidth <= 600 ? true : false);
	this._level_mask = 0;

	this.Init = function(){
		self._list_type = GetURLParam('l');
		self._artist = GetURLParam('n');

		self.InitComponentHandle();
		{
			if(self._is_mobile_device){
				var edit_link_list = $('[id="id_edit_link"]');
				for(var i=0 ; i<edit_link_list.length ; i++){
					var l = $(edit_link_list[i]);
					var url = l.attr('href');
					url = url.replace('edit_game', 'edit_game_mobile');
					l.attr('href', url);
				}
			}
		}
		return this;
	};

	this.InitComponentHandle = function(){
		window.onscroll = self.ScrollListener;

		$('#id_btn_lv-1').on('click', self.OnChangeLevel);
		$('#id_btn_lv-2').on('click', self.OnChangeLevel);
		$('#id_btn_lv-3').on('click', self.OnChangeLevel);
		$('#id_btn_lv-4').on('click', self.OnChangeLevel);
		$('#id_btn_lv-5').on('click', self.OnChangeLevel);
		$('#id_btn_lv-6').on('click', self.OnChangeLevel);
		$('#id_btn_lv-7').on('click', self.OnChangeLevel);
		$('#id_btn_lv-all').on('click', self.OnChangeLevel);
	};

	this.OnChangeLevel = function(){
		var level_str = this.id.split('-')[1];
		if(level_str == 'all'){
			self._level_mask = 0;
		}else{
			var level = parseInt(level_str);
			self._level_mask = (0x01 << (level-1));
		}

		$('#id_btn_lv-1').removeClass('badge-primary');
		$('#id_btn_lv-2').removeClass('badge-primary');
		$('#id_btn_lv-3').removeClass('badge-primary');
		$('#id_btn_lv-4').removeClass('badge-primary');
		$('#id_btn_lv-5').removeClass('badge-primary');
		$('#id_btn_lv-6').removeClass('badge-primary');
		$('#id_btn_lv-7').removeClass('badge-primary');
		$('#id_btn_lv-all').removeClass('badge-primary');

		$(this).addClass('badge-primary');

		{
			//LoadNextPage가 +1을 하기 때문에
			//1페이지를 불러오려면 0으로 설정해야 함.
			self._page = 0;
			$('#id_game_list').empty();
			self.LoadNextPage();
		}
	}

	this.ScrollListener = function(ev){
		var h = Math.ceil(window.innerHeight + window.scrollY);
		// console.log(document.body.offsetHeight + ' ' + h);
		if (h >= document.body.offsetHeight) {
			console.log('bottom');
			if(self._loading_more == false){
				console.log('loading more');
				self._loading_more = true;
				self.LoadNextPage();
			}
		}
	};

	this.LoadNextPage = function(){
		var data = {
			page: self._page+1,
			list_type: self._list_type,
			artist: self._artist,
			level_mask: self._level_mask
		};
		console.log('page ' + data.page);
		console.log('list type ' + data.list_type);
		$.ajax({
			url: '/beat_api/get_list',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DisplayGameList(res.list);
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplayGameList = function(list){
		console.log('more ' + list.length);
		var ele_list = $('#id_game_list');

		if(list.length == 0){
			return;
		}

		for(var i=0 ; i<list.length ; i++){
			var game = list[i];

			var h = '';
			h += '<div class="row" style="border-top: 1px solid #555;">';
			h += '	<div class="col-3 text-center" style="padding: 3px;">';
			h += '		<div>Level ' + game.level + '</div>';
			h += '		<div>';
			h += '				<image style="width:100%; height:auto" src="https://img.youtube.com/vi/' + game.video_id + '/0.jpg"></image>';
			if(game.score > 0){
				h += '			<image style="width:50%; height:40%; position: absolute; left: 0;" src="/img/check.png"></image>';
			}
			h += '		</div>';
			h += '	</div>';
			h += '	<div class="col-9 " style="padding:5px">';
			h += '		<div class="container-fluid">';
			h += '			<div class="row">';
			h += '				<div class="col-12 " style="padding: 0px;">';
			h += '					<div width="100%">';
			h += 								game.title;
			h += '					</div>';
			h += '					<div>';
			h += 							game.artist;
			h += '					</div>';
			h += '				</div>';
			h += '				<div class="col-12 text-right" style="padding: 5px;">';
			h += '					<button class="btn btn-sm btn-light" style="width: 80px;" type="button" onclick="GoToPlayer(' + game.game_id + ')">Play</button>';
			h += '				</div>';
			h += '			</div>';
			h += '		</div>';
			h += '	</div>';
			h += '</div>';

			ele_list.append($(h));
		}

		self._page++;
		self._loading_more = false;
	};
}