// +===============================================================+
// ---------------------- BLOG SEARCH ENTITY -----------------------
// +===============================================================+
class BlogPaginationEntity {
    constructor(object = {}) {
        this.link = object.link ? object.link : '';
        this.title = object.title ? object.title : '';
        this.embeds = ['link', 'title'];
    }
}
class BlogPostEntity {
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
    constructor(entry) {
        this.title = entry.title.$t;
        this.content = entry.content.$t;
        this.content_type = entry.content.type;
        this.published = entry.published.$t;
        this.updated = entry.updated.$t;
        this.links = entry.link;
        this.link = this.buildLink();
        this.labels = this.buildTerm(entry);
        this.authors = this.buildAuthors(entry.author);
        this.author = this.authors[0];
        this.author_name = this.authors[0].name;
        this.elements = this.buildElements(this.content);
        this.description = this.buildDescription(this.elements);
        this.img_src = this.buildImgSrc(this.elements);
        this.embeds = ['published', 'content', 'description', 'updated', 'link', 'title', 'img_src'];
    }
    buildLink() {
        for (let link of this.links) {
            if (link.title == this.title) {
                return link.href;
            }
        }
        return link[3].href;
    }
    buildTerm(entry) {
        let container = [];
        if (entry.category != undefined) {
            for (let cat of entry.category) {
                container.push(new BlogsLabelEntity(cat.term));
            }
        }
        return container;
    }
    buildDescription(elements) {
        let text = elements.innerText;
        text.trim();

        // max character
        if (text.length > 133) {
            text = text.slice(0, 130);
            text += '...';
        }

        return text;
    }
    buildImgSrc(elements) {
        // search thumbnail
        let thumbnail_element = elements.getElementsByClassName('search-posts-thumbnail')[0];
        let first_img_element = elements.getElementsByTagName('img')[0];
        // return default no image found
        if (thumbnail_element == undefined && first_img_element == undefined) return 'img not found';
        // search thumbnail
        if (thumbnail_element != undefined) return thumbnail_element.src;
        if (first_img_element != undefined) return first_img_element.src;
    }
    buildAuthors(authors) {
        let cont = [];
        for (let author of authors)
            cont.push(new BlogAuthorEntity(author));
        return cont;
    }
    buildElements(content = '') {
        return new DOMParser().parseFromString(content, 'text/html').body;
    }
}
class BlogsLabelEntity {
    constructor(category) {
        this.label = category;
        this.label_link = '/search/label/' + this.label;
        this.embeds = [
            'label',
            'label_link'
        ]
    }
}
class BlogAuthorEntity {
    /*
    email    : {$t: 'noreply@blogger.com'}
    gd$image : {rel: 'http://schemas.google.com/g/2005#thumbnail', width: '32', height: '17', src: '//blogger.googleusercontent.com/img/b/R29vZ2xl/AVv…u8TH_TkhcmSEWC5uR73LQZbpVCazJ/s220/cs-snedel.webp'}
    name     : {$t: 'Gilang Ramadhan'}
    uri      : {$t: 'http://www.blogger.com/profile/07000369991075541029'}
    */
    constructor(author_entry) {
        this.email = author_entry.email.$t;
        this.image = author_entry.gd$image;
        this.name = author_entry.name.$t;
        this.uri = author_entry.uri.$t;
        this.embeds = [
            'email',
            'image',
            'name',
            'uri',
        ]
    }
}

module.exports = {
    BlogPostEntity,
    BlogAuthorEntity,
    BlogsLabelEntity,
    BlogPaginationEntity,
}