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
		this.content      = entry.content.$t;
		this.content_type = entry.content.type;
		this.published    = entry.published.$t;
		this.updated 	  = entry.updated.$t;	
		this.links        = entry.link;
	}
	buildAuthors(authors){
		let cont = [];
		for(let author of authors)
			cont.push( new BlogAuthorEntity(author) );		
		return cont;
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
	}
}
