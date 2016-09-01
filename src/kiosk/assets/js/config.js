;(function(global, $) {
    'use strict';

    var $PanelsTable;
    var $DevCheckbox;

    $PanelsTable = (function(){
        var $table;
        var publicApi;

        var init = function(selector) {
            $table = $(selector);
            $table.on('change', 'input[type=checkbox]', function() {
                $.ajax({
                    "url" : "update",
                    "data" : {
                        "name" : $(this).attr( "name" ),
                        "checked" : $(this).prop("checked") ? true : false
                    },

                    "dataType" : "json",
                    "success" : function() {
                        console.log("Success" );
                    },
                    "error": function() {
                        alert("Error updating config file");
                    }
                });
            });
        };

        publicApi = {
            init: init
        };
        return publicApi;
    })();

    $DevCheckbox = (function() {
        var $checkbox;
        var publicApi;

        var init = function(selector) {
            $checkbox = $(selector);
            $checkbox.on('change', function() {
                console.log(this);
                console.log($(this).prop('checked'));
                $.ajax({
                    "url": "update",
                    "data": {
                        "name": $(this).attr("name"),
                        "checked": $(this).prop("checked") ? true : false
                    },

                    "dataType": "json",
                    "success": function () {
                        console.log("Success");
                    },
                    "error": function () {
                        alert("Error updating config file");
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
        $DevCheckbox.init('#dev');
    });

})(this, jQuery);
