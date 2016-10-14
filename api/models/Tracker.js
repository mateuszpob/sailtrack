/**
 * Tracker.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        session_id: {type: 'string'}, // id sesji
        app_key: {type: 'string'}, // id aplikacji (strony internetowej)
        tracked_on_page: {type: 'string'}, // podstrona na ktorej zarejestrowano akcj
        session_started_at: {type: 'integer'}, // timestam startu sesji
        tracking_data: {type: 'json'}           // dane trackingowe
    },
    /*
     * Tu przylatują dane przez sockety. Dodajemy do istniejącej sesji, albo tworzy nową jeśli takiej nie ma.
     */
    insertTrackData: function (track_data) {
        Tracker.findOne({
            session_id: track_data.session_id,
            app_key: track_data.app_key,
//            session_started_at: track_data.session_started_at
        }).exec(function (err, obj) {
            
            if(obj !== undefined){
                
            }
            
            
            if(obj !== undefined){
                obj.tracking_data = obj.tracking_data.concat(track_data.tracking_data);
                obj.save();
            }else{
                Tracker.create({
                    session_id: track_data.session_id,
                    app_key: track_data.app_key,
                    origin: track_data.origin,
                    session_started_at: track_data.session_started_at,
                    tracking_data: track_data.tracking_data
                }).exec(function createCB(err, created) {
                    console.log(obj)
                    console.log('------------------------------------------')
                });
            }
        });
    },
};

