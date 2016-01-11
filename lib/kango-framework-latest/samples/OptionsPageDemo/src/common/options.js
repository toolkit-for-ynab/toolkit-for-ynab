var StorageTest = {

    init: function() {
        $('#storage-get').click(function(event) {
            StorageTest.testGet();
        });

        $('#storage-set').click(function(event) {
            StorageTest.testSet();
        });

        $('#storage-remove').click(function(event) {
            StorageTest.testRemove();
        });

        $('#storage-keys').click(function(event) {
            StorageTest.testKeys();
        });
    },

    testGet: function() {
        kango.invokeAsync('kango.storage.getItem', $('#storage-key').val(), function(value) {
            $('#storage-value').val(value || 'null');
        });
    },

    testSet: function() {
        kango.invokeAsync('kango.storage.setItem', $('#storage-key').val(), $('#storage-value').val());
    },

    testRemove: function() {
        kango.invokeAsync('kango.storage.removeItem', $('#storage-key').val(), function() {
            $('#storage-value').val('null');
        });
    },

    testKeys: function() {
        kango.invokeAsync('kango.storage.getKeys', function(keys) {
            $('#storage-value').val(keys.toString());
        });
    }
};

KangoAPI.onReady(function() {
    $('#ready').show();
    $('#not-ready').hide();

    $('#close').click(function(event) {
        KangoAPI.closeWindow()
    });

    StorageTest.init();
});