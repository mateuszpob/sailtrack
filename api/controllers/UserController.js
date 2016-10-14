/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * `UserController.index()`
     */
    index: function (req, res) {
        return res.json({
            todo: 'index() is not implemented yet!'
        });
    },
    /**
     * `UserController.create()`
     */
    create: function (req, res) {
        var params = req.params.all();
        Tracker.create({session_id: params.session_id, data: params.data}).exec(function createCB(err, created) {
            return res.json({notice: 'Created tracklog for: ' + created.session_id});
        });
    }, 
    /**
     * `UserController.show()`
     */
    show: function (req, res) {
        return res.json({
            todo: 'show() is not implemented yet!'
        });
    },
    /**
     * `UserController.edit()`
     */
    edit: function (req, res) {
        return res.json({
            todo: 'edit() is not implemented yet!'
        });
    },
    /**
     * `UserController.delete()`
     */
    delete: function (req, res) {
        return res.json({
            todo: 'delete() is not implemented yet!'
        });
    },
    
    
    
};

