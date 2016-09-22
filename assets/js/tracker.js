var Tracker = function (){
    this.trackData = null;
    this.flag = false;
    this.prevX = null;
    this.prevY = null;
    this.user_screen_width = 1366;
    this.cursor_tracking_data = null;
    this.number_of_data_portion = 0;
    
    this.canvas = document.getElementById('tracker-canvas');
    this.ctx = this.canvas.getContext("2d");
};

Tracker.prototype.drawTo = function (){
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(this.prevX, this.prevY);
    var inst = this;
    var counter = 0,
    inter = setInterval(function() {
        var point = inst.cursor_tracking_data[counter++];
        inst.ctx.lineTo(point.x, point.y); 
        inst.ctx.stroke();
        if (counter >= inst.cursor_tracking_data.length) {
           clearInterval(inter);
           
           inst.prevX = point.x;
           inst.prevY = point.y;
           console.log(inst.prevX, inst.prevY)
           inst.cursor_tracking_data = JSON.parse(inst.trackData).data[++inst.number_of_data_portion].data
           inst.drawTo();
        }
    }, 10);
    this.ctx.stroke();
};

Tracker.prototype.displayTrackingMap = function(tracker_data){
    this.trackData = tracker_data;
    this.cursor_tracking_data = JSON.parse(this.trackData).data[this.number_of_data_portion].data;
            console.log(this.cursor_tracking_data)
    // Scaling canvas
//    var container_width = document.getElementById('page-container').getBoundingClientRect().width;
//    var scale = container_width / this.user_screen_width;
//    var left = ((container_width - this.user_screen_width) * scale / 2) - 30;
//    
//    this.canvas.style.transform = 'scale(' + scale + ')';
//    this.canvas.style.left = left;
    
    var i = this.cursor_tracking_data.length;
    this.prevX = this.cursor_tracking_data[0].x;
    this.prevY = this.cursor_tracking_data[0].y;
    console.log('dupa')
    this.drawTo();

          
};

/*
 * Get tracker data
 */
Tracker.prototype.init = function() {
    var xhttp = new XMLHttpRequest();
    var tracker_inst = this;
    xhttp.open("POST", "/get-track-data", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({elo:'mordo'}));
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //document.getElementById("demo").innerHTML = this.responseText;
            tracker_inst.displayTrackingMap(xhttp.responseText);
            //console.log(xhttp.responseText);
            
        }
    };
    
    console.log('tracker init');
};