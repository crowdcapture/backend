process.env.NODE_ENV = 'test';
process.env.PORT = 16601;

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../src/index');

chai.use(chaiHttp);

describe('/not/existing', function() {
    describe('/not/existing (GET)', function() {
        it('should give a 404 on a non existing route', function(done) {
            chai.request(server)
                .get('/v1/bla/bla')
                .end(function(err, res) {
                    res.should.have.status(404);
                    res.should.be.json;
                    res.body.should.have.property('success');
                    res.body.should.have.property('message');

                    res.body.success.should.equal(false);
                    res.body.message.should.equal('This URL can not be found on the API, try a valid route.');
                    done();
                });
        });
    });
});