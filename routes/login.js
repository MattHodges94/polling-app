var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

module.exports = function(passport) {

    router.get('/logout', function(req, res) {
        req.logout()
        res.redirect('/');
    });

    router.get('/login', function(req, res) {
        
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
        
    // process the login form
    router.post('/login', loginAndCheckRedirect);

    // show the signup form
    router.get('/signup', function(req, res) {
        
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
        
    // process the signup form
    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    function loginAndCheckRedirect(req, res, next){
        
            passport.authenticate('local-login', {
                successRedirect : req.session.returnTo ? req.session.returnTo : '/', 
                failureRedirect : '/login', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            })(req, res, next)
          }

    return router;
};