/**
 * Author: thegoldenmule
 * Date: 5/4/14
 */

(function(global) {

    'use strict';

    global.initialize = function() {
        new Main(1000, 600);
    };

    function Main(width, height) {
        this.width = width;
        this.height = height;

        this.paper = Raphael('content', this.width, this.height);
        this.rect = this.paper.rect(0, 0, this.width, this.height, 50).attr({fill:'#111', stroke:'none'});

        this.timeline = new Timeline(this.paper, this.width, this.height);

        var loaders = [
            new FeedLoader('Tech', 'http://thegoldenmule.com/blog/', 'http://thegoldenmule.com/blog/feed/'),
            new FeedLoader('Thoughts', 'http://thegoldenmule.svbtle.com/', 'http://thegoldenmule.svbtle.com/feed')
        ];

        var that = this;
        this.load(loaders, function(model) {
            that.timeline.populate(model);
        });
    }

    Main.prototype.load = function(loaders, callback) {
        var model = new Model();

        var numLoaded = 0;
        function onLoaded(data) {
            model.add(data);

            if (++numLoaded === loaders.length) {
                callback(model);
            }
        }

        for (var i = 0, len = loaders.length; i < len; i++) {
            loaders[i].load(onLoaded);
        }
    };

})(this);