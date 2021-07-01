
const Post = require('../models/post');

exports.watchPostChange = () =>{
    const changePostStream = Post.watch();

changePostStream.on('change', (change)=>{
    console.log(JSON.stringify(change))
});
}

