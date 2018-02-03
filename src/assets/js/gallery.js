;(function ( global, $ ) {
    'use strict';

    var fade            = 400;
    var nextItemTimeout = 5000;    // Number of milliseconds to pause between gallery images or announcements
    $( document ).ready( function () {

        // When an image is loaded, center it
        $( '.img-frame img' ).on( 'load', function () {
            centerImage( this );
        } );

        // When an image in the gallery is clicked, load that image into the Manage Gallery Image modal
        $( '#gallery .img-frame img' ).on( 'click', function () {
            $( '#modalImg' ).attr( 'src', $( this ).attr( 'src' ) );
        } );

        // When a thumbnail image is clicked, load the corresponding gallery image into the Manage Gallery Image modal
        $( '#thumbnails' ).on( 'click', 'img', function () {
            $( '#modalImg' ).attr( 'src', $( this ).attr( 'src' ).replace( 'thumbs/', '' ) );
        } );

        // When the browser is resized, re-center all of the images
        $( window ).on( 'resize', function ( e ) {
            $( '.img-frame img' ).each( function ( index, element ) {
                centerImage( element );
            } );
        } );

        $( 'button#clockwise' ).data( 'degrees', 90 );
        $( 'button#counterclockwise' ).data( 'degrees', -90 );
        $( 'button#clockwise, button#counterclockwise' ).on( 'click', function () {
            $( '#manageImageModal button' ).prop( 'disabled', true );
            var pathinfo = $( '#modalImg' ).attr( 'src' ).split( '/' );
            var imgName  = pathinfo.pop().split( '?' ).shift();
            $.ajax( {
                'url' : 'manage_gallery.php',
                'type': 'post',
                'data': 'rotate=&img=' + imgName + '&degrees=' + $( this ).data( 'degrees' ),

                'dataType': 'json',
                'success' : function ( json, textStatus, jqXHR ) {
                    if ( json.error ) {
                        alert( 'Failure: ' + json.message );
                    } else {
                        // Reload rotated image into the modal, the gallery (if necessary) and thumbnail
                        var d          = new Date();
                        var newImgName = pathinfo.join( '/' ) + '/' + imgName + '?' + d.getTime();
                        $( '#modalImg' ).attr( 'src', newImgName );   // Reload new image in the modal dialog
                        $( '#gallery .img-frame img' ).each( function ( index, img ) {
                            if ( imgName == $( img ).attr( 'src' ).split( '/' ).pop().split( '?' ).shift() ) {
                                $( img ).attr( 'src', newImgName );
                                return false;
                            }
                            return true;
                        } );

                        $( '#thumbnails img' ).each( function ( index, img ) {
                            if ( imgName == $( img ).attr( 'src' ).split( '/' ).pop().split( '?' ).shift() ) {
                                newImgName = pathinfo.join( '/' ) + '/thumbs/' + imgName + '?' + d.getTime();
                                $( img ).attr( 'src', newImgName );
                                return false;
                            }
                            return true;
                        } );
                    }
                    $( '#manageImageModal button' ).prop( 'disabled', false );
                },
                'error'   : function ( jqXHR, textStatus, errorThrown ) {
                    console.log( 'error: ' + errorThrown );
                    alert( 'error: ' + errorThrown );
                    $( '#manageImageModal button' ).prop( 'disabled', false );
                }
            } );
        } );

        $( '#manageImageModal button#delete' ).on( 'click', function () {
            if ( false == confirm( "Are you sure you want to delete this image from the kiosk?" ) ) {
                return;
            }

            $( '#manageImageModal button' ).prop( 'disabled', true );
            var pathinfo = $( '#modalImg' ).attr( 'src' ).split( '/' );
            var imgName  = pathinfo.pop().split( '?' ).shift();
            $.ajax( {
                'url' : 'manage_gallery.php',
                'type': 'post',
                'data': 'delete=&img=' + imgName,

                'dataType': 'json',
                'success' : function ( json, textStatus, jqXHR ) {
                    if ( json.error ) {
                        alert( 'error: ' + json.message );
                    } else {
                        $( '#manageImageModal' ).modal( 'hide' );
                        getThumbnails();
                        $( '#manageImageModal button' ).prop( 'disabled', false );
                    }
                },
                'error'   : function ( jqXHR, textStatus, errorThrown ) {
                    console.log( 'error: ' + errorThrown );
                    alert( 'error: ' + errorThrown );
                    $( '#manageImageModal button' ).prop( 'disabled', false );
                }
            } );
        } );

        $( '.scroll-left' ).on( 'click', function () {
            $( '#thumbnails' ).prepend( $( '#thumbnails img:last' ).closest( 'a' ).detach() );
        } );
        $( '.scroll-right' ).on( 'click', function () {
            $( '#thumbnails' ).append( $( '#thumbnails img:first' ).closest( 'a' ).detach() );
        } );


        getThumbnails();
        nextImage( 0 );
        tick();
    } );


    /******************************************************************************************
     * Gallery and Announcements
     ******************************************************************************************/

    function displayImages() {
        //console.log( "Displaying images" );
        $( 'div#gallery h1 span' ).fadeTo( fade, 0, function () {
            $( this ).text( 'Gallery' );
            $( this ).fadeTo( fade, 1 );
        } );

        $( 'div#announcement' ).fadeOut( fade, function () {
            $( 'div#images' ).fadeIn( fade, function () {
                setTimeout( function () {
                    nextImage( 0 );
                }, nextItemTimeout );
            } );
        } );
    }


    function getThumbnails() {
        //console.log( new Date( ) + ": Getting thumbnails" );
        $.ajax( {
            'url' : 'getThumbnails.php',
            'type': 'get',
            'data': '',

            'dataType': 'json',
            'success' : function ( json, textStatus, jqXHR ) {
                if ( json.error ) {
                    alert( "Error fetching thumbnails: " + json.message );
                    console.log( "Error fetching thumbnails: " + json.message );
                } else {
                    var d = new Date();
                    $( '#thumbnails' ).empty();
                    var $a;
                    var $img;
                    for ( var i = 0; i < json.thumbs.length; i++ ) {
                        $a   = $( '<a href="#manageImageModal" data-toggle="modal">' );
                        $img = $( '<img>' ).attr( 'src', json.thumbs[ i ] + '?' + d.getTime() );
                        $a.append( $img );
                        $( '#thumbnails' ).append( $a );
                    }
                }
            },
            'error'   : function ( jqXHR, textStatus, errorThrown ) {
            }
        } );

    }


// Display in the Gallery section the next picture
    function nextImage( frame ) {
        //console.log( "Next image" );
        if ( $( 'body' ).width() >= 600 ) {

            $.ajax( {
                'url' : 'getPicture.php',
                'type': 'get',
                'data': '',

                'dataType': 'json',
                'success' : function ( json, textStatus, jqXHR ) {
                    if ( json.error ) {
                        console.log( "Error: " + json.message );
                    } else {
                        //console.log( "Success: " + json.src );
                        var $img = $( '#img' + frame );
                        $img.fadeOut( fade, function () {
                            var d = new Date();
                            $img.attr( 'src', '' );   // To ensure the onload handler fires if new source equals old source (eg, if there are 1, 2, or 4 pictures in the gallery)
                            $img.attr( 'src', json.src + "?" + d.getTime() );

                            $( '#thumbnails img.selected' ).removeClass( 'selected' );
                            var imgname = json.src.split( '/' ).pop();
                            var extent  = 0;   // Position of right edge of thumbnail

                            $( '#thumbnails img' ).each( function ( index, element ) {
                                extent = extent + element.offsetWidth;
                                if ( $( element ).attr( 'src' ).split( '/' ).pop().split( '?' ).shift() == imgname ) {
                                    $( element ).addClass( 'selected' );

                                    // Scroll thumbnails to the left to keep selected thumbnail centered
                                    while ( extent > $( '#thumbnails' )[ 0 ].offsetWidth / 2 ) {
                                        var $temp = $( '#thumbnails a' ).splice( 0, 1 );
                                        extent    = extent - $temp[ 0 ].offsetWidth;
                                        $( '#thumbnails' ).append( $temp );
                                    }
                                    return false;
                                }
                                return true;
                            } );

                            // If no thumbnail is selected, this must be a new photo added and so re-load the thumbnails
                            if ( 0 == $( '#thumbnails img.selected' ).length ) {
                                getThumbnails();
                            }
                        } );
                        frame++;
                    }
                    setTimeout( function () {
                        nextImage( frame % 4 )
                    }, nextItemTimeout );
                },
                'error'   : function ( jqXHR, textStatus, errorThrown ) {
                    console.log( textStatus + ' : ' + errorThrown );
                    frame++;
                    if ( frame < 4 ) {
                        setTimeout( function () {
                            nextImage( frame )
                        }, nextItemTimeout );
                    } else {
                        setTimeout( nextAnnouncement, nextItemTimeout );
                    }
                }
            } );
        }
    }


// Center the image in the framing div.
    function centerImage( img ) {
        //console.log( img.src.split( '/' ).pop( ).split( '?' ).shift( ) + ' - Frame width: '  + $( img ).closest( 'div.img-frame' ).width( ) + '; Image width: ' + $( img ).width( ));
        var left = ($( img ).closest( 'div.img-frame' ).width() - $( img ).width()) / 2;
        $( img ).css( 'left', left + 'px' );   // This is why images have position: relative in CSS file
        $( img ).fadeIn( fade );               // Make sure image is centered BEFORE displaying it
    }


    function displayAnnouncements( text ) {
        //console.log( "Displaying announcements" );
        $( 'div#gallery h1 span' ).fadeTo( fade, 0, function () {
            $( this ).text( 'Announcements' );
            $( this ).fadeTo( fade, 1 );
        } );

        $( '#images' ).fadeOut( fade, function () {
            $( 'div#announcement' ).empty().append( text );
            $( '#announcement' ).fadeIn( fade );

            setTimeout( function () {
                displayImages();
            }, text.length * 30 );
        } );

    }


// Display the next announcement in the Announcements panel
    function nextAnnouncement() {

        $.ajax( {
            'url' : 'get.php',
            'type': 'get',
            'data': 'announcement',

            'dataType': 'json',
            'success' : function ( json, textStatus, jqXHR ) {
                if ( json.error ) {
                    console.log( "Error: " + json.message );
                } else {
                    //console.log( "Success: " + json.src.length );
                    if ( json.src.length ) {
                        displayAnnouncements( json.src );
                    } else {
                        //console.log( "No announcements" );
                        nextImage( 0 );
                    }

                }
            },
            'error'   : function ( jqXHR, textStatus, errorThrown ) {
                console.log( textStatus + ' : ' + errorThrown );
                displayImages();
            }
        } );
    }


// Advance the clock
    function tick() {
        var daysofweek = Array( 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' );
        var months     = Array( 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' );
        var now        = new Date();
        var clock;

        clock = daysofweek[ now.getDay() ]
            + ', '
            + months[ now.getMonth() ]
            + ' '
            + now.getDate()
            + ' '
            + (now.getHours() > 12 ? now.getHours() - 12 : now.getHours() ) + ':';


        if ( now.getMinutes() < 10 ) {
            clock += '0';
        }
        clock += now.getMinutes();
        clock += ':';

        if ( now.getSeconds() < 10 ) {
            clock += '0';
        }
        clock += now.getSeconds();

        $( '#footer' ).text( clock );
        setTimeout( tick, 1000 - now.getMilliseconds() );
    }


// http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
    function getCSSRule( ruleName, deleteFlag ) {
        ruleName = ruleName.toLowerCase();
        if ( document.styleSheets ) {
            for ( var i = 0; i < document.styleSheets.length; i++ ) {
                var styleSheet = document.styleSheets[ i ];
                var ii         = 0;
                var cssRule    = false;
                do {
                    if ( styleSheet.cssRules ) {
                        // Yes --Mozilla Style
                        cssRule = styleSheet.cssRules[ ii ];
                    } else if ( styleSheet.Rules[ ii ] ) {
                        // Yes IE style.
                        cssRule = styleSheet.rules[ ii ];
                    } else {
                        return false;
                    }

                    if ( cssRule ) {
                        var ruleText;
                        if ( cssRule.selectorText ) {
                            ruleText = cssRule.selectorText;
                        } else if ( cssRule.cssText ) {
                            ruleText = cssRule.cssText;
                        } else {
                            return false;
                        }

                        if ( ruleText.toLowerCase() == ruleName ) {
                            if ( deleteFlag == 'delete' ) {
                                if ( styleSheet.cssRules ) {
                                    styleSheet.deleteRule( ii );
                                } else {
                                    styleSheet.removeRule( ii );
                                }
                                return true;
                            } else {
                                return cssRule;
                            }
                        }
                    }
                    ii++;
                } while ( cssRule )
            }
        }
        return false;
    }


// Delete a CSS rule
    function killCSSRule( ruleName ) {
        return getCSSRule( ruleName, 'delete' );
    }


// Create a new css rule
    function addCSSRule( ruleName ) {
        if ( document.styleSheets ) {                            // Can browser do styleSheets?
            if ( !getCSSRule( ruleName ) ) {                        // if rule doesn't exist...
                if ( document.styleSheets[ 0 ].addRule ) {           // Browser is IE?
                    document.styleSheets[ 0 ].addRule( ruleName, null, 0 );      // Yes, add IE style
                } else {                                         // Browser is IE?
                    document.styleSheets[ 0 ].insertRule( ruleName + ' { }', 0 ); // Yes, add Moz style.
                }                                                // End browser check
            }                                                   // End already exist check.
        }                                                      // End browser ability check.
        return getCSSRule( ruleName );                           // return rule we just created.
    }
})( this, jQuery );

