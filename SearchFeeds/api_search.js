// +===============================================================+
// ---------------------- BLOG UNITS PRINTER -----------------------
// +===============================================================+
class UnitEvent{
	constructor(object = {}){
		this.trigger = object.trigger ? object.trigger : 'click';
		this.handler = object.handler ? object.handler : (e)=>{console.log(e)};
	}
}
class UnitEvents{
	constructor(object = {}){
		// target should be class or id or query selector
		this.selector = object.selector ? object.selector : '';
		this.events = object.events ? object.events : [];
	}
	execute(elements){
		// expect a nodelist
		for(let element of elements)
			for(let event of this.events)
				element.addEventListener(event.trigger,event.handler);
	}
	executeSelf(element){
		for(let event of this.events)
				element.addEventListener(event.trigger,event.handler);
	}
}
class UnitElements{
	constructor(object = {}){
		this.selector = object.selector ? object.selector : '';
		this.elements = object.elements ? object.elements : [];
	}
	execute(elements = []){
		// expect a nodelist
		for(let element of elements)
			for(let subelement of this.elements)
				element.appendChild(subelement);
	}
	executeSelf(element){
		for(let subelement of this.elements)
			element.appendChild(subelement);
	}
}

// +===============================================================+
// --------------------- BLOG UNITS INSTANCE -----------------------
// +===============================================================+


// +===============================================================+
// ---------------------- BLOG SEARCH ENTITY -----------------------
// +===============================================================+
class BlogPostEntity{
	/*
	author    : [{…}]
	content   : {type: 'html', $t: '<p>&nbsp;<span style="background-color: white; fon…, ut interdum velit lobortis eu.</span>&nbsp;</p>'}
	id        : {$t: 'tag:blogger.com,1999:blog-5950330201730594593.post-5916909838795192142'}
	link      : (5) [{…}, {…}, {…}, {…}, {…}]
	published : {$t: '2024-06-27T21:32:00.002-07:00'}
	thr$total : {$t: '0'} 
	title     : {type: 'text', $t: 'Testing Artikel 231456'}
	updated   : {$t: '2024-06-27T21:32:54.257-07:00'}
	*/
	constructor(entry){
		this.authors      = this.buildAuthors(entry.author);  
		this.title        = entry.title.$t;
		this.content      = entry.content.$t;
		this.content_type = entry.content.type;
		this.published    = entry.published.$t;
		this.updated 	  = entry.updated.$t;	
		this.links        = entry.link;

		this.buildElements();

		this.embeds = ['published','content','updated','link','title'];
		this.unit_elements = [
			new UnitElements({
				selector : '',
				elements :	this.elements.getElementsByTagName('p'),
			})
		];
	}
	buildAuthors(authors){
		let cont = [];
		for(let author of authors)
			cont.push( new BlogAuthorEntity(author) );		
		return cont;
	}
	buildElements(){
		this.elements = new DOMParser().parseFromString(this.content, 'text/html').body;
	}
}
class BlogAuthorEntity{
	/*
	email    : {$t: 'noreply@blogger.com'}
	gd$image : {rel: 'http://schemas.google.com/g/2005#thumbnail', width: '32', height: '17', src: '//blogger.googleusercontent.com/img/b/R29vZ2xl/AVv…u8TH_TkhcmSEWC5uR73LQZbpVCazJ/s220/cs-snedel.webp'}
	name     : {$t: 'Gilang Ramadhan'}
	uri      : {$t: 'http://www.blogger.com/profile/07000369991075541029'}
	*/
	constructor(author_entry){
		this.email = author_entry.email.$t;
		this.image = author_entry.gd$image;
		this.name  = author_entry.name.$t;
		this.uri   = author_entry.uri.$t;

		this.embeds = [
			'email',
			'image',
			'name',
			'uri',
		]
	}
}


// +===============================================================+
// --------------------- BLOG SEARCH PRINTER -----------------------
// +===============================================================+
class Printer{
	constructor(object = {}){
		this.container = object.container ? object.container : document.getElementById('BSearch-container');
		this.template  = object.template ? object.template : `<div></div>`;
		this.unit_events = object.unit_events ? object.unit_events : [];
	}

	// +----------- BUILDING FEATURE ------------+
	build(entity){
		// implement your print method here
		let raw      = this.buildTemplate(entity);
		let element  = this.buildElement(raw,entity)
		let finished = this.buildAdditional(element,entity);
		return finished;
	}
	buildTemplate(entity){
		let tmp = this.template;
		tmp = this.addEmbeds(tmp,entity);
		return tmp;
	}
	buildElement(raw = this.buildTemplate()){
		return new DOMParser().parseFromString(raw, 'text/html').body.firstElementChild;
	}
	buildAdditional(element,entity){
		element = this.addEmbedsElements(element,entity);
		element = this.addEvents(element,entity);
		return element;
	}

	// +----------- FINISHING FEATURE ------------+
	print(element,container = this.container){
		console.log(element,container);
		container.appendChild(element);
	}

	// +----------- ADITIONAL FEATURE ------------+
	addEmbeds(raw = this.template, entity){
		// this method replace {{keys}}
		for(let key of entity.embeds){
			raw = raw.replaceAll('{{'+key+'}}',entity[key]);
		}
		return raw;
	}
	addEmbedsElements(element,entity){
		// this method target an element that exist in the entity.embeds_element
		// that list all the elements, that will be get from the entity.
		// elements and put it in the targeted element argument.
		for(let unit of entity.unit_elements){
			if(unit.selector == ''){
				unit.executeSelf(element);
			} else {
				let queries = element.querySelectorAll(unit.selector);
				unit.execute(queries);			
			}
		}
		return element;
	}
	addEvents(element){
		// this method print the targeted event to the element
		for(let unit of this.unit_events){
			console.log(unit);
			if(unit.selector == ''){
				unit.executeSelf(element);
			} else {
				let queries = element.querySelectorAll(unit.selector);			
				unit.execute(queries);	
			}
		}
		return element;
	}
}
class BlogPostPrinter extends Printer{
	constructor(object = {}){
		super(object);
		this.template = object.template ? object.template : `
			<article>
				{{title}}
			</article>
		`;
		this.unit_events = object.unit_events ? object.unit_events : [
			new UnitEvents({
				selector:'',
				events:[ new UnitEvent() ],
			}),
		];
	}
}

// +===============================================================+
// --------------------- BLOG SEARCH QUERIES -----------------------
// +===============================================================+
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
		for( let key in object ) {
			this.setQueries( key, object[key] );
		}
	}	
	buildByUrl(path = window.location.search){
		const params = new URLSearchParams(window.location.search);
		for ( let key in this.queries ) {
			if( params.get(key) != undefined ) 
				this.setQueries( key, params.get(key) );
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
	validation(key,value) {
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
	buildByFeed(response = {}){
		if(response.feed == undefined) throw Error("response feeds property shouldn't empty");

		// we expect an response.feed object
		let feed = response.feed;

		// we start consuming this object proerty		
		// openSearch$itemsPerPage : {$t: '2'}
		// openSearch$startIndex   : {$t: '1 }
		// openSearch$totalResults : {$t: '4'}
		let totalResults = feed.openSearch$totalResults;
		let startIndex   = feed.openSearch$startIndex;
		let itemsPerPage = feed.openSearch$itemsPerPage;

		// Formula 
		// the goal is to calculate itemsPerPage / startIndex / Total Result -> CurrentPage / TotalPage
		// TotalPage         = total_result / items_perpage
		// CurrentPage_Index = TotalPage + 1 
		this.setQueries('total_page', totalResults / itemsPerPage);
		this.setQueries('total_results', totalResults);
	}
}
class BlogSearchQueries extends Queries { 
	// method overloading 
	init(object = {}){
		this.queries = {
			title : '',
			alt   : 'json',
			...object
		}
	}
	initRules(object = {}){
		this.rules = {
			title : {
				fill:true,
				fillApi:true,
			},
			alt : {
				fill:false,
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


// +===============================================================+
// ------------------------ BLOG SEARCH ----------------------------
// +===============================================================+
class BlogSearch{
	constructor( object = {} ){
		this.BlogSearchInfo    = new BlogSearchInfo( object.location );
		this.BlogSearchApi     = new BlogSearchApi( this.BlogSearchInfo );
		this.BlogSearchQueries = new BlogSearchQueries( object.search_settings );

		// Entity or Filtered Element
		this.BlogPosts      = [];
		this.BlogPagination = new BlogPagination( object.pagination_settings );

		// container for printer
		this.posts_container      = object.posts_container ? object.posts_container : document.getElementById('BSearch-posts_container');
		this.pagination_container = object.pagination_container ? object.pagination_container : document.getElementById('BSearch-pagination_container');

		// printer instance
		this.posts_printer = object.posts_printer ? object.posts_printer : new BlogPostPrinter();
		this.pagination_printer = object.pagination_printer ? object.pagination_printer : undefined;

		// build the each queries from the current window params
		this.BlogSearchQueries.buildByUrl();
		this.BlogPagination.buildByUrl();
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
		console.log(this.BlogPosts);

		// print entity to the dom
		this.printEntity();
	}

	buildApiQueries(path = '?'){
		path = this.BlogSearchQueries.fillApi(path);
		path = this.BlogPagination.fillApi(path);
		return path;	
	}
	buildPostEntity(response){
		if(response.feed.entry == undefined) return;
		for(let post of response.feed.entry){
			this.BlogPosts.push(new BlogPostEntity(post))
		}	
	}
	buildPaginationEntity(response){
		this.BlogPagination.buildByFeed(response);
	}

	printEntity(){
		for(let post of this.BlogPosts){
			let element = this.posts_printer.build(post);
			this.posts_printer.print(element);
		}	
	}
	resetEntity(){
		this.BlogPosts = [];
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

// +===============================================================+
// ------------------------ BLOG RUNTIME ---------------------------
// +===============================================================+
let Main = new BlogSearch();
Main.run();
