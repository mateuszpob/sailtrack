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
        switch(track_data.type){
            case 'move':
                Tracker.insertMove(track_data);
                break;
            case 'event':
                Tracker.insertScroll(track_data);
                break;
        }
    },
    
    insertScroll: function (track_data) {
        console.log('Insert event scroll ==================== S C R O L L ==')
        Tracker.findOne({
            session_id: track_data.session_id,
            app_key: track_data.app_key,
            // session_started_at: track_data.session_started_at
        }).exec(function (err, obj) {
            if(obj !== undefined){
                if(obj.events_data === undefined){
                    obj.events_data = [];
                }
                obj.events_data.push(track_data.tracking_data.event_data)
                obj.save();
            }else{
                
            }
        });
    },
    
    insertMove: function (track_data) {
        console.log('Insert Mooooove')
        Tracker.findOne({
            session_id: track_data.session_id,
            app_key: track_data.app_key,
            // session_started_at: track_data.session_started_at
        }).exec(function (err, obj) {
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
                    console.log('Insert background ==================== B A C K G R O U N D ==')
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
                
                
                obj.viewport_width = track_data.viewport_width;
                obj.viewport_height = track_data.viewport_height;
                obj.document_width = track_data.document_width;
                obj.document_height = track_data.document_height;
                
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
                    viewport_width: track_data.viewport_width,
                    viewport_height: track_data.viewport_height,
                    document_width: track_data.document_width,
                    document_height: track_data.document_height,
                    tracking_data: tracking_array
                }).exec(function createCB(err, created) {
                    console.log(obj)
                    console.log('------------------------------------------')
                });
            }
        });
    },
};

