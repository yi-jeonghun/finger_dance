function ThreeRenderer(){
	var m = this;
	m.scene = null;
	m.camera = null;
	m.renderer = null;
	m.cube = null;

	m.Init = function(){
		// m.InitScene();
		// m.Start();
		return this;
	};

	m.InitScene = function(ddr_player_height){
		console.log('InitScene ' );
		var ele_3d_canvas = $('#3d_canvas');

		var width = ele_3d_canvas.innerWidth();
		var height = ddr_player_height;
		height = height - 5;
		var ratio = width / height;
		// console.log('width ' + width);
		// console.log('height ' + height);
		// console.log('ratio ' + ratio);

		m.scene = new THREE.Scene();
		m.camera = new THREE.PerspectiveCamera( 75, ratio, 0.1, 1000 );
		{
			m.camera.position.z = 2.3;
			m.camera.position.y = 3;
			m.camera.lookAt(0, 0, -4);
		}
		{
			// m.camera.position.z = 2.3;
			// m.camera.position.y = 3;
			// m.camera.lookAt(0, 0, 0);
		}

		m.renderer = new THREE.WebGLRenderer();
		m.renderer.setSize(width, height);
		ele_3d_canvas.append(m.renderer.domElement);
	};

	m.AddObject = function(obj){
		m.scene.add(obj);
	};

	m.RemoveObject = function(obj){
		m.scene.remove(obj);
	};

	m.ClearScene = function(){
		while (m.scene.children.length)
		{
			m.scene.remove(m.scene.children[0]);
		}
	};

	m.Start = function(){
		m.Update();
	};

	m.Update = function () {
		requestAnimationFrame( m.Update );
		m.renderer.render( m.scene, m.camera );
	};
}
