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