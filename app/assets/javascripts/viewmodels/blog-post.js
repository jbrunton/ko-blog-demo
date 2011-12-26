var BlogPostViewModel = function(data) {
    util.ko.define(this, {
        properties: {
            id: null,
            blogId: null,
            title: null,
            content: null,
            createdAt: null,
            updatedAt: null,
            
            canEdit: true,
            editing: false,
            changed: false,
            loading: false
        },
        dependentProperties: {
            createdAtFm: function() {
                return this.createdAt()
                    ? util.prettyPrint(this.createdAt())
                    : "";
            },
            updatedAtFm: function() {
                return this.updatedAt()
                    ? util.prettyPrint(this.updatedAt())
                    : "";
            }
        }
    });
    
    if (data) {
        this.fromData(data);
    }

    this.configureSubscriptions();            
};

// TODO: implement as two mixins, crud.behavior and serialization.behavior
util.extend(
    BlogPostViewModel,
    util.crud.behavior, {
        entityName: util.crud.blogPost.entityName,
        dataRules: [
            ":id",
            ":blogId <> :blog_id",
            ":title",
            ":content",
            ":createdAt <- [parseTimestamp] :created_at",
            ":updatedAt <- [parseTimestamp] :updated_at"
        ]
    }
);

BlogPostViewModel.prototype.configureSubscriptions = function() {
    var self = this;
    
    $.subscribe("editing", function(post) {
        if (self.editing() && post && post != self) {
            self.editing(false);
        }
    });
};

BlogPostViewModel.prototype.startEditing = function() {
    this.editing(true);
    $.publish("editing", [this]);
};     
    
BlogPostViewModel.prototype.previewChanges = function() {
    this.changed(true);
    this.editing(false);        
    $.publish("editing", [null]);
};        

BlogPostViewModel.prototype.publishChanges = function() {
    this.editing(false);
    this.loading(true);
    
    var self = this;
    
    var success = function(data) {
        self.loadFromData(data);
        self.loading(false);
    };
    
    var error = function() {
        alert("Error updating post");
    };

    var data = this.toData();
    alert(JSON.stringify(data));
    
    if (this.id()) {
        this.doUpdateReq(success, error);
    } else {
        this.doCreateReq(success, error);
    }
        
    this.changed(false);
};
    
BlogPostViewModel.prototype.serialize = function() {
    return {
        id: this.id(),
        blog_id: this.blogId(),
        title: this.title(),
        content: this.content()
    };
}

BlogPostViewModel.prototype.loadFromData = function(data) {
    this.id(data.id);
    this.blogId(data.blog_id);
    this.title(data.title);
    this.content(data.content);

    if (data.created_at) {
        this.createdAt(util.parseTimestamp(data.created_at));
    }
    
    if (data.updated_at) {
        this.updatedAt(util.parseTimestamp(data.updated_at));
    }
};