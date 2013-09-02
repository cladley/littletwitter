window.twitter = window.twitter || {};

// Singleton to fetch twitter timeline data

twitter.server = (function ($, _) {

    var base_url = '/tweets';
    var default_count = 30;
    var server = {

        get: function (username, count) {
    
            count = count || default_count;

            var url = base_url + "?name=" + username;
            return $.ajax({
                dataType: "json",
                url : url
            });
        }
    };

    return server;
})(jQuery, _ );