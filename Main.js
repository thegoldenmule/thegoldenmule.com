/**
 * Author: thegoldenmule
 * Date: 5/4/14
 */

(function(global) {

    'use strict';

    global.initialize = function() {
        global.main = new Main(1000, 600);
    };

    function Main(width, height) {
        this.width = width;
        this.height = height;

        this.headers = document.getElementById('headers');
        this.groups = document.getElementById('groups');
        this.descriptions = document.getElementById('descriptions');
        this.model = Model;
        this.build();
    }

    Main.prototype.build = function()
    {
        var headers = this.model.Headers;
        for (var i = 0, ilen = headers.length; i < ilen; i++) {
            var header = new HeaderView(headers[i]);
            this.headers.appendChild(header.el);
        }

        this.selectHeader(headers[0].Header);
    };

    Main.prototype.selectHeader = function (headerName)
    {
        this.clearChildren(this.groups);

        var groups = this.headerByName(headerName).Groups;
        for (var i = 0, len = groups.length; i < len; i++) {
            var group = new GroupView(headerName, groups[i]);
            this.groups.appendChild(group.el);
        }
    };

    Main.prototype.selectElement = function (headerName, groupName, elementName)
    {
        this.clearChildren(this.descriptions);

        var element = this.elementByName(headerName, groupName, elementName);
        if (null === element)
        {
            return;
        }

        var description = new DescriptionView(element);
        this.descriptions.appendChild(description.el);
    };

    Main.prototype.headerByName = function(name)
    {
        var headers = this.model.Headers;
        for (var i = 0, len = headers.length; i < len; i++)
        {
            if (headers[i].Header === name)
            {
                return headers[i];
            }
        }

        return null;
    };

    Main.prototype.groupByName = function(headerName, groupName)
    {
        var header = this.headerByName(headerName);
        if (null === header)
        {
            return null;
        }

        var groups = header.Groups;
        for (var i = 0, len = groups.length; i < len; i++)
        {
            if (groups[i].Name === groupName)
            {
                return groups[i];
            }
        }

        return null;
    };

    Main.prototype.elementByName = function(headerName, groupName, elementName)
    {
        var group = this.groupByName(headerName, groupName);
        if (null === group)
        {
            return null;
        }

        var elements = group.Entries;
        for (var i = 0, len = elements.length; i < len; i++)
        {
            if (elements[i].Name === elementName)
            {
                return elements[i];
            }
        }

        return null;
    };

    Main.prototype.clearChildren = function(node)
    {
        while (node.firstChild)
        {
            node.removeChild(node.firstChild);
        }
    };

})(this);