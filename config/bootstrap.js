/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

    // Tracking data handler
    sails.io.on('connect', function (socket){
        var address = socket.handshake.headers.origin
        console.log('1==========================================')
        console.log(socket)
        console.log('2==============================================')
        console.log('socket Connect: '+address);
        if(address && address != 'http://127.0.0.1:1337' && address != 'http://127.0.0.1:1337/'){
            console.log('Wait for data.');
            socket.on('points_data', function (data) {
                Tracker.insertTrackData(data);
            });
        }
        
    });
    
    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};
