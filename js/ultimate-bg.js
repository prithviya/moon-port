
(function($, window){
    window.c47YTIframeReady = false;
    window.c47YTPlayers = [];
    var outerDivClass = 'c47-ultimate-bg';
    function C47Exception(message)
    {
        this.name = "UltimateBackgroundException";
        this.message = message;
    }
    function perfectDimensions(element, options)
    {
        var width = element.outerWidth();
        var height = element.outerHeight();

        console.log('viewport height: ' + $(window.top).height());

        var calculatedHeight = Math.floor(width * 1/(options.ratio));
        var calculatedWidth = Math.floor(height * options.ratio);

        if (options.container == 'body')
        {
            if (options.type=='image')
            {
                var cwidth = Math.ceil($(window).height() * options.ratio);
                if (cwidth < width)
                    return [width, calculatedHeight];
                else
                    return [cwidth, $(window).height()];

            }
            if (options.type == 'youtube')
            {
                var cwidth = Math.ceil($(window).height() * options.ratio);
                if (cwidth < width)
                    return [width, calculatedHeight];
                else
                    return [cwidth, $(window).height()];

            }
        }

        console.log('height: ' + height + '------ calculated height' + calculatedHeight);
        console.log('width: ' + width + '------ calculated width' + calculatedWidth);
        var appliedWidth, appliedHeight;
        if (height >= calculatedHeight)
        {
            console.log('using original height and calculated width');
            appliedHeight = height;
            appliedWidth = calculatedWidth;
        } else if (calculatedHeight >=height)
        {
            console.log('using original width and calculated height');
            appliedWidth = width;
            appliedHeight = calculatedHeight;
        }

        return [appliedWidth, appliedHeight];

    }

    function populateYouTubeVideo(divID, videoSource, width, height)
    {
        console.log('start a new player with video ID: ' + videoSource);
        var nPlayer = new YT.Player(divID, {
            videoId: videoSource,
            width: width,
            height: height,
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'showinfo': 0,
                'loop': 1,
                'start': 0,
                'rel' : 0,
                'modestbranding': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        window.c47YTPlayers = window.c47YTPlayers || [];

        window.c47YTPlayers.push(nPlayer);
    }


    $.fn.c47bg = function(options)
    {
        var element = this;

        element.css('position', 'relative');
        var defaults = {
            ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
            mute: true,
            repeat: true,
            crop: true
            
        };
        //element.css('position', 'relative');
        options = $.extend(defaults, options);
        console.log(options);
       
        console.log('tag name: ', this.prop('tagName'));
        if (this.prop('tagName').toLowerCase === "body")
        {
            console.log('removing padding and margin in body and html');
            $('body,html').css('margin', 0);
            $('body,html').css('padding', 0);
        }


        var dimensions = perfectDimensions(element, options);
        var width = dimensions[0];
        var height = dimensions[1];

        /**
         * Create a random ID to associate with the video/image container
         * @type {string}
         */
        var randomID = 'c47-random-' + Math.floor(Math.random() * 100000);

        
        if (options.crop && options.container != "body")
        {
            //console.log('we are cropping');
            //element.css('overflow', 'hidden');
        }

        if ( options.type == "youtube")
        {
            
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            element.find('.' + outerDivClass).remove();

            var videoPosition = options.container=='body' ?'fixed;' : 'absolute';

            videoContainer =
                '<div style="position: absolute; top: 0; left: 0; overflow: hidden; z-index: -1;" class="'+outerDivClass+'">' +
                '<div style="-webkit-backface-visibility: hidden; backface-visibility: hidden;position:'+videoPosition+';" id="'+randomID+'" ></div>' +
                '</div>';
            element.prepend(videoContainer);

            var checkIframeReady = setInterval(function(){
                if (window.c47YTIframeReady)
                {
                    clearInterval(checkIframeReady);
                    populateYouTubeVideo(randomID, options.source, width, height);
                }

            }, 10);

            window.onYouTubeIframeAPIReady = function() {
                window.c47YTIframeReady = true;
            };

            window.onPlayerReady = function(event)
            {
                event.target.playVideo();
                if(options.mute) {
                    event.target.mute();
                }
            };

            window.onPlayerStateChange = function(state)
            {
                if (state.data === 0 && options.repeat) {

                    console.log('ok to repeat', window.c47YTPlayers.length);
                    for (var i =0 ; i < window.c47YTPlayers.length; i++)
                    {
                        console.log(window.c47YTPlayers[i].getPlayerState());
                        if (window.c47YTPlayers[i].getPlayerState() == 0)
                            window.c47YTPlayers[i].seekTo(0);
                    }
                }
            }


        } else if (options.type == "self-hosted")
        {
         
            if (typeof options.source != "object")
                throw new C47Exception('The source property needs to be an object. Please go to https://github.com/datmt/ultimate-background for documentation');

            var source = options.source;


            var poster = '', mp4Source = '', ogvSource = '', webmSource = '';

            if (typeof options.poster != "undefined")
                poster = options.poster;

            if (typeof source.mp4 != "undefined")
                mp4Source = '<source src="'+source.mp4+'" type="video/mp4">';

            if (typeof source.ogv != "undefined")
                ogvSource = '<source src="'+source.ogv+'" type="video/ogg">';

            if (typeof source.webm != "undefined")
                webmSource = '<source src="'+source.webm+'" type="video/webm">';


            if (mp4Source == ogvSource == webmSource == '')
                throw new C47Exception('Please provide at least one video source');

            var videoContainer =
                '<div class="'+outerDivClass+'" style="z-index: -1; position: absolute; top: 0; left: 0; overflow: hidden;">'+
                '<video  autoplay="1" loop="1" muted="1" id="'+randomID+'" height="'+height+'" width="'+width+'" poster="'+poster+'" >'+
                mp4Source + ogvSource + webmSource +
                'Your browser doesn\'t support HTML5 video tag.'+
                '</video>'+
                '</div>';

            element.prepend(videoContainer);
        } else if (options.type == "image")
        {
            var position = options.container == "body" ? "fixed" : "absolute";
            var imageContainer =
                '<div style="position: absolute; top: 0; left: 0; z-index: -1;" class="'+outerDivClass+'">' +
                '<img style="position: '+position+'; top: 0; left: 0;" id="'+randomID+'" src="'+options.source+'" />' +
                '</div>';

            element.prepend(imageContainer);

        }
       
        $(function(){

          
            var backgroundDiv = $('.' + outerDivClass);

            
            var overlayClass = typeof options.overlayClass == "undefined" ? "b1" :  options.overlayClass;

            var overlayPosition = options.container == "body" ? "fixed" : "absolute";
            if (backgroundDiv.find('.c47-overlay').length ==0)
                backgroundDiv.append('<div class="c47-overlay '+overlayClass+'" style="position: '+overlayPosition+'; padding: 0; margin: 0; top: 0; bottom: 0; right: 0; left: 0; width: '+width+'px; height: '+height+'px; z-index: 100;"></div>');


            try
            {
                $('.c47-overlay').addEventListener('touchmove', function(e) {

                    e.preventDefault();

                }, false);

                backgroundDiv.addEventListener('touchmove', function(e) {

                    e.preventDefault();

                }, false);
            } catch (e)
            {

            }

            $(window).bind('resize orientationchange', function(){

                console.log('resizing bg...;');
                var dimensions = perfectDimensions($(this), options);

                var appliedWidth = dimensions[0];
                var appliedHeight = dimensions[1];

                var bg;
                var outerDiv = $(element).find('.'+outerDivClass).first();
                outerDiv.css('height', $(element).outerHeight());
                outerDiv.css('width', '100%');

                if (options.type == 'youtube')
                {
                    bg = outerDiv.find('iframe').first();
                    bg.attr('width', appliedWidth);
                    bg.attr('height', appliedHeight);
                    bg.css('top', 0);
                    bg.css('left', 0);

                } else if (options.type == 'image')
                {
                    bg = outerDiv.find('img').first();
                    bg.css('width', appliedWidth + 'px');
                    bg.css('height', appliedHeight + 'px');

                    var marginLeft = appliedWidth/2 - $(window).width()/2;

                    if (marginLeft > 0 && $(window).height()/$(window).width() >1.4)
                    {
                        bg.css('margin-left', '-'+marginLeft+'px');
                    } else
                    {
                        bg.css('margin-left', '0');
                    }

                } else if (options.type == 'self-hosted')
                {
                    bg =outerDiv.find('video');
                    bg.attr('width', appliedWidth);
                    bg.attr('height', appliedHeight);
                }

                bg.siblings('.c47-overlay').css('width', appliedWidth + 'px');
                bg.siblings('.c47-overlay').css('height', appliedHeight + 'px');

            });

            $(function(){
                console.log('triggering rezie manually');
                $(element).trigger('resize');
            });

        });

        return this;
    };


}(jQuery, window));
