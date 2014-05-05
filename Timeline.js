/**
 * Author: thegoldenmule
 * Date: 5/4/14
 */

(function(global) {

    'use strict';

    function formatTitle(title) {
        if (title.length > 45) {
            return title.slice(0, 45) + '...';
        }

        return title;
    }

    function addHandlers(link, key){
        var animateMS = 50;
        var circle = link.circle;
        var title = link.title;

        // handlers
        var mouseOver = function() {
            circle.stop().animate({
                transform:'s2'
            }, animateMS);
        };

        var mouseOut = function() {
            circle.stop().animate({
                transform:'s1'
            }, animateMS);
        };

        var click = function (){
            window.open(key.link);
        };

        circle
            .mouseover(mouseOver)
            .mouseout(mouseOut)
            .click(click);
        title
            .mouseover(mouseOver)
            .mouseout(mouseOut)
            .click(click);
    }

    function Timeline(paper, width, height) {
        this.paper = paper;
        this.width = width;
        this.height = height;
        this.twidth = 50;
        this.perPage = 17;

        this.positions = [];
        this.links = [];
        this.allKeys = [];

        this.model;
        this.path;

        this.currentFeed;
        this.currentFeedTitle;
        this.currentPage = -1;
        this.transitioningOut = false;

        var that = this;

        // next button
        this. next = this.paper
            .path('M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z')
            .attr({
                fill : '#FFF'
            })
            .transform('T' + (this.width - this.twidth) + ',' + (this.height / 2))
            .click(function(){
                that.showPage(that.currentPage + 1);
            });

        // previous button
        this.previous = this.paper
            .path('M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z')
            .attr({
                fill : '#FFF'
            })
            .transform('T' + this.twidth / 2 + ',' + (this.height / 2))
            .click(function(){
                that.showPage(that.currentPage - 1);
            });

        // down button
        this.down = this.paper
            .path('M8.037,11.166L14.5,22.359c0.825,1.43,2.175,1.43,3,0l6.463-11.194c0.826-1.429,0.15-2.598-1.5-2.598H9.537C7.886,8.568,7.211,9.737,8.037,11.166z')
            .attr({
                fill : '#FFF'
            })
            .transform('T' + this.width / 2 + ',' + (this.height - this.twidth))
            .click(function() {
                var index = that.model.groups.indexOf(that.currentFeed);
                if (index < that.model.groups.length - 1){
                    that._transitionOut(
                        function() {
                            that.showFeed(that.model.groups[index + 1]);
                        });
                }
            });

        // up button
        this.up = this.paper
            .path('M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z')
            .attr({
                fill : '#FFF'
            })
            .transform('T' + this.width / 2 + ',' + this.twidth / 2)
            .click(function() {
                var index = that.model.groups.indexOf(that.currentFeed);
                if (index > 0){
                    that._transitionOut(
                        function() {
                            that.showFeed(that.model.groups[index - 1]);
                        });
                }
            });
    }

    Timeline.prototype.populate = function(model) {
        this.model = model;
        this.showFeed(model.groups[0]);
    };

    Timeline.prototype.showFeed = function(feedData) {
        this.currentPage = -1;
        this.currentFeed = feedData;
        this.allKeys = feedData.keys;

        if (!this.currentFeedTitle) {
            this.currentFeedTitle = this.paper.text(0, 0, feedData.name);
            this.currentFeedTitle.attr({
                font: '28px Helvetica',
                fill: '#FFF'
            });
        }

        var padding = 20;
        this.currentFeedTitle.attr({text: feedData.name});
        var bbox = this.currentFeedTitle.getBBox();
        this.currentFeedTitle.attr({
            transform: 't' + (bbox.width / 2 + padding) + ',' + (this.height - bbox.height / 2 - padding)
        });

        // set opacity of up and down arrows
        var index = this.model.groups.indexOf(feedData);
        this.up.attr({
            opacity : 0 === index
                ? 0.2
                : 1
        });

        this.down.attr({
            opacity : this.model.groups.length - 1 === index
                ? 0.2
                : 1
        });

        this.showPage(0);
    };

    Timeline.prototype.showPage = function(page) {
        if (this.transitioningOut) {
            return;
        }

        var numPages = Math.floor(this.allKeys.length / this.perPage);
        page = page < 0 ? 0 : page > numPages ? numPages : page;

        if (page === this.currentPage) {
            return;
        }

        // change opacity of arrows
        var numPages = Math.floor(this.allKeys.length / this.perPage);
        this.previous.attr({
            opacity: 0 === page
                ? 0.2
                : 1
        });

        this.next.attr({
            opacity: numPages === page
                ? 0.2
                : 1
        });

        var that = this;
        if (-1 !== this.currentPage) {
            this._transitionOut(
                function() {
                    that._transitionIn(page);
                });
        }
        else {
            this._transitionIn(page);
        }
    };

    Timeline.prototype.setKeys = function(keys) {
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

            var link = {
                title:title,
                circle:circle
            };
            this.links.push(link);

            // add event handlers
            addHandlers(link, keys[i]);
        }

        var animationDelayMS = 20;
        for (var i = 0, len = this.links.length; i < len; i++) {
            var animation = Raphael.animation({
                'opacity' : 1
            }, 500);
            this.links[i].circle.animate(animation.delay(i * animationDelayMS));
        }

        this._updatePath();
    };

    Timeline.prototype._updatePath = function() {
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
                });
            //.insertAfter(this.rect);
        }

        this.path.animate({
            'path' : splinePathString,
            'opacity' : 1
        }, 200);
    };

    Timeline.prototype._transitionOut = function(callback) {
        this.transitioningOut = true;

        var that = this;
        var numCalls = 0;
        function onAnimationComplete() {
            if (++numCalls === that.links.length + 1) {
                // remove them all
                for (var i = 0, len = that.links.length; i < len; i++) {
                    that.links[i].circle.remove();
                    that.links[i].title.remove();
                }
                that.links = [];

                that.transitioningOut = false;

                callback();
            }
        }

        var tweenMS = 500;
        var delayMS = 20;
        var animation = Raphael.animation({'opacity' : 0}, tweenMS, onAnimationComplete);
        for (var i = 0, len = this.links.length; i < len; i++) {
            var delayedAnimation = animation.delay(i * delayMS);
            this.links[i].circle.stop().animate(delayedAnimation);
            this.links[i].title.stop().animate(delayedAnimation);
        }
    };

    Timeline.prototype._transitionIn = function(page) {
        this.transitioningOut = false;

        this.currentPage = page;

        this.setKeys(this.allKeys.slice(
            this.currentPage * this.perPage,
            (this.currentPage + 1) * this.perPage
        ));
    };

    global.Timeline = Timeline;
})(this);