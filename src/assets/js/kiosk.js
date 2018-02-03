;(function ( global, $ ) {
    'use strict';

    var FeedItems = [];


    var feedTimeout     = 10000;   // Number of milliseconds to retrieve the RSS feed
    var itemTimeout     = 10000;   // Number of milliseconds to retrieve an item
    var nextItemTimeout = 5000;    // Number of milliseconds to pause between gallery images or announcements
    var fade            = 400;

    var $Updates;   // The section of the kiosk containing the daily updates
    $Updates = $( 'div#updates' );   //

    var $UpdatePanels;   // The set of all update
    $UpdatePanels = $Updates.find( 'div.panel' );

    $( document ).ready( function () {

        // Show or hide updates when the update title is clicked
        $( 'div#updates div.panel-heading' ).on( 'click', function ( event ) {
            if ( $( 'body' ).width() < 768 ) {
                if ( $( this ).closest( 'div.panel' ).find( 'div.panel-body p' ).is( ':visible' ) ) {
                    $( this ).closest( 'div.panel' ).find( 'div.panel-body p' ).hide( 400 );
                } else {
                    $( 'div#updates div.panel-body p:visible' ).hide( 400 );
                    $( this ).closest( 'div.panel' ).find( 'div.panel-body p' ).show( 400 );
                }
            }
        } );

        $( 'div#updates div.panel-heading' ).on( 'click', function ( event ) {
        } );

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
                url     : 'manage_gallery.php',
                type    : 'post',
                data    : 'rotate=&img=' + imgName + '&degrees=' + $( this ).data( 'degrees' ),
                dataType: 'json',
                success : function ( json, textStatus, jqXHR ) {
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
                error   : function ( jqXHR, textStatus, errorThrown ) {
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
                url     : 'manage_gallery.php',
                type    : 'post',
                data    : 'delete=&img=' + imgName,
                dataType: 'json',
                success : function ( json, textStatus, jqXHR ) {
                    if ( json.error ) {
                        alert( 'error: ' + json.message );
                    } else {
                        $( '#manageImageModal' ).modal( 'hide' );
                        getThumbnails();
                        $( '#manageImageModal button' ).prop( 'disabled', false );
                    }
                },
                error   : function ( jqXHR, textStatus, errorThrown ) {
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


        if ( typeof dev == 'undefined' ) {
            getFeed( 'http://www.camelotschool.net/feed' );   // Comment out during development
        } else {
            getDevFeed();   // Comment out during pre-production and production
        }
        getThumbnails();
        nextImage( 0 );
        tick();
    } );


// Check whether all the "needles" are found in the "haystack"
    function match_categories( $categories, tags ) {
        for ( var i = 0; i < $categories.length; i++ ) {
            //var idx = tags.indexOf($categories.eq(i).text().toLowerCase());
            var temp = $categories.eq( i ).text().toLowerCase();
            var idx  = tags.indexOf( temp );
            if ( -1 != idx ) {
                tags.splice( idx, 1 );
                if ( 0 == tags.length ) {
                    return true;
                }
            }
        }
        return false;
    }


// Search through an array of items for most recent one with just the right tags.
    function searchForNewUpdate( $xml, tag, $title, $body ) {
        $xml.find( "item" ).each( function ( index, element ) {
            var $this = $( this );
            var tags  = [ 'dailies' ];
            if ( tag != 'summer' ) {
                tags.push( tag );
            }

            if ( match_categories( $this.find( 'category' ), tags ) ) {
                if ( ( null == FeedItems[ tag ] ) || ($this.find( "link" ).text() != FeedItems[ tag ].link ) ) {
                    console.log( new Date() + ": Found new " + tag + " update." );

                    // Copied from some place else; not really necessary to save all of this info?
                    FeedItems[ tag ] = {
                        title      : $this.find( "title" ).text(),
                        link       : $this.find( "link" ).text(),
                        description: $this.find( "description" ).text(),
                        categories : $this.find( "category" ),
                        pubDate    : $this.find( "pubDate" ).text(),
                        author     : $this.find( "author" ).length,
                        content    : $this.find( "content\\:encoded" )
                    };
                    $title.empty().text( FeedItems[ tag ].title );
                    fetchItem( FeedItems[ tag ].link, $body );
                }
                return false;   // Break out of .each( ) loop
            }
            return true;   // Did not find a match for the categories, so continue the .each( ) loop
        } );
    }


// Dev-only: Simulate getting a feed without actually doing so, so as to not distort the web site stats
    function getDevFeed() {
        var lorem   = new Lorem;
        lorem.type  = Lorem.TEXT;
        lorem.query = '1p';

        $UpdatePanels.each( function ( index, element ) {
            setTimeout( function () {
                $( element ).find( '.panel-body p' ).html( lorem.createLorem() );
                scaleUpdates();
            }, 2000 * (index + 1) );
        } );
        return;
    }


// Update the page with the most recent ABC and Pre-K updates
    function getFeed( rssurl ) {
        console.log( new Date() + ": Getting RSS feed: " + rssurl );
        $.ajax( {
            url     : 'proxy.php?url=' + rssurl,
            type    : 'get',
            dataType: 'xml',
            timeout : feedTimeout,

            success: function ( data, textStatus, jqXHR ) {
                console.log( new Date() + ": RSS feed retrieved" );
                $UpdatePanels.each( function ( index, element ) {
                    var $tag     = $( element ).data( 'tag' ).toString();
                    var $title   = $( element ).find( 'div.panel-heading h4' );
                    var $content = $( element ).find( 'div.panel-body p' )
                    searchForNewUpdate( $( data ), $tag, $title, $content );
                } );

                //setTimeout(function () {
                //    getFeed(rssurl);
                //}, 300000);
            },

            error: function ( jqXHR, textStatus, errorThrown ) {
                console.log( new Date() + ' ERROR: ' + errorThrown );
                feedTimeout += 5000;   // Wait 5 seconds longer next time
                getFeed( rssurl );
            }
        } );
        return;
    }


// Retrieve the specified URL and place the content in the specified (local) element
    function fetchItem( url, element ) {
        console.log( 'Fetching item: ' + url );
        $.ajax( 'proxy.php?url=' + url, {
            type: 'get',

            dataType: 'html',
            timeout : itemTimeout,
            success : function ( html, textStatus, jqXHR ) {
                //console.log( html );
                var $section = $( html ).find( 'section.entry-content' );
                element.empty().append( $section );
                scaleUpdates();
            },
            error   : function ( jqXHR, textStatus, errorThrown ) {
                console.log( 'error: ' + errorThrown );
                element.text( "error: " + errorThrown );
                fetchItem( url, element );
            }
        } );
    }


    function scaleUpdates() {
        // Don't scale if the updates are hidden (ie, small devices)
        if ( $( 'div#updates div.panel-body p:visible' ).length == 0 ) {
            return;
        }
        var max      // Height of the content container; set in CSS file
        var height;  // Height of the content; must be calculated
        max    = $( 'div#updates' ).height();
        height = $( 'div#updates h2' ).height();
        $( 'div#updates div.panel' ).each( function ( index, element ) {
            height = height + $( this ).height();
        } )

        // Scale up
        while ( height < max ) {
            var h1 = parseFloat( $( 'div#updates div.panel-body p' ).css( 'font-size' ) );
            h      = h1 + 1;
            h      = h + 'px';
            $( 'div#updates div.panel-body p' ).css( 'font-size', h );
            height = $( 'div#updates h2' ).height();
            $( 'div#updates div.panel' ).each( function ( index, element ) {
                height = height + $( this ).height();
            } )
        }

        // Scale down
        while ( height > .98 * max ) {
            var h = parseFloat( $( 'div#updates div.panel-body p' ).css( 'font-size' ) );
            h     = h - 1;
            h     = h + 'px';
            $( 'div#updates div.panel-body p' ).css( 'font-size', h );
            height = $( 'div#updates h2' ).height();
            $( 'div#updates div.panel' ).each( function ( index, element ) {
                height = height + $( this ).height();
            } )
        }

        return;
    }


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
            url     : 'getThumbnails.php',
            type    : 'get',
            data    : '',
            dataType: 'json',
            success : function ( json, textStatus, jqXHR ) {
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
            error   : function ( jqXHR, textStatus, errorThrown ) {
            }
        } );

    }


// Display in the Gallery section the next picture
    function nextImage( frame ) {
        //console.log( "Next image" );
        if ( $( 'body' ).width() >= 600 ) {

            $.ajax( 'getPicture.php', {
                'type'  : 'get',
                'data'  : '',
                dataType: 'json',
                success : function ( json, textStatus, jqXHR ) {
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

                        //if (frame < 4) {
                        //    setTimeout(function () {
                        //        nextImage(frame)
                        //    }, nextItemTimeout);
                        //} else {
                        //    setTimeout(nextAnnouncement, nextItemTimeout);
                        //}
                    }
                    setTimeout( function () {
                        nextImage( frame % 4 )
                    }, nextItemTimeout );
                },
                error   : function ( jqXHR, textStatus, errorThrown ) {
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

        $.ajax( 'get', {
            'type': 'get',
            'data': 'announcement',

            'dataType': 'json',
            success   : function ( json, textStatus, jqXHR ) {
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
            error     : function ( jqXHR, textStatus, errorThrown ) {
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

