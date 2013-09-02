
window.twitter = window.twitter || {};

window.twitter.Models = (function ($,_) {

    function Tweet(args) {
        this.text = args.text || '';
        this.name = args.name || '';
        this.screen_name = args.screen_name || '';
        this.id = args.id;
        this.tweet_url = args.tweet_url;
        this.date_string = args.created_at;
      
        this.date = twitter.utils.create_date(args.created_at);
        this.posted = this.date.getDate() + " " + twitter.utils.get_month_str(this.date.getMonth());
        this.profile_img = args.profile_img || '';
        this.mentions = args.mentions;
        this.status = args.status || 'tweet';
        this.link = args.link || '';
    }
    

    return {
        Tweet: Tweet,
    };

})(jQuery,_);



window.twitter.utils = (function ($, _) {

    var month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


    // Collection of utilites used
    var utilites = {

       

        create_date: function (date_str) {
            if (!date_str) {
                throw new Error('date string needed');
            }

            var date = new Date(Date.parse(date_str));
            
            return date;
        },
        get_month_str: function (num) {
            return month_names[num];
        }
    };

    return utilites;

})(jQuery, _);


