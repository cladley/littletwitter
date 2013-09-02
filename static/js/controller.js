
window.twitter = window.twitter || {};

twitter.controls = (function ($, _) {
    var twitter_url = "https://twitter.com/"
    // Each Panel is a TwitterControl. 
    // We pass in a html element representing the control
    // and a username , which is the twitter timeline we 
    // be viewing
    function TwitterControl(element, username, tweet_count) {
        this.$element = $(element);
        this.username = username;
        this.tweets_container = this.$element.find('.tweets_container')[0];
        this.tweet_count = tweet_count || 30;
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

        // sort the tweets by their time in seconds
        sort: function (e) {
            var that = this;
            var r = this.collection.sort(function (t1, t2) {
              
                var time1,
                    time2,
                    diff;

                time1 = t1.date.getTime();
                console.log(time1);
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
            var promise = twitter.server.get(this.username, this.tweet_count);

            promise.done(_.bind(this.end_loading, this));
            promise.done(_.bind(this.extract_data, this));
            promise.error(_.bind(this.onerror, this));
       
        },
        // loading animation for when we are waiting for twitter to return
        create_busy_element: function () {
            this.busy_indicator = document.createElement("img");
            this.busy_indicator.src = "static/img/50x50.gif";
            this.busy_indicator.style.marginTop = "40%";
            this.busy_indicator.style.marginLeft = "39%";
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

        build_tweet_url : function(name,id){
            return twitter_url + name + '/status/' + id;
        },


       
        // parse the returned data from twitter, create a new Tweet object
        // and add it to our collection. Display these at the end.
        extract_data: function (data) {
            this.collection = [];

            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                var user = (obj.retweeted_status) ? obj.retweeted_status.user : obj.user;

                var args = {
                    name: user.name,
                    screen_name: user.screen_name,
                    profile_img: user.profile_image_url,
                    created_at: obj.created_at,
                    id : obj.id_str,
                    text: obj.text,
                    status: obj.retweeted_status
                };

                if (obj.entities.user_mentions) {
                    var mentions = obj.entities.user_mentions;
                    var str = '';
                    for (var j = 0; j < mentions.length; j++) {
                        str = mentions[j].screen_name + ", " + str;
                    }
                    args.mentions = str;
                }

                var url = this.build_tweet_url(args.screen_name, args.id);
                args.tweet_url = url;

                var tweet = new twitter.Models.Tweet(args);
                this.collection.push(tweet);
            }

            this.collectionView = new twitter.Views.TweetsCollectionView(this.collection);
            this.render_tweets(this.collectionView);
 
        },
        // render all our tweets into the placeholder in the document.
        render_tweets : function(colView){
            this.tweets_container.innerHTML = "";
            colView.render();
            this.tweets_container.appendChild(colView.element);

        },
        insert_error_message: function () {
            var error = document.createElement('h3');
            error.className = 'error_message';
            error.textContent = "Unable to retrieve timeline for '" + this.username + "'";
            this.tweets_container.appendChild(error);
        },
        // handles any network related errors
        onerror: function (reason) {
            if (reason.status === 404) {
                this.end_loading();
                this.insert_error_message();
            }

            if (reason.status === 500) {
                this.end_loading();
            }
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
                var control = new twitter.controls.TwitterControl(elm, args.username, args.tweet_count);
                this.controls.push(control);
            }
        },
        // make new request out to twitter
        refresh_all: function () {
            for (var i = 0; i < this.controls.length; i++) {
                this.controls[i].refresh();
            }
        },
        // change the timeline to a new username and send request to twitter 
        // to get the new timeline data.
        set_setting: function (e,setting) {
    
            if (setting.type === "timeline_change") {

                var timeline = setting.value[0];
                var index = setting.value[1];
                var ctrl = this.controls[index];

                ctrl.username = timeline;
                ctrl.set_title(timeline);
                ctrl.refresh();
            }

            if (setting.type === "count_change") {
                for (var i = 0; i < this.controls.length; i++) {
                    this.controls[i].tweet_count = setting.value[0];
                }
            }
        }
    }


    return {
        TwitterCoordinator : TwitterCoordinator
    }
})(jQuery, _);