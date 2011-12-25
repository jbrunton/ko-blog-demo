var ContainerViewModel = function() {
    util.ko.define(this, {
        properties: {
            currentView: null
        },
        arrayProperties: {
            items: []
        }
    });
};

ContainerViewModel.prototype.push = function(tmplId, viewModel) {
    this.items.push({
        tmplId: tmplId,
        viewModel: viewModel
    });
};
