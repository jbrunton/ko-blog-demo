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
    
    str: {
        removeWS: function(str) {
            return str.replace(/\s/g, "");
        }
    },
    
    serialization : {
        behavior: function(options) {
            this._compileRules = function() {
                    this.dataRules = [];
                    var self = this;
                    
                    function parseRule(rule) {
                        var clean = util.str.removeWS(rule);
                        var regex = /^(\[[\w\.]+\])?(:\w+)(<-|<>|->)?(\[[\w\.]+\])?(:\w+)?$/;
                        
                        var match = clean.match(regex);
                        
                        var _toIdent = function(token) {
                            var _ident = token;
                            if (token[0] === ":") {
                                _ident = token.slice(1, token.length);
                            };
                            return _ident;
                        };
                        
                        var _toFunc = function(ident) {
                            if (ident.match(/^\[([\w\.])+\]$/)) {
                                var expr = ident.slice(1, ident.length - 1);
                                return eval(expr);
                            }
                        };

                        var _parseMatch = function(match) {
                        
                            var AST = {
                                objConv: match[1],
                                objField: match[2],
                                op: match[3],
                                dataConv: match[4],
                                dataField: match[5]
                            };
                            
                            if (!AST.op) {
                                AST.op = "<>";
                                AST.dataField = AST.objField;
                            }

                            return AST;
                        };
                        
                        var _compileAST = function(AST) {
                            var objIdent = _toIdent(AST.objField);
                            var dataIdent = _toIdent(AST.dataField);
                            var rule = { name: AST.objField };
                            
                            if (_.include(["<>", "->"], AST.op)) {
                                rule.toData = function(data) {
                                    var conv = AST.objConv
                                        ? _toFunc(AST.objConv)
                                        : _.identity;
                                    data[dataIdent] = conv(self[objIdent]());
                                };
                            }
                            
                            if (_.include(["<>", "<-"], AST.op)) {
                                rule.fromData = function(data) {
                                    var conv = AST.dataConv
                                        ? _toFunc(AST.dataConv)
                                        : _.identity;
                                    self[objIdent](conv(data[dataIdent]));
                                };
                            };
                            return rule;
                        };
                        
                        if (match) {
                            var AST = _parseMatch(match);
                            var rule = _compileAST(AST);
                            self.dataRules.push(rule);
                        }
                    }
                    
                    _(options.dataRules)
                        .chain()
                        .each(parseRule);
            };
            
            this.toData = function() {
                if (!this.dataRules) {
                    this._compileRules();
                }
            
                var _apply = function(rule, data) {
                    if (rule.toData) {
                        rule.toData(data);
                    }
                };
            
                var data = {};
                _(this.dataRules)
                    .chain()
                    .each(function(rule) {
                        _apply(rule, data);
                    });
                return data;
            };
            
            this.fromData = function(data) {
                if (!this.dataRules) {
                    this._compileRules();
                }
            
                var _apply = function(rule, data) {
                    if (rule.fromData) {
                        rule.fromData(data);
                    }
                };
            
                _(this.dataRules)
                    .chain()
                    .each(function(rule) {
                        _apply(rule, data);
                    });
            };
            
            return this;
        }
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
                    data: this.toData(),
                    success: success,
                    error: error,
                    dataType: 'json'
                });
            };
            
            this.doUpdateReq = function(success, error) {
                $.ajax({
                    type: 'POST',
                    url: this.actionUrl("update"),
                    data: { data: this.toData() },
                    success: success,
                    error: error,
                    dataType: 'json'
                });
            };
            
            this.doDeleteReq = function(success, error) {
                $.ajax({
                    type: 'POST',
                    url: this.actionUrl("delete"),
                    data: { id: this.id() },
                    success: success,
                    error: error,
                    dataType: 'json'
                });
            };
                        
            return this;
        }
        
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
        if (!value) return null;
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
                        dlg.dialog("close");
                    },
                    Cancel: function() {
                        if (options.cancel) {
                            options.cancel();
                        }
                        dlg.dialog("close");
                    }
                }
            });            
        }
    },
    
    effects : {
        afterAdd: function(element) {
            $(element).hide().fadeIn('fast');
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
        
        map: function(routes) {
            var _addRoute = function(map) {
                // alert("_addRoute - map: " + map);
                var matches = map.trim().match(/(.*)->(.*)/);
                
                var url = matches[1].trim(),
                    action = matches[2].trim();
                    
                // alert("url: " + url + ", action: " + action);
                    
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
                
                util.nav._routes.push(route);
            };
            _(routes).chain().each(_addRoute);
        },
        
        history: {},
        
        to: function(url) {
            var urlParts = url.split("/");
            
            var params = {};
                
            var _matchRoute = function(route) {
                if (route.routeParts.length != urlParts.length) {
                    return false;
                }
                
                var xs = _.zip(route.routeParts, urlParts);
                
                var _matchRoutePart = function(x) {
                    if (x[1].match(x[0].regex)) {
                        if (x[0].id) {
                            params[x[0].id] = x[1];
                        }
                        return true;
                    }
                    
                    return false;
                };
                
                var match = _(xs).chain()
                    .map(_matchRoutePart)
                    .all(_.identity)
                    .value();
                
                return match;
            };
            
            var route = _(this._routes)
                .chain()
                .find(_matchRoute)
                .value();
            
            if (route) {
                history.pushState(util.nav.history, url, url);
                route.action(params);
            }
        },
        
        view: function(tmplId, viewModel) {
            var currentItems = $('.slider .slider-item');

            $('.slider-tray').append($(
                "<div class='slider-item'><div data-bind='template: \""
                + tmplId
                + "\"'></div></div>"
            ));
            
            var newItem = $('.slider .slider-item').last();            
            ko.applyBindings(viewModel, newItem[0]); 
            
            if (currentItems.length) {
                currentItems.animate({ left: '-=800px', opacity: 0 }, 500, function() {
                    currentItems.remove();
                });
                newItem.css('opacity', '0').animate({ left: '-=800px', opacity: 1.0 }, 500, function() {
                    newItem.css('left', '0');
                });
            }
        }
    }

};