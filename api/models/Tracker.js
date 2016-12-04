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
            // session_started_at: track_data.session_started_at
        }).exec(function (err, obj) {
            if(obj){
//                console.log(track_data);
                //var time_offset = track_data.session_started_at - obj.session_started_at;
                var time_offset = Math.round((track_data.session_started_at - obj.session_started_at) / 10) * 10;
                console.log(time_offset)
                switch(track_data.type){
                    case 'move':
                        for (var attrname in track_data.move_data) { 
                            obj.move_data[''+parseInt(parseInt(time_offset) + parseInt(attrname))] = track_data.move_data[attrname]; 
                        }
                        break;
                    case 'scroll':
                        for (var attrname in track_data.scroll_data) { 
                            obj.scroll_data[''+parseInt(parseInt(time_offset) + parseInt(attrname))] = track_data.scroll_data[attrname]; 
                        }
                        break;
                    case 'init': 
                        var background = track_data.background;
//                            .replace(/(\r\n|\n|\r)/gm,"")
//                            .replace(/src="\/\//g,'src="_sailtrack/')
//                            .replace(/href="\/\//g,'href="_sailtrack/')
//
//                            .replace(/src="\//g,'src="'+track_data.origin+'/')
//                            .replace(/href="\//g,'href="'+track_data.origin+'/')
//
//                            .replace(/src="_sailtrack\//g,'src="//')
//                            .replace(/href="_sailtrack\//g,'href="//')
//                    
//                
//                            .replace(/http:\/\/127.0.0.1:1337\/clientscr/g,'');
                    
                        console.log('================== Jaaaaazdaaa z obiektem!: '+track_data.type);
                        obj.background_data[''+parseInt(time_offset)] = {
                            background: background, 
                            viewport_width: track_data.viewport_width,
                            viewport_height: track_data.viewport_height,
                            document_width: track_data.document_width,
                            document_height: track_data.document_height,
                        }
                        break;
                }
                
                
                
                obj.save();
            }else{
                
//                var x = btoa(track_data.background);
//                console.log(x)
                
                var background = track_data.background;
//                            .replace(/(\r\n|\n|\r)/gm,"")
//                            .replace(/src="\/\//g,'src="_sailtrack/')
//                            .replace(/href="\/\//g,'href="_sailtrack/')
//
//                            .replace(/src="\//g,'src="'+track_data.origin+'/')
//                            .replace(/href="\//g,'href="'+track_data.origin+'/')
//
//                            .replace(/src="_sailtrack\//g,'src="//')
//                            .replace(/href="_sailtrack\//g,'href="//')
//                    
//                
//                            .replace(/http:\/\/127.0.0.1:1337\/clientscr/g,'');
                
                Tracker.create({
                    session_id: track_data.session_id,
                    app_key: track_data.app_key,
                    origin: track_data.origin,
                    session_started_at: track_data.session_started_at,
                    
                    move_data: {},
                    scroll_data: {},
                    background_data: {10: {
                            background: background,
                            viewport_width: track_data.viewport_width,
                            viewport_height: track_data.viewport_height,
                            document_width: track_data.document_width,
                            document_height: track_data.document_height
                    }}
                    
                }).exec(function createCB(err, created) {
                    console.log('create new Object.')
                });
            }
    
        });
    },
};

