class Queries {
	constructor(object = {}){
		this.init(object.queries);
		this.initRules(object.rules);
	}

	// this method is responsible for building the object proerties
	// the init method can be used either to reset the current queries
	// or to initalize the object
	init(object = {}){
		this.queries = {
			...object,
		};
	}
	initRules(object = {}){
		this.rules = {
			...object,
		};
	}
	build(object = {}){
		for( let key in Object.fromEntries(object.entries()) ) {
			this.setQueries( key, object[key] );
		}
	}
	buildByUrl(path = window.location.search){
		const params = new URLSearchParams(window.location.search);
		for ( let key in this.queries ) {
			if( params.get(key) != undefined ) 
				this.setQueries( key,params.get(key) );
		}
	}	

	// this method is responsible for building query url
	// it can be used either for api or building for the new pagination
	fillApi(path = '?'){
		for( let key in this.queries ){
			let fill_key = key;

			// skip if shouldn't filled
			if( !this.isFillApi(key) || !this.fillValidation(key,this.queries[key]) )
				continue;
			
			// if converted 
			if( this.isConverted(key) != undefined ) 
				fill_key = this.isConverted(key); 

			// prevent weird url
			if( path.length != 1 ) path += '&';

			// if not array
			if( !Array.isArray(this.queries[key]) ) 
				path += fill_key + '=' + this.middleware(key,this.queries[key]);          

			// if array
			if( Array.isArray(this.queries[key]) ) {
				for( let value of this.queries[key] ) {
					if( path.length != 1 ) path += '&';
					path += fill_key + '=' + this.middleware(key,value);          
				}
			} 
			
		}
		return path;
	}
	isFillApi(key){		
		if( this.rules[key] != undefined ) {			
			if( !this.rules[key].fillApi ) 
				return false;
		}
		return true;
	}
	fill(path = '?'){
		for( let key in this.queries ){
			let fill_key = key;

			// skip if shouldn't filled
			if( !this.isFill( key ) || !this.fillValidation(key,this.queries[key]) ) 
				continue;

			// if converted 
			if( this.isConverted(key) != undefined ) 
				fill_key = this.isConverted(key); 

			// prevent weird url
			if( path.length != 1 ) path += '&';

			// if not array
			if( !Array.isArray(this.queries[key]) ) 
				path += fill_key + '=' + this.middleware(key,this.queries[key]);          

			// if array
			if( Array.isArray(this.queries[key]) ) {
				for( let value of this.queries[key] ) {
					if( path.length != 1 ) path += '&';
					path += fill_key + '=' + this.middleware(key,value);          
				}
			} 			
		}
		return path;
	}
	isFill(key){
		if( this.rules[key] != undefined ) {
			if( !this.rules[key].fill ) 
				return false;
		}
		return true;
	}
	isConverted(key){
		if( this.rules[key] != undefined ) {
			if ( this.rules[key].converted != undefined ) 
				return this.rules[key].converted;
		} 
		return undefined;
	}

	// implement your validation method here
	getQueries(key){
		this.queries[key];
	}
	setQueries(key,value){
		if(this.validation(key,value)) 
			this.queries[key] = value;
	}

	// fill support method
	fillValidation(key,value){
		return true;
	}
	validation( key,value ) {
		return true;
	}
	middleware(key, value){
		return value;
	}
}
class BlogPagination extends Queries { 
	// method overloading 
	init(object = {}){
		this.queries = {
			current_page  : 1,
			start_index   : 1,
			max_results   : 6,
			total_results : -1,
			...object
		}
	}
	initRules(object = {}){
		this.rules = {
			// queries for data pagination
			total_results : {
				fill:false,
				fillApi:false,
			},
			total_page : {
				fill:false,
				fillApi:false,
			},
			// queries for url
			current_page : {
				fill:true,
				fillApi:false,
			},
			// queries for api
			start_index : {
				converted:'start-index',
				fill:false,
				fillApi:true,
			},
			max_results : {
				converted:'max-results',
				fill:false,
				fillApi:true,
			},
			...object
		}
	}

	// middleware
	middleware(key,value){
		if(key == 'start_index')
			value = parseInt(this.queries['start_index']) + ( ( parseInt(this.queries['current_page']) - 1 ) * parseInt(this.queries['max_results']) );
		return value;
	}

	// on blog pagination this method should expect a response object
	// because this class need the data of the total post that provided by the
	// blogger rss feeds.
	buildByFeeds(response = {}){
		if(response.feed) throw Error("response feeds property shouldn't empty");

		// we expect an response.feed object
		let feeds = response.feed;

		// we start consuming this object proerty		
		// openSearch$itemsPerPage : {$t: '2'}
		// openSearch$startIndex   : {$t: '1 }
		// openSearch$totalResults : {$t: '4'}
		let totalResults = feeds.openSearch$totalResults;
		let startIndex   = feeds.openSearch$startIndex;
		let itemsPerPage = feeds.openSearch$itemsPerPage;

		// Formula 
		// the goal is to calculate itemsPerPage / startIndex / Total Result -> CurrentPage / TotalPage
		// TotalPage         = total_result / items_perpage
		// CurrentPage_Index = TotalPage + 1 
		this.setQueries('total_page', totalResults / itemPerPage);
		this.setQueries('total_results', totalResults);
	}
}
class BlogSearchQueries extends Queries { 
	// method overloading 
	init(object = {}){
		this.queries = {
			title : '',
			...object
		}
	}
	initRules(object = {}){
		this.rules = {
			title : {
				fill:true,
				fillApi:true,
			},
			...object
		}
	}

	// validation for fill
	fillValidation(key,value){
		if(key == 'title' && value == '') return false;
		return true;
	}
}
