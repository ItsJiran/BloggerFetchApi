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
