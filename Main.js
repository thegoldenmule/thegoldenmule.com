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

var rect;
var entries = [];
var positions = [];
var path;
var paper;

function initialize() {
    this.feed = new google.feeds.Feed('http://thegoldenmule.svbtle.com/feed');
    this.feed.load(function(result) {
        if (!result.error) {
            entries = result.feed.entries;

            var width = 900;
            var height = 600;
            paper = Raphael(0, 0, width, height);
            rect = paper.rect(0, 0, width, height, 5).attr({fill:'#000', stroke:'none'});

            var animateMS = 50;
            var circleRadius = 10;
            var attr = {font: '20px Helvetica', opacity: 0.5};
            var twidth = 50;
            for (var i = entries.length - 1; i >= 0; i--) {
                var x = ((i + 1) * twidth);
                var title = paper.text(0, 0, entries[i].title)
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
                positions.push(position);

                var circle = paper
                    .circle(position.x, position.y, circleRadius)
                    .attr({
                        fill: '#FFF'
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
                    var entry = entries[i];
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

            updatePath();
        }
    });

    function updatePath() {
        if (path) {
            path.remove();
            path = null;
        }

        var pathString = 'M' + positions[0].x + ',' + positions[0].y + 'R';
        for (var i = 1, len = positions.length; i < len; i++) {
            pathString += ' ' + positions[i].x + ' ' + positions[i].y;
        }

        paper
            .path(pathString)
            .attr({
                'stroke' : '#FFF',
                'stroke-width': 4,
                'stroke-linecap' : 'round'
            })
            .insertAfter(rect);
    }
}