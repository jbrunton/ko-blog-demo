var BlogListViewModel = function(data) {
    util.ko.define(this, {
        arrayProperties: {
            blogs: data
        }
    });
};