import * as server from '../../app';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { response } from 'express';
import * as sinon from 'sinon';

// @ts-ignore
import * as User from '../../models/user.model';
// @ts-ignore
import * as Poll from '../../models/poll.model';
import { createUser, createPoll } from '../test-utils';

chai.use(chaiHttp);

const renderSpy = sinon.spy(response, 'render');
let polls: Poll[], user: User;

describe('index', () => {
    before(async () => {
        await Promise.all([
            createUser(),
            createPoll(),
        ]);

        polls = await Poll.find().lean();
        user = await User.findOne().lean();
    });

    afterEach(() => {
        renderSpy.resetHistory();
    })

    after(async () => Promise.all([
        User.remove({}),
        Poll.remove({}),
    ]));

    context('when logged in', () => {
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

    context('when logged out', () => {
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