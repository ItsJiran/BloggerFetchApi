import {
    Builder,
    EmptyPosts,
    PostBuilder,
    PostLabelBuilder,
    PaginationLink,
} from "./builder";
import {
    BlogPostEntity,
    BlogAuthorEntity,
    BlogsLabelEntity,
    BlogPaginationEntity,
} from "./entity";
import {
    BlogSearchInfo,
    BlogSearchApi
} from "./info";
import {
    Queries,
    BlogPagination,
    BlogSearchQueries
} from "./queries";

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
                    element.getElementsByTagName('h2')[0].insertBefore();
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
