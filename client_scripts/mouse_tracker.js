var TrackerClient = function() {
    this.move = 1;
    this.rast = 2;
    this.send_moment = 10;
    this.point_stack = {};
    
    this.scroll_stack = [];
    this.scroll_stack_interval = null;

    this.cookie_name = 'tracker_sid';
    this.session_exp_days = 1;
    this.socket = null;
    
    this.time_start;
    this.session_id;
};



TrackerClient.prototype.onmousemoveM = function(e){
    
    this.move++;
    if(this.move % this.rast === 0){
        var time_from_start = Date.now() - this.time_start;
        time_from_start = Math.round(time_from_start / 10) * 10;
        if(e.pageX && e.pageY){
            console.log('-----------------')
            console.log(e)
            var prop = ""+time_from_start;
            console.log(e.pageX, e.pageY, prop)
            this.point_stack[prop] = {
                //pathname: window.location.pathname,
                x:e.pageX, 
                y:e.pageY
            };
        }
    }
    if(this.move % this.send_moment === 0){ 
        this.sendData('move', this.point_stack);
        this.move = 1;
    }
};

TrackerClient.prototype.onscrollme = function() { console.log('scrolujeeeeeeeeeee')
    var inst = this;
    var time_from_start = Date.now() - this.time_start;
    time_from_start = Math.round(time_from_start / 10) * 10;
    this.scroll_stack.push({scroll: document.body.scrollTop, time: time_from_start});
    clearTimeout(this.scroll_stack_interval);
    this.tmp_stack = {};
    this.scroll_stack_interval = setTimeout(function(){
        
        inst.tmp_stack[''+inst.scroll_stack[0].time] = {
            start_scroll: inst.scroll_stack[0].scroll, 
            start_time: inst.scroll_stack[0].time,
            end_scroll: inst.scroll_stack[inst.scroll_stack.length-1].scroll, 
            end_time: inst.scroll_stack[inst.scroll_stack.length-1].time
        };
        inst.scroll_stack = [];
        inst.sendData('scroll', inst.tmp_stack)
    },100);
    
};

TrackerClient.prototype.sendData = function(type, to_send){
    console.log('huuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuj',type, to_send, to_send.length)
    if(to_send){
        
        var point_stack = null;
        var scroll_stack = null;
        
        
        switch(type){
            case 'move':
                point_stack = to_send;
                scroll_stack = {};
                break;
            case 'scroll': 
                point_stack = {};
                scroll_stack = to_send;
                break;
        }
        
        var points_data = {
            session_id: this.session_id,
            app_key: 'hwdpjp100%',
            session_started_at: this.time_start,
            type: type,
            origin: window.location.origin,
            move_data: point_stack,
            scroll_data: scroll_stack
        }
        console.log('EMITED: ')
        console.log(points_data)
        this.socket.emit('points_data', points_data);
        this.point_stack = {};
    }else{
        
    }
};
/*
 * Wysyla dane inicjujące pierwszy obiekt sesji na serwerze
 */
TrackerClient.prototype.sendInitData = function(html){
    var points_data = {
        session_id: this.session_id,
        app_key: 'hwdpjp100%',
        session_started_at: this.time_start,
        type: 'init',
        viewport_width: window.innerWidth, 
        viewport_height: window.innerHeight,
        document_width:document.body.scrollWidth,
        document_height: document.body.scrollHeight,
        origin: window.location.origin,
        background: html,
        move_data: {},
        scroll_data: {}
    }
    this.socket.emit('points_data', points_data);
};



TrackerClient.prototype.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
//    d.setTime(d.getTime() + (exdays*24*60*60*1000)); // dni
    d.setTime(d.getTime() + (exdays*60*1000)); // minuty
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

TrackerClient.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
};

TrackerClient.prototype.getSessionId = function(){
    var sid = this.getCookie('tracker_sid');
    if(sid !== "")
        return sid;
    var new_sid = Array(40+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 40);
    this.setCookie("tracker_sid", new_sid, this.session_exp_days);
    return new_sid;
};


var init = function(){
    console.log('Tracker Init')
    
    var inst = new TrackerClient();
    var body = document.body;
    inst.time_start = Date.now();
    inst.socket = io.connect('http://127.0.0.1:1337');
    inst.session_id = inst.getSessionId();
    
    var last_html = document.documentElement.outerHTML;
   // inst.sendBackgroundData(last_html)
   
    inst.sendInitData(last_html);
    
    document.addEventListener("mousemove", function(e){
        last_html = document.body.outerHTML;
        inst.onmousemoveM(e);
    });
    
    document.addEventListener('scroll', function(e){
        inst.onscrollme(e);
        inst.onmousemoveM(e);
    });
    
    
};

document.addEventListener('DOMContentLoaded', init, false);



//var i=0;
//setInterval(function(){
//    //console.log(++i);
//}, 1)
