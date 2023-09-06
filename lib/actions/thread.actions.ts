'use server';

import { revalidatePath } from 'next/cache';
import Thread from '../models/thread.model';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';

interface Params {
	text: string;
	author: string;
	path: string;
}

connectToDB();


export async function createThread({ text, author, path }: Params) {
	try {
		const createThread = await Thread.create({
			text,
			author,
			community: null,
		});

		await User.findByIdAndUpdate(author, {
			$push: { threads: createThread._id },
		});

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error creating thread:${error.message}`);
	}
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	try {
		const skipAmount = (pageNumber - 1) * pageSize;
		const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
			.sort({ createdAt: 'desc' })
			.skip(skipAmount)
			.limit(pageSize)
			.populate({ path: 'author' })
			.populate({
				path: 'children',
				populate: {
					path: 'author',
					model: User,
					select: '_id name parentId image',
				},
			})
			.populate({
				path: 'likes',
				strictPopulate: false,
			});

		const totalPostCount = await Thread.countDocuments({
			parentId: { $in: [null, undefined] },
		});
		
		const posts = await postQuery.exec();
		const isNext = totalPostCount > skipAmount + posts.length;

		return { posts, isNext };
	} catch (error: any) {
		throw new Error(`Error creating thread:${error.message}`);
	}
}

export async function fetchThreadById(id: string) {
	try {
		const thread = await Thread.findById(id)
			.populate({
				path: 'author',
				model: User,
				select: '_id id name image',
			})
			.populate({
				path: 'children',
				populate: [
					{
						path: 'author',
						model: User,
						select: '_id id name parentId image',
					},
					{
						path: 'children',
						model: Thread,
						populate: {
							path: 'author',
							model: User,
							select: '_id id name parentId image',
						},
					},
				],
			})
			.exec();

		return thread;
	} catch (error: any) {
		throw new Error(`Error fetching thread: ${error.message}`);
	}
}

export async function addCommentToThread(
	threadId: string,
	commentText: string,
	userId: string,
	path: string
) {
	try {
		const originalThread = await Thread.findById(threadId);

		if (!originalThread) {
			throw new Error('Thread not found');
		}

		const commentThread = new Thread({
			text: commentText,
			author: userId,
			parentId: threadId,
		});

		const saveCommentThread = await commentThread.save();
		originalThread.children.push(saveCommentThread._id);
		await originalThread.save();
		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error adding comment to thread: ${error.message}`);
	}
}
