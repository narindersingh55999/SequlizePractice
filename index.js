const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const port = 7000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const sequelize = new Sequelize("test", "root", "", {
  dialect: "mysql",
});

const blog_table = sequelize.define(
  "blog_table",
  {
    title: Sequelize.STRING,
    desc: Sequelize.TEXT,
  },
  { tableName: "blog_table" }
);

blog_table.sync();

sequelize
  .authenticate()
  .then(() => {
    console.log("connection made successfully");
  })
  .catch((err) => console.log(err, "this has a error"));

  // const User = sequelize.define('user', {
  //   name: Sequelize.STRING,
  //   email: Sequelize.STRING
  // });
  
  // // Define the Order model
  // const Order = sequelize.define('order', {
  //   totalAmount: Sequelize.FLOAT,
  //   status: Sequelize.STRING
  // });
  
  // // Define the association between User and Order
  // User.hasMany(Order);
  // Order.belongsTo(User);


  const User = sequelize.define('user', {
    name: Sequelize.STRING,
    email: Sequelize.STRING
  });
  
  const Post = sequelize.define('post', {
    title: Sequelize.STRING,
    body: Sequelize.TEXT
  });
  
  // Define the many-to-many association between User and Post
  const UserPost = sequelize.define('user_post', {});
  
  User.belongsToMany(Post, { through: UserPost });
  Post.belongsToMany(User, { through: UserPost });


  // const User = sequelize.define('user', {
  //   name: Sequelize.STRING,
  //   email: Sequelize.STRING
  // });
  
  // const Order = sequelize.define('order', {
  //   totalPrice: Sequelize.INTEGER
  // });
  
  // // Define the one-to-many association between User and Order
  // User.hasMany(Order);
  // Order.belongsTo(User);

  const user = await User.findByPk(1); // Get the user with id=1
const orders = await user.getOrders();

const order = await Order.create({
  totalAmount: 100,
  status: 'pending',
  userId: 1 // Associate the order with the user with id=1
});

// const Post = sequelize.define('post', {
//   title: Sequelize.STRING,
//   content: Sequelize.TEXT
// });

// const Comment = sequelize.define('comment', {
//   content: Sequelize.TEXT
// });

// // Define the association between Post and Comment
// Post.hasMany(Comment);
// Comment.belongsTo(Post);

const Book = sequelize.define('book', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT
});

const Author = sequelize.define('author', {
  name: Sequelize.STRING,
  biography: Sequelize.TEXT,
  photoUrl: Sequelize.STRING,
  email: Sequelize.STRING
});

// Define the one-to-one association between Book and Author
Book.hasOne(Author);
Author.belongsTo(Book);

app.post("/", async (req, res) => {
  const title = req.body.title;
  const desc = req.body.desc;
  const saveBlog = blog_table.build({
    title,
    desc,
  });
  await saveBlog.save();
  res.send("data posted ");
});

app.get("/", async (req, res) => {
  const alldata = await blog_table.findAll();
  res.json(alldata);
});

app.put("/:id", (req, res) => {
  const data = req.body.data;
  blog_table.update(
    {
      desc: data,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  );
  res.redirect("/");
});

app.delete("/:id", (req, res) => {
  blog_table.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.redirect("/");
});



app.post("/", async (req, res) => {
  const title = req.body.title;
  const desc = req.body.desc;
  const saveBlog = blog_table.build({
    title,
    desc,
  });
  await saveBlog.save();
  res.send("data posted ");
});

// Get all comments for a post
app.get('/posts/:postId/comments', async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comment.findAll({ where: { postId } });
  res.send(comments);
});

// Add a new comment to a post
app.post('/posts/:postId/comments', async (req, res) => {
  const postId = req.params.postId;
  const content = req.body.content;

  // Create a new comment and associate it with the post
  const comment = await Comment.create({ content });
  const post = await Post.findByPk(postId);
  await post.addComment(comment);

  res.send(comment);
});

app.get('/books/:bookId/author', async (req, res) => {
  const bookId = req.params.bookId;
  const book = await Book.findByPk(bookId, { include: Author });
  res.send(book.author);
});

// Add an author to a book
app.post('/books/:bookId/author', async (req, res) => {
  const bookId = req.params.bookId;
  const name = req.body.name;
  const biography = req.body.biography;
  const photoUrl = req.body.photoUrl;
  const email = req.body.email;

  // Create a new author and associate it with the book
  const author = await Author.create({ name, biography, photoUrl, email });
  const book = await Book.findByPk(bookId);
  await book.setAuthor(author);

  res.send(author);
});

app.get('/users/:userId/orders', async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findByPk(userId, { include: Order });
  res.send(user.orders);
});

// Add an order to a user
app.post('/users/:userId/orders', async (req, res) => {
  const userId = req.params.userId;
  const totalPrice = req.body.totalPrice;

  // Create a new order and associate it with the user
  const order = await Order.create({ totalPrice });
  const user = await User.findByPk(userId);
  await user.addOrder(order);

  res.send(order);
});

app.get('/users/:userId/posts', async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findByPk(userId, { include: Post });
  res.send(user.posts);
});

// Create a post and associate it with one or more users
app.post('/posts', async (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const creatorIds = req.body.creatorIds;

  // Create a new post
  const post = await Post.create({ title, body });

  // Associate the post with each creator
  const creators = await User.findAll({ where: { id: creatorIds } });
  await post.addUsers(creators);

  res.send(post);
});


app.listen(port, () => {
  console.log(`server starts at http://localhost:${port}`);
});
