const sio = require('socket.io');

let io = null;
module.exports = {
    //Initialize the socket server
    initialize: function(httpServer) {
        io = sio(httpServer, {
          cors: {
            origin: '*',
          }
        });
        io.on('connection', function(socket) {
            console.log('New client connected with id = ', socket.id);
            socket.on('disconnect', function(reason) {
                console.log('A client disconnected with id = ', socket.id, " reason ==> ", reason);
            });
        });

    },
    //return the io instance
    getInstance: function() {
        return io;
    }
}

