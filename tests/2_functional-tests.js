/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var ObjectId = require('mongodb').ObjectId;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var testId;
  var testId2;
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('#example Test POST /api/threads/:board', function(done){
         chai.request(server)
          .post('/api/threads/test')
          .send( {
             text : 'test',
             delete_password : 'ulfi'
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
          });
          
          chai.request(server)
          .post('/api/threads/test')
          .send( {
             text : 'test2',
             delete_password : 'ulfi'
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            done()
          });
      });
    });
    
    suite('GET', function() {
      test('#example Test GET /api/threads/:board', function(done){
         chai.request(server)
          .get('/api/threads/test')
          .query( {} )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
            testId = res.body[0]._id;
            testId2 = res.body[1]._id;
            done();
          });
      });
    });
    
    suite('DELETE', function() {
      test('#example Test DELETE /api/threads/:board  with bad password', function(done){
         chai.request(server)
          .delete('/api/threads/test')
          .send( {
             thread_id : testId,
             delete_password : 'ulf'
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });
      
      test('#example Test DELETE /api/threads/:board  with good password', function(done){
         chai.request(server)
          .delete('/api/threads/test')
          .send( {
             thread_id : testId,
             delete_password : 'ulfi'
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    
    suite('PUT', function() {
      test('#example Test PUT /api/threads/:board', function(done){
         chai.request(server)
          .put('/api/threads/test')
          .send( {
             thread_id : testId2,
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    var replyId;
    
    suite('POST', function() {
      test('#example Test POST /api/replies/:board', function(done){
         chai.request(server)
          .post('/api/replies/test')
          .send( {
             text : 'reply1',
             delete_password : 'ulfi',
             thread_id : testId2
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            done();
          });
      });
    });
    
    suite('GET', function() {
      test('#example Test GET /api/replies/:board', function(done){
         chai.request(server)
          .get('/api/replies/test')
          .query( { thread_id:testId2 } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'replies');
            assert.isArray(res.body.replies);
            assert.equal(res.body.replies[0].text, 'reply1')
            replyId = res.body.replies[0]._id
            done();
          });
       });
    });
    
    suite('PUT', function() {
      test('#example Test PUT /api/replies/:board', function(done){
         chai.request(server)
          .put('/api/replies/test')
          .send( {
             thread_id : testId2,
             reply_id : replyId
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    
    suite('DELETE', function() {
      test('#example Test DELETE /api/replies/:board  with bad password', function(done){
         chai.request(server)
          .delete('/api/replies/test')
          .send( {
             thread_id : testId2,
             reply_id : replyId,
             delete_password : 'ulf'
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });
      
      test('#example Test DELETE /api/replies/:board  with good password', function(done){
         chai.request(server)
          .delete('/api/replies/test')
          .send( {
             thread_id : testId2,
             reply_id : replyId,
             delete_password : 'ulfi'
           } )
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
      
    });
    
  });

});
