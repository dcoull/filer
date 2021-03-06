var util = require('../lib/test-utils.js');
var expect = require('chai').expect;

describe('fs.link', function() {
  beforeEach(util.setup);
  afterEach(util.cleanup);

  it('should be a function', function() {
    var fs = util.fs();
    expect(fs.link).to.be.a('function');
  });

  it('should create a link to an existing file', function(done) {
    var fs = util.fs();

    fs.open('/myfile', 'w+', function(error, fd) {
      if(error) throw error;

      fs.close(fd, function(error) {
        if(error) throw error;

        fs.link('/myfile', '/myotherfile', function(error) {
          if(error) throw error;

          fs.stat('/myfile', function(error, result) {
            if(error) throw error;

            var _oldstats = result;
            fs.stat('/myotherfile', function(error, result) {
              expect(error).not.to.exist;
              expect(result.nlinks).to.equal(2);
              expect(result.dev).to.equal(_oldstats.dev);
              expect(result.node).to.equal(_oldstats.node);
              expect(result.size).to.equal(_oldstats.size);
              expect(result.type).to.equal(_oldstats.type);
              done();
            });
          });
        });
      });
    });
  });

  it('should create hard link to identical data node', function(done) {
    var fs = util.fs();
    var contents = 'Hello World!';

    fs.writeFile('/file', contents, function(err) {
      if(err) throw err;

      fs.link('/file', '/hlink', function(err) {
        if(err) throw err;

        fs.readFile('/file', 'utf8', function(err, fileData) {
          if(err) throw err;

          fs.readFile('/hlink', 'utf8', function(err, hlinkData) {
            if(err) throw err;

            expect(fileData).to.equal(hlinkData);
            done();
          });
        });
      });
    });
  });

  it('should not follow symbolic links', function(done) {
    var fs = util.fs();

    fs.stat('/', function (error, result) {
      if (error) throw error;
      expect(result).to.exist;

      fs.symlink('/', '/myfileLink', function (error) {
        if (error) throw error;

        fs.link('/myfileLink', '/myotherfile', function (error) {
          if (error) throw error;

          fs.lstat('/myfileLink', function (error, result) {
            if (error) throw error;
            var _linkstats = result;
            fs.lstat('/myotherfile', function (error, result) {
              expect(error).not.to.exist;
              expect(result.dev).to.equal(_linkstats.dev);
              expect(result.node).to.equal(_linkstats.node);
              expect(result.size).to.equal(_linkstats.size);
              expect(result.type).to.equal(_linkstats.type);
              expect(result.nlinks).to.equal(2);
              done();
            });
          });
        });
      });
    });
  });

  it('should not allow links to a directory', function(done) {
    var fs = util.fs();

    fs.mkdir('/mydir', function(error) {
      if(error) throw error;

      fs.link('/mydir', '/mydirlink', function(error) {
        expect(error).to.exist;
        expect(error.code).to.equal('EPERM');
        done();
      });
    });
  });

});

describe('fs.promises.link', function() {

  beforeEach(util.setup);
  afterEach(util.cleanup);

  it('should be a function', function(){
    var fsPromises = util.fs().promises;
    expect(fsPromises.link).to.be.a('function');
  });

  it('should return a promise', function() {
    var fsPromise = util.fs().promises;

    var p = fsPromise
      .writeFile('/myfile', '')
      .then(() => fsPromise.link('/myfile', '/myotherfile'));
    
    expect(p).to.be.a('promise');
    
    return p;
  });
});

describe('fs.promises.link', function() {
  beforeEach(util.setup);
  afterEach(util.cleanup);

  it('should be a function', function() {
    var fs = util.fs();
    expect(fs.promises.link).to.be.a('function');
  });

  it('should create a link to an existing file', function() {
    var fs = util.fs().promises;

    return fs.writeFile('/myfile', 'data')
      .then(() => fs.link('/myfile', '/myotherfile'))
      .then(() => fs.stat('/myfile'))
      .then(stats => {
        var _oldstats = stats;

        return fs.stat('/myotherfile')
          .then(stats => {
            expect(stats.nlinks).to.equal(2);
            expect(stats.dev).to.equal(_oldstats.dev);
            expect(stats.node).to.equal(_oldstats.node);
            expect(stats.size).to.equal(_oldstats.size);
            expect(stats.type).to.equal(_oldstats.type);
          });
      });
  });
  
  it('should create hard link to identical data node', function() {
    var fs = util.fs().promises;
    var contents = 'Hello World!';

    return fs.writeFile('/file', contents)
      .then(() => fs.link('/file', '/hlink'))
      .then(() => fs.readFile('/file', 'utf8'))
      .then(fileData => {
        
        return fs.readFile('/hlink', 'utf8')
          .then(hlinkData => expect(fileData).to.equal(hlinkData));
      });
  });

  it('should not allow links to a directory', function() {
    var fs = util.fs().promises;

    return fs.mkdir('/mydir')
      .then(() => fs.link('/mydir', '/mydirlink'))
      .catch(error => {
        expect(error).to.exist;
        expect(error.code).to.equal('EPERM');
      });
  });
});
