(function ( global, $ ) {
    'use strict';

    var FeedItems   = [];
    var feedTimeout = 10000;   // Number of milliseconds to retrieve the RSS feed
    var itemTimeout = 10000;   // Number of milliseconds to retrieve an item

    var $Updates;   // The section of the kiosk containing the daily updates
    $Updates = $( 'div#updates' );   //

    var $UpdatePanels;   // The set of all update
    $UpdatePanels = $Updates.find( 'div.panel' );


    /**
     *  Update the page with the most recent ABC and Pre-K updates
     */
    function getFeed( rssurl ) {
        console.log( new Date() + ": Getting RSS feed: " + rssurl );
        $.ajax( {
            'url'    : 'proxy.php?url=' + rssurl,
            'type'   : 'get',
            'timeout': feedTimeout,

            'dataType': 'xml',
            'success' : function ( xml ) {
                console.log( new Date() + ": RSS feed retrieved" );
                $UpdatePanels.each( function ( index, element ) {
                    var $tag     = $( element ).data( 'tag' ).toString();
                    var $title   = $( element ).find( 'div.panel-heading h4' );
                    var $content = $( element ).find( 'div.panel-body p' )
                    searchForNewUpdate( $( xml ), $tag, $title, $content );
                } );
            },
            'error'   : function ( jqXHR, textStatus, errorThrown ) {
                console.log( new Date() + ' ERROR: ' + errorThrown );
                feedTimeout += 5000;   // Wait 5 seconds longer next time
                getFeed( rssurl );
            }
        } );
    }


    /**
     * Search through an array of items for most recent one with just the right tags.
     */
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


    /**
     * Check whether all the "tags" are found in the "$categories"
     *
     * @param $categories
     * @param tags
     * @returns {boolean}
     */
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


    /**
     * Retrieve the specified URL and place the content in the specified (local) element
     */
    function fetchItem( url, element ) {
        console.log( 'Fetching item: ' + url );
        $.ajax( {
            'url'    : 'proxy.php?url=' + url,
            'type'   : 'get',
            'timeout': itemTimeout,

            'dataType': 'html',
            'success' : function ( html ) {
                //console.log( html );
                var $section = $( html ).find( 'section.entry-content' );
                element.empty().append( $section );
                scaleUpdates();
            },
            'error'   : function ( jqXHR, textStatus, errorThrown ) {
                console.log( 'error: ' + errorThrown );
                element.text( "error: " + errorThrown );
                fetchItem( url, element );
            }
        } );
    }

    /**
     *
     */
    function toggleUpdatePanel() {
        if ( $( 'body' ).width() < 768 ) {
            if ( $( this ).closest( 'div.panel' ).find( 'div.panel-body p' ).is( ':visible' ) ) {
                $( this ).closest( 'div.panel' ).find( 'div.panel-body p' ).hide( 400 );
            } else {
                $( 'div#updates div.panel-body p:visible' ).hide( 400 );
                $( this ).closest( 'div.panel' ).find( 'div.panel-body p' ).show( 400 );
            }
        }
    }


    /**
     *
     */
    function scaleUpdates() {
        // Don't scale if the updates are hidden (ie, small devices)
        if ( $( 'div#updates div.panel-body p:visible' ).length == 0 ) {
            return;
        }
        var max;     // Height of the content container; set in CSS file
        var height;  // Height of the content; must be calculated
        max    = $( 'div#updates' ).height();
        height = $( 'div#updates h2' ).height();
        $( 'div#updates div.panel' ).each( function ( index, element ) {
            height = height + $( this ).height();
        } );

        // Scale up
        while ( height < max ) {
            var h1 = parseFloat( $( 'div#updates div.panel-body p' ).css( 'font-size' ) );
            h      = h1 + 1;
            h      = h + 'px';
            $( 'div#updates div.panel-body p' ).css( 'font-size', h );
            height = $( 'div#updates h2' ).height();
            $( 'div#updates div.panel' ).each( function ( index, element ) {
                height = height + $( this ).height();
            } );
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
            } );
        }
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


    /********************************************************************************
     * Document on-ready handler
     ********************************************************************************/
    $( document ).ready( function () {
        $Updates.on( 'click', 'div.panel-heading', toggleUpdatePanel );

        if ( typeof dev == 'undefined' ) {
            getFeed( 'http://www.camelotschool.net/feed' );   // Comment out during development
        } else {
            getDevFeed();   // Comment out during pre-production and production
        }
    } );
})( this, jQuery );
