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
                // add static stuff
                model.add(new FeedData(
                    'Projects',
                    'https://github.com/thegoldenmule/',
                    [
                        {
                            title: 'boX',
                            link: 'https://github.com/thegoldenmule/boX'
                        },
                        {
                            title: 'Realtime Clouds',
                            link: 'https://github.com/thegoldenmule/RealtimeClouds'
                        },
                        {
                            title: 'Story',
                            link: 'https://github.com/thegoldenmule/story'
                        },
                        {
                            title: 'Unitijection',
                            link: 'https://github.com/thegoldenmule/Unitijection'
                        },
                        {
                            title: 'Einstein',
                            link: 'http://thegoldenmule.com/labs/EinsteinDemo/'
                        },
                        {
                            title: 'Itsy',
                            link: 'https://github.com/thegoldenmule/Itsy'
                        },
                        {
                            title: 'Telemetrino',
                            link: 'https://github.com/thegoldenmule/Telemetrino'
                        },
                        {
                            title: 'Topology',
                            link: 'https://github.com/thegoldenmule/Topology'
                        },
                        {
                            title: '2D Terrain Generator',
                            link: 'https://github.com/thegoldenmule/EasyTerrain'
                        },
                        {
                            title: 'Spherical Terran Generation',
                            link: 'http://thegoldenmule.com/labs/PlanarSphericalGen2/planardemo.html'
                        },
                        {
                            title: 'Circle Physics',
                            link: 'http://thegoldenmule.com/labs/CirclePhysics/'
                        },
                        {
                            title: 'Porter\'s Stemming Algorithm',
                            link: 'http://thegoldenmule.com/labs/PStem/'
                        },
                        {
                            title: 'Scorched 3D: Now in 2D!',
                            link: 'http://thegoldenmule.com/labs/Scorch3d/'
                        }
                    ]));

                callback(model);
            }
        }

        for (var i = 0, len = loaders.length; i < len; i++) {
            loaders[i].load(onLoaded);
        }
    };

})(this);