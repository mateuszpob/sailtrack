var TrackerClient = function() {
    this.move = 1;
    this.rast = 2;
    this.send_moment = 10;
    
    this.point_stack = [];
    this.socket;
    this.time_start;
    this.session_id;

    this.cookie_name = 'tracker_sid';
    this.session_exp_days = 1;
    this.socket = null;
};



TrackerClient.prototype.onmousemoveM = function(e){
    var dt = new Date();
    
    this.move++;
    if(this.move % this.rast == 0){
        var time_from_start = Date.now() - this.time_start;
        this.point_stack.push({
            type: 'move',
            pathname: window.location.pathname,
            time:time_from_start,
            x:e.pageX, 
            y:e.pageY
        });
    }
    if(this.move % this.send_moment == 0){ 
        this.sendData();
        this.move = 1;
    }
};

TrackerClient.prototype.sendData = function(){
    if(this.point_stack.length){
        var points_data = {
            session_id: this.session_id,
            app_key: 'hwdpjp100%',
            session_started_at: this.time_start,
            width: window.innerWidth, 
            height: window.innerHeight,
            tracking_data: this.point_stack,
            origin: window.location.origin
        }
        this.socket.emit('points_data', points_data);
        this.point_stack = [];
    }
};

TrackerClient.prototype.sendBackgroundData = function(bckgr){
    if(true){
        var time_from_start = Date.now() - this.time_start;
        var data = {
            session_id: this.session_id,
            app_key: 'hwdpjp100%',
            session_started_at: this.time_start,
            width: window.innerWidth, 
            height: window.innerHeight,
            origin: window.location.origin,
            tracking_data: {
                type: 'background',
                pathname: window.location.pathname,
                time:time_from_start,
                background: bckgr
            }
        }
        this.socket.emit('points_data', data);
    }
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
    var body = document.getElementsByTagName("BODY")[0];
    inst.time_start = Date.now();
    inst.socket = io.connect('http://127.0.0.1:1337');
    inst.session_id = inst.getSessionId();
    
    var ddd = document.documentElement.outerHTML;//.replace(/(\r\n|\n|\r)/gm,"");
    inst.sendBackgroundData(ddd)
    
    
    document.addEventListener("mousemove", function(e){
        inst.onmousemoveM(e);
    });
    

    body.addEventListener("mouseout", function (event) {
        inst.sendData();
    });


    document.addEventListener("click", function(e){

        var one = document.body.outerHTML;
        var sec = null;

        setTimeout(function(){
            sec = document.body.innerHTML;
            if(sec != one){
                console.log('robie SreenShot')
                ddd = document.documentElement.outerHTML;
                console.log(ddd)
                inst.sendBackgroundData(ddd)
            }else{
                console.log('pierdole Nie Robie')
            }
        }, 200);

    });
    
    
    
//    var observer = new MutationObserver(function(mutations) {
//        mutations.forEach(function(mutationRecord) {
//            console.log(mutationRecord);
//            
//        });    
//    });
//
////    var target = document.querySelectorAll('.welcome-featured-item')[0]
////        var target = document;//.getElementsByTagName('*')[0];
////        observer.observe(target, { attributes : true, attributeFilter : ['style', 'class'] });
//    
//    
//    [].slice.call(document.getElementsByTagName('*')).forEach(function(o,i,a){
//        observer.observe(o, { attributes : true, attributeFilter : ['style', 'class'] });
//    })    

};





document.addEventListener('DOMContentLoaded', init, false);

