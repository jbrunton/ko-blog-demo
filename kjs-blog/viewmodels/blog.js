
    var BlogPostViewModel = function(model) {
        var self = this;
        
        this.guid = util.guid();
        
        this.title = ko.observable(model.title);
        this.content = ko.observable(model.content);
        //this.title = model.title;
        //this.content = model.content;
        
        this.canEdit = ko.observable(true);
        this.editing = ko.observable(false);
        this.changed = ko.observable(false);
        
        this.creationDate = ko.observable(model.creationDate);
        this.modifiedDate = ko.observable(null);
        
        this.startEditing = function() {
            this.editing(true);
            $.publish("editing", [this]);
        };     
        
        $.subscribe("editing", function(post) {
            if (post) {
                self.canEdit(false);
            } else {
                self.canEdit(true);
            }
        });
        
        this.previewChanges = function() {
            this.changed(true);
            this.editing(false);
            
            $.publish("editing", [null]);
            
            // TODO: store original somewhere
        };        

        this.deletePost = function() {
            $.publish("deletePost", [this]);
        };
        
        this.publishChanges = function() {
            this.editing(false);
            this.changed(false);
            
            var now = new Date();
            if (!this.creationDate()) {
                this.creationDate(now);
            } else {
                this.modifiedDate(now);
            }
        };
        
        this.creationDateFmt = ko.dependentObservable(function() {
            // var date = this.creationDate();
            return util.formatDate(self.creationDate());
        }, this);
        
        this.modifiedDateFmt = ko.dependentObservable(function() {
            // var date = this.creationDate();
            return util.formatDate(self.modifiedDate());
        }, this);
    };
    
    var BlogViewModel = function(title, author, posts) {
        var self = this;
        this.title = title;
        this.author = author;
        this.posts = ko.observableArray(posts ? posts : []);
        this.newPost = function() {
            this.posts.push(new BlogPostViewModel({ title: "New Post" }));   
        };
        
        $.subscribe("deletePost", function(post) {
            // TODO: remove this dependency on jquery ui - maybe provide a dialog service/monopattern
            $( "#del-post-dlg" ).dialog({
                resizable: false,
                modal: true,
                buttons: {
                    "Delete item": function() {
                        $(this).dialog( "close" );
                        self.posts.remove(post);
                    },
                    Cancel: function() {
                        $(this).dialog( "close" );
                    }
                }
            });
        });
    };

            