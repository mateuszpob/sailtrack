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
    _insertTrackData: function (track_data) {
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

                            .replace(/src="\//g,'src="http://mo.mo/')
                            .replace(/href="\//g,'href="http://mo.mo/')

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

                            .replace(/src="\//g,'src="'+tracking_array[0].origin+'/')
                            .replace(/href="\//g,'href="'+tracking_array[0].origin+'/')

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
                        var background = track_data.background
                            .replace(/(\r\n|\n|\r)/gm,"")
                            .replace(/src="\/\//g,'src="_sailtrack/')
                            .replace(/href="\/\//g,'href="_sailtrack/')

                            .replace(/src="\//g,'src="'+track_data.origin+'/')
                            .replace(/href="\//g,'href="'+track_data.origin+'/')

                            .replace(/src="_sailtrack\//g,'src="//')
                            .replace(/href="_sailtrack\//g,'href="//')
                    
                
                            .replace(/http:\/\/127.0.0.1:1337\/clientscr/g,'');
                    
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
                
                var background = track_data.background
                            .replace(/(\r\n|\n|\r)/gm,"")
                            .replace(/src="\/\//g,'src="_sailtrack/')
                            .replace(/href="\/\//g,'href="_sailtrack/')

                            .replace(/src="\//g,'src="'+track_data.origin+'/')
                            .replace(/href="\//g,'href="'+track_data.origin+'/')

                            .replace(/src="_sailtrack\//g,'src="//')
                            .replace(/href="_sailtrack\//g,'href="//')
                    
                
                            .replace(/http:\/\/127.0.0.1:1337\/clientscr/g,'');
                
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

