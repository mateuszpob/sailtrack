/**
 * ClientController
 *
 * @description :: Zwraca skrypty dla klientow
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');

module.exports = {
    getClientTrackingScript: function (req, response) {
        fs.readFile('./client_scripts/mouse_tracker.js', function (error, content) {
            if (error) {
                response.writeHead(500);
                response.end();
            } else {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(content, 'utf-8');
            }
        });
    }
};