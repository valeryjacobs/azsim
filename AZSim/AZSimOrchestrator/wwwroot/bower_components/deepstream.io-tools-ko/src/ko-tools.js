var KoTools = function( ko ) {
	this.ko = ko;
};

KoTools.prototype.getObservable = function( record, path ) {
	return getObservable( this.ko, record, path );
};

KoTools.prototype.getViewList = function( viewmodel, list ) {
	return new ViewList( this.ko, viewmodel, list );
};

if (typeof exports === 'object') {
	module.exports = KoTools;
} else if (typeof define === 'function' && define.amd) {
	define(function(){
		return KoTools;
	});
} else {
	window.KoTools = KoTools;
}