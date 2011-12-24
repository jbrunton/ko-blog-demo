var HeaderViewModel = function() {
    util.ko.define(this, {
        properties: {
            authorized: false,
            userName: ""
        }
    });
    
    if (util.auth.user()) {
        this.authorized(true);
        this.userName(util.auth.user());
    }
    
    this.configureSubscriptions();  
};

HeaderViewModel.prototype.configureSubscriptions = function() {
    var self = this;
    
    $.subscribe('authorized', function(data) {
        if (data) {
            self.authorized(true);
            self.userName(util.auth.user());
        } else {
            self.authorized(false);
            self.userName("");
        }
    });
};