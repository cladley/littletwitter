// Entry point of application.
// Everything gets started from here.
(function ($, _) {

    var timelines = [];
    var administrator = {

        set_theme: function (e, data) {
           // debugger;
            if (data.type === 'theme')
                document.body.id = data.value[0];
        },
        // get the timeline username from the defaults or localStorage
        // the settingsControl determines which to select .
      
        set_initial_settings: function (e, data) {
            document.body.id = data.theme;
            for (var i = 0; i < data.panels.length; i++) {
                timelines.push(data.panels[i]);
            }
        }

    };

    var btn = document.getElementById('btn_settings');
    var settings_panel = document.getElementById('settings_panel');
    var settings_overlay = document.getElementById('settings_overlay');
    var settingsControl = new twitter.Views.SettingsView(btn, settings_overlay, settings_panel);


 
    $(settingsControl).on('settingChange', administrator.set_theme);
    $(settingsControl).on('settingsChange', administrator.set_initial_settings);
    settingsControl.fetch_settings();


    var twitterCoordinator = new twitter.coordinators.TwitterCoordinator();
    $(settingsControl).on('settingChange', _.bind(twitterCoordinator.set_username, twitterCoordinator));
    // creates 3 TwitterControl objects with dom element id and twitter timeline name
    twitterCoordinator.setup({ id: 'panel_1', username: timelines[0] });
    twitterCoordinator.setup({ id: 'panel_2', username: timelines[1] });
    twitterCoordinator.setup({ id: 'panel_3', username: timelines[2] });
    twitterCoordinator.refresh_all();

})(jQuery, _);
