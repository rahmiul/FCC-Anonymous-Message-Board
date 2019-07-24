/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

module.exports = function (app) {
  const DB_URI = process.env.DB_URI;
  
  // app.route('/api/threads/:board');  important!! dont delete
  // app.route('/api/replies/:board'); important!! dont delete
  

  app.route('/api/threads/:board')
  
    .get(function (req, res){
      const board     = req.params.board;  
      MongoClient.connect( DB_URI )      
        .then( db => {
          const collection = db.collection( board );
          collection.find(
            {}, 
            {reported         : 0,
             delete_password  : 0,
             "replies.delete_password"  : 0,
             "replies.reported"         : 0
            }
          )
            .sort( {bumped_on : -1} )
            .limit( 10 )
            .toArray( ( err, docs ) => {
              if ( !err ) {
                docs.forEach(function(doc){
                  doc.replycount = doc.replies.length
                  if (doc.replies.length > 3){
                    doc.replies.slice(-3)
                  } 
                })
                res.json(docs);
              } 
              else  res.send( err )
            })
        })
        .catch( err => { res.send( err ) } )
    })
    
    .post(function (req, res){
      const board     = req.params.board;           //the first time to submit the board followed by new thread
      const newThread = {
        text             : req.body.text,
        delete_password  : req.body.delete_password,
        created_on       : new Date(),
        bumped_on        : new Date(),
        reported         : false,
        replies          : []
      }
      MongoClient.connect(DB_URI)  
        .then( db => {
          const collection = db.collection( board );
          collection.insert( newThread )
            .then( doc => {
              res.redirect('/b/'+board+'/')
            })
            .catch( err => res.send( err ));
        })
        .catch( err => res.send( err ) );
    })
  
    .put(function (req, res){
      const board     = req.params.board; 
      const threadId  = req.body.thread_id; 
      MongoClient.connect(DB_URI)  //response will contain new book object including atleast _id and title
        .then( db => {
          const collection = db.collection( board );
          collection.findAndModify( 
            {_id : new ObjectId(threadId)},
            [],
            {$set : { reported : true }} 
          )
            .then( doc => {
              res.send( 'success' )
            })
            .catch( err => res.send( err ));
        })
        .catch( err => res.send( err ) );
    })
    
    .delete(function(req, res){
      const board     = req.params.board; 
      const threadId  = req.body.thread_id;
      const delete_password  = req.body.delete_password;
      MongoClient.connect(DB_URI)    //if successful response will be 'complete delete successful'
        .then ( db => {
          const collection =  db.collection( board );
          collection.findAndModify(
            { _id : new ObjectId(threadId),
              delete_password : delete_password
            },
            [],
            {},
            { remove : true }
          )
            .then( doc => {
              if ( doc.value === null ) { res.send( 'incorrect password' ) } 
              else { res.send( 'success' )};
            })
            .catch( err => res.send( err ))
        })
        .catch( err => res.send( err ))
    });



  app.route('/api/replies/:board')
    
    .get(function (req, res){
      const board    = req.params.board
      const threadId = req.query.thread_id
      MongoClient.connect(DB_URI)         //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        .then( db => {
          const collection = db.collection( board);
          collection.find( 
            { _id : new ObjectId( threadId ) },
            {reported         : 0,
             delete_password  : 0,
             "replies.delete_password"  : 0,
             "replies.reported"         : 0
            }  
          )
            .toArray( )
              .then( doc => {
                res.json(doc[0]);
              })
              .catch( err => res.send( err ))
        })
        .catch( err => res.send( err ))
    })
    
    .post(function(req, res){
      const board    = req.params.board
      const threadId = req.body.thread_id
      const newReply = {
        _id            : new ObjectId(),
        text           : req.body.text,
        delete_password: req.body.delete_password,
        created_on     : new Date(),
        reported       : false,
      }
      MongoClient.connect(DB_URI)        //json res format same as .get
        .then( db => {
          const collection = db.collection( board )
          collection.findAndModify( 
            {_id : new ObjectId(threadId) }, 
            [],
            { $set : { bumped_on : new Date() },
              $push: { replies : newReply }
            }, 
            function( err, doc ){
              if (err) res.send(err);
              res.redirect('/b/'+board+'/'+threadId);         //doc.value contain schema value 
            } 
          )
            
        })
        .catch( err => res.send( err ))
    })
  
    .put(function (req, res){
      const board     = req.params.board; 
      const threadId  = req.body.thread_id;
      const replyId   = req.body.reply_id
      MongoClient.connect(DB_URI)  //response will contain new book object including atleast _id and title
        .then( db => {
          const collection = db.collection( board );
          collection.findAndModify( 
            {_id : new ObjectId(threadId),
             "replies._id" : new ObjectId(replyId)
            },
            [],
            {$set : { "replies.$.reported" : true }} 
          )
            .then( doc => {
              res.send( 'success' )
            })
            .catch( err => res.send( err ));
        })
        .catch( err => res.send( err ) );
    })
    
    .delete(function(req, res){
      const board     = req.params.board; 
      const threadId  = req.body.thread_id; 
      const replyId   = req.body.reply_id;
      const delete_password = req.body.delete_password
      MongoClient.connect(DB_URI)    //if successful response will be 'complete delete successful'
        .then ( db => {
          const collection =  db.collection( board );
          collection.findAndModify(
            { _id : new ObjectId(threadId),
              replies : { $elemMatch: { _id : new ObjectId( replyId ), delete_password: delete_password } }
            },
            [],
            { $set : {"replies.$.text" : "[deleted]"} }
          )
            .then( doc => {
              if ( doc.value === null ) { res.send( 'incorrect password' ) } 
              else { res.send( 'success' )};
            })
            .catch( err => res.send( err ))
        })
        .catch( err => res.send( err ))
    });
  
  

};
