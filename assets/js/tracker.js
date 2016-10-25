var Tracker = function () {
    this.trackData = null;
    this.flag = false;
    this.prevX = null;
    this.prevY = null;
    this.background_light = false; // czy renderowac zdarzenai z htmla (true), czy na iframe z aktualna strona (false)
    this.user_screen_width = 1920;
    this.number_of_data_portion = 0;
    this.tracking_scale = 0.825; // skala canvasa i backgroundu
    this.last_time = null;
    this.startDelay = 1000; // rysowanie zaczyna sie po tym czasie (ms)
    this.animation_locked = false; 
    this.tracking_data_legth = null; // liczba wszystkich kroków (pozycji x + y + time ...)
    this.current_background_url = null; // url podstrony na ktorej w danym momencie znalazl sie user
    this.tracking_patch = []; // przebyta podczas jednej sesji ścieżka (urle podstron)
    this.counter = 1; // licznik krokow w rysowaniu ścieżki
    this.tracking_drav_interval = null; // interval do rysowania sciezki
    this.timeline_interval = null; // interval do lini czasu
    this.timeline_is_paused = false; // do zatrzymywania lini czasu (np przy przechodzeniu między podstronami sesji)
    this.go_step_locker = false; // blokada przycisków go_step, jak jeden step sie laduje to zeby nie klikac, bo i na huj
    this.redirect_steps = [];

    this.canvas = null; //document.getElementById('tracker-canvas');
    this.background = null; //document.getElementById('tracker-background');
    this.background_content = null; //this.background.contentWindow || ( this.background.contentDocument.document || this.background.contentDocument);
    //this.ctx = this.canvas.getContext("2d");

    this.mouse_timeline = document.getElementById('mouse-timeline');
    this.mouse_timeline_ptr = document.getElementById('mouse-timeline-pointer');
    
    this.events_counter = 1;
    this.events_interval = null;
    this.events_data_legth = 0;
    
    this.tracking_path = document.getElementById('tracking-path-wrapper');
};

Tracker.prototype.trackingDrawStart = function () {

    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(this.prevX, this.prevY);
    var inst = this;
    
    function inv(){
        inst.tracking_drav_interval = setInterval(function(){
            if(inst.counter+1 < inst.tracking_data_legth){
                var one_step = inst.trackData.tracking_data[inst.counter];
                var temp_batckgorund = null;
                if(one_step.type === 'background'){
                    temp_batckgorund = one_step.background;
                    // przeskocz krok z backgroundem, po jego ustawieniu
                    inst.counter++;
                    one_step = inst.trackData.tracking_data[inst.counter];
                }
//                switch(one_step.type){
//                    case 'move':

                         //console.log(one_step.x, one_step.y, Math.floor(one_step.time/1000))
                        // Sprawdz czy strona się nie zmieniła, jeśli tak, 
                        // ustaw odpowiedni adres w iframe
                        if(one_step.pathname != inst.trackData.tracking_data[inst.counter-1].pathname){
                            
                            inst.current_background_url = one_step.pathname;
                            
                            
                            
                            clearInterval(inst.tracking_drav_interval);
                            inst.timeline_is_paused = true; // zapalzuj timeline
                            setTimeout(function(){
                                //inst.setPathStepToActive(one_step.pathname); // zaznacz aktualną podstronę
                                inst.clearCanvas();
                                // podmnien html'a z backgroundem
                                if(temp_batckgorund)
                                    inst.changeTrackedPage(temp_batckgorund);
                                //inst.changeTrackedPage();
                                setTimeout(function(){
                                    inst.timeline_is_paused = false; // wystartuj ponownie timeline
                                    inst.ctx.beginPath();
                                    inst.ctx.lineTo(one_step.x, one_step.y);
                                    inst.ctx.stroke();
                                    inst.counter++;
                                    inst.tracking_drav_interval = window.clearInterval(inst.tracking_drav_interval);
                                    inv();
                                }, 1000);
                            }, 500);
                        }else{
                            if(temp_batckgorund)
                                    inst.changeTrackedPage(temp_batckgorund);
                            inst.ctx.lineTo(one_step.x, one_step.y);
                            inst.ctx.stroke();
                            inst.counter++;
                            inst.tracking_drav_interval = window.clearInterval(inst.tracking_drav_interval);
                            inv();
                        }
//                        break;
//                    case 'background':
//                        console.log('BCKGR')
//                        if(one_step.background !== null && one_step.background !== 'undefined')
//                            inst.background.innerHtml = one_step.background;
//                        inst.counter++;
//                        inv();
//                        break;
//                }
            }else{
                inst.animation_locked = true;
                clearInterval(inst.tracking_drav_interval);
            }
        }, (inst.trackData.tracking_data[inst.counter].time - inst.trackData.tracking_data[inst.counter-1].time));
    }
    
    inv();
    
};

Tracker.prototype.emitScrollEvents = function () {
    var inst = this;
//    console.log('Start Emit Events!')

    function scrl(x1, x2, t1, t2) {
        var total_time = t2 - t1;
        var total_scroll = x2 - x1;
        var one_step_t = total_time /  total_scroll;
        
//        return;
        
        var body = document.getElementById('tracker-background').contentWindow.document.getElementsByTagName('body')[0];
        
        var interval = setInterval(function() {
            if(one_step_t >= 0){ console.log('JAZDA w Dół, time:'+t1)
                body.scrollTop += 2;
                if(body.scrollTop >= x2) 
                    clearInterval(interval);
            }else{ console.log('JAZDA w GóRE, time:'+t1)
                body.scrollTop -= 2;
                if(body.scrollTop <= x2)
                    clearInterval(interval);
            }
        }, Math.abs(one_step_t * 2));
        
    };
    
    function init() {
        if(inst.events_counter+1 < inst.events_data_legth){
            var one_step = inst.trackData.events_data[inst.events_counter];
            setTimeout(function() {
                inst.events_counter++;
                scrl(one_step.start_scroll, one_step.end_scroll, one_step.start_time, one_step.end_time);
                init();
            }, (one_step.start_time - (inst.trackData.events_data[inst.events_counter-1].end_time)));
            
        }
    };
    init();
};


Tracker.prototype.runTimeline = function () {
    var tracker_inst = this;
    var timeline_width = this.mouse_timeline.offsetWidth - 6;  
    var end_time = 0;
    // oblicz czas wszystkich stepow
    this.redirect_steps.forEach(function(o, i, a) {
        end_time += tracker_inst.trackData.tracking_data[o].time;
    });
    
    var pos = 0;
    
    var step_time = end_time/timeline_width;
    tracker_inst.timeline_interval = setInterval(function(){
        // przechodzenie miedzy podstronami pałzuje
        if(!tracker_inst.timeline_is_paused){
            tracker_inst.mouse_timeline_ptr.style.left = pos + 'px';
            pos++;
        }
        if(pos >= timeline_width){
            clearInterval(tracker_inst.timeline_interval);
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
 * Czyści canvas
 */
Tracker.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, 1920, 1080);
    //console.log('CLEAR CANVAS')
}
/**
 * Wyswietla wszystkie stronu jakie odwiedził user podczas danej sesji
 */
Tracker.prototype.displayTrackingPath = function() {
    var inst = this;
    var tmp = '';
    var one_step_html = '';
    
    this.trackData.tracking_data.forEach(function(e, i, a){
        if(tmp != e.pathname){
            if(i > 0)
                inst.redirect_steps.push(i-1);

            inst.tracking_patch.push(e.pathname);
            tmp = e.pathname;
            
            // wyświetl to
            one_step_html = '<div class="path-step" onclick="tracker.goToStep(this)" data-number="'+i+'" data-path="'+tmp+'">'+tmp+'</div><div class="path-step-arrow" data-path="'+tmp+'"></div>';
            var node = document.createElement('node');
            node.innerHTML = one_step_html;
            inst.tracking_path.appendChild(node);
        }
    });
    // dodaj ostatni step
    inst.redirect_steps.push(inst.tracking_data_legth-1)
    // ustaw pierwszemu active
    document.getElementsByClassName('path-step')[0].className += ' active';
    document.getElementsByClassName('path-step-arrow')[0].className += ' active';
};
Tracker.prototype.setPathStepToActive = function(url) {
    // odznacz przyciski path-step
    document.querySelectorAll('.path-step').forEach(function(e, i, a){
        e.className = 'path-step';
    });
    document.querySelectorAll('.path-step-arrow').forEach(function(e, i, a){
        e.className = 'path-step-arrow';
    });
    // ustaw active odpowiedniemu path-step i path-step-arrow
    var path_node = document.querySelectorAll('[data-path="'+url+'"]')
    path_node.forEach(function(e, i ,a){
        e.className += ' active';
    });
};
/**
 * Przejdz do konkretnego kroku
 */
Tracker.prototype.goToStep = function(o) {
    clearInterval(this.tracking_drav_interval);
    var nr = parseInt(o.getAttribute('data-number'));
    this.clearCanvas();
    if(nr==0) nr = 1; // bo od jedynki trzeba startować (0 jest do ustawienia rysowarki w odpowiednim miejscu)
    if(!this.go_step_locker){
        this.go_step_locker = true;
        this.counter = nr;
        this.prevX = this.trackData.tracking_data[nr].x;
        this.prevY = this.trackData.tracking_data[nr].y;
        this.drawTo();
    }
    //console.log('GOSTEPLOCKER')
    this.go_step_locker = false;
};


/**
 * Zmienia url w iframe
 */
Tracker.prototype.changeTrackedPage = function(html) {
//    if(this.background_light){
//        this.background_content.src = this.trackData.origin + this.current_background_url;
//    }else{
//        this.background_content.document.open();
//        this.background_content.document.write(html);
//        this.background_content.document.close();
//    }
    
}
/*
 * Doklej canvas do srodka iframe
 */
Tracker.prototype.initCanvasAndBackground = function () {
    var inst = this;
    this.current_background_url = this.trackData.tracking_data[0].pathname;
    // this.changeTrackedPage(this.trackData.tracking_data[0].background)
    console.log('Start canvas elo elo')
    
    this.background = window.frames['tracker-background'];
    this.background.document.open();
    this.background.document.write(this.trackData.tracking_data[0].background);
    this.background.document.close();
    
    this.background_content = this.background.document;
    
    this.background.onload = function() {
        
        inst.canvas = inst.background.document.createElement('canvas');
        inst.canvas.id = 'tracker-canvas';
        inst.canvas.style.position = 'absolute';
        inst.canvas.style.top = 0;
        var x = inst.background.document.body.appendChild(inst.canvas);
        inst.ctx = inst.canvas.getContext("2d");
        console.log(x);
        
        inst.initTrackingMap();
        
    };
//inst.background_content = inst.background.contentDocument || inst.background.contentWindow.document;
}

Tracker.prototype.initTrackingMap = function () { //console.log(this.trackData)
    this.background = document.getElementById('tracker-background')
    // ustaw dlugosci danych trackingu kursora i eventow
    this.tracking_data_legth = this.trackData.tracking_data.length;
    this.events_data_legth = this.trackData.events_data.length;
    

    console.log('ViewPort: '+this.trackData.viewport_width)
    // Skalowanie backgrounda 
    this.background.width = this.trackData.viewport_width;
    this.background.height = this.trackData.viewport_height;
    this.background.style.transform = 'scale(' + this.tracking_scale + ')';
    this.background.style.transformOrigin = '0 0';
    
    // Skalowanie canvasa 
    this.canvas.width = this.trackData.document_width;
    this.canvas.height = this.background_content.body.scrollHeight;// this.trackData.document_height;
//    this.canvas.style.transform = 'scale(' + this.tracking_scale + ')';
//    this.canvas.style.transformOrigin = '0 0';
       
    var height = this.canvas.height * this.tracking_scale + 10;
    // this.canvas.insertAdjacentHTML('afterend', '<div style="width:100%;height:' + height + 'px"></div>');
    
    
    
    this.prevX = this.trackData.tracking_data[0].x;
    this.prevY = this.trackData.tracking_data[0].y;
    this.last_time = this.trackData.tracking_data[0].time;
    
    // wystartuj reszte funkcji do rysowania etc
    this.startTracker();
    
};
Tracker.prototype.startTracker = function (){
    var tracker_inst = this;
    setTimeout(function(){
        // wyswietla wszystkie strony jakie odwiedził user podczas danej sesji
        tracker_inst.displayTrackingPath();

        // start rysowania trackingu
        tracker_inst.trackingDrawStart();

        // odpalaj nagrane eventy
        tracker_inst.emitScrollEvents();

        // wyświetl linie czasu z zaznaczonymi eventami
        tracker_inst.runTimeline();
    }, tracker_inst.startDelay);
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
            
            // ustaw dane do rysowania, eventy, background ... 
            tracker_inst.initCanvasAndBackground();
            
        }
    };

};