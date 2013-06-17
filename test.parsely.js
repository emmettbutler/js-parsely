var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var parsely = new Parsely();

describe('Parsely', function() {
  this.timeout(10000);
  describe('authenticate()', function() {
    it('should set public key', function(done) {
      parsely.authenticate(publickey, secretkey, function(success){
        assert.equal(parsely.public_key(), publickey);
        done();
      });
    })
    it('should set secret key', function(done) {
      parsely.authenticate(publickey, secretkey, function(success){
        assert.equal(parsely.secret_key(), secretkey);
        done();
      });
    })
    it('should fail on bad keys', function(done){
      parsely.authenticate(publickey, "dummy", function(success){
        assert.isFalse(success);
        done();
      })
    })
  })

  describe('request_endpoint()', function(){
    it('should get some JSON', function(done){
      parsely.authenticate(publickey, secretkey, function(success){});
      parsely.request_endpoint('/analytics/posts', {}, function(res){
        assert.isTrue(res != undefined && res.hasOwnProperty('data'));
        done();
      })
    })
  })
})
