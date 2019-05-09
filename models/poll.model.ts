import mongoose from 'mongoose';

export type PollModel = mongoose.Document & {
	name: string,
	description: string,
	choices: string[],
	results: Record<string, number>,
	usersVoted: [],
	isPremium: boolean,
	isApproved: boolean
};

const pollSchema = new mongoose.Schema({
	name: String,
	description: String,
	choices: Array,
	results: Object,
	usersVoted: Array,
	isPremium: Boolean,
	isApproved: Boolean
});

const Poll = mongoose.model<PollModel>('Poll', pollSchema);
export default Poll;