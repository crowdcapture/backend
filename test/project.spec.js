process.env.NODE_ENV = 'test';
process.env.PORT = 16601;

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../src/index');

chai.use(chaiHttp);

describe('/project', function() {
    describe('/project (POST)', function() {
        it('should check if all the properties are set', function(done) {
            chai.request(server)
                .post('/v1/project')
                .send({})
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.should.be.json;
                    res.body.should.have.property('success');
                    res.body.should.have.property('message');

                    res.body.success.should.equal(false);
                    res.body.message.should.equal('Some required properties where not set');
                    done();
                });
        });

        it('should check the length of the project name', function(done) {
            chai.request(server)
                .post('/v1/project')
                .send({userId: 1, name: "A super long name that surely has more than sixtyfour characters which is not allowed by the way."})
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.should.be.json;
                    res.body.should.have.property('success');
                    res.body.should.have.property('message');

                    res.body.success.should.equal(false);
                    res.body.message.should.equal('The maximum length of the projectname is 64 characters.');
                    done();
                });
        });

        it('should create a project', function(done) {
            chai.request(server)
                .post('/v1/project')
                .send({userId: 1, name: "A super normal name"})
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('success');
                    res.body.should.have.property('project');

                    res.body.success.should.equal(true);
                    res.body.project.id.should.be.a('number');
                    res.body.project.lastUpdate.should.be.a('string');
                    res.body.project.created.should.be.a('string');
                    res.body.project.characterTotal.should.equal(0);
                    res.body.project.blocks.should.be.a('array');
                    done();
                });
        });
    });
});