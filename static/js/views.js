
window.twitter = window.twitter || {};

window.twitter.Views = (function ($, _) {
    
    // Simple view of a single tweet
    function TweetView(model, template, el) {
        this.el = el || 'li';
        this.model = model || {};
        this.template_string = template || TweetView.template;
        // user underscore template function to create a template object.
        this.template = _.template(this.template_string); 
    }
    // make the template a property of TweetView function, so it is only set once
    TweetView.template = document.getElementById("tweet-template").innerHTML;

    TweetView.prototype = {
        constructor: TweetView,
        render: function () {
            this.element = document.createElement(this.el);
            var raw_render = this.template(this.model);
            this.element.innerHTML = raw_render;
            return this;
        }
    };


    // Simple view for a collection of tweets
    function TweetsCollectionView(collection, el) {
        // el is the type of element we will use  to render our tweets in 
        this.el = el || 'ul',
        this.classes = 'tweets_list',
        this.collection = collection;
    }

    TweetsCollectionView.prototype = {
        constructor: TweetsCollectionView,
        // loop through each tweet in our collection and call its
        // render function and insert it into the container
        render: function () {
            this.element = document.createElement(this.el);
            this.element.className = this.classes;

            for (var i = 0, len = this.collection.length; i < len; i++) {
                var tview = new TweetView(this.collection[i]);
                this.element.appendChild(tview.render().element);
            }
        }
    };

    // Represents the Settings panel
    // overlay is the faded background that sits behind the Settings panel 
    function SettingsView(btn,overlay,panel) {
        this.$btn = $(btn);
        this.$overlay = $(overlay);
        this.$panel = $(panel);
        this.theme_section = document.getElementById('theme_section');
        this.twitter_section = document.getElementById('twitter_section');
        this.checkboxes = this.theme_section.getElementsByTagName('input');
        this.textboxes = this.twitter_section.getElementsByTagName('input');
        this.settings = {};
        this.setup_bindings();
        

    }

    SettingsView.prototype = {
        constructor: SettingsView,
        open: function (e) {

            this.$overlay.fadeIn(500);
            this.$panel.stop().animate({
                'left' : '35%'
            });
            e.preventDefault();
        },

        close: function () {
            this.save();
            
            this.$panel.animate({
                'left' : '-5000px'
            }, 700);

            this.$overlay.fadeOut(700); 
        },
        // setup all event handlers
        setup_bindings: function () {
            this.$btn.on('click', _.bind(this.open, this));
            this.$overlay.on('click', _.bind(this.close, this));
            $('#theme_section').on('change', _.bind(this.theme_change, this));
            $('#timeline').on('blur', 'input', _.bind(this.timeline_change, this));
            $('#timeline').on('focus', 'input', _.bind(this.timeline_enter, this));
            $('#num_of_tweets').on('focus', _.bind(this.num_of_tweets_enter, this));
            $('#num_of_tweets').on('blur', _.bind(this.num_of_tweets_change, this));  
        },

        default_settings : {
            theme: 'dark',
            panels: ['appdirect', 'hackernews', 'laughingsquid'],
            tweet_count : 30
        },


        num_of_tweets_enter : function(e){
            this.old_count = e.target.value;
        },
        num_of_tweets_change : function(e){
            var current_count = e.target.value;
            if (current_count !== this.old_count) {
                this.settings.tweet_count = current_count;
                this.setting_change('count_change', current_count);
            }
        },

        timeline_enter: function (e) {
          
            this.old_text = e.target.value;
        },

        timeline_change: function (e) {
            // we remember what the old value was and compare it to the 
            // new one. If it hasn't changed, then no need to send another request
            var current_text = e.target.value;
            if (current_text !== this.old_text) {
                var index = e.target.dataset.index;
                this.settings.panels[index] = current_text;
                this.setting_change('timeline_change', current_text, index);
            }
            this.old_text = '';
        },

        // try to get settings from local storage or else use the defaults
        fetch_settings: function () {
            var that = this;
            this.settings = JSON.parse(localStorage.getItem('settings'));

            if (this.settings == null) {
                this.settings = this.default_settings;
            }

            this.setup_controls_state(this.settings)
            $(this).trigger('settingsChange', this.settings);
        },

        // We set the controls on the settings form so that they match
        // our settings object.
        setup_controls_state : function(settings){

            for (var i = 0; i < this.checkboxes.length; i++) {
                if (this.checkboxes[i].value === this.settings.theme) {
                    this.checkboxes[i].checked = true;
                    break;
                }
            }

            for (var i = 0; i < this.textboxes.length; i++) {
                this.textboxes[i].value = this.settings.panels[i];
            }
     
            $('#num_of_tweets').val(this.settings.tweet_count);
        },

        save: function () {
            localStorage.setItem('settings', JSON.stringify(this.settings));
        },

        set : function(e){
            e.preventDefault();
        },
        // Changes the colour scheme of the application
        theme_change: function (e) {
            var theme = e.target.value;
            this.settings.theme = theme;
            this.setting_change('theme', theme);
        },
        setting_change: function (type) {
            var args = Array.prototype.slice.call(arguments, 1);
            $(this).trigger('settingChange', { type: type, value: args });
        }

    };

    return {
        TweetView: TweetView,
        TweetsCollectionView: TweetsCollectionView,
        SettingsView : SettingsView
    };

})(jQuery,_);



