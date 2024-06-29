
class BlogPostEntity{
  
  constructor(entry){
    this.author = entry.author;  
    this.content      = entry.content.$t;
    this.contnet_type = entry.content.type;
  }

  

}


class BlogSearch{
	constructor(){
		this.BlogSearchInfo = new BlogSearchInfo();
		this.BlogSearchApi  = new BlogSearchApi( this.BlogSearchInfo );
	}
	async run(){
    // call response json
		let response = await this.BlogSearchApi.call();

    // get the data for pagination and posts
	}
	apiUrl(){
		return this.BlogSearchApi.url;
	}
}
class BlogSearchInfo{
	// This class is entity to the information that the
	// blogger has, like query and etc
	constructor(location = window.location){
		this.host     = location.host;
		this.hostname = location.hostname;
		this.origin   = location.origin;
		this.pathname = location.pathname;
		this.label    = undefined;
		this.queries = {
			'current-page' : 1,      
		}; 
		this.reset();
		this.build();
	}  

	// build queries
	validator( key,value ) {
		if(key == 'current-page' && value <= 0) return false;  
		return true;
	}
	build(){
		this.buildQueries();
		this.buildLabel();
	}
	buildQueries(path = window.location.search){
		const params = new URLSearchParams(window.location.search)
		for( let key in Object.fromEntries(params.entries()) ){
			if ( !this.validator(key,this.queries[key]) ) continue;
			if ( params.getAll(key).length > 1 ) this.queries[key] = params.getAll(key);          
			else                                 this.queries[key] = params.get(key);                
		}
	}
	buildLabel(path = window.location.pathname){
		let paths = path.split('/');
		// url / "/search/label/[label-name]"
		if(paths[1] == 'search' && paths[2] == 'label')
			this.label = paths[3];
	}

	// getter setter
	get(key){
		return this[key];
	}
	set(key,value){
		this[key] = value;    
	}  
	reset(){
		this.queries = {
			'current-page' : 1,      
		}; 
	}
}
class BlogSearchApi{
	constructor(blog_info){
		this.url      = '';
    this.queries  = '';
    this.path     = '';
		this.target       = '/feeds/posts/default';
		this.property = {      
			'start-index' : 1,
			'max-result' : 6,
			'alt' : 'json',
		}
		this.build(blog_info);
	} 
	async call(url = this.url){
		const response = await fetch(url, {
			method: "GET",       
			mode: "cors",       
			cache: "no-cache",       
			credentials: "same-origin", 
			headers: {
				"Content-Type": "application/json",
			},
			redirect: "follow", 
			referrerPolicy: "no-referrer", 
		});
		return response.json();
	}
	build( blog_info ) {
		// /1|l0v3|u|354\ 
		if(blog_info instanceof BlogSearchInfo == false) 
			throw Error('Blog info should be instance of BlogSearchInfo');

		// api queries
		this.queries = this.buildQueries(blog_info);
    this.path    = '';
      
		// determine if there's a label search or not
		if(blog_info.label != undefined) this.path = '/-/' + blog_info.label;

		// return combine with the api_path
		this.url = blog_info.origin + this.target + this.path + this.queries;
	}
	buildQueries( blog_info, path = '?' ){    
		// setup pagination propety
		let queries = this.property;
		queries['start-index'] += ( this.property["max-result"] * ( blog_info.queries['current-page'] - 1 ) );
      
		for( let key in queries ){
			if( path.length != 1 ) path += '&';
			if( Array.isArray(queries[key]) ) {
				for( let value of queries[key] ) {
					if( path.length != 1 ) path += '&';
					path += key + '=' + value;          
				}
			} else {
				path += key + '=' + queries[key];          
			}
		}
		return path;
	}
}

