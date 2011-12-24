var util = {
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

ko.bindingHandlers.button =
{
    init: function (element, valueAccessor)
    {
        ko.bindingHandlers.button.update(element, valueAccessor);
    },
    update: function (element, valueAccessor)
    {
        $(element).button();
        // var binding = ko.utils.unwrapObservable(valueAccessor());
        // alert("");
    }
};