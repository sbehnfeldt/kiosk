;(function ( global, $ ) {
    'use strict';

    var $PanelsTable;
    var $DevCheckbox;

    $PanelsTable = (function () {
        var $table;
        var publicApi;

        var init = function ( selector ) {
            $table = $( selector );
            $table.on( 'change', 'input[type=checkbox]', function () {
                $.ajax( {
                    "url" : "update.php",
                    "data": {
                        "name"   : $( this ).attr( "name" ),
                        "checked": $( this ).prop( "checked" ) ? true : false
                    },

                    "dataType": "json",
                    "success" : function () {
                        console.log( "Success" );
                    },
                    "error"   : function ( xhr ) {
                        console.log( xhr );
                        alert( "Error updating config file" );
                    }
                } );
            } );
        };

        publicApi = {
            init: init
        };
        return publicApi;
    })();

    $DevCheckbox = (function () {
        var $checkbox;
        var publicApi;

        var init = function ( selector ) {
            $checkbox = $( selector );
            $checkbox.on( 'change', function () {
                $.ajax( {
                    "url" : "update.php",
                    "data": {
                        "name"   : $( this ).attr( "name" ),
                        "checked": $( this ).prop( "checked" ) ? true : false
                    },

                    "dataType": "json",
                    "success" : function ( json ) {
                        console.log( json );
                        console.log( "Success" );
                    },
                    "error"   : function ( xhr ) {
                        console.log( xhr );
                        alert( "Error updating config file" );
                    }
                } );
            } );
        };

        publicApi = {
            init: init
        };

        return publicApi;
    })();


    // Document on-load handler
    $( function () {
        $PanelsTable.init( '#updatePanelsConfig' );
        $DevCheckbox.init( '#dev' );
    } );

})( this, jQuery );
