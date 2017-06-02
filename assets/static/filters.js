/* globals sha1 */     // sha1.js

/* globals Autocomplete, Cookies, QueryString, Unsee */

/* exported Filters */
var Filters = (function() {

    var selectors = {
        filter: "#filter",
        icon: "#filter-icon"
    };

    var addBadge = function(text) {
        $.each($("span.tag"), function(i, tag) {
            if ($(tag).text() == text) {
                var chksum = sha1(text);
                $(tag).prepend("<span class='badge tag-badge' id='tag-counter-" + chksum + "' data-badge-id='" + chksum + "'></span>");
            }
        });
    };

    var update = function() {
        Filters.Updating();

        // update location so it's easy to share it
        QueryString.Set("q", Filters.GetFilters().join(","));

        // reload alerts
        Unsee.Reload();
    };

    var init = function() {
        var initialFilter;

        if ($(selectors.filter).data("default-used") == "false" || $(selectors.filter).data("default-used") === false) {
            // user passed ?q=filter string
            initialFilter = $(selectors.filter).val();
        } else {
            // no ?q=filter string, check if we have default filter cookie
            initialFilter = Cookies.get("defaultFilter.v2");
            if (initialFilter === undefined) {
                // no cookie, use global default
                initialFilter = $(selectors.filter).data("default-filter");
            }
        }

        var initialFilterArr = initialFilter.split(",");
        $(selectors.filter).val("");
        $(".filterbar :input").tagsinput({
            typeaheadjs: {
                minLength: 1,
                hint: true,
                limit: 12,
                name: "autocomplete",
                source: Autocomplete.Autocomplete()
            }
        });
        $.each(initialFilterArr, function(i, filter) {
            $(selectors.filter).tagsinput("add", filter);
            addBadge(filter);
        });

        $(selectors.filter).on("itemAdded itemRemoved", function(event) {
            Filters.SetFilters();
            // add counter badge to new tag
            if (event.type == "itemAdded") {
                addBadge(event.item);
            }
        });

        $(selectors.filter).tagsinput("focus");

        // stop when user is typing in the filter bar
        $(".bootstrap-tagsinput").typing({
            start: function(event) {
                if (event.keyCode != 8 && event.keyCode != 13) Unsee.Pause();
            },
            stop: function(event) {
                if (event.keyCode != 8 && event.keyCode != 13) Unsee.WaitForNextReload();
            },
            delay: 1000
        });

        // fix body padding if needed, input might endup using more than 1 line
        $(".bootstrap-tagsinput").bind("DOMSubtreeModified", function() {
            $("body").css("padding-top", $(".navbar").height());
        });
        $("input.tt-input").on("change keypress", function() {
            $("body").css("padding-top", $(".navbar").height());
        });

        $(".filterbar").on("resize", function(){
            // hack for fixing padding since input can grow and change height
            $("body").css("padding-top", $(".navbar").height());
        });

    };

    var getFilters = function() {
        return $(selectors.filter).tagsinput("items");
    };

    var reloadBadges = function(filterData) {
        $.each(filterData, function(i, filter) {
            $.each($("span.tag-badge"), function(j, tag) {
                if (sha1(filter.text) == $(tag).data("badge-id")) {
                    $(tag).html(filter.hits.toString());
                    if (filter.isValid === true) {
                        $(tag).parent().addClass("label-info").removeClass("label-danger");
                    } else {
                        $(tag).parent().addClass("label-danger").removeClass("label-info");
                    }
                }
            });
        });
    };

    var addFilter = function(text) {
        $(selectors.filter).tagsinput("add", text);
    };

    var setUpdating = function() {
        // visual hint that alerts are reloaded due to filter change
        $(selectors.icon).removeClass("fa-search fa-pause").addClass("fa-circle-o-notch fa-spin");
    };

    var updateDone = function() {
        $(selectors.icon).removeClass("fa-circle-o-notch fa-spin fa-pause").addClass("fa-search");
    };

    var setPause = function() {
        $(selectors.icon).removeClass("fa-circle-o-notch fa-spin fa-search").addClass("fa-pause");
    };

    return {
        Init: init,
        AddFilter: addFilter,
        SetFilters: update,
        GetFilters: getFilters,
        ReloadBadges: reloadBadges,
        UpdateCompleted: updateDone,
        Updating: setUpdating,
        Pause: setPause
    };

}());
