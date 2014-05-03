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

function Timeline(feedPath) {
    this.rect;
    this.entries = [];
    this.positions = [];
    this.links = [];
    this.path;
    this.paper;

    this.feed = new google.feeds.Feed(feedPath);

    var that = this;
    this.feed.setNumEntries(10000);
    this.feed.load(function(result) {
        if (!result.error) {
            that.entries = result.feed.entries;

            var width = 1000;
            var height = 600;
            var twidth = 50;
            that.paper = Raphael('content', width, height);
            that.rect = that.paper.rect(0, 0, width, height, 5).attr({fill:'#111', stroke:'none'});

            // next button
            that.paper
                .path('M6.684,25.682L24.316,15.5L6.684,5.318V25.682z')
                .attr({
                    fill : '#FFF'
                })
                .transform('T' + (width - twidth) + ',' + (height - twidth))
                .click(function(){
                    for (var i = 0, len = links.length; i < len; i++) {
                        var circle = links[i].circle;
                        var title = links[i].title;

                        circle.transform('t-10,0');
                    }

                    updatePath();
                });

            var animateMS = 50;
            var circleRadius = 10;
            var attr = {font: '20px Helvetica', opacity: 0.5};
            for (var i = that.entries.length - 1; i >= 0; i--) {
                var x = ((i + 1) * twidth);
                var title = that.paper.text(0, 0, that.entries[i].title)
                    .attr(attr)
                    .attr(
                    {
                        fill: '#FFF',
                        transform: 'R-90' + 'T' + x + ',' + height / 2
                    });

                var bbox = title.getBBox();
                var position = {
                    x:x,
                    y:bbox.y2 + 4 * circleRadius
                };
                that.positions.push(position);

                var circle = that.paper
                    .circle(position.x, position.y, circleRadius)
                    .attr({
                        fill: '#FFF'
                    });

                that.links.push({
                    title:title,
                    circle:circle
                });

                // handlers
                var mouseOver = (function() {
                    var handle = circle;
                    return function() {
                        handle.stop().animate({
                            transform:'S2'
                        }, animateMS);
                    };
                })();

                var mouseOut = (function() {
                    var handle = circle;
                    return function() {
                        handle.stop().animate({
                            transform:'S1'
                        }, animateMS);
                    };
                })();

                var click = (function() {
                    var entry = that.entries[i];
                    return function (){
                        window.open(entry.link);
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

            that.updatePath();
        }
    });
}

Timeline.prototype.updatePath = function() {
    if (this.path) {
        this.path.remove();
        this.path = null;
    }

    var pathString = 'M' + this.positions[0].x + ',' + this.positions[0].y + 'R';
    for (var i = 1, len = this.positions.length; i < len; i++) {
        pathString += ' ' + this.positions[i].x + ' ' + this.positions[i].y;
    }

    this.path = this.paper
        .path(pathString)
        .attr({
            'stroke' : '#FFF',
            'stroke-width': 4,
            'stroke-linecap' : 'round'
        })
        .insertAfter(this.rect);
};

function initialize() {
    new Timeline('http://thegoldenmule.com/blog/feed/');
    //new Timeline('http://thegoldenmule.svbtle.com/feed');
}