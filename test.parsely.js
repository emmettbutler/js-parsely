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

  describe('Request options', function(){
    parsely.setOption('days', 5);
    parsely.setOption('page', 4);
    it('should build properly', function(){
      assert.isTrue(parsely.getOptions().days == 5);
      assert.isTrue(parsely.getOptions().page == 4);
    })
    it('should provide default values', function(){
      assert.isTrue(parsely.getOptions().limit == 10);
    })
  })

  describe('_request_endpoint()', function(){
    it('should get some JSON', function(done){
      parsely.authenticate(publickey, secretkey, function(success){});
      parsely._request_endpoint('/analytics/posts', {}, function(res){
        assert.isTrue(res != undefined && res.hasOwnProperty('data'));
        done();
      })
    })
  })

  describe('analytics()', function(){
    parsely.authenticate(publickey, secretkey, function(success){});
    it('should return ten posts', function(done){
      parsely.analytics(function(res){
        assert.isTrue(res.data.length == 10);
        assert.isTrue(res.data[3].hasOwnProperty("author"));
        done();
      })
    })
    it('should honor limit parameter', function(done){
      parsely.clearOptions();
      parsely.setOption('limit', 3);
      parsely.analytics(function(res){
        assert.isTrue(res.data.length == 3);
        done();
      })
    })
    it('should honor start and end dates', function(done){
      var test_date = new Date("6/1/2013");
      parsely.clearOptions();
      parsely.setOption('pub_date_start', test_date);
      parsely.setOption('pub_date_end', new Date('6/2/2013'));
      parsely.setOption('limit', 1);
      parsely.analytics(function(res){
        var ret_date = new Date(res.data[0].pub_date);
        assert.isTrue(ret_date.getDate() == test_date.getDate());
        done();
      })
    })
  })
})
