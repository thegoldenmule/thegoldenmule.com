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

function Timeline(url, feedPath) {
    this.rect;
    this.entries = [];
    this.positions = [];
    this.links = [];
    this.allKeys = [];
    this.path;
    this.paper;
    this.disableInput = false;

    this.width = 1000;
    this.height = 600;
    this.twidth = 50;
    this.perPage = 17;
    this.currentPage = -1;

    this.feed = new google.feeds.Feed(feedPath);

    var that = this;
    this.feed.setNumEntries(10000);
    this.feed.load(function(result) {
        if (!result.error) {
            that.entries = result.feed.entries;

            that.paper = Raphael('content', that.width, that.height);
            that.rect = that.paper.rect(0, 0, that.width, that.height, 50).attr({fill:'#111', stroke:'none'});

            // next button
            that.paper
                .path('M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z')
                .attr({
                    fill : '#FFF'
                })
                .transform('T' + (that.width - that.twidth) + ',' + (that.height / 2))
                .click(function(){
                    if (that.disableInput) {
                        return;
                    }

                    that.showPage(that.currentPage + 1);
                });

            // previous button
            that.paper
                .path('M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z')
                .attr({
                    fill : '#FFF'
                })
                .transform('T' + that.twidth / 2 + ',' + (that.height / 2))
                .click(function(){
                    if (that.disableInput) {
                        return;
                    }

                    that.showPage(that.currentPage - 1);
                });

            // create keys
            that.allKeys = [];
            for (var i = 0, len = that.entries.length; i < len; i++) {
                that.allKeys.push({
                    title:that.entries[i].title,
                    link:that.entries[i].link
                });
            }
            
            that.showPage(0);
        }
    });
}

Timeline.prototype.showPage = function(page) {

    var that = this;
    function transitionOut() {
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
        var animation = Raphael.animation({"opacity" : 0}, tweenMS, callback);
        for (var i = 0, len = that.links.length; i < len; i++) {
            var delayedAnimation = animation.delay(i * delayMS);
            that.links[i].circle.stop().animate(delayedAnimation);
            that.links[i].title.stop().animate(delayedAnimation);
        }

        that.path.stop().animate(animation);
    }

    function transitionIn() {
        that.currentPage = page;

        that.setKeys(that.allKeys.slice(
            that.currentPage * that.perPage,
            (that.currentPage + 1) * that.perPage
        ));
    }

    var numPages = Math.ceil(this.allKeys.length / this.perPage);
    page = page < 0 ? 0 : page > numPages ? numPages : page;

    if (page === this.currentPage) {
        return;
    }

    this.disableInput = true;

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
        font: '18px Helvetica',
        opacity: 0.5
    };

    this.positions = [];
    this.links = [];

    for (var i = 0, len = keys.length; i < len; i++) {
        var x = ((i + 2) * this.twidth);

        var title = this.paper.text(0, 0, keys[i].title)
            .attr(attr)
            .attr(
            {
                fill: '#FFF',
                transform: 'R-90' + 'T' + x + ',' + this.height / 2
            });

        var bbox = title.getBBox();
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

    var numAnimations = 0;
    var that = this;
    function callback() {
        if (++numAnimations === that.links.length) {
            that.disableInput = false;
        }
    }

    var animationDelayMS = 20;
    for (var i = 0, len = this.links.length; i < len; i++) {
        var animation = Raphael.animation({
            'opacity' : 1
        }, 500, callback);
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

    this.path.attr({
        'path' : flatPathString
    });
    this.path.animate({
        "path" : splinePathString,
        "opacity" : 1
    }, 200);
};

function initialize() {
    new Timeline('http://thegoldenmule.com/blog/', 'http://thegoldenmule.com/blog/feed/');
    //new Timeline('http://thegoldenmule.svbtle.com/', 'http://thegoldenmule.svbtle.com/feed');
}