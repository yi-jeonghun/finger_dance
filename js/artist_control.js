$('document').ready(function(){
	new ArtistControl().Init();
});

function ArtistControl(){
	var self = this;

	this.Init = function(){
		console.log('artist control init ');
		self.InitComponentHandle();
		return this;
	};

	this.InitComponentHandle = function(){
	};
}