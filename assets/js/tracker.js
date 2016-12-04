var Tracker = function () {
    this.trackData = null;
    this.flag = false;
    this.prevX = null;
    this.prevY = null;
    this.number_of_data_portion = 0;
    this.tracking_scale = 0.825; // skala canvasa i backgroundu
    this.last_time = null;
    this.startDelay = 1000; // rysowanie zaczyna sie po tym czasie (ms)
    this.animation_locked = false; 
    this.move_data_legth = null; // liczba wszystkich kroków (pozycji x + y + time ...)
    this.tracking_patch = []; // przebyta podczas jednej sesji ścieżka (urle podstron)
    this.counter = 1; // licznik krokow w rysowaniu ścieżki
    this.tracking_drav_interval = null; // interval do rysowania sciezki
    this.timeline_interval = null; // interval do lini czasu
    this.timeline_is_paused = false; // do zatrzymywania lini czasu (np przy przechodzeniu między podstronami sesji)
    this.go_step_locker = false; // blokada przycisków go_step, jak jeden step sie laduje to zeby nie klikac, bo i na huj
    this.redirect_steps = [];
    this.time_start_script = null;
    this.time_temp = 0;
    
    this.events_timer_interval = null; // wersja z timerem: główny timer eventów (interval)
    this.run_time = null; // czas w ktorym rozpocznie się odtwarzanie eventow
    this.first_event_time = null;
    this.last_event_time = null;

    this.canvas = null; //document.getElementById('tracker-canvas');
    this.background = null; //document.getElementById('tracker-background');
    this.background_content = null; //this.background.contentWindow || ( this.background.contentDocument.document || this.background.contentDocument);
    //this.ctx = this.canvas.getContext("2d");

    this.mouse_timeline = document.getElementById('mouse-timeline');
    this.mouse_timeline_ptr = document.getElementById('mouse-timeline-pointer');
    
    this.events_counter = 1;
    this.events_interval = null;
    this.scroll_data_legth = 0;
    
    this.tracking_path = document.getElementById('tracking-path-wrapper');
};

/**
 * Pobierz dane trakingu przez ajax, odpal nastepne funkcje
 */
Tracker.prototype.init = function (tracker_id) {
    var xhttp = new XMLHttpRequest();
    var tracker_inst = this;
    xhttp.open("POST", "/mouse-tracker/display-tracking/" + tracker_id, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({elo: 'mordo'}));
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            
            tracker_inst.trackData = JSON.parse(xhttp.responseText).data;
            
            tracker_inst.findFirsAndLastEventTime();
            // przeskaluj iframe i overlay
            tracker_inst.scaleBackground(tracker_inst.trackData.background_data['10']);
            // ustaw dane do rysowania, eventy, background ... 
            this.time_start_script = new Date();
            tracker_inst.initCanvasAndBackground(tracker_inst.trackData.background_data['10']);
            
           
        }
    };
};
/*
 * Skaluje iframe i overlay na nim przed osadzeniem html'a
 * @returns {undefined}
 */
Tracker.prototype.scaleBackground = function (one_step) {
    this.background = document.getElementById('tracker-background');
    this.background.width = one_step.viewport_width;
    this.background.height = one_step.viewport_height;
    this.background.style.transform = 'scale(' + this.tracking_scale + ')';
    this.background.style.transformOrigin = '0 0';
    
    document.getElementById('overlay').style.width = one_step.viewport_width+"px";
    document.getElementById('overlay').style.height = one_step.viewport_height+"px";
    document.getElementById('overlay').style.transform = 'scale(' + this.tracking_scale + ')';
    document.getElementById('overlay').style.transformOrigin = '0 0';
    document.getElementById('overlay').style['z-index'] = 2147483647;
};
/*
 * Ustawia czas pierwszego eventu i ostatniego eventu + liczba eventów move & scroll
 * @returns {undefined}
 */
Tracker.prototype.findFirsAndLastEventTime = function () {
    var temp_first_time = 99999999;
    var temp_last_time = 0;
    
    for (var o in this.trackData.move_data){
        if(temp_first_time >= parseInt(o))
            temp_first_time = parseInt(o);
        
        if(temp_last_time <= parseInt(o))
            temp_last_time = parseInt(o);
    }
    for (var o in this.trackData.scroll_data){
        if(temp_first_time >= parseInt(o))
            temp_first_time = parseInt(o);
        
        if(temp_last_time <= parseInt(o))
            temp_last_time = parseInt(o);
    }
    this.first_event_time = temp_first_time;
    this.last_event_time = temp_last_time;
    
    // ustaw dlugosci danych trackingu kursora i eventow
    this.move_data_legth = this.trackData.move_data.length;
    this.scroll_data_legth = this.trackData.scroll_data.length;
};
/*
 * Osadza html'a w iframe i
 * dokleja canvas do srodka iframe
 */
Tracker.prototype.initCanvasAndBackground = function (one_step) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(one_step.background, 'text/html');
    
    var base = doc.createElement('base');
    base.href = 'http://hiveware.ws';
    doc.getElementsByTagName('head')[0].insertBefore(base, doc.getElementsByTagName('head')[0].firstChild)
    
    var inst = this;
//    var bckgr = $.parseHTML(one_step.background);
    var bckgr = new XMLSerializer().serializeToString(doc);// one_step.background;
    
    bckgr = bckgr.replace(/(&lt;)/g,"<").replace(/(&gt;)/g,">").replace(/(&amp;)/g,"&").replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "");
  
    this.background = window.frames['tracker-background'];
    this.background.document.open();
    this.background.document.write(bckgr);
    this.background.document.close();
//    this.background.document.appendChild(doc.documentElement)
    this.background_content = this.background.document;
    
    this.background.onload = function() {
        // init canvas
        inst.canvas = inst.background.document.createElement('canvas');
        inst.canvas.id = 'tracker-canvas';
        inst.canvas.style.position = 'absolute';
        inst.canvas.style.top = 0;
        inst.canvas.style['z-index'] = 2147483646;
        inst.canvas.width = one_step.document_width;
        inst.canvas.height = inst.background_content.body.scrollHeight;
        
        // init mouse cursor
        inst.tracker_cursor = inst.background.document.createElement('div');
        inst.tracker_cursor.id = 'tracker-cursor';
        inst.tracker_cursor.style.position = 'absolute';
        inst.tracker_cursor.style.width = 90;
        inst.tracker_cursor.style.height = 90;
        inst.tracker_cursor.style.background = 'url(http://127.0.0.1:1337/images/mouse_cursor_2.png)';
        inst.tracker_cursor.style['background-size'] = 'contain';
        inst.tracker_cursor.style['z-index'] = 2147483647;
        
        // add base
//        var base = inst.background.document.createElement('base')
//        base.href = 'http://hiveware.ws'
//        inst.background.document.getElementsByTagName('head')[0].insertBefore(base, inst.background.document.getElementsByTagName('head')[0].firstChild)

        // append canvas and cursor to embed document
        inst.background.document.body.appendChild(inst.canvas);
        inst.setCursorPosition();
        inst.background.document.body.appendChild(inst.tracker_cursor);
       
        inst.time_start = Date.now() - inst.time_temp;
        
        inst.runTimer();
        
    };
//inst.background_content = inst.background.contentDocument || inst.background.contentWindow.document;
};

/*
 * Ustawia kursor myszy i poczatek rysowania na canvasie.
 * Odpalane po zaladowaniu nowego backgrounda
 */
Tracker.prototype.setCursorPosition = function () {
    this.ctx = this.canvas.getContext("2d");
    var t = this.time_temp;
    var i = 0;
    while(this.trackData.move_data[t] === undefined || i<this.move_data_legth){
        i++;
        t += 10;
    }
    if(this.trackData.move_data[t]){
        this.ctx.beginPath();
        this.ctx.strokeStyle = "black";
        this.ctx.moveTo(this.trackData.move_data[t].x, this.trackData.move_data[t].y);
        // ustaw kursor (obrazek myszk)
        this.tracker_cursor.style.top = this.trackData.move_data[t].y;
        this.tracker_cursor.style.left = this.trackData.move_data[t].x;
    }
    
};
/*
 * Główny timer odpalający wszystkie eventy.
 */
Tracker.prototype.runTimer = function (){
    var inst = this;
    
    this.events_timer = setInterval(function(){ 
        inst.time_temp = Math.round((Date.now() - inst.time_start) / 10) * 10;
        
        inst.mouseMoveEvent(inst.trackData.move_data[""+inst.time_temp]); 
        inst.scrollEvent(inst.trackData.scroll_data[""+inst.time_temp]); 
        inst.backgroundEvent(inst.trackData.background_data[""+inst.time_temp], inst.time_temp); 
           
        if(inst.time_temp >= inst.last_event_time)
            clearInterval(inst.events_timer);
    }, 10);
    
};






 
/*______________________________________________________________________________
 * EVENTY
 */
Tracker.prototype.backgroundEvent = function (one_step, t){ 
    if(one_step){
        var inst = this;
        clearInterval(this.events_timer);
        this.time_start = this.time_temp;
        setTimeout(function(){
            inst.initCanvasAndBackground(one_step);
        }, 500);
          
    }
};
Tracker.prototype.mouseMoveEvent = function (one_step){
    if(one_step){
        this.ctx.lineTo(one_step.x, one_step.y);
        this.ctx.stroke()
        this.tracker_cursor.style.top = one_step.y-30;
        this.tracker_cursor.style.left = one_step.x-40;
    }
};
Tracker.prototype.scrollEvent = function (one_step){
    if(one_step){
        var total_time = one_step.end_time - one_step.start_time;
        var total_scroll = one_step.end_scroll - one_step.start_scroll;
        var one_step_t = 10 * total_time /  total_scroll;
        
        
        var body = document.getElementById('tracker-background').contentWindow.document.getElementsByTagName('body')[0];
        
//        var body = this.background.document.body
        
        var interval = setInterval(function() {
            if(one_step_t >= 0){
                body.scrollTop += 10;
                if(body.scrollTop >= one_step.end_scroll) 
                    clearInterval(interval);
            }else{
                body.scrollTop -= 10;
                if(body.scrollTop <= one_step.end_scroll)
                    clearInterval(interval);
            }
        }, Math.abs(one_step_t));
        
    }
}; 







