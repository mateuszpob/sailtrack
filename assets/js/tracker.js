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

    this.canvas = document.getElementById('tracker-canvas');
    this.background = document.getElementById('tracker-background');
    this.ctx = this.canvas.getContext("2d");
    this.background_img = document.getElementById('bckgr');

    this.mouse_timeline = document.getElementById('mouse-timeline');
    this.mouse_timeline_ptr = document.getElementById('mouse-timeline-pointer');
    
    this.tracking_path = document.getElementById('tracking-path-wrapper');
};

Tracker.prototype.drawTo = function () {

    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(this.prevX, this.prevY);
    var inst = this;
    
    function inv(){
        inst.tracking_drav_interval = setInterval(function(){
            if(inst.counter+1 < inst.tracking_data_legth){
                var one_step = inst.trackData.tracking_data[inst.counter];
                
//                switch(one_step.type){
//                    case 'move':

                         console.log(one_step.x, one_step.y, Math.floor(one_step.time/1000))
                        // Sprawdz czy strona się nie zmieniła, jeśli tak, 
                        // ustaw odpowiedni adres w iframe
                        if(one_step.pathname != inst.trackData.tracking_data[inst.counter-1].pathname){
                            var temp_batckgorund = null;
                            inst.current_background_url = one_step.pathname;
                            if(one_step.type === 'background'){
//                                console.log('PATHNAME:  '+one_step.background)
                                temp_batckgorund = one_step.background;
                                // przeskocz krok z backgroundem, po jego ustawieniu
                                inst.counter++;
                                one_step = inst.trackData.tracking_data[inst.counter];
                            }
                            
                            
                            clearInterval(inst.tracking_drav_interval);
                            inst.timeline_is_paused = true; // zapalzuj timeline
                            setTimeout(function(){
                                inst.setPathStepToActive(one_step.pathname); // zaznacz aktualną podstronę
                                inst.clearCanvas();
                                // podmnien html'a z backgroundem
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

Tracker.prototype.displayTrackingMap = function () {
    // Skalowanie canvasa i  backgrounda 
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.canvas.style.transform = 'scale(' + this.tracking_scale + ')';
    this.canvas.style.transformOrigin = '0 0';
    
    this.background.width = 1920;
    this.background.height = 1080;
    this.background.style.transform = 'scale(' + this.tracking_scale + ')';
    this.background.style.transformOrigin = '0 0';
    
    if(!this.background_light)
        this.background = this.background.contentWindow || ( this.background.contentDocument.document || this.background.contentDocument);
    
       
    var height = this.canvas.height * this.tracking_scale + 10;
    this.canvas.insertAdjacentHTML('afterend', '<div style="width:100%;height:' + height + 'px"></div>');
    
    // ustaw pierwsza strone
    this.current_background_url = this.trackData.tracking_data[0].pathname
    this.changeTrackedPage(this.trackData.tracking_data[0].background);
    
    this.prevX = this.trackData.tracking_data[0].x;
    this.prevY = this.trackData.tracking_data[0].y;
    this.last_time = this.trackData.tracking_data[0].time;
    
    // dopiero ta funkcja wszystko rysuje
    this.drawTo();
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
 * Zmienia url w iframe
 */
Tracker.prototype.changeTrackedPage = function(html) {
    if(this.background_light){
        this.background.src = this.trackData.origin + this.current_background_url;
    }else{
        this.background.document.open();
        this.background.document.write(html);
        this.background.document.close();
    }
    
}
/**
 * Czyści canvas
 */
Tracker.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, 1920, 1080);
    console.log('CLEAR CANVAS')
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
    console.log('GOSTEPLOCKER')
    this.go_step_locker = false;
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
            //document.getElementById("demo").innerHTML = this.responseText;
            setTimeout(function(){
                tracker_inst.trackData = JSON.parse(xhttp.responseText).data;
                tracker_inst.tracking_data_legth = tracker_inst.trackData.tracking_data.length;
                
                // wyswietla wszystkie stronu jakie odwiedził user podczas danej sesji
                tracker_inst.displayTrackingPath();
                
                // zacznij rysować 
                tracker_inst.displayTrackingMap();
                
                // wyświetl linie czasu z zaznaczonymi eventami
                tracker_inst.runTimeline();
            }, tracker_inst.startDelay);
        }
    };

};