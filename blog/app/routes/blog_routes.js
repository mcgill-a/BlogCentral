var ObjectID = require('mongodb').ObjectId;
var express = require('express');
var assert = require('assert');
var router = new express.Router();
var path = require('path');

module.exports = function(blog_app, client) {
    
    var db = client.db('blog_db');

    // Home Route
    blog_app.get('/', (req, res) => {
       res.render('index', { title : 'The Home Route'});
    });

    // Test Route
    blog_app.get('/test/', (req, res) => {
        res.render('index', { title : 'The Test Route'});
    });

    // Articles Route
    blog_app.get('/articles/', (req, res) => {
        var dbPosts = [];
        var cursor = db.collection('posts').find();
        // Execute the each command, triggers for each document
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            // Need to add some validation
            var post = {
                id:         doc._id,
                author:     doc.author,
                title:      doc.title,
                thumbnail:  doc.thumbnail,
                content:    doc.content,
                date:       doc.date,
                category:   doc.category,
                tags:       doc.tags
            }
            dbPosts.push(post);
            //console.log("ID: " + post.id +  " | Title: " + post.title);
        }, function() {
                res.render('articles', {
                    title : 'The Articles Route',
                    "posts": dbPosts
                });
        });
    });

    // Articles Route
    blog_app.get('/articles/:category/:id', (req, res) => {
        const category = req.params.category;
        const id = req.params.id;
        var selectedPost;
        var dbPosts = [];
        var cursor = db.collection('posts').find();
        // Execute the each command, triggers for each document
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            // Need to add some validation
            var post = {
                id:         doc._id,
                author:     doc.author,
                title:      doc.title,
                thumbnail:  doc.thumbnail,
                content:    doc.content,
                date:       doc.date,
                category:   doc.category,
                tags:       doc.tags
            }
            if(post.id == id)
            {
                //console.log("Matched POST ID: " + post.id);
                selectedPost = post;
            }
            else
            {
                dbPosts.push(post);
            }
            //console.log("ID: " + post.id +  " | Title: " + post.title);
        }, function() {
                res.render('article', {
                    title : 'The Articles Route',
                    "selectedPost": selectedPost,
                    "posts": dbPosts
                });
        });
    });

    // Samples Route
    blog_app.get('/add_article/', (req, res) => {
        res.render('add_article', { title : 'The Add Article Route'});
    });

    blog_app.post('/add_article/', (req, res) => {
        var originalTagString = req.body.tags;
        var tagsUnfiltered = originalTagString.split(',');
        var tagsFiltered = new Array();
        var currentDateTime = new Date();
        for(i = 0; i < tagsUnfiltered.length; i++)
        {
            var current = tagsUnfiltered[i];
            while(current.charAt(0) == ' ' || current.charAt(0) == ',')
            {
            current = current.substring(1);
            }
            if(current.length > 2)
            {
                tagsFiltered.push(current);
            }
        }
        
        delete req.body.id; // for saftey (to avoid overwriting existing id)
        // Create the blog post
        const post = {
            author: req.body.author,
            title: req.body.title,
            thumbnail: req.body.thumbnail,
            content: req.body.content,
            date: currentDateTime,
            //date: req.body.date,
            category: req.body.category,
            tags: tagsFiltered
         };
        
        db.collection('posts').insertOne(post, (err, result) => {
            if(err)
            {
                res.send({ 'error' : 'An error occurred' });
            }
            else
            {
                //res.send(result.ops[0]);
                res.redirect('/');
                var currentDate = new Date().toLocaleString();
                console.log(currentDate + " | Blog Post Submitted by " + post.author + " : '" + post.title + "'")
                //alert("Blog Post Successfully Submitted!");
            }
        })
    });

    // Samples Route
    blog_app.get('/samples/', (req, res) => {
        res.render('samples', { title : 'The Sample Route'});
    });

    blog_app.get('/posts/:id', (req, res) => {

        const id = req.params.id;
        const details = {'_id' : new ObjectID(id) };
        db.collection('posts').findOne(details, (err, item) => {
            if(err)
            {
                res.send({ 'error' : 'An error occurred' });
            }
            else
            {
                res.send(item);
            }
        });
    });

    blog_app.delete('/posts/:id', (req, res) => {

        const id = req.params.id;
        const details = {'_id' : new ObjectID(id) };
        db.collection('posts').remove(details, (err, item) => {
            if(err)
            {
                res.send({ 'error' : 'An error occurred' });
            }
            else
            {
                res.send('Note ' + id + ' has been removed');
            }
        });
    });
    
    blog_app.put('/posts/:id', (req, res) => {

        const id = req.params.id;
        const details = {'_id' : new ObjectID(id) };
        const post = {text: req.body.body, title: req.body.title };
        db.collection('posts').update(details, post, (err, item) => {
            if(err)
            {
                res.send({ 'error' : 'An error occurred' });
            }
            else
            {
                res.send(item);
            }
        });
    });

    blog_app.post('/posts', (req, res) => {
        // Create the blog post
        const post = {text: req.body.body, title: req.body.title };
        

        // delete req.body._id; // for saftey (so they cant overwrite existing id)
        db.collection('posts').insertOne(post, (err, result) => {
            if(err)
            {
                res.send({ 'error' : 'An error occurred' });
            }
            else
            {
                res.send(result.ops[0]);
            }
        })


    });
};