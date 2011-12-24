Util = {
    
    
};




var BlogViewModel = function(data) {
    var self = this;
    
    util.ko.define(this, {
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
    // todo: if another post is editing, doesn't preview other
    post.startEditing();
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
        
    util.dialog.okCancel({
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
