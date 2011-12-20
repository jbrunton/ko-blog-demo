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
    parseDate: function(value) {
        return $.datepicker.parseDate('dd M, yy', value);
    },
    formatDate: function(value) {
        return $.datepicker.formatDate('dd M, yy', value);
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