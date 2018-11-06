const SioServer = require('socket.io')
const io = new SioServer(8001)

const redis = require('redis')
const sub = redis.createClient()

//Subscribe to the Redis chat channel
sub.subscribe('push_channel')

io.sockets.on('connection', function(socket) {

  // Grab message from Redis and send to client
  sub.on('message', function(channel, message) {
    socket.send(message)
  })

})
