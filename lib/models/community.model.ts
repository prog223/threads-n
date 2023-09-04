import mongoose from 'mongoose';

const { Schema } = mongoose;

const communitySchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		unique: true,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	image: String,
	bio: String,
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	threads: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Thread',
		},
	],
	members: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

const Community =
	mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;
