import ThreadCard from '@/components/cards/ThreadCard';
import { fetchPosts } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function Home() {
	const result = await fetchPosts(1, 30);
	const user = await currentUser();
	if (!user) return null;
	const userInfo = await fetchUser(user.id);
	if (!userInfo?.onboarded) redirect('/onboarding');

	return (
		<>
			<h1 className="head-text text-left">Home</h1>

			<section className="mt-9 flex flex-col gap-10">
				{result?.posts.length === 0 ? (
					<p>No threads found</p>
				) : (
					<>
						{result?.posts.map((post) => (
							<ThreadCard
								key={post._id}
								id={post._id}
								currentUserId={user?.id || ''}
								parentId={post.parentId}
								content={post.text}
								author={post.author}
								community={post.community}
								createdAt={post.ceratedAt}
								comments={post.children}
							/>
						))}
					</>
				)}
			</section>
		</>
	);
}

// export async function getServerSideProps() {
// 	const res = await fetch('https://jsonplaceholder.typicode.com/users');
// 	const data = await res.json();

// 	console.log(data[0]);

// 	return {
// 		props: {
// 			data,
// 		},
// 	};
// }