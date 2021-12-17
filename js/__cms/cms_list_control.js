$('document').ready(function(){
	window._cms_list_control = new CMSListControl().Init();
});

function GoToPage(page){
	console.log('page ' + page);
	_cms_list_control.LoadPage(page);
}

function CMSListControl(){
	var self = this;
	this._cur_page = 1;
	this._game_type = 0;
	this._list_type = 'p';
	this._artist = '';
	this._public_flag = -1;
	this._level_mask = 0;

	this.Init = function(){
		self.InitComponentHandle();
		self.UpdateButton();
		self.UpdatePublic();
		self.LoadPage(1);
		return this;
	};

	this.InitComponentHandle = function(){
		$('#id_btn_ddr').on('click', self.OnBtnDDR);
		$('#id_btn_dash').on('click', self.OnBtnDash);
		$('#id_btn_popular').on('click', self.OnBtnPopular);
		$('#id_btn_recent').on('click', self.OnBtnRecent);
		$('#id_btn_public').on('click', self.OnBtnPublic);
		$('#id_btn_private').on('click', self.OnBtnPrivate);
		$('#id_btn_all').on('click', self.OnBtnAll);

		$('#id_chk_lv-1').on('click', self.OnLevelChange);
		$('#id_chk_lv-2').on('click', self.OnLevelChange);
		$('#id_chk_lv-3').on('click', self.OnLevelChange);
		$('#id_chk_lv-4').on('click', self.OnLevelChange);
		$('#id_chk_lv-5').on('click', self.OnLevelChange);
		$('#id_chk_lv-6').on('click', self.OnLevelChange);
		$('#id_chk_lv-7').on('click', self.OnLevelChange);
		$('#id_chk_lv-all').on('click', self.OnLevelChange);
		$('#id_btn_pick_artist').on('click', self.OnBtnPickArtist);
	};

	this.OnBtnPickArtist = function(){
		console.log('OnBtnPickArtist ');
		$.ajax({
			url: '/beat_api/get_artist_list',
			type: 'GET',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DisplayArtistList(res.artist_list);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.DisplayArtistList = function(artist_list){
		var ele = $('#id_div_artist_list');
		ele.empty();
		var h = '';

		h += '<div class="container-fluid">';
		h += '	<div class="row">';
		for(var i=0 ; i<artist_list.length ; i++){
			h += '<div class="col-3" style="cursor:pointer" ';
			h += '	onClick="_cms_list_control.ChooseArtist(\'' + artist_list[i].artist + '\')">';
			h += 		artist_list[i].artist;
			h += '[' + artist_list[i].game_count + ']';
			h += '</div>';
		}
		h += '	</div>';
		h += '</div>';
		ele.html(h);
	};

	this.ChooseArtist = function(artist){
		console.log('artist ' + artist);
		$('#id_div_artist_choosed').html(artist);
		$('#exampleModal').modal('toggle');
		self._artist = artist;
		self._list_type = 'artist';
		self.LoadPage(1);
	};

	this.OnLevelChange = function(){
		var level = this.id.split('-')[1];
		if(level == 'all'){
			self._level_mask = 0;
		}else{
			var lv = parseInt(level);
			lv--;
			self._level_mask = (0x01 << lv);
		}

		{
			$('#id_chk_lv-all').removeClass('badge-primary');
			for(var i=1 ; i<=7 ; i++){
				$('#id_chk_lv-'+i).removeClass('badge-primary');
			}
			$(this).addClass('badge-primary');
		}

		// console.log('lv mask ' + self._level_mask);
		self.LoadPage(1);
	};

	this.OnBtnPublic = function(){
		self._public_flag = 1;
		self.UpdatePublic();
		self.LoadPage(1);
	};

	this.OnBtnPrivate = function(){
		self._public_flag = 0;
		self.UpdatePublic();
		self.LoadPage(1);
	};

	this.OnBtnAll = function(){
		self._public_flag = -1;
		self.UpdatePublic();
		self.LoadPage(1);
	};

	this.OnBtnDDR = function(){
		self._game_type = 0;
		self.UpdateButton();
		self.LoadPage(1);
	};

	this.OnBtnDash = function(){
		self._game_type = 1;
		self.UpdateButton();
		self.LoadPage(1);
	};

	this.OnBtnPopular = function(){
		console.log('OnBtnPopular ' );
		self._list_type = 'p';
		self.UpdateButton();
		self.LoadPage(1);
	};

	this.OnBtnRecent = function(){
		console.log('OnBtnRecent ' );
		self._list_type = 'r';
		self.UpdateButton();
		self.LoadPage(1);
	};

	this.UpdateButton = function(){
		$('#id_game_type_ddr').prop('checked', false);
		$('#id_game_type_dash').prop('checked', false);
		$('#id_list_type_popular').prop('checked', false);
		$('#id_list_type_recent').prop('checked', false);

		if(self._game_type == 0){
			$('#id_game_type_ddr').prop('checked', true);
		}else if(self._game_type == 1){
			$('#id_game_type_dash').prop('checked', true);
		}

		if(self._list_type == 'p'){
			$('#id_list_type_popular').prop('checked', true);
		}else if(self._list_type == 'r'){
			$('#id_list_type_recent').prop('checked', true);
		}
	};

	this.UpdatePublic = function(){
		$('#id_radio_public').prop('checked', false);
		$('#id_radio_private').prop('checked', false);
		$('#id_radio_all').prop('checked', false);
		if(self._public_flag == 1){
			$('#id_radio_public').prop('checked', true);
		}else if(self._public_flag == 0){
			$('#id_radio_private').prop('checked', true);
		}else if(self._public_flag == -1){
			$('#id_radio_all').prop('checked', true);
		}
	};

	this.LoadPage = function(page){
		self._cur_page = page;
		self.GetList();
	};

	this.GetList = function(){
		var data = {
			game_type: self._game_type,
			page: self._cur_page,
			list_type: self._list_type,
			artist: self._artist,
			public_flag: self._public_flag,
			level_mask: self._level_mask
		};

		console.log('self._public_flag ' + self._public_flag);

		$.ajax({
			url: '/beat_api/get_list_cms',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DisplayList(res.list);
				}else{
					alert(res.err);
				}
			}
		});

		var data1 = {
			game_type: self._game_type,
			list_type: self._list_type,
			public_flag: self._public_flag,
			artist: self._artist
		};
		$.ajax({
			url: '/beat_api/get_total_cms',
			type: 'POST',
			data: JSON.stringify(data1),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					$('#id_text_total').text(res.total);
					self.DisplayPages(res.total);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.DisplayList = function(list){
		var ele_list = $('#id_div_list');
		ele_list.empty();
		for(var i=0 ; i<list.length ; i++){
			var g = list[i];

			var game_type_str = '';
			if(g.game_type == GAME_TYPE.DDR){
				game_type_str = 'DDR';
			}else if(g.game_type == GAME_TYPE.Dash){
				game_type_str = 'Dash';
			}

			var h = '';
			h += '<tr>';
			h += '	<td>' + g.game_id + '</td>';
			h += '	<td>' + game_type_str + '</td>';
			h += '	<td>';
			h += '		<image style="width:50; height:50" src="https://img.youtube.com/vi/' + g.video_id + '/0.jpg"></image>';
			h += '		' + g.title;
			h += '	</td>';
			h += '	<td>' + g.artist + '</td>';
			h += '	<td>';
			h += '		<a target="_blank" href="/play_game.vu?id='+g.game_id+'&game_type='+g.game_type+'">[Play]</a>';
			h += '		<a target="_blank" href="/edit_game.vu?id='+g.game_id+'&game_type='+g.game_type+'">[Edit]</a>';
			h += '	</td>';
			h += '	<td>' + g.level + '</td>';
			h += '	<td>' + g.play_count + '</td>';
			h += '	<td>' + g.like_count + '</td>';
			h += '	<td>' + g.name + '</td>';
			h += '	<td>' + g.timestamp_created + '</td>';
			h += '</tr>';

			ele_list.append($(h));
		}
	};

	this.DisplayPages = function(total_cnt){
		var ele_page = $('#id_div_pages');
		ele_page.empty();

		var count_per_page = 12;
		var page_count_to_show = 10;
		var total_pages = Math.ceil(total_cnt / count_per_page);
		console.log('total_pages ' + total_pages);
		var start_page = (Math.floor((self._cur_page-1) / page_count_to_show) * page_count_to_show) + 1;
		console.log('start_page ' + start_page);
		var end_page = start_page + (page_count_to_show - 1);
		console.log('end_page ' + end_page);
		if(end_page > total_pages){
			end_page = total_pages;
		}

		var h = '';
		if(start_page > 20){
			h += '<span style="cursor:pointer" onclick="GoToPage(1)"> << </span>';
		}
		if(start_page > 10){
			h += '<span style="cursor:pointer" onclick="GoToPage(' + (start_page-1) + ')"> < </span>';
		}

		for(var i=start_page ; i<=end_page ; i++){
			if(self._cur_page == i){
				h += '<span>_' + i + '_</span>';
			}else{
				h += '<span style="cursor:pointer" onclick="GoToPage(' + i + ')">[' + i + ']</span>';
			}
		}

		if(end_page < total_pages){
			h += '<span style="cursor:pointer" onclick="GoToPage(' + (end_page+1) + ')"> > </span>';
			h += '<span style="cursor:pointer" onclick="GoToPage(' + total_pages + ')"> >> </span>';
		}

		ele_page.append($(h));
	};
}