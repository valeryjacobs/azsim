(function(){var getObservable = function( ko, record, path ) {
		
	var downStreamFormatter = null, 
		upStreamFormatter = null,
		observable = ko.observable( record.get( path ) ),
		onRecordChange,
		subscription;

	onRecordChange = function( value ) {
		if( downStreamFormatter === null ) {
			observable( value );
		} else {
			observable( downStreamFormatter( value ) );
		}
	};
	
	record.subscribe( path, onRecordChange );
	
	subscription = observable.subscribe(function( value ){
		if( upStreamFormatter === null ) {
			record.set( path, value );
		} else {
			record.set( path, upStreamFormatter( value ) );
		}
	});

	observable.destroyBindings = function() {
		record.unsubscribe( path, onRecordChange );
		subscription.dispose();
		delete observable.destroyBindings;
		delete observable.formatDownStream;
		delete observable.formatUpStream;
	};

	observable.setDownstreamFormatter = function( format ) {
		downStreamFormatter = format;
	};

	observable.setUpstreamFormatter = function( format ) {
		upStreamFormatter = format;
	};

	return observable;
};
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
/**
 * This class creates a ko.observableArray that's bound
 * to a deepstream list and keeps both in sync.
 *
 * @param {Object} viewModel
 * @param {deepstream list} list
 *
 * @constructor
 */
var ViewList = function( ko, viewModel, list ) {
	this._list = list;
	this._list.subscribe( this.updateEntries.bind( this ) );
	this._standardTemplate = null;
	this._emptyTemplate = null;
	this._isEmpty = true;
	this._viewModel = viewModel;
	this._entries = {};
	this.entries = ko.observableArray([]);
};

/**
 * Allows to specify the templates that will be used
 * for every entry in the list and the template that
 * will be displayed if the list is empty
 *
 * @param {String} standard html string
 * @param {String} empty    html string
 *
 * @public
 * @returns {void}
 */
ViewList.prototype.setTemplates = function( standard, empty ) {
	this._standardTemplate = standard;
	this._emptyTemplate = empty;
};

/**
 * Specifies a ViewModel that will be bound to the empty
 * template if the list doesn't have entries
 *
 * @param {Object} emptyViewModel
 */
ViewList.prototype.setEmptyViewModel = function( emptyViewModel ) {
	this._emptyViewModel = emptyViewModel;
};

/**
 * This method is meant to be bound to the view
 * using
 *
 * @returns {[type]} [description]
 */
ViewList.prototype.getTemplate = function() {
	if( this._isEmpty ===  true ) {
		return this._emptyTemplate;
	} else {
		return this._standardTemplate;
	}
};

ViewList.prototype.getList = function() {
	return this._list;
};

ViewList.prototype.empty = function() {
	this._entries = {};
	this.entries([]);
};

ViewList.prototype.callOnEntries = function( methodName, params ) {
	var entries = this.entries();

	for( var i = 0; i < entries.length; i++ )
	{
		/**
		* entries[ i ] === this prevents loops if the viewlist is empty and
		* is used as a viewmodel for the empty template
		*/
		if( entries[ i ] === this ) continue;
		
		if( typeof entries[ i ][ methodName ] === "function" )
		{
			entries[ i ][ methodName ].apply( entries[ i ], params || [] );
		}
		else
		{
			throw "Viewlist entry doesn't have method " + methodName;
		}
	}
};

ViewList.prototype.destroy = function()
{
	if( this._list )
	{
		this._list.unsubscribe( this.updateEntries, this );
		this._list.discard();
		this._list = null;
	}
	
	this.entries([]);
	delete this._entries;
};

ViewList.prototype.getSubjects = function()
{
	return Object.keys( this._entries );
};

ViewList.prototype.updateEntries = function( entries )
{
	var viewModels = [], i, entriesLength = entries.length;

	for( i = 0; i !== entriesLength; i++ )
	{
		if( !this._entries[ entries[ i ] ] )
		{
			this._entries[ entries[ i ] ] = new this._viewModel( entries[ i ], this );
		}

		viewModels.push( this._entries[ entries[ i ] ] );
	}

	if( viewModels.length === 0 && this._emptyTemplate )
	{
		viewModels.push( this._emptyViewModel || this );
		this._isEmpty = true;
	}
	else
	{
		this._isEmpty = false;
	}

	this.entries( viewModels );
};})();