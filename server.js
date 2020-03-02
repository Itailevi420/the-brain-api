const express = require('express');
const app = express();
// const fs = require('fs');
const port = 3001;
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');


const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'itail',
    password : '',
    database : 'smart-brain'
  }
});


app.use(express.json());
app.use(cors());






// app.get('/', (req, res) => {
//   res.send(database.users);
// })

app.post('/signin', (req, res) => {
  const { email, password } = req.body; 
  db.select('email', 'hash').from('login')
  .where('email', '=', email)
  .then(data => {
    // console.log(data)
    const isValid = bcrypt.compareSync(password, data[0].hash);
    // console.log(isValid)
    if(isValid) {
     db.select('*').from('users')
        .where('email', '=', email)
        .then(user => res.json(user[0]))
        .catch(err => res.status(400).json('unable to get user'))
    } else{
       throw(err);
    }
  })
  .catch(err => res.status(400).json('email or password does not exist'))
})

/*
req e.g {
  name: '',
  email: '',
  password: '',
}
*/

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {

    return trx('users')
        .returning('*')
        .insert({
          name: name,
          email: loginEmail[0],
          joined: new Date()
          
        })
        .then(user=> res.json(user[0]))
      })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json('Something Went Wrong, can not register!!!'))
})


/* One way to use  Knex ".where" method is with an object e.g:
.where({
  id: id,
})
in ES6 syntax if the key and value are the same  so you can do it like this as well: (assume obj like example above)
.where({id})
*/
app.get('/profile/:id', (req, res) => {
  const {id} = req.params;
  db.select('*')
    .from('users')
    .where({id})
    .then(user => {
      if(user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('not found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))  
})

app.put('/image', (req, res) => {
  const {id} = req.body;
  db('users')
    .where('id' ,'=' , id)
    .increment('entries' , 1)
    .returning('entries')
    .then(ent => res.json(ent[0]))
    .catch(err => res.status(400).json("can't get entries"))

})

app.listen(port, () => {
  console.log(`app is running on port ${port}`)
})

