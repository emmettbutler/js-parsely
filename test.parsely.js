var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var parsely = new Parsely();

describe('Parsely', function() {
  describe('authenticate()', function() {
    it('should set public key', function() {
      assert.equal(parsely.public_key(), publickey);
    })
    it('should set secret key', function() {
      assert.equal(parsely.secret_key(), secretkey);
    })
  })

  describe('request_endpoint()', function(){
    parsely.authenticate(publickey, secretkey);
    var res = parsely.request_endpoint('/analytics/posts', {})
    it('should get some JSON', function(){
      assert.isTrue(res.hasOwnProperty("data") && res != undefined);
    })
  })
})
