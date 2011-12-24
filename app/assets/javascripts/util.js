var util = {
    ko : {
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
        }
    },
    
    extend : function(target, mixin, options) {
        mixin.call(target.prototype, options);
    },
    
    crud : {
        actionUrl : function(action, entity, id) {
            return "/api/json/" + action + "/" + entity + (id ? "/" + id : "");
        },
        blogPost : {
            actionUrl : function(action, id) {
                return util.crud.actionUrl(action, "blog-posts", id);
            }
        },
        blog : {
            actionUrl : function(action, id) {
                return util.crud.actionUrl(action, "blogs", id);
            }
        },
        
        behavior : function(entity) {            
            this.actionUrl = function(action) {
                return util.crud.actionUrl(action, entity, this.id());
            };
            
            this.doCreateReq = function(success, error) {
                $.ajax({
                    type: 'POST',
                    url: util.crud.actionUrl("create", "blog-posts"),
                    data: this.serialize(),
                    success: success,
                    error: error,
                    dataType: 'json'
                });
            }
            
            this.doUpdateReq = function(success, error) {
                $.ajax({
                    type: 'POST',
                    url: this.actionUrl("update"),
                    data: { data: this.serialize() },
                    success: success,
                    error: error,
                    dataType: 'json'
                });
            }
            
            this.doDeleteReq = function(success, error) {
                $.ajax({
                    type: 'POST',
                    url: this.actionUrl("delete"),
                    data: { id: this.id() },
                    success: success,
                    error: error,
                    dataType: 'json'
                });
            }
            
            
            return this;
        },
        
    },
    
    loadView: function(url) {
        var result = $.ajax({ url: url, dataType: "text", async: false });
        return $(result.responseText);
    },
    loadFeed: function(url) {
        var feed = null;
        $.ajax({ url: url, dataType: 'json', async: false,
            success: function (data) {
                feed = data;
            }
        });
        return feed;
    },
    guid: function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },
    zeroPad: function( number, width )
    {
        width -= number.toString().length;
        if ( width > 0 )
        {
            return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
        }
        return number;
    },
    parseTimestamp: function(value) {
        var regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
        var dateParts = value.match(regex);
        return new Date(dateParts[1], dateParts[2], dateParts[3], dateParts[4], dateParts[5], dateParts[6]);
    },
    parseDate: function(value) {
        return $.datepicker.parseDate('dd M, yy', value);
    },
    formatDate: function(value) {
        return $.datepicker.formatDate('dd M, yy', value);
    },
    formatTime: function(value) {
        return util.zeroPad(value.getHours(), 2) + ":" + util.zeroPad(value.getMinutes(), 2);
    },
    formatTimestamp: function(value) {
        return util.formatDate(value) + " at " + util.formatTime(value);
    },
    prettyPrint: function(value) {
        var now = new Date();
        var datePart = now.getDate() === value.getDate()
            ? "today"
            : util.formatDate(value);
        var timePart = util.formatTime(value);
        return datePart + " at " + timePart;
    },
    format: function(value) {
        var args = arguments;
        return value.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
            if (m == "{{") { return "{"; }
            if (m == "}}") { return "}"; }
            return args[n];
        });
    }

};