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
// TODO: cache mixins!
util.extend(
    BlogPostViewModel,
    util.crud.behavior,
    { entityName: util.crud.blogPost.entityName }
);

util.extend(
    BlogPostViewModel,
    util.serialization.behavior, {
        dataRules: [
            ":id",
            ":blogId <> :blog_id",
            ":title",
            ":content",
            ":createdAt <- [util.parseTimestamp] :created_at",
            ":updatedAt <- [util.parseTimestamp] :updated_at"
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
        self.fromData(data);
        self.loading(false);
    };
    
    var error = function() {
        alert("Error updating post");
    };

    if (this.id()) {
        this.doUpdateReq(success, error);
    } else {
        this.doCreateReq(success, error);
    }
        
    this.changed(false);
};
