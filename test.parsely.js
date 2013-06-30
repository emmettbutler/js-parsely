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

  describe('request options', function(){
    it('should build properly', function(){
      parsely.setOption('days', 5);
      parsely.setOption('page', 4);
      assert.isTrue(parsely.getOptions().days == 5);
      assert.isTrue(parsely.getOptions().page == 4);
    })
    it('should provide default values', function(){
      parsely.setOption('days', 5);
      parsely.setOption('page', 4);
      assert.isTrue(parsely.getOptions().limit == 10);
    })
    it('should clear to defaults', function(){
      parsely.setOption('limit', 69);
      parsely.clearOptions();
      assert.isTrue(parsely.getOptions().limit == 10);
    })
  })

  describe('analytics()', function(){
    it('should return ten posts', function(done){
      parsely.authenticate(publickey, secretkey, function(success){});
      parsely.analytics(function(res){
        assert.isTrue(res.data.length == 10);
        assert.isTrue(res.data[3].hasOwnProperty("author"));
        done();
      })
    })
    it('should return less posts when asked', function(done){
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
    it('should return authors when asked', function(done){
      parsely.clearOptions();
      parsely.analytics(function(res){
        assert.isTrue(res.data[0].author !== undefined);
        assert.isTrue(res.data[0]._hits !== undefined);
        assert.isTrue(res.data[0].pub_date === undefined);
        done();
      }, 'authors')
    })
  })

  describe('post_detail()', function(){
    it('should return the post referenced by url', function(done){
      var url = "http://arstechnica.com/tech-policy/2013/06/teenage-wikileaks-volunteer-why-i-served-as-an-fbi-informant/";
      parsely.clearOptions();
      parsely.post_detail(function(res){
        assert.isTrue(res.data[0].url === url);
        done();
      }, url)
    })
    it('should return the post referenced by object', function(done){
      parsely.clearOptions();
      var post = parsely.analytics(function(_res){
        parsely.post_detail(function(res){
          assert.isTrue(res.data[0].url === _res.data[0].url);
          done();
        }, _res.data[0])
      })
    })
  })

  describe('meta_detail()', function(){
    it('should return posts from the given section when given a string', function(done){
      parsely.clearOptions();
      var section = 'Technology Lab';
      parsely.meta_detail(function(res){
        assert.isTrue(res.data[3].section === section);
        done();
      }, section, 'section')
    })
    it('should return posts from the given section when given a post', function(done){
      parsely.clearOptions();
      parsely.analytics(function(_res){
        parsely.meta_detail(function(res){
          assert.isTrue(res.data[0].section === _res.data[0].section);
          done();
        }, _res.data[0], 'section')
      })
    })
  })

  describe('referrers()', function(){
    it('should return some referrers', function(done){
      var tag = 'copyright';
      parsely.clearOptions();
      parsely.referrers(function(res){
        assert.isTrue(res.data[0]._hits > 0);
        done();
      }, undefined, undefined, tag, undefined)
    })
  })

  describe('referrers_meta()', function(){
    it('should return some data objects', function(done){
      parsely.clearOptions();
      parsely.referrers_meta(function(res){
        assert.isTrue(res.data[0]._hits > 0);
        done();
      })
    })
  })

  describe('referrers_meta_detail()', function(){
    it('should return some data objects', function(done){
      parsely.clearOptions();
      parsely.referrers_meta_detail(function(res){
        assert.isTrue(res.data[0]._hits > 0);
        done();
      }, 'Ars Staff', undefined, 'author', undefined)
    })
  })

  describe('referrers_post_detail()', function(){
    it('should return some data when given a url', function(done){
      parsely.clearOptions();
      parsely.referrers_post_detail(function(res){
        assert.isTrue(res.data[0]._hits > 0);
        done();
      }, 'http://arstechnica.com/information-technology/2013/04/memory-that-never-forgets-non-volatile-dimms-hit-the-market/')
    })
    it('should return some data when given a post', function(done){
      parsely.analytics(function(_res){
        parsely.referrers_post_detail(function(res){
          assert.isTrue(res.data[0]._hits > 0);
          done();
        }, _res.data[0], 'section')
      })
    })
  })

  describe('shares()', function(){
    it('should return post details when given a url', function(done){
      parsely.clearOptions();
      parsely.shares(function(res){
        assert.isTrue(res.data[0].total > 0)
        done();
      }, undefined, 'http://arstechnica.com/information-technology/2013/04/memory-that-never-forgets-non-volatile-dimms-hit-the-market/')
    })
    it('should return data objects when not given a url', function(done){
      parsely.shares(function(res){
        assert.isTrue(res.data[1]._shares > 0)
        done();
      })
    })
  })

  describe('realtime()', function(){
    it('should return some posts', function(done){
      parsely.clearOptions();
      parsely.realtime(function(res){
        assert.isTrue(res.data[0]._hits > 0);
        done();
      })
    })
  })

  describe('related()', function(){
    it('should return some posts', function(done){
      parsely.clearOptions();
      parsely.related(function(res){
        assert.isTrue(res.data[0].title !== '');
        done();
      }, 'http://arstechnica.com/information-technology/2013/04/memory-that-never-forgets-non-volatile-dimms-hit-the-market/')
    })
  })

  describe('search()', function(){
    it('should return some posts', function(done){
      parsely.clearOptions();
      parsely.related(function(res){
        assert.isTrue(res.data[0].title !== '');
        done();
      }, 'security')
    })
  })
})
