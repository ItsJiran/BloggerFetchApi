class BlogSearch{
	constructor( object = {} ){
		this.BlogSearchInfo    = new BlogSearchInfo( object );
		this.BlogSearchApi     = new BlogSearchApi( this.BlogSearchInfo );
		this.BlogSearchQueries = new BlogSearchQueries( object.search_settings );

		// Entity or Filtered Element
		this.BlogPosts      = [];
		this.BlogPagination = new BlogPagination( object.pagination_settings );

		// container for printer
		this.posts_container      = object.posts_container ? object.posts_container : document.getElementById('BSearch-posts_container');
		this.pagination_container = object.pagination_container ? object.pagination_container : document.getElementById('BSearch-pagination_container');

		// build the each queries from the current window params
		this.BlogSearchQueries.build();
		this.BlogPagination.build();
	}

	async run(){
		// build the targeted api_url
		this.BlogSearchApi.build( this.BlogSearchInfo, this.buildApiQueries() );
		console.log(this.BlogSearchApi.url);

		// call response json
		let response = await this.BlogSearchApi.call();
		console.log(response);
		
		if(response.feed == undefined){
			console.error("response shouldn't be empty");
			return;
		}

		// reset 
		this.resetEntity();	

		// handle response feed;
		this.buildPostEntity(response);
		this.buildPaginationEntity(response);

		// print entity to the dom
		this.printEntity();
	}

	buildApiQueries(path = '?'){
		path = this.BlogSearchQueries.fillApi(path);
		path = this.BlogPagination.fillApi(path);
		return path;	
	}
	buildPostEntity(response){
		for(let posts of response.feeds.entry){
			
		}	
	}
	buildPaginationEntity(response){
		this.BlogPagination.buildByFeeds(response);
	}

	resetEntity(){
		this.BlogPosts  = [];
	}
}
class BlogSearchInfo{
	// This class is entity to the information that the blogger has, like query and etc
	constructor(location = window.location){
		this.host     = location.host;
		this.hostname = location.hostname;
		this.origin   = location.origin;
		this.pathname = location.pathname;
		this.label    = undefined;
		this.buildLabel();
	}  
	// build queries
	buildLabel(path = window.location.pathname){
		let paths = path.split('/');
		// url / "/search/label/[label-name]"
		if(paths[1] == 'search' && paths[2] == 'label')
			this.label = paths[3];
	}
}
class BlogSearchApi{
	constructor(blog_info){
		this.url      = '';
		this.path     = '';
		this.target   = '/feeds/posts/default';
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
	build( blog_info, api_queries = '?' ) {
		if(blog_info instanceof BlogSearchInfo == false) 
			throw Error('Blog info should be instance of BlogSearchInfo');

		// determine if there's a label search or not
		if(blog_info.label != undefined) this.path = '/-/' + blog_info.label;

		// return combine with the api_path
		this.url = blog_info.origin + this.target + this.path + api_queries;
	}
}
