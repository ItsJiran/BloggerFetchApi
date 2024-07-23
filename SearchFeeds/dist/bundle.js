// +===============================================================+
// ------------------- BLOG SEARCH FUNCTIONS -----------------------
// +===============================================================+
function preg_match_all(regex, str) {
    return regex.exec(str);
}
// +===============================================================+
// --------------------- BLOG SEARCH BUILDER -----------------------
// +===============================================================+
class Builder {
    static template = '';

    // builder
    static build(entity) {
        // implement your print method here
        let raw = this.buildTemplate(entity);
        let element = this.buildElement(raw, entity)
        return element;
    }
    static buildTemplate(entity) {
        let tmp = this.template;
        tmp = this.addEmbeds(tmp, entity);
        return tmp;
    }
    static buildElement(raw = this.buildTemplate()) {
        return new DOMParser().parseFromString(raw, 'text/html').body.firstElementChild;
    }

    // embbeder
    static addEmbeds(raw = this.template, entity = {}) {
        if (entity.embeds == undefined) return raw;
        for (let key of entity.embeds) {
            raw = raw.replaceAll('{{' + key + '}}', entity[key]);
        }
        return raw;
    }

    // slot manipulator
    static getSlots(raw = this.template) {
        return preg_match_all(/\[\[(?![^\]]*\/\])[^\]]*\]\]/, raw);
    }
    static addSlot(original = this.template, slot_template = '', slotKey = '') {
        if (slotKey == '') return;
        // replace every = [[slot]]
        let slots = this.getSlots(raw);
        for (let slot of slots) {

        }
        return
    }
    static cleanSlot(raw = this.template) {

    }
}
class PostBuilder extends Builder {
    static template = `
        <div class='post-outer'>
            <article class='post hentry' itemprop='blogPost' itemscope='itemscope' itemtype='https://schema.opg/BlogPosting'>
                <div class="post-body entry-content" itemprop="articleBody">
                    <div class="box-deg">
                        <div class="post-thumbnail">
                            <div class="blanterimgthumb">
                                <a href="{{link}}"><img alt="{{title}}" height="74" itemprop="image" src="{{img_src}}" title="{{title}}" width="74"></a></div>
                            </div>
                        </div>							
                        <div class="box-body-deg">
                            [[post-label]]
                            <h2 class="post-title entry-title" itemprop="name headline">
                                <a href="{{link}}" itemprop="url" title="{{title}}">{{title}}</a>
                            </h2>
                            <div class="snippet-material" itemprop="description">{{description}}</div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    `;
}
class PostLabelBuilder extends Builder {
    static template = `
        <div class="label-info">
            <a href="{{label_link}}" rel="tag"><i class="fa-solid fa-hashtag"></i>{{label}}</a>
        </div>
    `
}
class PaginationLink extends Builder {
    static template = `
        <a class='BSearch-pagination' href='{{link}}'>	
            {{title}}
        </a>
    `
}
class EmptyPosts extends Builder {
    static template = `
        <div class='empty'>Empty Blog Posts</div>
    `
}

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

// +===============================================================+
// ------------------------ BLOG INFO ----------------------------
// +===============================================================+
class BlogSearchInfo {
    // This class is entity to the information that the blogger has, like query and etc
    constructor(location = window.location) {
        this.host = location.host;
        this.hostname = location.hostname;
        this.origin = location.origin;
        this.pathname = location.pathname;
        this.label = undefined;
        this.buildLabel();
    }
    // build queries
    buildLabel(path = window.location.pathname) {
        let paths = path.split('/');
        // url / "/search/label/[label-name]"
        if (paths[1] == 'search' && paths[2] == 'label')
            this.label = paths[3];
    }
}
class BlogSearchApi {
    constructor(blog_info) {
        this.url = '';
        this.path = '';
        this.target = '/feeds/posts/default';
        this.build(blog_info);
    }
    async call(url = this.url) {
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
    build(blog_info, api_queries = '?') {
        if (blog_info instanceof BlogSearchInfo == false)
            throw Error('Blog info should be instance of BlogSearchInfo');

        // determine if there's a label search or not
        if (blog_info.label != undefined) this.path = '/-/' + blog_info.label;

        // return combine with the api_path
        this.url = blog_info.origin + this.target + this.path + api_queries;
    }
}

// +===============================================================+
// --------------------- BLOG SEARCH QUERIES -----------------------
// +===============================================================+
class Queries {
    constructor(object = {}) {
        this.init(object.queries);
        this.initRules(object.rules);
    }

    // this method is responsible for building the object proerties
    // the init method can be used either to reset the current queries
    // or to initalize the object
    init(object = {}) {
        this.queries = {
            ...object,
        };
    }
    initRules(object = {}) {
        this.rules = {
            ...object,
        };
    }
    build(object = {}) {
        for (let key in object) {
            this.setQueries(key, object[key]);
        }
    }
    buildByUrl(path = window.location.search) {
        const params = new URLSearchParams(window.location.search);
        for (let key in this.queries) {
            if (params.get(key) != undefined)
                this.setQueries(key, params.get(key));
        }
    }

    // this method is responsible for building query url
    // it can be used either for api or building for the new pagination
    fillApi(path = '?') {
        for (let key in this.queries) {
            let fill_key = key;

            // skip if shouldn't filled
            if (!this.isFillApi(key) || !this.fillValidation(key, this.queries[key]))
                continue;

            // if converted 
            if (this.isConverted(key) != undefined)
                fill_key = this.isConverted(key);

            // prevent weird url
            if (path.length != 1) path += '&';

            // if not array
            if (!Array.isArray(this.queries[key]))
                path += fill_key + '=' + this.middleware(key, this.queries[key]);

            // if array
            if (Array.isArray(this.queries[key])) {
                for (let value of this.queries[key]) {
                    if (path.length != 1) path += '&';
                    path += fill_key + '=' + this.middleware(key, value);
                }
            }

        }
        return path;
    }
    isFillApi(key) {
        if (this.rules[key] != undefined) {
            if (!this.rules[key].fillApi)
                return false;
        }
        return true;
    }
    fill(path = '?') {
        for (let key in this.queries) {
            let fill_key = key;

            // skip if shouldn't filled
            if (!this.isFill(key) || !this.fillValidation(key, this.queries[key]))
                continue;

            // if converted 
            if (this.isConverted(key) != undefined)
                fill_key = this.isConverted(key);

            // prevent weird url
            if (path.length != 1) path += '&';

            // if not array
            if (!Array.isArray(this.queries[key]))
                path += fill_key + '=' + this.middleware(key, this.queries[key]);

            // if array
            if (Array.isArray(this.queries[key])) {
                for (let value of this.queries[key]) {
                    if (path.length != 1) path += '&';
                    path += fill_key + '=' + this.middleware(key, value);
                }
            }
        }
        return path;
    }
    isFill(key) {
        if (this.rules[key] != undefined) {
            if (!this.rules[key].fill)
                return false;
        }
        return true;
    }
    isConverted(key) {
        if (this.rules[key] != undefined) {
            if (this.rules[key].converted != undefined)
                return this.rules[key].converted;
        }
        return undefined;
    }

    // implement your validation method here
    getQueries(key) {
        this.queries[key];
    }
    setQueries(key, value) {
        if (this.validation(key, value))
            this.queries[key] = value;
    }

    // fill support method
    fillValidation(key, value) {
        return true;
    }
    validation(key, value) {
        return true;
    }
    middleware(key, value) {
        return value;
    }
}
class BlogPagination extends Queries {
    // method overloading 
    init(object = {}) {
        this.queries = {
            current_page: 1,
            start_index: 1,
            max_results: 1,
            total_results: -1,
            ...object
        }
    }
    initRules(object = {}) {
        this.rules = {
            // queries for data pagination
            total_results: {
                fill: false,
                fillApi: false,
            },
            total_page: {
                fill: false,
                fillApi: false,
            },
            // queries for url
            current_page: {
                fill: true,
                fillApi: false,
            },
            // queries for api
            start_index: {
                converted: 'start-index',
                fill: false,
                fillApi: true,
            },
            max_results: {
                converted: 'max-results',
                fill: false,
                fillApi: true,
            },
            ...object
        }
    }

    // middleware
    middleware(key, value) {
        if (key == 'start_index')
            value = parseInt(this.queries['start_index']) + ((parseInt(this.queries['current_page']) - 1) * parseInt(this.queries['max_results']));
        return value;
    }

    // on blog pagination this method should expect a response object
    // because this class need the data of the total post that provided by the
    // blogger rss feeds.
    buildByFeed(response = {}) {
        if (response.feed == undefined) throw Error("response feeds property shouldn't empty");

        // we expect an response.feed object
        let feed = response.feed;

        // we start consuming this object property		
        // openSearch$itemsPerPage : {$t: '2'}
        // openSearch$startIndex   : {$t: '1 }
        // openSearch$totalResults : {$t: '4'}
        let totalResults = feed.openSearch$totalResults.$t;
        let startIndex = feed.openSearch$startIndex.$t;
        let itemsPerPage = feed.openSearch$itemsPerPage.$t;

        // Formula 
        // the goal is to calculate itemsPerPage / startIndex / Total Result -> CurrentPage / TotalPage
        // TotalPage         = total_result / items_perpage
        // CurrentPage_Index = TotalPage + 1 
        this.setQueries('total_page', Math.round(totalResults / itemsPerPage));
        this.setQueries('total_results', totalResults);
    }
}
class BlogSearchQueries extends Queries {
    // method overloading 
    init(object = {}) {
        this.queries = {
            q: '',
            alt: 'json',
            ...object
        }
    }
    initRules(object = {}) {
        this.rules = {
            q: {
                fill: true,
                fillApi: true,
                converted: 'q',
            },
            alt: {
                fill: false,
                fillApi: true,
            },
            ...object
        }
    }
    // validation for fill
    fillValidation(key, value) {
        if (key == 'q' && value == '') return false;
        return true;
    }
}


// +===============================================================+
// ------------------------ BLOG SEARCH ----------------------------
// +===============================================================+
class BlogSearch {
    constructor(object = {}) {
        this.BlogSearchInfo = new BlogSearchInfo(object.location);
        this.BlogSearchApi = new BlogSearchApi(this.BlogSearchInfo);
        this.BlogSearchQueries = new BlogSearchQueries(object.search_settings);

        // Entity or Filtered Element
        this.BlogPosts = [];
        this.BlogPagination = new BlogPagination(object.pagination_settings);

        // container for printer
        this.posts_container = object.posts_container ? object.posts_container : document.getElementById('BSearch-posts-container');
        this.pagination_container = object.pagination_container ? object.pagination_container : document.getElementById('BSearch-pagination-container');

        // build the each queries from the current window params
        this.BlogSearchQueries.buildByUrl();
        this.BlogPagination.buildByUrl();
    }

    async run() {
        // build the targeted api_url
        this.BlogSearchApi.build(this.BlogSearchInfo, this.buildApiQueries());

        // call response json
        let response = await this.BlogSearchApi.call();
        if (response.feed == undefined) {
            // handle restart button here
            console.error("response shouldn't be empty");
            return;
        }

        // reset 
        this.resetEntity();

        // handle response feed;
        this.buildPostEntity(response);
        this.buildPaginationEntity(response);

        // print entity to the dom
        this.printPostsEntity();
        this.printPaginationEntity();
    }

    buildApiQueries(path = '?') {
        path = this.BlogSearchQueries.fillApi(path);
        path = this.BlogPagination.fillApi(path);
        return path;
    }
    buildPostEntity(response) {
        if (response.feed.entry == undefined) return;
        for (let post of response.feed.entry) {
            this.BlogPosts.push(new BlogPostEntity(post))
        }
    }
    buildPaginationEntity(response) {
        this.BlogPagination.buildByFeed(response);
    }
    buildPaginationQueries(path = '?', page = '#') {
        path = this.BlogSearchQueries.fill(path);
        if (path == '?') return path + 'current_page=' + page;
        else return path + '&current_page=' + page;
    }

    printPostsEntity() {
        if (this.BlogPosts.length <= 0) {
            let element = EmptyPosts.build();
            this.posts_container.appendChild(element);
        } else {
            for (let post of this.BlogPosts) {
                let element = PostBuilder.build(post);
                // print aditional element
                if (post.labels >= 1) {
                    let label_element = PostLabelBuilder.build(post.labels[0]);
                    element.getElementsByTagName('h2')[0].insertBefore('');
                }
                this.posts_container.appendChild(element);
            }
        }
    }
    printPaginationEntity() {
        let current = parseInt(this.BlogPagination.queries.current_page);

        // print left button
        for (let i = Math.max(current - 5, 1); i < current; i++) {
            let elm = this.buildPaginationElement(String('left'), this.buildPaginationQueries('?', i));
            this.pagination_container.appendChild(elm);
        }
        // print current button
        let elm = this.buildPaginationElement(String('now'), '#');
        this.pagination_container.appendChild(elm);

        // print right button
        for (let i = current + 1; i <= this.BlogPagination.queries.total_page && i < current + 5; i++) {
            let elm = this.buildPaginationElement(String('right'), this.buildPaginationQueries('?', i));
            this.pagination_container.appendChild(elm);
        }
    }
    buildPaginationElement(title, link) {
        let entity = new BlogPaginationEntity({
            title: title,
            link: link,
        });
        return PaginationLink.build(entity);
    }
    resetEntity() {
        this.BlogPosts = [];
    }
}

// +===============================================================+
// ------------------------ BLOG RUNTIME ---------------------------
// +===============================================================+
let Main = new BlogSearch();
Main.run();
console.log(PostBuilder.getSlots())