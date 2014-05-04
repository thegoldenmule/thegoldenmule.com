/**
 * Author: thegoldenmule
 * Date: 5/2/14
 */

'use strict';

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

(function(global) {

    function formatTitle(title) {
        if (title.length > 45) {
            return title.slice(0, 45) + "...";
        }

        return title;
    }

    function Timeline(url, feedPath) {
        this.rect;
        this.entries = [];
        this.positions = [];
        this.links = [];
        this.allKeys = [];
        this.path;
        this.paper;

        this.width = 1000;
        this.height = 600;
        this.twidth = 50;
        this.perPage = 17;
        this.currentPage = -1;
        this.transitioningOut = false;

        this.feed = new google.feeds.Feed(feedPath);

        this.feed.setNumEntries(10000);

        var that = this;
        this.feed.load(function(result) {
            that.onFeedLoaded(result);
        });
    }

    Timeline.prototype.onFeedLoaded = function(result) {
        if (result.error) {
            return;
        }

        this.entries = result.feed.entries;

        this.paper = Raphael('content', this.width, this.height);
        this.rect = this.paper.rect(0, 0, this.width, this.height, 50).attr({fill:'#111', stroke:'none'});

        var that = this;

        // next button
        var animateMS = 50;
        var next = this.paper
            .path('M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z')
            .attr({
                fill : '#FFF'
            })
            .transform('T' + (this.width - this.twidth) + ',' + (this.height / 2))
            .click(function(){
                that.showPage(that.currentPage + 1);
            });

        // previous button
        var previous = this.paper
            .path('M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z')
            .attr({
                fill : '#FFF'
            })
            .transform('T' + this.twidth / 2 + ',' + (this.height / 2))
            .click(function(){
                that.showPage(that.currentPage - 1);
            });

        // down button
        var down = this.paper
            .path('M8.037,11.166L14.5,22.359c0.825,1.43,2.175,1.43,3,0l6.463-11.194c0.826-1.429,0.15-2.598-1.5-2.598H9.537C7.886,8.568,7.211,9.737,8.037,11.166z')
            .attr({
                fill : '#FFF'
            })
            .transform('T' + this.width / 2 + ',' + (this.height - this.twidth))
            .click(function() {
                window.scroll(0, 600);
            });

        // create keys
        this.allKeys = [];
        for (var i = 0, len = this.entries.length; i < len; i++) {
            this.allKeys.push({
                title:this.entries[i].title,
                link:this.entries[i].link
            });
        }

        this.showPage(0);
    };

    Timeline.prototype.showPage = function(page) {
        if (this.transitioningOut) {
            return;
        }

        var that = this;
        function transitionOut() {
            that.transitioningOut = true;

            var numCalls = 0;
            function callback() {
                if (++numCalls === that.links.length + 1) {
                    // remove them all
                    for (var i = 0, len = that.links.length; i < len; i++) {
                        that.links[i].circle.remove();
                        that.links[i].title.remove();
                    }
                    that.links = [];

                    transitionIn();
                }
            }

            var tweenMS = 500;
            var delayMS = 20;
            var animation = Raphael.animation({'opacity' : 0}, tweenMS, callback);
            for (var i = 0, len = that.links.length; i < len; i++) {
                var delayedAnimation = animation.delay(i * delayMS);
                that.links[i].circle.stop().animate(delayedAnimation);
                that.links[i].title.stop().animate(delayedAnimation);
            }
        }

        function transitionIn() {
            that.transitioningOut = false;

            that.currentPage = page;

            that.setKeys(that.allKeys.slice(
                that.currentPage * that.perPage,
                (that.currentPage + 1) * that.perPage
            ));
        }

        var numPages = Math.floor(this.allKeys.length / this.perPage);
        page = page < 0 ? 0 : page > numPages ? numPages : page;

        if (page === this.currentPage) {
            return;
        }

        if (-1 !== this.currentPage) {
            transitionOut();
        }
        else {
            transitionIn();
        }
    };

    Timeline.prototype.setKeys = function(keys) {
        var animateMS = 50;
        var circleRadius = 10;
        var attr = {
            font: '16px Helvetica',
            opacity: 0.5
        };

        this.positions = [];
        this.links = [];

        for (var i = 0, len = keys.length; i < len; i++) {
            var x = ((i + 2) * this.twidth);

            var title = this.paper.text(0, 0, formatTitle(keys[i].title))
                .attr(attr)
                .attr(
                {
                    fill: '#FFF',
                    transform:'R-70T' + x + ',' + this.height / 2
                });

            var bbox = title.getBBox();
            x = bbox.x;
            var position = {
                x:x,
                y:bbox.y2 + 4 * circleRadius
            };
            this.positions.push(position);

            var circle = this.paper
                .circle(position.x, position.y, circleRadius)
                .attr({
                    fill: '#FFF',
                    opacity: 0
                });

            this.links.push({
                title:title,
                circle:circle
            });

            // handlers
            var mouseOver = (function() {
                var handle = circle;
                return function() {
                    handle.stop().animate({
                        transform:'s2'
                    }, animateMS);
                };
            })();

            var mouseOut = (function() {
                var handle = circle;
                return function() {
                    handle.stop().animate({
                        transform:'s1'
                    }, animateMS);
                };
            })();

            var click = (function() {
                var key = keys[i];
                return function (){
                    window.open(key.link);
                };
            })();

            circle
                .mouseover(mouseOver)
                .mouseout(mouseOut)
                .click(click);
            title
                .mouseover(mouseOver)
                .mouseout(mouseOut)
                .click(click);
        }

        var animationDelayMS = 20;
        for (var i = 0, len = this.links.length; i < len; i++) {
            var animation = Raphael.animation({
                'opacity' : 1
            }, 500);
            this.links[i].circle.animate(animation.delay(i * animationDelayMS));
        }

        this.updatePath();
    };

    Timeline.prototype.updatePath = function() {
        var splinePathString = 'M' + this.positions[0].x + ',' + this.positions[0].y + 'R';
        var flatPathString = 'M' + this.positions[0].x + ',' + this.positions[0].y;
        for (var i = 1, len = this.positions.length; i < len; i++) {
            splinePathString += ' ' + this.positions[i].x + ' ' + this.positions[i].y;
            flatPathString += ' L' + this.positions[i].x + ' ' + this.height;
        }

        if (!this.path) {
            this.path = this.paper.path(flatPathString);
            this.path
                .attr({
                    'stroke' : '#FFF',
                    'stroke-width': 4,
                    'stroke-linecap' : 'round'
                })
                .insertAfter(this.rect);
        }

        this.path.animate({
            'path' : splinePathString,
            'opacity' : 1
        }, 200);
    };

    global.Timeline = Timeline;
})(this);

(function(global) {

    global.initialize = function() {
        new Main();
    }

    function Main() {
        this.timelines = [
            new Timeline('http://thegoldenmule.com/blog/', 'http://thegoldenmule.com/blog/feed/'),
            new Timeline('http://thegoldenmule.svbtle.com/', 'http://thegoldenmule.svbtle.com/feed')
        ];
    }

})(this);