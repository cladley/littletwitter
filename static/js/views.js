
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
        // el is the type of element will we use  to render our tweets in 
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
        this.setup_bindings();
        this.settings = {};

    }

    SettingsView.prototype = {
        constructor: SettingsView,
        open: function () {
            this.$overlay.fadeIn(500);
            this.$panel.stop().animate({
                'left' : '35%'
            });
        },

        close: function () {
            this.save();
            
            this.$panel.animate({
                'left' : '-5000px'
            }, 700);

            this.$overlay.fadeOut(700); 
        },
        setup_bindings: function () {
            this.$btn.on('click', _.bind(this.open, this));
            this.$overlay.on('click', _.bind(this.close, this));
            this.$panel.on('change', _.bind(this.theme_change, this));
           // this.$panel.on('click', _.bind(this.set, this));
        },

        default_settings : {
            theme: 'dark',
            panels : ['appdirect', 'hackernews', 'laughingsquid']
        },

        fetch_settings: function () {
            var that = this;
            this.settings = JSON.parse(localStorage.getItem('settings'));

            if (this.settings == null) {
                this.settings = this.default_settings;
            }


            // TESTING
            // loop through checboxes and which ever one is the same theme as this
            // then set it to checked
            // find traverse down all decendents, children only one level
           

            var checkboxes = this.theme_section.getElementsByTagName('input');
   
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].value === this.settings.theme) {
                    checkboxes[i].checked = true;
                    break;
                }
            }

         
            var textboxes = this.twitter_section.getElementsByTagName('input');
            for (var i = 0; i < textboxes.length; i++) {
                textboxes[i].value = this.settings.panels[i];
            }

            $(this).trigger('settingsChange', this.settings);

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
            this.setting_change('theme', theme);
        },
        setting_change: function (type, value) {
            this.settings[type] = value;
            $(this).trigger('settingChange', { type: type, value: value });
        }

    };


    return {
        TweetView: TweetView,
        TweetsCollectionView: TweetsCollectionView,
        SettingsView : SettingsView
    };

})(jQuery,_);



