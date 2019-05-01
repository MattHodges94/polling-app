// @ts-ignore
import * as Poll from '../models/poll.model';
// @ts-ignore
import * as User from '../models/user.model';

export const createUser = async () => {
    return User.create({
        local: {
            email: 'mocha@test.com',
            // @ts-ignore
            password: User.generateHash('mocha123'),
            isVerified: true,
        },
    });
}

export const createPoll = async () => {
    return Poll.create({
        name: 'mocha poll',
        description: 'poll for mocha test',
        choices: [],
        results: {},
        usersVoted: [],
        isPremium: false,
        isApproved: true,
    });
}