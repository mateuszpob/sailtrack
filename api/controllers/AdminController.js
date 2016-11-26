/**
 * AdminController
 *
 * @description :: Server-side logic for managing Trackers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /*
     * GET Wyświetla dashboard.
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    displayDashboard: function (req, res) {
        return res.view('dashboard');
    },
    
    test: function (req, res) {
        return res.view('test');
    }
};