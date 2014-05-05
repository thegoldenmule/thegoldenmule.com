/**
 * Author: thegoldenmule
 * Date: 5/4/14
 */

(function(global) {

    'use strict';

    function FeedData(name, url, keys) {
        this.name = name;
        this.url = url;
        this.keys = keys;
    }

    global.FeedData = FeedData;

})(this);

(function(global) {

    'use strict';

    function FeedLoader(name, url, feedUrl) {
        this.name = name;
        this.url = url;
        this.feedUrl = feedUrl;
    }

    FeedLoader.prototype.load = function(callback) {
        this.feed = new google.feeds.Feed(this.feedUrl);
        this.feed.setNumEntries(10000);

        var that = this;
        this.feed.load(function(result) {
            if (result.error) {
                return;
            }

            var entries = result.feed.entries;

            // create keys
            var keys = [];
            for (var i = 0, len = entries.length; i < len; i++) {
                keys.push({
                    title: entries[i].title,
                    link: entries[i].link
                });
            }

            callback(new FeedData(that.name, that.url, keys));
        });
    };

    global.FeedLoader = FeedLoader;

})(this);