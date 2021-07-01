const socket = require('../utils/websockets');
const Post = require('../models/post');



const changePostStream = Post.watch();

changePostStream.on('change', (change)=>{
    console.log(JSON.stringify(change))
})