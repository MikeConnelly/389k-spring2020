var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var marked = require('marked');
var moment = require('moment');
var _ = require("underscore");
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var Challenge = require('./models/Challenge');
var Comment = require('./models/Comment');
var getTags = require('./utils/getTags');

dotenv.config();
console.log(process.env.MONGODB);
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('error', () => {
  console.log('MongoDB connection error');
  process.exit(1);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

/* Add whatever endpoints you need! Remember that your API endpoints must
 * have '/api' prepended to them. Please remember that you need at least 5
 * endpoints for the API, and 5 others.
 */

app.get('/', (req, res) => {
  Challenge.find({}).exec()
    .then(result => {
      const allTags = getTags(result);
      res.render('home', {
        data: result,
        tags: allTags,
        page: 'Recent Challenges'
      });
    })
    .catch(err => res.render(404));
});


app.get('/random', (req, res) => {
  Challenge.find({}).exec()
    .catch(err => res.render(404))
    .then(results => {
      const tags = getTags(results);
      const post = results[Math.floor(Math.random()*results.length)];
      Comment.find({ postID: post.id }).exec()
          .catch(err => res.render(404))
          .then(commentsWithID => {
            res.render('post', {
              post: post,
              tags: tags,
              comments: _.sortBy(commentsWithID, c => c.commentNumber)
            })
      });
    })
});


app.get('/easiest', (req, res) => {
  Challenge.find({}).exec()
    .then(results => {
      const tags = getTags(results);
      const sortedData = _.sortBy(results, post => post.difficulty);
      res.render('home', {
        data: sortedData,
        tags: tags,
        page: 'Easiest Challenges'
      });
    })
    .catch(err => res.render(404));
});


app.get('/hardest', (req, res) => {
  Challenge.find({}).exec()
    .then(results => {
      const tags = getTags(results);
      const sortedData = _.sortBy(results, post => post.difficulty).reverse();
      res.render('home', {
        data: sortedData,
        tags: tags,
        page: 'Hardest Challgenges'
      });
    })
    .catch(err => res.render(404));
});


app.get('/shortest', (req, res) => {
  Challenge.find({}).exec()
    .then(results => {
      const tags = getTags(results);
      const sortedData = _.sortBy(results, post => post.description.length);
      res.render('home', {
        data: sortedData,
        tags: tags,
        page: 'Challgenges With Short Descriptions'
      });
    })
    .catch(err => res.render(404));
});


app.get('/longest', (req, res) => {
  Challenge.find({}).exec()
    .then(results => {
      const tags = getTags(results);
      const sortedData = _.sortBy(results, post => post.description.length).reverse();
      res.render('home', {
        data: sortedData,
        tags: tags,
        page: 'Challgenges With Long Descriptions'
      });
    })
    .catch(err => res.render(404));
});


app.get('/tag/:tag', (req, res) => {
  Challenge.find({}).exec()
    .then(results => {
      const tags = getTags(results);
      const tag = req.params.tag;
      const postsWithTag = [];
      results.forEach(post => {
        if (post.tags.includes(tag)) {
          postsWithTag.push(post);
        }
      });
      res.render('home', {
        tag: tag,
        data: postsWithTag,
        tags: tags
      });
    })
    .catch(err => res.render(404));
});


app.get('/post/:id', (req, res) => {
  const _id = parseInt(req.params.id);
  Challenge.findOne({ id: _id }).exec()
    .catch(err => res.render(404))
    .then(result => {
      if (!result) {
        res.render(404);
      } else {
        const tags = getTags([result]);
        Comment.find({ postID: _id }).exec()
          .catch(err => res.render(404))
          .then(commentsWithID => {
            res.render('post', {
              post: result,
              tags: tags,
              comments: _.sortBy(commentsWithID, c => c.commentNumber)
            })
          });
      }
    })
});


app.get('/post/title/:title', (req, res) => {
  const title = req.params.title;
  Challenge.findOne({ title: title }).exec()
    .catch(err => res.render(404))
    .then(result => {
      if (!result) {
        res.render(404);
      } else {
        const tags = getTags([result]);
        Comment.find({ postID: result.id }).exec()
          .catch(err =>  res.render(404))
          .then(commentsWithID => {
            res.render('post', {
              post: result,
              tags: tags,
              comments: _.sortBy(commentsWithID, c =>  c.commentNumber)
            })
          })
      }
    });
});


app.get('/api/data', (req, res) => {
  Challenge.find({}).exec()
    .then(results => res.json(results))
    .catch(err => res.render(404));
});


app.get('/create', (req, res) => {
  res.render('create');
});


app.post('/api/create', (req, res) => {
  const body = req.body;
  const desc = marked(body.description);
  const tagsArray = (typeof body.tags === 'string') ? body.tags.split(' ') : body.tags;
  Challenge.findOne({}).sort('-id').exec((err, item) => {
    if (err) throw err;
    let id = 0;
    if (item) { id = item.id + 1; }

    const challenge = new Challenge({
      title: body.title,
      tags: tagsArray,
      description: desc,
      preview: desc.substring(0, 300),
      difficulty: body.difficulty,
      time: moment().format('MMMM Do YYYY, h:mm a'),
      id: id
    });
    challenge.save(err => {
      if (err) throw err;
      res.redirect('/');
    });
  });
});


app.post('/api/comment/:postID', (req, res) => {
  const text = req.body.text;
  const _postID = parseInt(req.params.postID);

  Comment.find({ postID: _postID }).exec((err, posts) => {
    if (err) throw err;
    let commentNum = posts ? posts.length : 0;

    const comment = new Comment({
      text: text,
      time: moment().format('MMMM Do YYYY, h:mm a'),
      postID: _postID,
      commentNumber: commentNum
    });
    comment.save(err => {
      if (err) throw err;
      res.redirect(`/post/${_postID}`);
    });
  });
})


// deletes a post and all associated comments
app.delete('/api/post/:id', (req, res) => {
  const id = parseInt(req.params.id);
  Challenge.deleteOne({ id: id }, err => {
    if (err) throw err;
    Comment.deleteMany({ postID: id }, err => {
      if (err) throw err;
      res.redirect('/');
    });
  });
});


//deletes a single comment
app.delete('/api/comment/:postID/:commentNum', (req, res) => {
  const postID = parseInt(req.params.postID);
  const commentNum = parseInt(req.params.commentNum);
  Comment.deleteOne({ postID: postID, commentNum: commentNum }, err => {
    if (err) throw err;
    res.redirect(`/post/${postID}`);
  });
})


http.listen(3000, () => {
  console.log('Listening on port 3000!');
});


io.on('connection', socket => {
  console.log('new connection');

  socket.on('new post', newPost => {
    io.emit('new post', newPost);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
