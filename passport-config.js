var localStrategy = require('passport-local').Strategy
const User = require('./models/User')
module.exports = function(passport){

    passport.serializeUser(function(user, done){
        done(null, user)
    })
    passport.deserializeUser(function(user, done){
        done(null, user)
    })

    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function(email, password, done){
        User.findOne({email: email}, function(err, doc){
            if(err){
                done(err)
            }
            else{
                if(doc){
                    const valid = doc.comparePassword(password, doc.password)
                    // console.log(valid)
                    if(valid){
                        done(null, doc)
                        // next()
                    }
                    else{
                        done(err, null)
                    }
                }
            }
        })
    }))
}