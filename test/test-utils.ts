import { default as Poll } from '../models/poll.model';
import { default as User, UserModel } from '../models/user.model';

export const createUser = async (options = {}) => {
    const userProperties = Object.assign({
        email: 'mocha@test.com',
        // @ts-ignore
        password: User.generateHash('mocha123'),
        isVerified: true,
    }, options);

    await User.create({
        local: userProperties,
    });

    return User.findOne({ 'local.email': userProperties.email }).lean();
}

export const createPoll = async (options = {}) => {
    const pollProperties = Object.assign({
        name: 'mocha poll',
        description: 'poll for mocha test',
        choices: [],
        results: {},
        usersVoted: [],
        isPremium: false,
        isApproved: true,
    }, options);

    return Poll.create(pollProperties);
}