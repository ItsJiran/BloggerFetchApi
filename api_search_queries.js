class Queries {
	constructor(object){
		init(object.queries);
		initRules(object.rules);
	}

	// this method is responsible for building the object proerties
	// the init method can be used either to reset the current queries
	// or to initalize the object
	init(object = [}){
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
		for( let key in Object.fromEntries(object.entries()) ){
			if ( !this.validation(key,this.queries[key]) ) continue;	
			this.queries[key] = object[key];
		}
	}
	buildByUrl(path = window.location.search){
		const params = new URLSearchParams(window.location.search);
		for ( let key in Object.fromEntries( this.queries ) ) {
			if( params.get(key) != undefined ) 
				this.setQueries( key,params.get(key) );
		}
	}	
	
	// this method is responsible for building query url
	// it can be used either for api or building for the new pagination
	fill( path = '?' ){
		for( let key in queries ){
			let fill_key = key;

			// skip if shouldn't filled
			if( !this.isFill(queries[key] ) continue;

			// if converted 
			if( this.isConverted(key) != undefined ) 
				fill_key = this.isConverted(key); 

			// prevent weird url
			if( path.length != 1 ) path += '&';

			// if not array
			if( !Array.isArray(queries[key]) ) 
				path += fill_key + '=' + queries[key];          

			// if array
			if( Array.isArray(queries[key]) ) {
				for( let value of queries[key] ) {
					if( path.length != 1 ) path += '&';
					path += fill_key + '=' + value;          
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

	// impllement your validation method here
	getQueries(key){
		this.queries[key];
	}
	setQueries(key,value){
		if(this.validation(key,value)) 
			this.queries[key] = value;
	}
	validation( key,value ) {
		return true;
	}
}
class BlogPagination extends Queries { 
	// method overloading 
	init(object = {}){
		this.queries = {
			current_page : 1,
			max_result   : 1,
			...object
		}
	}
	initRules(object = {}){
		this.rules = {
			current_page : {
				fill:false,
			},
			max_result : {
				fill:false,
			},
			...object
		}
	}
	
	// on blog pagination this method should expect a response object
	// because this class need the data of the total post that provided by the
	// blogger rss feeds.
	buildByFeeds(response = {}){
		if(response.feed) throw Error("response feeds property should'nt empty");
		// we expect an response.feed object
	}
}

class BlogSearchQueries extends Queries { 
	// method overloading 
	init(object = {}){
		this.queries = {
			label : '',
			title : '',
			...object
		}
	}
	initRules(object = {}){
		this.rules = {
			current_page : {
				fill:false,
			},
			max_result : {
				fill:false,
			},
			...object
		}
	}
}
