var Tracker = function () {
    this.trackData = null;
    this.flag = false;
    this.prevX = null;
    this.prevY = null;
    this.user_screen_width = 1920;
    this.number_of_data_portion = 0;
    this.tracking_scale = 0.83;
    this.last_time = null;
    this.startDelay = 1000;
    this.animation_locked = false; 
    this.tracking_data_legth = null;
    this.current_background_url = null;

    this.canvas = document.getElementById('tracker-canvas');
    this.background = document.getElementById('tracker-background');
    this.ctx = this.canvas.getContext("2d");

    this.mouse_timeline = document.getElementById('mouse-timeline');
    this.mouse_timeline_ptr = document.getElementById('mouse-timeline-pointer');
};

Tracker.prototype.drawTo = function () {

    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(this.prevX, this.prevY);
    var inst = this;
    var counter = 1;
    var inter = null;
    
    function inv(){
        inter = setInterval(function(){
            if(counter+1 < inst.tracking_data_legth){
                var one_step = inst.trackData.tracking_data[counter];
                //console.log(one_step.x, one_step.y, Math.floor(one_step.time/1000))
                // Sprawdz czy strona się nie zmieniła, jeśli tak, 
                // ustaw odpowiedni adres w iframe
                if(one_step.pathname != inst.current_background_url){
                    console.log('Pathname: '+one_step.pathname)
                    inst.current_background_url = one_step.pathname;
                    
                    clearInterval(inter);
                    
//                    var c = document.getElementById('tracker-canvas');
//                    var ctx = c.getContext("2d");
//                    ctx.clearRect(0,0,1920,1080);
                    setTimeout(function(){
                        inst.clearCanvas();
                        inst.changeTrackedPage();
                        setTimeout(function(){
                            inst.ctx.beginPath();
                            inst.ctx.lineTo(one_step.x, one_step.y);
                            inst.ctx.stroke();
                            counter++;
                            inter = window.clearInterval(inter);
                            inv();
                        }, 1000);
                    }, 500);
                }else{
                    inst.ctx.lineTo(one_step.x, one_step.y);
                    inst.ctx.stroke();
                    counter++;
                    inter = window.clearInterval(inter);
                    inv();
                }
            }else{
                inst.animation_locked = true;
                clearInterval(inter);
            }
        }, (inst.trackData.tracking_data[counter].time - inst.trackData.tracking_data[counter-1].time));
    }
    
    inv();
    
};

Tracker.prototype.displayTrackingMap = function (tracker_data) {
    this.trackData = JSON.parse(tracker_data).data;
    this.tracking_data_legth = this.trackData.tracking_data.length;

    // Scaling canvas
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.canvas.style.transform = 'scale(' + this.tracking_scale + ')';
    this.canvas.style.transformOrigin = '0 0';
    this.background.width = 1920;
    this.background.height = 1080;
    this.background.style.transform = 'scale(' + this.tracking_scale + ')';
    this.background.style.transformOrigin = '0 0';
    var height = this.canvas.height * this.tracking_scale + 10;
    this.canvas.insertAdjacentHTML('afterend', '<div style="width:100%;height:' + height + 'px"></div>');

    this.current_background_url = this.trackData.tracking_data[0].pathname
    this.prevX = this.trackData.tracking_data[0].x;
    this.prevY = this.trackData.tracking_data[0].y;
    this.last_time = this.trackData.tracking_data[0].time;
    
    // ustaw odpowiednią stronę na iframe, początkową
    this.changeTrackedPage();
    
    this.drawTo();


};

Tracker.prototype.runTimeline = function () {
    var timeline_width = this.mouse_timeline.offsetWidth - 6;  
    var end_time = this.trackData.tracking_data[this.tracking_data_legth - 1].time;
    var tracker_inst = this;
    var pos = 0;
    
    var step_time = end_time/timeline_width;
    var timeline_interval = setInterval(function(){
        tracker_inst.mouse_timeline_ptr.style.left = pos + 'px';
        pos++;
        if(pos >= timeline_width){
            clearInterval(timeline_interval);
        }
    }, step_time);
    
    
    var end_date = new Date(end_time);

    document.getElementById("time-total").innerHTML = ('0' + (end_date.getHours()-1).toString()).slice(-2) + ':' 
            + ('0' + end_date.getMinutes()).slice(-2) + ':' 
            + ('0' + end_date.getSeconds()).slice(-2);
    
    var curr_time = 0;
    var curr_mins = 0;
    myTimer();
    
    function myTimer() {
        var d = new Date();
        var curr_sec = curr_time % 60;
        if(curr_time > 0 && curr_sec == 0){
            curr_mins++;
        }
        document.getElementById("time-current").innerHTML = curr_mins + ':' + curr_sec;
        curr_time++;
        if(!tracker_inst.animation_locked)
            setTimeout(myTimer, 1000);
    }

};
/**
 * Zmienia url w iframe
 */
Tracker.prototype.changeTrackedPage = function() {
    this.background.src = this.trackData.origin + this.current_background_url;
}
/**
 * Czyści canvas
 */
Tracker.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, 1920, 1080);
    console.log('CLEAR CANVAS')
}
/**
 * Pobierz dane trakingu przez ajax
 */
Tracker.prototype.init = function (tracker_id) {
    var xhttp = new XMLHttpRequest();
    var tracker_inst = this;
    xhttp.open("POST", "/mouse-tracker/display-tracking/" + tracker_id, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({elo: 'mordo'}));
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //document.getElementById("demo").innerHTML = this.responseText;
            setTimeout(function(){
                tracker_inst.displayTrackingMap(xhttp.responseText);
                tracker_inst.runTimeline();
            }, tracker_inst.startDelay);
        }
    };

};