import * as server from '../../app';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { response, request } from 'express';
import * as sinon from 'sinon';
import * as passport from 'passport';

// @ts-ignore
import * as User from '../../models/user.model';
import { createUser } from '../test-utils';

chai.use(chaiHttp);

let user: User,
    unverifiedUser: User,
    passportSpy: any,
    renderSpy: sinon.SinonSpy,
    requestSpy: any,
    findOneAndUpdateUserSpy: sinon.SinonSpy;

describe('login', () => {
    before(async () => {
        [user, unverifiedUser] = await Promise.all([
            createUser(),
            createUser({ email: 'unverified@test.com', isVerified: false, verifyToken: 'token' }),
        ]);

        renderSpy = sinon.spy(response, 'render');
        passportSpy = sinon.spy(passport, 'authenticate');
        requestSpy = sinon.spy(request, 'logout');
        findOneAndUpdateUserSpy = sinon.spy(User, 'findOneAndUpdate');
    });

    after(async () => {
        renderSpy.restore();
        passportSpy.restore();
        requestSpy.restore();
        await User.remove({});
    });

    context('when logged in', () => {
        afterEach(() => {
            renderSpy.resetHistory();
            passportSpy.resetHistory();
            request
        })

        describe('GET /login', () => {
            it('should send the login page with the correct args', (done: any) => {
                const agent = chai.request.agent(server);
    
                agent
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .then(() => {
                    agent
                    .get('/login')
                    .end((err: any, res: any) => {
                        const args = renderSpy.args[1];
                        chai.expect(res).to.have.status(200)
                        
                        chai.expect(renderSpy.calledTwice).to.eq(true);
    
                        chai.expect(args[0]).to.eq('login');
                        chai.expect(args[1]).to.deep.include({
                            user,
                            message: [],
                        });
        
                        done();
                    });
                });
            });
        });

        describe('POST /login', () => {
            it('should redirect to the homepage', (done: any) => {
                const agent = chai.request.agent('http://127.0.0.1:3000');
    
                agent
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .end((err: any, res: any) => {
                    passportSpy.resetHistory();

                    agent
                    .post('/login')
                    .send({ email: 'mocha@test.com', password: 'mocha123' })
                    .end((err: any, res: any) => {
                        chai.expect(res).to.have.status(200)

                        chai.expect(passportSpy.called).to.eq(false);
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                        done();
                    });
                });
            });
        });

        describe('GET /signup', () => {
            it('should redirect to the homepage', (done: any) => {
                const agent = chai.request.agent('http://127.0.0.1:3000');
    
                agent
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .end((err: any, res: any) => {

                    agent
                    .get('/signup')
                    .end((err: any, res: any) => {
                        const args = renderSpy.args[1];
    
                        chai.expect(res).to.have.status(200)

                        chai.expect(args[0]).to.eq('index');
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                        done();
                    });
                });
            });
        });

        describe('POST /signup', () => {
            it('should redirect to the homepage', (done: any) => {
                const agent = chai.request.agent('http://127.0.0.1:3000');
    
                agent
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .end((err: any, res: any) => {
                    passportSpy.resetHistory();

                    agent
                    .post('/signup')
                    .send({ email: 'mocha2@test.com', password: 'mocha123' })
                    .end((err: any, res: any) => {
                        chai.expect(res).to.have.status(200)

                        chai.expect(passportSpy.called).to.eq(false);
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                        done();
                    });
                });
            });
        });

        describe('GET /logout', () => {
            after(() => {
                requestSpy.resetHistory();
            });

            it('should log the user out redirect to the homepage', (done: any) => {
                const agent = chai.request.agent('http://127.0.0.1:3000');
    
                agent
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .end((err: any, res: any) => {

                    agent
                    .get('/logout')
                    .end((err: any, res: any) => {
                        chai.expect(res).to.have.status(200)
                        
                        chai.expect(requestSpy.calledOnce).to.eq(true);
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                        done();
                    });
                });
            });
        });
    });

    context('when logged out', () => {
        afterEach(() => {
            renderSpy.resetHistory();
            passportSpy.resetHistory();
        })

        describe('GET /login', () => {
            it('should send the login page with the correct args', (done: any) => {
                chai.request(server)
                .get('/login')
                .end((err: any, res: any) => {
                    const args = renderSpy.args[0];
                    chai.expect(res).to.have.status(200)
                    
                    chai.expect(renderSpy.calledOnce).to.eq(true);

                    chai.expect(args[0]).to.eq('login');
                    chai.expect(args[1]).to.deep.include({
                        user: undefined,
                        message: [],
                    });

                    done();
                });
            });
        });

        describe('POST /login', () => {
            it('should login the user and redirect to the homepage', (done: any) => {
                chai.request(server)
                .post('/login')
                .send({ email: 'mocha@test.com', password: 'mocha123' })
                .end((err: any, res: any) => {
                    const args = passportSpy.args[0];
                    chai.expect(res).to.have.status(200)

                    chai.expect(passportSpy.calledOnce).to.eq(true);

                    chai.expect(args[0]).to.eq('local-login');
                    chai.expect(args[1]).to.deep.include({
                        successRedirect: '/',
                        failureRedirect: '/login',
                        failureFlash: true
                    });
    
                    done();
                });
            });
        });

        describe('GET /signup', () => {
            it('should send the signup page with the correct args', (done: any) => {
                chai.request(server)
                .get('/signup')
                .end((err: any, res: any) => {
                    const args = renderSpy.args[0];

                    chai.expect(res).to.have.status(200)

                    chai.expect(args[0]).to.eq('signup');
                    chai.expect(args[1]).to.deep.include({
                        user: undefined,
                        message: [],
                    });
                    done();
                });
            });
        });

        describe('POST /signup', () => {
            it('should sign up the user and redirect to the homepage', (done: any) => {
                chai.request(server)
                .post('/signup')
                .send({ email: 'mocha2@test.com', password: 'mocha123' })
                .end((err: any, res: any) => {
                    const args = passportSpy.args[0];
                    chai.expect(res).to.have.status(200)

                    chai.expect(passportSpy.calledOnce).to.eq(true);

                    chai.expect(args[0]).to.eq('local-signup');
                    chai.expect(args[1]).to.deep.include({
                        successRedirect: '/',
                        failureRedirect: '/signup',
                        failureFlash: true
                    });
    
                    done();
                });
            });
        });

        describe('GET /logout', () => {
            it('should redirect to the homepage', (done: any) => {
                chai.request('http://127.0.0.1:3000')
                .get('/logout')
                .end((err: any, res: any) => {
                    chai.expect(res).to.have.status(200)
                    
                    chai.expect(requestSpy.calledOnce).to.eq(false);
                    chai.expect(res).to.redirectTo('http://127.0.0.1:3000/');
                    done();
                });
            });
        });

        describe('GET /verify/:uid/:token', () => {
            context('when a user is already verified', () => {
                it('should verify the user and redirect to login', (done: any) => {
                    chai.request('http://127.0.0.1:3000')
                    .get(`/verify/${ unverifiedUser._id }/${ unverifiedUser.local.verifyToken }`)
                    .end((err: any, res: any) => {
                        chai.expect(res).to.have.status(200)
                        
                        chai.expect(findOneAndUpdateUserSpy.called).to.eq(true);
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/login');
                        done();
                    });
                });
            });

            context('when a user is not verified', () => {
                it('should redirect to login', (done: any) => {
                    chai.request('http://127.0.0.1:3000')
                    .get(`/verify/${ user._id }/${ user.local.verifyToken }`)
                    .end(async (err: any, res: any) => {
                        chai.expect(res).to.have.status(200)
                        
                        chai.expect(res).to.redirectTo('http://127.0.0.1:3000/login');
                        done();
                    });
                });
            });
        });
    });
});