var BlogViewModel = function(data) {
    util.ko.define(this, {
        properties: {
            id: null,
            title: null,
            author: null,
            
            authorized: false
        },
        arrayProperties: {
            posts: []
        }
    });
    
    this.configureSubscriptions();
    
    if (data) {    
        this.loadFromData(data);
    }
};

BlogViewModel.prototype.configureSubscriptions = function() {
    var self = this;
        
    $.subscribe("authorized", function(user) {
        self.checkIfAuthorized();
    });
};

BlogViewModel.prototype.newPost = function() {
    var newPostData = { blog_id: this.id(), title: "New Post", content: "" };
    var newPost = new BlogPostViewModel(newPostData);
    // todo: if another post is editing, doesn't preview other
    newPost.startEditing();
    this.posts.unshift(newPost);
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

BlogViewModel.prototype.checkIfAuthorized = function() {
    this.authorized(util.auth.user()
        && this.author() === util.auth.user());
};

BlogViewModel.prototype.loadFromData = function(data) {
    this.id(data.id);
    this.title(data.title);
    this.author(data.author);
    
    this.checkIfAuthorized();
    
    var self = this;
    
    $.each(data.posts, function (index, post) {
        var postViewModel = new BlogPostViewModel(post);
        self.posts.push(postViewModel);
    });
};
