;(function(global, $) {
    'use strict';

    var $PanelsTable;

    $PanelsTable = (function(){
        var $table;
        var publicApi;

        var init = function(selector) {
            $table = $(selector);
            $table.on('change', 'input[type=checkbox]', function() {
                $.ajax({
                    "url" : "update.php",
                    "data" : {
                        "name" : $(this).attr( "name" ),
                        "checked" : $(this).prop("checked") ? true : false
                    },

                    "dataType" : "json",
                    "success" : function() {
                        alert("Success" );
                    },
                    "error": function() {
                        alert("error");
                    }
                });
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