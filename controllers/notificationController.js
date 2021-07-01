const socket = require('../utils/websockets');
const Post = require('../models/post');



const changePostStream = Post.watch()

changePostStream.on('change',()=>{
    const io = socket.getInstance()
    io.emit("send-notification", ()=>{
        console.log("neki se je spremenil")
    })
})