import server from '../../app';
import chai from 'chai';
import chaiHttp = require('chai-http');
import { response } from 'express';
import * as sinon from 'sinon';

import { default as User, UserModel } from '../../src/models/user.model';
import { default as Poll, PollModel } from '../../src/models/poll.model';
import { createUser, createPoll } from '../test-utils';

chai.use(chaiHttp);

let polls: PollModel[], 
    user: UserModel, 
    renderSpy: sinon.SinonSpy;

describe('index', () => {
    before(async () => {
        await Promise.all([
            createUser(),
            createPoll(),
        ]);

        renderSpy = sinon.spy(response, 'render');

        polls = await Poll.find().lean();
        user = await User.findOne().lean();
    });

    afterEach(() => {
        renderSpy.resetHistory();
    })

    after(async () => {
        renderSpy.restore();
        await Promise.all([
            User.remove({}),
            Poll.remove({}),
        ]);
    })

    context('when logged in', () => {
        describe('GET /', () => {
            it('should send the index page with the correct args', (done: any) => {
                const agent = chai.request.agent(server);
    
                agent
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .then(() => {
                    agent
                    .get('/')
                    .end((err: any, res: any) => {
                        const args = renderSpy.args[1];
                        chai.expect(res).to.have.status(200)
                        
                        chai.expect(renderSpy.calledTwice).to.eq(true);
    
                        chai.expect(args[0]).to.eq('index');
                        chai.expect(args[1]).to.deep.include({
                            polls,
                            user,
                            votedOnCookie: undefined,
                            message: [],
                            successMessage: []
                        });
        
                        done();
                    });
                });
            });
        });
    });

    context('when logged out', () => {
        describe('GET /', () => {
            it('should send the index page with the correct args', (done: any) => {
                chai.request(server)
                .get('/')
                .set('Cookie', 'votedOn=["some-poll-id"]')
                .end((err: any, res: any) => {
                    const args = renderSpy.args[0];
                    chai.expect(res).to.have.status(200)
                    
                    chai.expect(renderSpy.calledOnce).to.eq(true);
    
                    chai.expect(args[0]).to.eq('index');
                    chai.expect(args[1]).to.deep.include({
                        polls,
                        user: undefined,
                        votedOnCookie: '["some-poll-id"]',
                        message: [],
                        successMessage: []
                    });
    
                    done();
                });
            });
        });
    });
});