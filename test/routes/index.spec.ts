import * as server from '../../app';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('something', () => {
    it('should equal 1', (done: any) => {
        chai.request(server)
        .get('/')
        .end((err: any, res: any) => {
            chai.expect(res).to.have.status(200);
            done();
        });
    })
})