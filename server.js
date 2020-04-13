const express = require('express');
const app = express();
// const fs = require('fs');
const port = 3001;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const register = require('./controller/register')
const signin = require('./controller/signin')
const profile = require('./controller/profile')
const image = require('./controller/image')

const knex = require('knex');
const db = knex({
  client: 'pg',
  connection: {
    host : process.env.DATABASE_URL,
    ssl: true,
  }
});


app.use(express.json());
app.use(cors());






app.get('/', (req, res) =>   {res.send(`It's working Emmm... I think ;)`)})
// we pass bcrypt & db to the function via dependence injection like so. 
// instead of importing them in function file (although that would work too).
app.post('/signin', (req, res) =>  signin.handleSignin(req, res, bcrypt, db))

/*
req e.g {
  name: '',
  email: '',
  password: '',
}
*/
// we pass bcrypt & db to the function via dependence injection like so. 
// instead of importing them in function file (although that would work too).
app.post('/register', (req, res) => register.handleRegister(req, res, bcrypt, db )) 
/* One way to use  Knex ".where" method is with an object e.g:
.where({
  id: id,
})
in ES6 syntax if the key and value are the same  so you can do it like this as well: (assume obj like example above)
.where({id})
*/
//  Another way of calling the function is like so:
app.get('/profile/:id', profile.profileHandlerGet(db));

app.put('/image', (req, res) => image.handleImage(req, res, db));
app.post('/imageurl', (req, res) => image.handleApiCall(req, res));


app.listen(process.env.PORT || port, () => {
  console.log(`app is running on port ${process.env.PORT}`)
});



