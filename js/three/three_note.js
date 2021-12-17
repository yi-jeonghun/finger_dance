function ThreeNote(arrow, offset_ms, speed_pps, base_line){
	var m = this;
	m.cube = null;
	m.speed = 0.2;
	m.to_be_removed = false;
	m.arrow = arrow;
	m.offset_ms = offset_ms;
	m.speed = 5;
	m.base_line = 0;
	m.object_added = false;
	m.passed = false;
	m.offset_init = 0;//최초 시작한 offset
	m.hit_range = 0.9;

	m.Init = function(){

		var color_table = [
			'#619eff',
			'#ffa561',
			'#ffff69',
			'#d0ff69',
			'#69ff6b',
			'#69fffd',
			'#b5c4ff',
			'#e7a6ff',
			'#ffade9'
		];

		var random = Math.floor(Math.random() * color_table.length);
		var color = color_table[random];

		var geometry = new THREE.BoxGeometry(1, 0.5, 1);
		var material = new THREE.MeshBasicMaterial( { color: color } );
		m.cube = new THREE.Mesh( geometry, material );
		switch(m.arrow)
		{
			case ARROW.LEFT:
				m.cube.position.x = -1.5;
				break;
			case ARROW.DOWN:
				m.cube.position.x = -0.5;
				break;
			case ARROW.UP:
				m.cube.position.x = 0.5;
				break;
			case ARROW.RIGHT:
				m.cube.position.x = 1.5;
				break;
		}

		m.offset_init = m.base_line - ((m.offset_ms/1000) * m.speed);
		m.cube.position.z = m.offset_init;

		m.AddObject();
		return this;
	};

	m.GetObject = function(){
		return m.cube;
	};

	m.AddObject = function(){
		if(m.object_added){
			return;
		}

		if(m.cube.position.z < -50){
			return;
		}

		_three_renderer.AddObject(m.cube);
		m.object_added = true;
	};

	m.RemoveObject = function(){
		if(m.object_added == false){
			return;
		}

		if(m.cube.position.z > 1.5){
			_three_renderer.RemoveObject(m.cube);
			m.passed = true;
		}
	};

	m.Update = function(ms){
		//FIXME music 시간 경과 고려해야 함.
		m.cube.position.z = m.offset_init + ((ms/1000)*m.speed);

		m.AddObject();
		m.RemoveObject();
	};

	this.Hit = function(arrow){
		var res = {
			hit:false,
			score:0,
			text:''
		};

		if(m.arrow != arrow){
			// console.log('oops!');
			return res;
		}

		var diff = Math.abs(m.base_line - m.cube.position.z);
		// console.log('diff ' + diff);

		if(diff < m.hit_range){
			// console.log('hit ' + m.arrow);

			if(0 <= diff && diff < 0.3){//perfect
				// console.log('perfect');
				res.score = 10;
				res.text = 'Perfect';
			}else if(0.3 <= diff && diff < 0.4){//excelent
				// console.log('excellent');
				res.score = 9;
				res.text = 'Excellent';
			}else if(0.4 <= diff & diff < 0.5){//very good
				// console.log('very good');
				res.score = 8;
				res.text = 'Very Good';
			}else if(0.5 <= diff & diff < 0.6){//good
				// console.log('good');
				res.score = 7;
				res.text = 'Good';
			}else if(0.6 <= diff & diff <= 0.9){//not bad
				// console.log('not bad');
				res.score = 6;
				res.text = 'Not Bad';
			}
			
			m.is_hit = true;
			m.passed = true;
			res.hit = true;
			_three_renderer.RemoveObject(m.cube);
		}else{
			res.score = -10;
			res.text = 'Miss';
		}
		return res;
	};
};