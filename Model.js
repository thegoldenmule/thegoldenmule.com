/**
 * Author: thegoldenmule
 * Date: 5/4/14
 */

(function(global) {

    'use strict';

    function Model() {
        this.groups = [];
    }

    Model.prototype.add = function(data) {
        this.groups.push(data);
    };

    global.Model = Model;

})(this);