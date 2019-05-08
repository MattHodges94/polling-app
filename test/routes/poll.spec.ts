import * as server from '../../app';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { response } from 'express';
import * as sinon from 'sinon';

// @ts-ignore
import * as Poll from '../../models/poll.model';
import * as pollHelper from '../../routes/poll-helper';
import { createUser, createPoll } from '../test-utils';

chai.use(chaiHttp);
chai.request(server)

let poll: any,
    user: any,
    renderSpy: sinon.SinonSpy,
    updateVotedOnCookieSpy: sinon.SinonSpy,
    updateUsersVotedOnPollSpy: sinon.SinonSpy,
    updateClientPollsSpy: sinon.SinonSpy,
    validatePollSpy: sinon.SinonSpy;

describe('poll', () => {

    before(async () => {
        // @ts-ignore
        updateVotedOnCookieSpy = sinon.spy(pollHelper, 'updateVotedOnCookie');
        // @ts-ignore
        updateUsersVotedOnPollSpy = sinon.spy(pollHelper, 'updateUsersVotedOnPoll');
        // @ts-ignore
        updateClientPollsSpy = sinon.spy(pollHelper, 'updateClientPolls');
        // @ts-ignore
        validatePollSpy = sinon.spy(pollHelper, 'validatePoll');
        renderSpy = sinon.spy(response, 'render');

        [poll, user] = await Promise.all([
            createPoll({
                name: 'something',
                choices: [
                    'choice 1'
                ],
                results: {
                    'choice 1': 0
                }
            }),
            createUser(),
        ])
    })

    afterEach(() => {
        updateVotedOnCookieSpy.resetHistory();
        updateUsersVotedOnPollSpy.resetHistory();
        updateClientPollsSpy.resetHistory();
        validatePollSpy.resetHistory();
        renderSpy.resetHistory();
    })
        
    after(async () => {
        updateVotedOnCookieSpy.restore();
        updateUsersVotedOnPollSpy.restore();
        updateClientPollsSpy.restore();
        validatePollSpy.restore();
        renderSpy.restore();

        await Promise.all([
            Poll.remove({}),
        ]);
    })

    context('when logged in', () => {
        describe('POST /submit/poll/:id', () => {
            context('without a votedOn cookie', () => {
                it('should update the poll results an users voted on, and redirect to the homepage', (done: any) => {
                    const agent = chai.request.agent('http://127.0.0.1:3000');

                    agent
                    .post('/login')
                    .send({ email: 'mocha@test.com', password: 'mocha123' })
                    .end((err: any, res: any) => {
                        agent
                        .post(`/submit/poll/${ poll._id }`)
                        .send({ choice: 'choice 1' })
                        .end((err: any, res: any) => {
                            chai.expect(res).to.have.status(200)

                            chai.expect(updateUsersVotedOnPollSpy.called).to.eq(true);
                            chai.expect(updateClientPollsSpy.called).to.eq(true);
                            chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                            done();
                        });
                    });
                });
            });
        });

        describe('GET /poll/new', () => {
            it('should render the poll form with the correct args', (done: any) => {
                const agent = chai.request.agent(server);

                agent
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .end((err: any, res: any) => {
                    agent
                    .get('/poll/new')
                    .end((err: any, res: any) => {
                        const args = renderSpy.args[1];
                        chai.expect(res).to.have.status(200)

                        chai.expect(renderSpy.called).to.eq(true);
                        chai.expect(args[0]).to.eq('poll');
                        chai.expect(args[1]).to.deep.include({
                            user,
                            message: [],
                        });

                        done();
                    });
                });
            });
        });

        describe('POST /poll/new', () => {
            context('when a poll does not meet validation criteria', () => {
                it('should check poll validation and redirect to the poll form', (done: any) => {
                    const agent = chai.request.agent('http://127.0.0.1:3000');

                    agent
                    .post('/login')
                    .send({ email: 'mocha@test.com', password: 'mocha123' })
                    .end((err: any, res: any) => {
                        agent
                        .post('/poll/new')
                        .send({})
                        .end((err: any, res: any) => {
                            chai.expect(res).to.have.status(200)

                            chai.expect(validatePollSpy.called).to.eq(true);
                            chai.expect(res).to.redirectTo('http://127.0.0.1:3000/poll/new');
                            done();
                        });
                    });
                });
            });

            context('when a poll does meet validation criteria', () => {
                it('should check poll validation and redirect to the homepage', (done: any) => {
                    const agent = chai.request.agent('http://127.0.0.1:3000');

                    agent
                    .post('/login')
                    .send({ email: 'mocha@test.com', password: 'mocha123' })
                    .end((err: any, res: any) => {
                        agent
                        .post('/poll/new')
                        .send({ title: 'mocha poll 2', description: 'poll for mocha test', choices: ['1', '2', '3'] })
                        .end((err: any, res: any) => {
                            chai.expect(res).to.have.status(200)

                            chai.expect(validatePollSpy.called).to.eq(true);
                            chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                            done();
                        });
                    });
                });
            });
        });
    });

    context('when logged out', () => {
        describe('POST /submit/poll/:id', () => {
            context('with a votedOn cookie', () => {
                it('should redirect to the homepage', (done: any) => {
                    chai.request('http://127.0.0.1:3000')
                    .post(`/submit/poll/${ poll._id }`)
                    .send({ choice: 'choice 1' })
                    .set('Cookie', `votedOn=["${ poll._id }"]`)
                    .end((err: any, res: any) => {
                        chai.expect(res).to.have.status(200)
                        
                        chai.expect(updateClientPollsSpy.called).to.eq(false);
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                        done();
                    });
                });
            });

            context('without a votedOn cookie', () => {
                it('should set a cookie with the poll id, update the poll results, and redirect to the homepage', (done: any) => {
                    chai.request('http://127.0.0.1:3000')
                    .post(`/submit/poll/${ poll._id }`)
                    .send({ choice: 'choice 1' })
                    .end((err: any, res: any) => {
                        chai.expect(res).to.have.status(200)

                        chai.expect(updateVotedOnCookieSpy.called).to.eq(true);
                        chai.expect(updateClientPollsSpy.called).to.eq(true);
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                        done();
                    });
                });
            });

            context('when no no choice is sent', () => {
                it('should redirect to the homepage', (done: any) => {
                    chai.request('http://127.0.0.1:3000')
                    .post(`/submit/poll/${ poll._id }`)
                    .end((err: any, res: any) => {
                        chai.expect(res).to.have.status(200)
                        
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                        done();
                    });
                });
            });
        });

        describe('GET /poll/new', () => {
            it('should redirect to the login page', (done: any) => {
                chai.request('http://127.0.0.1:3000')
                .get('/poll/new')
                .end((err: any, res: any) => {
                    chai.expect(res).to.have.status(200)

                    chai.expect(res).to.redirectTo('http://127.0.0.1:3000/login');
                    done();
                });
            });
        });

        describe('POST /poll/new', () => {
            it('should redirect to the login page', (done: any) => {
                chai.request.agent('http://127.0.0.1:3000')
                .post('/poll/new')
                .send({ choice: 'choice 1' })
                .end((err: any, res: any) => {
                    chai.expect(res).to.have.status(200)

                    chai.expect(res).to.redirectTo('http://127.0.0.1:3000/login');
                    done();
                });
            });
        });
    });
});