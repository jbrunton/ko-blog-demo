Util = {
    initialize: function(target, options) {
        var _createProperty = function(propName) {
            var val = options.properties[propName];
            target[propName] = val
                ? ko.observable(val)
                : ko.observable();
        };
        
        var _createArrayProperty = function(propName) {
            var val = options.arrayProperties[propName];
            target[propName] = val
                ? ko.observableArray(val)
                : ko.observableArray([]);
        };
        
        var _createDependentProperty = function(propName) {
            var fn = options.dependentProperties[propName];
            target[propName] = ko.dependentObservable(fn, target);
        };
        
        for (var propName in options.properties) {
            _createProperty(propName);
        }
        
        for (var propName in options.arrayProperties) {
            _createArrayProperty(propName);
        }
        
        for (var propName in options.dependentProperties) {
            _createDependentProperty(propName);
        }
    },
    CRUD : {
        actionUrl : function(action, entity, id) {
            return "/api/json/" + action + "/" + entity + (id ? "/" + id : "");
        },
        blogPost : {
            actionUrl : function(action, id) {
                return Util.CRUD.actionUrl(action, "blog-posts", id);
            }
        },
        blog : {
            actionUrl : function(action, id) {
                return Util.CRUD.actionUrl(action, "blogs", id);
            }
        }
    },
    dialog : {
        okCancel : function(options) {
            var selector = options.selector
                ? options.selector
                : "#ok-cancel-dlg";
                
            var dlg = $(selector);
                    
            if (options.title) {
                dlg.attr("title", options.title);
            }
            
            if (options.message) {
                dlg.find("#message").text(options.message);
            }

            dlg.dialog({
                resizable: false,
                modal: true,
                buttons: {
                    OK: function() {
                        if (options.ok) {
                            options.ok();
                        }
                        $(this).dialog("close");
                    },
                    Cancel: function() {
                        if (options.cancel) {
                            options.cancel();
                        }
                        $(this).dialog("close");
                    }
                }
            });            
        }
    }
};

var BlogPostViewModel = function(model) {
    Util.initialize(this, {
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
    
    this.configureSubscriptions();
            
    if (model) {
        this.loadFromData(model);
    }
};

BlogPostViewModel.prototype.configureSubscriptions = function() {
    var self = this;
    
    $.subscribe("editing", function(post) {
        if (post) {
            self.canEdit(false);
        } else {
            self.canEdit(true);
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

BlogPostViewModel.prototype.deletePost = function() {
    $.publish("deletePost", [this]);
};

BlogPostViewModel.prototype.actionUrl = function(action) {
    return Util.CRUD.blogPost.actionUrl(action, this.id());
}

BlogPostViewModel.prototype.doCreateReq = function(blogId, success, error) {
    $.ajax({
        type: 'POST',
        url: Util.CRUD.blogPost.actionUrl("create"),
        data: this.serialize(),
        success: success,
        error: error,
        dataType: 'json'
    });
}

BlogPostViewModel.prototype.doUpdateReq = function(success, error) {
    $.ajax({
        type: 'POST',
        url: this.actionUrl("update"),
        data: { data: this.serialize() },
        success: success,
        error: error,
        dataType: 'json'
    });
}

BlogPostViewModel.prototype.doDeleteReq = function(success, error) {
    $.ajax({
        type: 'POST',
        url: this.actionUrl("delete"),
        data: { id: this.id() },
        success: success,
        error: error,
        dataType: 'json'
    });
}
    
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
    
    if (this.id()) {
        this.doUpdateReq(success, error);
    } else {
        this.doCreateReq(this.blogId(), success, error);
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


var BlogViewModel = function(data) {
    var self = this;
    
    Util.initialize(this, {
        properties: {
            id: null,
            title: null,
            author: null
        },
        arrayProperties: {
            posts: []
        }
    });
    
    if (data) {    
        this.loadFromData(data);
    }
        
    $.subscribe("deletePost", function(post) {
        self.deletePost(post);
    });
};

BlogViewModel.prototype.newPost = function() {
    var post = new BlogPostViewModel({
        blog_id: this.id(),
        title: "New Post",
        content: ""
    });
    post.editing(true);
    this.posts.unshift(post);
};

BlogViewModel.prototype.deletePost = function(post) {
    var self = this;

    success = function() {
        self.posts.remove(post);
    };
    
    error = function() {
        alert("error");
    };
        
    var verb = post.id() ? "delete" : "discard",
        message = "Are you sure you want to " + verb + " this post?";    
        
    Util.dialog.okCancel({
        title: "Delete post?",
        warning: true,
        message: message,
        ok: function() {
            if (post.id()) {
                post.doDeleteReq(success, error);
            } else {
                self.posts.remove(post);
            }
        }
    });
};

BlogViewModel.prototype.loadFromData = function(data) {
    this.id(data.id);
    this.title(data.title);
    this.author(data.author);
};

BlogViewModel.prototype.afterAdd = function(element) {
    $(element).hide().fadeIn();
}

BlogViewModel.prototype.beforeRemove = function(element) {
    $(element).children().fadeOut('fast', function() {
        $(element).slideUp('fast');
    });
}