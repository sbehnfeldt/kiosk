;(function(global, $) {
    'use strict';

    var $PanelsTable;

    $PanelsTable = (function(){
        var $table;
        var publicApi;

        var init = function(selector) {
            $table = $(selector);
            $table.on('change', 'input[type=checkbox]', function() {
                console.log( $(this).prop('checked'));
            });
        };

        publicApi = {
            init: init
        };
        return publicApi;
    })();


    // Document on-load handler
    $(function() {
        $PanelsTable.init('#updatePanelsConfig');
    });

})(this, jQuery);
