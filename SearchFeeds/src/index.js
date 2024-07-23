// +===============================================================+
// ------------------------ BLOG SEARCH ----------------------------
// +===============================================================+
class BlogSearch {
    constructor(object = {}) {
        // state
        this.isPaginate = object.isPaginate == true ? true : false;

        // pagination
        this.BlogSearchInfo = new BlogSearchInfo(object.location);
        this.BlogSearchApi = new BlogSearchApi(this.BlogSearchInfo);
        this.BlogSearchQueries = new BlogSearchQueries(object.search_settings);

        // Entity or Filtered Element
        this.BlogPosts = [];
        this.BlogPagination = new BlogPagination(object.pagination_settings);

        // container for printer
        this.posts_container = object.posts_container ? object.posts_container : document.getElementById('blog-posts');
        this.pagination_container = object.pagination_container ? object.pagination_container : document.getElementById('blog-pager');

        // build the each queries from the current window params
        this.BlogSearchQueries.buildByUrl();
        this.BlogPagination.buildByUrl();
    }

    async run() {
        // build the targeted api_url
        this.BlogSearchApi.build(this.BlogSearchInfo, this.buildApiQueries());

        // if the pagination is lazy
        if (!this.isPaginate) {
            let elm = PaginationLazyLoader.build();
            if (this.pagination_container.firstChild != undefined) {
                this.pagination_container.removeChild(this.pagination_container.firstChild);
            }
            this.pagination_container.appendChild(elm);
        }

        // call response json
        try {
            let response = await this.BlogSearchApi.call();
            let data = await response.json();

            // reset 
            this.resetEntity();


            // handle response feed;
            this.buildPostEntity(data);
            this.buildPaginationEntity(data);

            // print entity to the dom
            this.printPostsEntity();
            this.printPaginationEntity();
        } catch (err) {
            console.error(err);

            if (this.isPaginate) {
                let elm = ReloadPosts.build();
                if (this.posts_container.firstChild != undefined) {
                    this.posts_container.removeChild(this.posts_container.firstChild);
                }
                this.posts_container.appendChild(elm);
            } else {
                let elm = PaginationReload.build();
                if (this.pagination_container.firstChild != undefined) {
                    this.pagination_container.removeChild(this.pagination_container.firstChild);
                }
                elm.addEventListener('click', () => {
                    this.run();
                })
                this.pagination_container.appendChild(elm);
            }
        }
    }

    buildApiQueries(path = '?') {
        path = this.BlogSearchQueries.fillApi(path);
        path = this.BlogPagination.fillApi(path);
        return path;
    }
    buildPostEntity(data) {
        if (data.feed.entry == undefined) return;
        for (let post of data.feed.entry) {
            this.BlogPosts.push(new BlogPostEntity(post))
        }
        console.log('pass');
    }
    buildPaginationEntity(data) {
        this.BlogPagination.buildByFeed(data);
        // increase one for current_page lazy load
        if (!this.isPaginate) this.BlogPagination.queries.current_page++;
    }
    buildPaginationQueries(path = '?', page = '#') {
        path = this.BlogSearchQueries.fill(path);
        if (path == '?') return path + 'current_page=' + page;
        else return path + '&current_page=' + page;
    }

    printPostsEntity() {
        // clear
        if (this.isPaginate) {
            this.posts_container.innerHTML = '';
        }
        // add
        if (this.BlogPosts.length <= 0) {
            let element = EmptyPosts.build();
            this.posts_container.appendChild(element);
        } else {
            for (let post of this.BlogPosts) {
                let post_template = PostBuilder.buildTemplate(post);
                // print aditional element
                if (post.labels.length >= 1) {
                    let label_template = PostLabelBuilder.buildTemplate(post.labels[0]);
                    post_template = PostBuilder.addSlot(post_template, label_template, '[[post-label]]');
                }
                // print the element
                let element = PostBuilder.buildElement(post_template);
                this.posts_container.appendChild(element);
            }
        }
    }
    printPaginationEntity() {
        // clear
        if (this.isPaginate) {
            this.pagination_container.innerHTML = '';
        }
        // add
        let current = parseInt(this.BlogPagination.queries.current_page);
        if (this.isPaginate) {
            if (current <= this.BlogPagination.queries.total_page) {
                // print left button
                for (let i = Math.max(current - 5, 1); i < current; i++) {
                    let elm = this.buildPaginationElement(String(i), this.buildPaginationQueries('?', i));
                    this.pagination_container.appendChild(elm);
                }

                // print current button
                let elm = this.buildPaginationElement(String(current), '#');
                this.pagination_container.appendChild(elm);

                // print right button
                for (let i = current + 1; i <= this.BlogPagination.queries.total_page && i < current + 5; i++) {
                    let elm = this.buildPaginationElement(String(i), this.buildPaginationQueries('?', i));
                    this.pagination_container.appendChild(elm);
                }
            }
        } else {
            // increase
            let elm = this.buildPaginationElement('', 'javascript:;');
            if (this.pagination_container.firstChild != undefined) {
                this.pagination_container.removeChild(this.pagination_container.firstChild);
            }
            this.pagination_container.appendChild(elm);
        }

    }
    buildPaginationElement(title, link) {
        let entity = new BlogPaginationEntity({
            title: title,
            link: link,
        });
        if (this.isPaginate) {
            return PaginationLink.build(entity);
        } else {
            if (this.BlogPagination.queries.current_page > this.BlogPagination.queries.total_page) {
                return PaginationMax.build(entity);
            } else {
                let elm = PaginationLazyButton.build(entity);
                elm.addEventListener('click', (e) => {
                    this.run();
                })
                return elm;
            }

        }
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
