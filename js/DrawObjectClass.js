class DrawObject {
	_ctx;

	constructor(context){
		this._ctx = context;
	}

	Update(){

	}

	NeedDelete(){
		return false;
	}

	IsVisible(){
		return true;
	}
}

