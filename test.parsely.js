var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var parsely = Parsely();

describe('Parsely', function() {
  describe('authenticate()', function() {
    parsely.authenticate("publicdummy", "privatedummy");
    it('should set public key', function() {
      assert.equal(parsely.public_key(), "publicdummy");
    })
    it('should set secret key', function() {
      assert.equal(parsely.secret_key(), "privatedummy");
    })
  })
})
