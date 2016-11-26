/**
 * ClientController
 *
 * @description :: Zwraca skrypty dla klientow
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');

module.exports = {
    /*
     * Zwraca skrypty dal clienta
     * @param {type} req
     * @param {type} response
     */
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
    },
    /*
     * Zwraca socket.io.min.js 1.4.5
     */
    getClientSocketScript: function (req, response) {
        fs.readFile('./client_scripts/socket.io.min.js', function (error, content) {
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