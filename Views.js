var HeaderView = Backbone.View.extend({
    initialize: function(model)
    {
        this.model = model;
        this.render();
    },
    events:
    {
        "click h2": "select"
    },
    render: function()
    {
        var template = _.template($("#template_header").html());

        this.$el.html(template({ title: this.model.Header }));
    },
    select: function (event)
    {
        main.selectHeader(event.target.innerHTML);
    }
});

var GroupView = Backbone.View.extend({
    initialize: function(headerName, model)
    {
        this.headerName = headerName;
        this.model = model;
        this.render();
    },
    events:
    {
        "click img" : "select"
    },
    render: function()
    {
        var html = "";

        var groupTemplate = _.template($("#template_group").html());
        html += groupTemplate({
            title: this.model.Name
        });
        html += "<div class='groupcontainer'>";

        var elementTemplate = _.template($("#template_element").html());
        var entries = this.model.Entries;

        for (var i = 0, len = entries.length; i < len; i++)
        {
            html += elementTemplate({
                img: entries[i].ImageURL,
                headername: this.headerName,
                groupname: this.model.Name,
                elementname: entries[i].Name
            });
        }

        html += "</div>";

        this.$el.html(html);
    },
    select: function(event)
    {
        main.selectElement(
            getAttribute(event.target, "data-header-name"),
            getAttribute(event.target, "data-group-name"),
            getAttribute(event.target, "data-element-name"));
    }
});

var DescriptionView = Backbone.View.extend({
    initialize: function(model)
    {
        this.model = model;
        this.render();
    },
    render: function()
    {
        var template = _.template($("#template_description").html());

        this.$el.html(template(
            {
                title: this.model.Name,
                description: this.model.Description,
                url: this.model.URL
            }));
    }
});

function getAttribute(element, name)
{
    var attributes = element.attributes;
    for (var i = 0, len = attributes.length; i < len; i++)
    {
        var attribute = attributes[i];
        if (attribute.name === name)
        {
            return attribute.value;
        }
    }

    return null;
}