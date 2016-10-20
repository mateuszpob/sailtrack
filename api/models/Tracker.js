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
            
            console.log('huj huj hu hu j')
            
            if(obj !== undefined){
                
            }
            
            
            if(obj !== undefined){
                var tracking_array = null;
                if(Array.isArray(track_data.tracking_data)){
                    tracking_array = track_data.tracking_data;
                }else{
                    tracking_array = [];
                    tracking_array.push(track_data.tracking_data)
                }
                
                if(tracking_array[0].type == 'background'){
                    tracking_array[0].background = tracking_array[0].background
                            .replace(/(\r\n|\n|\r)/gm,"")
                            .replace(/src="\/\//g,'src="_sailtrack/')
                            .replace(/href="\/\//g,'href="_sailtrack/')

                            .replace(/src="\//g,'src="http://127.0.0.1:8000/')
                            .replace(/href="\//g,'href="http://127.0.0.1:8000/')

                            .replace(/src="_sailtrack\//g,'src="//')
                            .replace(/href="_sailtrack\//g,'href="//')
                    
                
                            .replace(/http:\/\/127.0.0.1:1337\/clientscr/g,'');
                }
//                console.log(tracking_array[0].background)
                console.log(tracking_array[0].type);
                obj.tracking_data = obj.tracking_data.concat(tracking_array);
                obj.save();
            }else{
                var tracking_array = null;
                if(Array.isArray(track_data.tracking_data)){
                    tracking_array = track_data.tracking_data;
                }else{
                    tracking_array = [];
                    tracking_array.push(track_data.tracking_data)
                }
                
                if(tracking_array[0].type == 'background'){
                    tracking_array[0].background = tracking_array[0].background
                            .replace(/(\r\n|\n|\r)/gm,"")
                            .replace(/src="\/\//g,'src="_sailtrack/')
                            .replace(/href="\/\//g,'href="_sailtrack/')

                            .replace(/src="\//g,'src="http://127.0.0.1:8000/')
                            .replace(/href="\//g,'href="http://127.0.0.1:8000/')

                            .replace(/src="_sailtrack\//g,'src="//')
                            .replace(/href="_sailtrack\//g,'href="//');
                    
                }
                
                Tracker.create({
                    session_id: track_data.session_id,
                    app_key: track_data.app_key,
                    origin: track_data.origin,
                    session_started_at: track_data.session_started_at,
                    tracking_data: tracking_array
                }).exec(function createCB(err, created) {
                    console.log(obj)
                    console.log('------------------------------------------')
                });
            }
        });
    },
};

