const express = require('express')
const app = express()
const connectDB = require('./config/db')
require('dotenv').config()
const path = require('path');
const User = require('./models/User');
const Room = require('./models/Room')
const passport = require('passport');
const session = require('express-session')
const hbs = require('hbs')
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
// bodyparser
connectDB()
app.use(express.json())
app.set('views', path.join(__dirname, './templates/views'))
app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, './templates/partials'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, './public')))
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
}))

app.use(passport.initialize())
app.use(passport.session())
require('./passport-config')(passport)

/*************************************/
const http = require('http')
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
/*************************************/

app.get('/', checkNotAuthenticated, (req, res)=>{
    return res.render('home', {})
})

app.get('/signup', checkNotAuthenticated, async(req, res)=>{
    try{
        return res.render('signup', {})
    }
    catch(e){
        return res.render('signup2')
    }
})

app.post('/signup', checkNotAuthenticated, async(req, res)=>{
    try{
        const user = new User(req.body)
        user.password = user.hashedPassword(user.password)
        await user.save();
        return res.render('login', {})
    }
    catch(e){
        return res.render('signup2')
    }
})

app.get('/login', checkNotAuthenticated, async(req, res)=>{
    try{
        return res.render('login', {})
    }
    catch(e){
        return res.send(e)
    }
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/dashboard'
}))

app.get('/dashboard', checkAuthenticated, async(req, res)=>{
    try{
        return res.render('dashboard', {name: req.user.name})
    }
    catch(e){
        return res.render('swr')
    }
})

app.get('/create', checkAuthenticated, async(req, res)=>{
    try{
        return res.render('createroom')
    }
    catch(e){
        return res.render('swr')
    }
})
app.post('/create', checkAuthenticated, async(req, res)=>{
    try{
        const room = new Room(req.body)
        room.password = room.hashedPassword(room.password)
        room.adminEmail = req.user.email
        await room.save()
        return res.send(room)
    }
    catch(e){
        return res.render('swr')
    }
})
app.get('/join', checkAuthenticated, async(req, res)=>{
    try{
        return res.render('joinroom')
    }
    catch(e){
        return res.render('swr')
    }
})

app.post('/join', checkAuthenticated, async(req, res)=>{
    try{
        const name = req.body.name;
        const password = req.body.password;

        const room = await Room.findOne({name : name})
        if(!room){
            return res.render('invalidRoom')
        }
        else{
            if(req.user.email === room.adminEmail || req.user.email === room.email1 || req.user.email === room.email2){
                const valid = room.comparePassword(password, room.password)
                if(valid){
                    res.render('room.hbs')
                    io.on('connection', (socket) => {
                        console.log(`${req.user.name} connected!`);
                        socket.on('message', (evt) => {
                            // console.log(evt)
                            socket.broadcast.emit('message', evt)
                        })
                        socket.on('disconnect', ()=>{
                            console.log(`${req.user.name} disconnected!`);
                        })
                    });
                }
                else{
                    return res.render('invalidRoom')
                }
            }
            else{
                return res.render('invalidRoom')
            }
        }
    }
    catch(e){
        return res.render('swr')
    }
})



function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    } 
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/dashboard')
    }
    next()
}

server.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`);
})