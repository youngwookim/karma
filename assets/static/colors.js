/* exported Colors */
var Colors = (function() {

    var colors;

    var specialLabels = {
        "@state: unprocessed": "label-default",
        "@state: active": "label-danger",
        "@state: suppressed": "label-success",
    };

    var update = function(colorData) {
        colors = colorData;
    };

    var getClass = function(key, value) {
        var label = key + ": " + value;
        if (key == "alertname") {
            return "label-primary";  // special case for alertname label, which is the name of alert
        } else if (specialLabels[label] !== undefined) {
            return specialLabels[label];
        } else if (Colors.IsStaticLabel(key)) {
            return "label-info";
        } else {
            return "label-warning";
        }
    };

    var getStyle = function(key, value) {
        // get color data, returned as css style string
        var style = "";
        if (colors[key] !== undefined && colors[key][value] !== undefined) {
            var c = colors[key][value];
            style = "background-color: rgba(" + [ c.background.red, c.background.green, c.background.blue, c.background.alpha ].join(", ") + "); ";
            style += "color: rgba(" + [ c.font.red, c.font.green, c.font.blue, c.font.alpha ].join(", ") + "); ";
        }
        return style;
    };

    var getStaticLabels = function() {
        return $("#alerts").data("static-color-labels").split(" ");
    };

    var isStaticLabel = function(key) {
        return ($.inArray(key, Colors.GetStaticLabels()) >= 0);
    };

    return {
        Update: update,
        Get: getStyle,
        GetClass: getClass,
        GetStaticLabels: getStaticLabels,
        IsStaticLabel: isStaticLabel
    };

})();
