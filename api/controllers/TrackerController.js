/**
 * TrackerController
 *
 * @description :: Server-side logic for managing Trackers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /*
     * GET Wyświetla listę nagranych sesji z ruchem myszy.
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    displayTrackingSessionList: function (req, res) {
        return res.view('cursor_tracking/session_list');
    },
    /*
     * POST 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getSessionsList: function (req, res) {
        var obj = Tracker.find().sort('session_started_at DESC').exec(function (err, obj) {
            console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
            console.log(obj)
            return res.json({data:obj})
        });
    },
    /* 
     * GET Wyświetla tracking kursora wybranej sesji.
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    displayTracking: function (req, res) {
        var obj = Tracker.findOne({'tracker_id':req.param('tracker_id')}).exec(function (err, obj) {
            return res.view('cursor_tracking/tracker_panel', {
                    tracker_id: req.param('tracker_id')
                });
            console.log(obj);
            if(obj){
                return res.view('cursor_tracking/tracker_panel', {
                    tracker_id: req.param('tracker_id')
                });
            }else{
                return res.view('cursor_tracking/tracker_panel', {
                    tracker_id: null
                });
            }
        });
        
    },
    /*
     * POST Zwraca dane trakingu
     * @param {type} req
     * @param {type} res
     * @returns {object}
     */
    getTrackData: function (req, res) {
        var obj = Tracker.findOne({id: req.param('tracker_id')}).exec(function (err, obj) {
            return res.json({data:obj})
        });
    },
    /**
     * `TrackerController.index()`
     */
    index: function (req, res) {
        return 1;
        Tracker.find().find().exec(function (err, obj) {
            
//        res.setHeader('Content-Type', 'application/json');
            return res.view('tracker_panel', {
                data: JSON.stringify(obj)
            });
//            return res.json({
//                todo: obj
//            });
        });

    },
    /**
     * `TrackerController.getBackground()`
     *  dla tracking-panel
     */
    getBackground: function (req, res) {
        var obj = Tracker.findOne({id: req.param('tracker_id')}).exec(function (err, obj) {
            
            res.writeHead(200, {'content-type':'text/html'});
            res.write(obj.tracking_data[0].background);
            res.end();
        });
    },
    /**
     * `TrackerController.show()`
     */
    show: function (req, res) {
        return res.json({
            todo: 'show() is not implemented yet!'
        });
    },
    /**
     * `TrackerController.edit()`
     */
    edit: function (req, res) {
        return res.json({
            todo: 'edit() is not implemented yet!'
        });
    },
    /**
     * `TrackerController.delete()`
     */
    delete: function (req, res) {
        return res.json({
            todo: 'delete() is not implemented yet!'
        });
    }
};

