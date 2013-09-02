
window.twitter = window.twitter || {};

twitter.controls = (function ($, _) {

    // Each Panel is a TwitterControl. 
    // We pass in a html element representing the control
    // and a username , which is the twitter timeline we 
    // be viewing
    function TwitterControl(element, username) {
        this.$element = $(element);
        this.username = username;
        this.tweets_container = this.$element.find('.tweets_container')[0];
        this.collection = [];
        this.loading = false;
        this.create_busy_element();
        this.setup_bindings();
        this.set_title(this.username);
        this.asc = true;
    }

    TwitterControl.prototype = {
        constructor: TwitterControl,
        // the name in the header of the control
        set_title : function(name){
            var titlespan = this.$element.find('.title')[0];
            titlespan.innerHTML = name;
        },

        sort: function (e) {
            var that = this;
            var r = this.collection.sort(function (t1, t2) {
              
                var time1,
                    time2,
                    diff;

                time1 = t1.date.getTime();
                time2 = t2.date.getTime();

                if (that.asc) {
                    return that.compare(time1, time2);
                } else {
                    return that.compare(time2, time1);
                }
            });
            this.change_icon();
            this.render_tweets(this.collectionView);
            e.preventDefault();
        },

        change_icon : function(){
            if (this.asc) {
                $(this.btn_sort).removeClass('asc');
                $(this.btn_sort).addClass('desc');
                this.asc = false;

            } else {
                $(this.btn_sort).removeClass('desc');
                $(this.btn_sort).addClass('asc');
                this.asc = true;
            }
        },

        compare : function(a , b){
                if (a < b)
                    return -1;
                else if (a > b)
                    return 1;
                else return 0;
        },

        // send a request to twitter to fetch fresh results
        refresh: function (e) {
            if (e) e.preventDefault();

            this.start_loading();

            var promise = twitter.server.get(this.username);

            promise.done(_.bind(this.end_loading, this));
            promise.done(_.bind(this.extract_data, this));
            promise.error(this.onerror);
       
        },
        // loading animation for when we are waiting for twitter to return
        create_busy_element: function () {
            this.busy_indicator = document.createElement("img");
            this.busy_indicator.src = "static/img/50x50.gif";
        },
        // start the 'busy' animation
        start_loading: function () {
            this.tweets_container.innerHTML = '';
            this.tweets_container.appendChild(this.busy_indicator);
        },
        end_loading: function () {
            this.tweets_container.innerHTML = '';
        },

        setup_bindings: function () {
            this.btn_sort = this.$element.find('.btn_sort')[0];
            this.btn_refresh = this.$element.find('.btn_refresh')[0];
            
            $(this.btn_sort).on('click', _.bind(this.sort, this));
            $(this.btn_refresh).on('click', _.bind(this.refresh, this));
        },

       
        // parse the returned data from twitter call
        extract_data: function (data) {

            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                var user = (obj.retweeted_status) ? obj.retweeted_status.user : obj.user;

                var args = {
                    name: user.name,
                    screen_name: user.screen_name,
                    profile_img: user.profile_image_url,
                    created_at: obj.created_at,
                    text: obj.text,
                    status: obj.retweeted_status
                };

                if (obj.entities.user_mentions) {
                    var mentions = obj.entities.user_mentions;
                    var str = '';
                    for (var j = 0; j < mentions.length; j++) {
                        str = str + ', ' + mentions[j].screen_name;
                    }
                    args.mentions = str;
                } 


                var tweet = new twitter.Models.Tweet(args);
                this.collection.push(tweet);
            }
      
            this.collectionView = new twitter.Views.TweetsCollectionView(this.collection);
            this.render_tweets(this.collectionView);
            window.coll = this.collection;
        },
        // render all our tweets into the placeholder in the document.
        render_tweets : function(colView){
            this.tweets_container.innerHTML = "";
            colView.render();
            this.tweets_container.appendChild(colView.element);

        },
        onerror: function (reason) {

        }
    };

    return {
        TwitterControl: TwitterControl
    };

})(jQuery, _ );


twitter.coordinators = (function ($, _) {


    // TwitterCoordinator setups and starts the 3 twitterControls (3 panels on screen).
    function TwitterCoordinator() {
        this.controls = [];
    }

    TwitterCoordinator.prototype = {
        constructor: TwitterCoordinator,
        setup: function (args) {
            if (args) {
                var elm = document.getElementById(args.id);
                var control = new twitter.controls.TwitterControl(elm, args.username);
                this.controls.push(control);
            }
        },
        refresh_all: function () {
            for (var i = 0; i < this.controls.length; i++) {
                this.controls[i].refresh();
            }
        },
        // change the timeline to a new username and send request to twitter 
        // to get the new timeline data.
        set_username: function (setting) {
            console.log("I'm in set_username anyway");
            if (setting.type === "name_change") {
                console.log("Yes its a name change");
            }
        }
    }


    return {
        TwitterCoordinator : TwitterCoordinator
    }
})(jQuery, _);