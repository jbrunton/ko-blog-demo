var util = {
    ko : {
        define: function(target, options) {
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
            entityName : "blog-posts",
            actionUrl : function(action, id) {
                return util.crud.actionUrl(action, util.crud.blogPost.entityName, id);
            }
        },
        blog : {
            entityName: "blogs",
            actionUrl : function(action, id) {
                return util.crud.actionUrl(action, util.crud.blog.entityName, id);
            }
        },
        
        behavior : function(options) {            
            this.actionUrl = function(action) {
                return util.crud.actionUrl(action, options.entityName, this.id());
            };
            
            this.doCreateReq = function(success, error) {
                $.ajax({
                    type: 'POST',
                    url: util.crud.actionUrl("create", util.crud.blogPost.entityName),
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
    },
    
    dialog : {
        okCancel : function(options) {
            var selector = options.selector
                ? options.selector
                : "#ok-cancel-dlg";
                
            var dlg = $(selector).clone();
            
            if (options.warning) {
                dlg.find("#warning").show();
            } else {
                dlg.find("#warning").hide();
            }
                    
            if (options.title) {
                dlg.attr("title", options.title);
            }
            
            if (options.message) {
                dlg.find("#message").text(options.message);
            }
            
            if (options.form) {
                var form = $('<form></form>');
                
                var _createField = function(field) {
                    form.append('<label>' + field.label + ':</label>');
                    form.append("<div><input type='text' name='" + field.name + "' /></div>");
                };
                
                _(options.form.fields).chain().each(_createField);
            }
            
            dlg.append(form);
            

            dlg.dialog({
                resizable: false,
                modal: true,
                buttons: {
                    OK: function() {
                        if (options.ok) {
                            if (options.form) {
                                var formValues = {};
                                
                                var _addValue = function(field) {
                                    var val = dlg.find('input[name=' + field.name + ']').val();
                                    formValues[field.name] = val;
                                };
                                
                                _(options.form.fields).chain().each(_addValue);
                            }
                            if (formValues) {
                                options.ok(formValues);
                            } else {
                                options.ok();
                            }
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
    },
    
    effects : {
        afterAdd: function(element) {
            $(element).hide().fadeIn();
        },        
        beforeRemove: function(element) {
            $(element).find(".actions").hide();
            $(element).children().fadeOut('fast', function() {
                $(element).slideUp('fast');
            });
        }
    },
    
    auth : {
        prompt: function() {
            util.dialog.okCancel({
                title: "Sign-in",
                message: "Please enter your username and password",
                form: {
                    fields: [
                        { label: "username", name: "user_name" },
                        { label: "password", name: "password" }
                    ]
                },
                ok: function(formValues) {
                    var success = function() {
                        // alert("success");
                    };
                    var error = function() {
                        // alert("error");
                    };
                    var options = {
                        user_name: formValues["user_name"],
                        password: formValues["password"],
                        success: success,
                        error: error
                    };
                    util.auth.doAuthReq(options);
                }
            });
        },
        
        user: function() {
            var authCookie = $.cookie('auth_token');
            if (authCookie) {
                return JSON.parse(authCookie).user_name;
            }
        },
        
        token: function() {
            var authCookie = $.cookie('auth_token');
            if (authCookie) {
                return JSON.parse(authCookie).token;
            }
        },
        
        signout: function() {
            $.cookie('auth_token', null);
            $.publish('authorized');
        },
        
        doAuthReq: function(options) {
            $.ajax({
                type: 'POST',
                url: "/auth/token.json",
                data: { user_name: options.user_name },
                success: function(data) {
                    if (data.user.id) {
                        var authCookie = {
                            user_name: data.user.user_name,
                            token: data.token
                        };

                        $.cookie('auth_token',
                            JSON.stringify(authCookie),
                            { expires: 7, path: '/' }
                        );
                                                
                        if (options.success) {
                            options.success(data.user);
                            $.publish('authorized', [data.user]);
                        }
                    }
                },
                error: function() {
                    if (options.error) {
                        options.error();
                    }
                },
                dataType: 'json'
            });
        }
    },
    
    nav: {
        _routes: [],
        
        actions: {},
        
        map: function(url, action) {
            var _compilePart = function(part) {
                if (part[0] === ":") {
                    var routePart = {
                        regex: /.*/,
                        id: part.slice(1, part.length)
                    };
                } else {
                    var routePart = {
                        regex: part
                    };
                }
                return routePart;
            };
            
            var _routeParts = function() {
                return _(url.split("/"))
                    .chain()
                    .map(_compilePart)
                    .value();
            };
            
            var _compileAction = function(obj, actions) {
                if (actions.length === 0) {
                    return obj;
                } else {
                    return _compileAction(obj[actions[0]], actions.slice(1, actions.length));
                }
            }
            
            var route = {
                routeParts: _routeParts(),
                action: _compileAction(util.nav.actions, action.split("."))
            };

            this._routes.push(route);
        },
        
        to: function(url) {
            var urlParts = url.split("/");
            
            var params = {};
                
            var _matchRoute = function(route) {
                var xs = _.zip(route.routeParts, urlParts);

                var _matchRoutePart = function(x) {
                    if (x[1].match(x[0].regex)) {
                        if (x[0].id) {
                            params[x[0].id] = x[1];
                        }
                        return true;
                    }
                };
                
                return _(xs).chain()
                    .map(_matchRoutePart)
                    .all(_.identity);
            };
            
            var route = _(this._routes)
                .chain()
                .find(_matchRoute)
                .value();
            
            if (route) {
                route.action(params);
            }
        }
    }

};