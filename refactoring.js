class BloggerPostsService {
  constructor(t) {
      (this.blogger_information = new BloggerPostsInformation()),
          (this.blogger_post_printer = new BloggerPostPrinter({ blog_url: this.blogger_information.blog_url, post_missing_unit: t.post_missing_unit, posts_container: t.posts_container, post_format: t.post_format })),
          (this.blogger_page_navigator = new BloggerPageNavigation(t.max_results)),
          void 0 !== t.callback && (this.callback = t.callback),
          void 0 !== t.search_by_label && (this.blogger_information.search_label = t.search_by_label),
          void 0 !== t.pagination_container &&
              void 0 !== t.pagination_button_format &&
              (this.blogger_pagination_printer = new BloggerPaginationNavigationPrinter({
                  blogger_information: this.blogger_information,
                  pagination_container: t.pagination_container,
                  pagination_button_format: t.pagination_button_format,
              })),
          this.execute();
  }
  execute() {
      this.setJson(),
          this.blogger_posts_json.fetchData((t) => {
              if (
                  (new BloggerPosts(t).posts.forEach((t) => {
                      this.blogger_post_printer.print(t);
                  }),
                  null == this.blogger_pagination_printer && void 0 !== this.callback && this.callback(),
                  void 0 !== this.blogger_pagination_printer)
              ) {
                  var i = new BloggerPageNavigation(this.blogger_page_navigator.max_results);
                  i.decrement(),
                      new BloggerPostsJson({
                          blog_information: this.blogger_information,
                          blog_url: this.blogger_information.blog_url,
                          start_index: i.start_index,
                          max_results: i.max_results,
                          search_query: this.blogger_information.search_query,
                          search_label: this.blogger_information.search_label,
                      }).fetchData((t) => {
                          var r = `https://${this.blogger_information.blog_url}/search`;
                          if (
                              (void 0 !== this.blogger_information.search_label && (r += `/label/${this.blogger_information.search_label}?current-page=${i.current_page}`),
                              (r += "?"),
                              void 0 !== this.blogger_information.search_query && (r += `q=${this.blogger_information.search_query}&`),
                              (r += `current-page=${i.current_page}`),
                              i.start_index == this.blogger_page_navigator.start_index)
                          )
                              this.blogger_pagination_printer.print({ pagination_url: "#", pagination_title: "Prev", additional_class: "disabled" }),
                                  this.blogger_pagination_printer.print({ pagination_url: r, pagination_title: this.blogger_page_navigator.current_page, additional_class: "active" });
                          else {
                              r = `https://${this.blogger_information.blog_url}/search`;
                              void 0 !== this.blogger_information.search_label && (r += `/label/${this.blogger_information.search_label}?current-page=${i.current_page}`),
                                  (r += "?"),
                                  void 0 !== this.blogger_information.search_query && (r += `q=${this.blogger_information.search_query}&`),
                                  (r += `current-page=${i.current_page}`),
                                  this.blogger_pagination_printer.print({ pagination_url: r, pagination_title: "Prev" }),
                                  this.blogger_pagination_printer.print({ pagination_url: r, pagination_title: i.current_page }),
                                  this.blogger_pagination_printer.print({ pagination_url: "#", pagination_title: this.blogger_page_navigator.current_page, additional_class: "active" });
                          }
                          var s = new BloggerPageNavigation(this.blogger_page_navigator.max_results);
                          s.increment(),
                              new BloggerPostsJson({
                                  blog_information: this.blogger_information,
                                  blog_url: this.blogger_information.blog_url,
                                  start_index: s.start_index,
                                  max_results: s.max_results,
                                  search_query: this.blogger_information.search_query,
                                  search_label: this.blogger_information.search_label,
                              }).fetchData((t) => {
                                  var i = `https://${this.blogger_information.blog_url}/search`;
                                  void 0 !== this.blogger_information.search_label && (i += `/label/${this.blogger_information.search_label}?current-page=${s.current_page}`),
                                      (i += "?"),
                                      void 0 !== this.blogger_information.search_query && (i += `q=${this.blogger_information.search_query}&`),
                                      (i += `current-page=${s.current_page}`),
                                      void 0 !== t.entry
                                          ? (this.blogger_pagination_printer.print({ pagination_url: i, pagination_title: s.current_page }), this.blogger_pagination_printer.print({ pagination_url: i, pagination_title: "Next" }))
                                          : this.blogger_pagination_printer.print({ pagination_url: "#", pagination_title: "Next", additional_class: "disabled" }),
                                      void 0 !== this.callback && this.callback();
                              });
                      });
              }
          });
  }
  setJson() {
      return (this.blogger_posts_json = new BloggerPostsJson({
          blog_information: this.blogger_information,
          blog_url: this.blogger_information.blog_url,
          start_index: this.blogger_page_navigator.start_index,
          max_results: this.blogger_page_navigator.max_results,
          search_query: this.blogger_information.search_query,
          search_label: this.blogger_information.search_label,
      }));
  }
}
class BloggerPostsJson {
  constructor(t) {
      (this.blog_url = t.blog_url),
          (this.start_index = t.start_index),
          (this.search_query = t.search_query),
          (this.search_label = t.search_label),
          (this.max_results = t.max_results),
          null == this.search_label ? (this.head_url = "/feeds/posts/default/") : (this.head_url = "/feeds/posts/default/-/" + this.search_label),
          (this.parameter_head = ["start-index", "max-results", "q"]),
          (this.parameter_value = ["start_index", "max_results", "search_query"]),
          (this.parameter_url = this.formatJsonParameterUrl()),
          (this.json_url = this.blog_url + this.head_url + "?" + this.parameter_url + "&alt=json");
  }
  formatJsonParameterUrl() {
      var t = "";
      for (var i in this.parameter_head) {
          var r = this.parameter_head[i],
              s = this[this.parameter_value[i]];
          void 0 !== s && (t = t + r.toString() + "=" + s.toString() + "&");
      }
      return t;
  }
  fetchData(t) {
      getJson(this.json_url, (i) => {
          t(i);
      });
  }
}
class BloggerPageNavigation {
  constructor(t) {
      (this.current_page = this.getCurrentPage()), (this.max_results = t), (this.start_index = this.calculateValidStartIndexByCurrentPage());
  }
  getCurrentPage() {
      var t = window.location.href.split("?")[1],
          i = void 0;
      if (null == t || "" == t) return 1;
      for (var r of (t = t.split("&"))) {
          var s = r.split("=")[0],
              e = r.split("=")[1];
          if ("current-page" == s) return parseInt(e);
      }
      return null == i ? 1 : i;
  }
  getStartIndex() {
      var t = window.location.href.split("?")[1],
          i = void 0;
      if (null != t) {
          for (var r of (t = t.split("&"))) {
              var s = r.split("=")[0],
                  e = r.split("=")[1];
              if ("start-index" == s) return parseInt(e);
          }
          return i;
      }
  }
  calculateValidStartIndexByCurrentPage() {
      return this.current_page < 1 && (this.current_page = 1), this.max_results * this.current_page - this.max_results + 1;
  }
  calculateValidStartIndexByMaxResults() {
      return this.start_index - (this.start_index % this.max_results) + 1;
  }
  calculateValidCurrentPageByStartIndex() {
      return (this.start_index - (this.start_index % this.max_results)) / this.max_results + 1;
  }
  checkStartIndexAndCurrentPageValid() {
      return this.start_index == this.calculateValidStartIndexByCurrentPage();
  }
  increment() {
      (this.current_page += 1), (this.start_index = this.calculateValidStartIndexByCurrentPage());
  }
  decrement() {
      (this.current_page -= 1), (this.start_index = this.calculateValidStartIndexByCurrentPage());
  }
}
class BloggerPostsInformation {
  constructor() {
      (this.current_url = window.location.href), (this.blog_url = this.getBlogUrl()), (this.search_label = this.getSearchLabel()), (this.search_query = this.getSearchQuery());
  }
  getBlogUrl() {
      for (var t of this.current_url.split("/")) {
          if ("blogspot" == t.split(".")[1] && "com" == t.split(".")[2]) return t;
      }
  }
  getSearchLabel() {
      var t = this.current_url.split("?")[0].split("/");
      for (var i in t) {
          if ("label" == t[i]) return t[parseInt(i) + 1];
      }
  }
  getSearchQuery() {
      var t = window.location.href.split("?")[1];
      if (null != t)
          for (var i of (t = t.split("&"))) {
              var r = i.split("=")[0],
                  s = i.split("=")[1];
              if ("q" == r) return s;
          }
  }
}
class BloggerPosts {
  constructor(t) {
      (this.posts = []), (this.json = t), this.formatPostData(t.entry);
  }
  formatPostData(t) {
      null != t &&
          t.forEach((t) => {
              var i = new BloggerPostBuilder().setDescription(t).setPublished(t).setThumbnail(t).setCategory(t).setComment(t).setAuthor(t).setTitle(t).setUrl(t).build();
              this.posts.push(i);
          });
  }
}
class BloggerPostItem {
  constructor(t) {
      (this.published = t.published),
          (this.title = t.title),
          (this.description = t.description),
          (this.author_list = t.author_list),
          (this.category_list = t.category_list),
          (this.thumbnail_src = t.thumbnail_src),
          (this.comment = t.comment),
          (this.url = t.url);
  }
}
class BloggerPostBuilder {
  constructor() {
      (this.published = void 0), (this.author_list = void 0), (this.title = void 0), (this.description = ""), (this.thumbnail_src = void 0), (this.category_list = void 0), (this.comment = void 0), (this.url = void 0);
  }
  setAuthor(t) {
      return this.ifExist(t.author)
          ? ((this.author_list = []),
            t.author.forEach((t) => {
                var i = {};
                (i.url = t.uri.$t), (i.name = t.name.$t), (i.email = t.email.$t), (i.img = t.gd$image.src), this.author_list.push(i);
            }),
            this)
          : this;
  }
  setPublished(t) {
      if (!this.ifExist(t.published.$t)) return this;
      var i = t.published.$t.split("T")[0].split("-");
      return (this.published = {}), (this.published.year = i[0]), (this.published.month = i[1]), (this.published.day = i[2]), this;
  }
  setCategory(t) {
      return this.ifExist(t.category)
          ? ((this.category_list = []),
            t.category.forEach((t) => {
                this.category_list.push(t.term);
            }),
            this)
          : this;
  }
  setTitle(t) {
      return this.ifExist(t.title) && "" != t.title.$t ? ((this.title = t.title.$t), this) : this;
  }
  setThumbnail(t) {
      var i = new DOMParser().parseFromString(t.content.$t, "text/html");
      if (!this.ifThumbnailExist(i)) return this;
      var r = i.getElementsByTagName("img")[0],
          s = i.getElementsByClassName("post-thumbnail")[0];
      return (this.thumbnail_src = void 0 !== s ? s.src : r.src), this;
  }
  setComment(t) {
      return this.ifExist(t.link[1]) && "replies" === t.link[1].rel ? ((this.comment = {}), (this.comment.link = t.link[1].href), (this.comment.total = t.link[1].title.split(" ")[0]), this) : this;
  }
  setDescription(t) {
      if (!this.ifExist(t.content.$t)) return this;
      var i = new DOMParser().parseFromString(t.content.$t, "text/html");
      return (
          Array.prototype.slice.call(i.getElementsByTagName("p")).forEach((t) => {
              t = t.innerText;
              if (this.description.length < 100) {
                  this.description[this.description.length - 1];
                  var i = 100 - this.description.length,
                      r = t.slice(0, i);
                  (this.description = this.description + r), this.description.trim();
              }
              this.description.trim();
          }),
          this
      );
  }
  setUrl(t) {
      return this.ifExist(t.link)
          ? (t.link.forEach((t) => {
                "alternate" == t.rel && (this.url = t.href);
            }),
            this)
          : this;
  }
  ifExist(t) {
      return null != t && !(t instanceof Array && 0 == t.length);
  }
  ifThumbnailExist(t) {
      var i = t.getElementsByTagName("img");
      return null != i && 0 != i.length;
  }
  build() {
      return new BloggerPostItem(this);
  }
}
class BloggerPostPrinter {
  constructor(t) {
      (this.blog_information = t.blog_information),
          (this.blog_url = t.blog_url),
          (this.posts_container = t.posts_container),
          (this.post_format = t.post_format),
          (this.post_missing_unit = t.post_missing_unit),
          (this.temporary_format = ""),
          (this.parser = new DOMParser());
  }
  setDescription(t) {
      var i = t.description,
          r = this.post_missing_unit.description,
          s = this.findWichOneExist(i, r);
      this.temporary_format = this.temporary_format.replaceAll("{post_description}", s);
  }
  setThumbnail(t) {
      var i = t.thumbnail_src,
          r = this.post_missing_unit.thumbnail_src,
          s = this.findWichOneExistUrl(i, r);
      this.temporary_format = this.temporary_format.replaceAll("{post_thumbnail_src}", s);
  }
  setTitle(t) {
      var i = t.title,
          r = this.post_missing_unit.title,
          s = this.findWichOneExist(i, r);
      this.temporary_format = this.temporary_format.replaceAll("{post_title}", s);
  }
  setLabelName(t) {
      if (this.ifExist(t.category_list)) var i = t.category_list[0];
      var r = this.post_missing_unit.label,
          s = this.findWichOneExistUrl(i, r);
      this.temporary_format = this.temporary_format.replaceAll("{post_label_name}", s);
  }
  setLabelUrl(t) {
      if (this.ifExist(t.category_list)) var i = "https://" + this.blog_url + "/search/label/" + t.category_list[0];
      var r = this.findWichOneExistUrl(i, "#");
      this.temporary_format = this.temporary_format.replaceAll("{post_label_href}", r);
  }
  setUrl(t) {
      var i = t.url,
          r = this.post_missing_unit.url,
          s = this.findWichOneExistUrl(i, r);
      this.temporary_format = this.temporary_format.replaceAll("{post_url}", s);
  }
  setCommentTotal(t) {
      if (this.ifExist(t.comment)) var i = t.comment.total;
      else i = void 0;
      var r = this.findWichOneExist(i, "Comments Disabled");
      "Comments Disabled" !== r && (r += " Comments"), (this.temporary_format = this.temporary_format.replaceAll("{post_total_comment}", r));
  }
  setCommentUrl(t) {
      if (this.ifExist(t.comment)) var i = t.comment.link;
      else i = void 0;
      var r = this.findWichOneExistUrl(i, "#");
      this.temporary_format = this.temporary_format.replaceAll("{post_comment_link}", r);
  }
  setDate(t) {
      if (this.ifExist(t.published)) var i = `${t.published.day}-${t.published.month}-${t.published.year}`;
      else i = void 0;
      var r = this.findWichOneExistUrl(i, "No Date");
      this.temporary_format = this.temporary_format.replaceAll("{post_date}", r);
  }
  setAuthorName(t) {
      if (this.ifExist(t.author_list)) var i = t.author_list[0].name;
      var r = this.findWichOneExist(i, "Unknown");
      this.temporary_format = this.temporary_format.replaceAll("{post_author_name}", r);
  }
  setAuthorImg(t) {
      if (this.ifExist(t.author_list)) var i = t.author_list[0].img;
      var r = this.post_missing_unit.author_img,
          s = this.findWichOneExistUrl(i, r);
      this.temporary_format = this.temporary_format.replaceAll("{post_author_img}", s);
  }
  setAuthorLink(t) {
      if (this.ifExist(t.author_list)) var i = t.author_list[0].url;
      var r = this.findWichOneExistUrl(i, "#");
      this.temporary_format = this.temporary_format.replaceAll("{post_author_link}", r);
  }
  ifExist(t) {
      return null != t && !(t instanceof Array && 0 == t.length);
  }
  findWichOneExist(t, i) {
      var r;
      return this.ifExist(t) || this.ifExist(i) || (r = "Not Found"), this.ifExist(t) && (r = t), !this.ifExist(t) && this.ifExist(i) && (r = i), r;
  }
  findWichOneExistUrl(t, i) {
      var r;
      return this.ifExist(t) || this.ifExist(i) || (r = "#"), this.ifExist(t) && (r = t), !this.ifExist(t) && this.ifExist(i) && (r = i), r;
  }
  print(t) {
      (this.temporary_format = this.post_format),
          this.setDescription(t),
          this.setThumbnail(t),
          this.setTitle(t),
          this.setAuthorName(t),
          this.setAuthorLink(t),
          this.setAuthorImg(t),
          this.setCommentTotal(t),
          this.setCommentUrl(t),
          this.setLabelName(t),
          this.setDate(t),
          this.setLabelUrl(t),
          this.setUrl(t),
          this.posts_container.appendChild(this.parser.parseFromString(this.temporary_format, "text/html").body.firstChild);
  }
}
class BloggerPaginationNavigationPrinter {
  constructor(t) {
      (this.blogger_information = t.blogger_information), (this.pagination_container = t.pagination_container), (this.pagination_button_format = t.pagination_button_format), (this.parser = new DOMParser());
  }
  setPaginationUrl(t) {
      var i = t.pagination_url,
          r = this.findWichOneExistUrl(i, "#");
      this.temporary_format = this.temporary_format.replaceAll("{pagination_url}", r);
  }
  setPaginationTitle(t) {
      var i = t.pagination_title,
          r = this.findWichOneExist(i, "No Index");
      this.temporary_format = this.temporary_format.replaceAll("{pagination_title}", r);
  }
  ifExist(t) {
      return null != t && !(t instanceof Array && 0 == t.length);
  }
  findWichOneExist(t, i) {
      var r;
      return this.ifExist(t) || this.ifExist(i) || (r = "Not Found"), this.ifExist(t) && (r = t), !this.ifExist(t) && this.ifExist(i) && (r = i), r;
  }
  findWichOneExistUrl(t, i) {
      var r;
      return this.ifExist(t) || this.ifExist(i) || (r = "#"), this.ifExist(t) && (r = t), !this.ifExist(t) && this.ifExist(i) && (r = i), r;
  }
  print(t) {
      (this.temporary_format = this.pagination_button_format), this.setPaginationUrl(t), this.setPaginationTitle(t);
      var i = this.parser.parseFromString(this.temporary_format, "text/html").body.firstChild;
      this.ifExist(t.additional_class) && i.classList.add(t.additional_class), console.log(i), this.pagination_container.appendChild(i);
  }
}
