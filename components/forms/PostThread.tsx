'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { usePathname, useRouter } from 'next/navigation';
import { ThreadValidation } from '@/lib/validations/thread';
import { updateUser } from '@/lib/actions/user.actions';
import { createThread } from '@/lib/actions/thread.actions';



function PostThread({ userId }: { userId: string }) {
	const pathname = usePathname();
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(ThreadValidation),
		defaultValues: {
			thread: '',
			accountId: userId,
		},
	});

	const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
		if (pathname)
			await createThread({
				text: values.thread,
				author: userId,
				path: pathname,
			});

		router.push('/');
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex mt-10 flex-col justify-start gap-10"
			>
				<FormField
					control={form.control}
					name="thread"
					render={({ field }) => (
						<FormItem className="flex flex-col w-full gap-3">
							<FormLabel className="text-base-semibold text-light-2">
								Content
							</FormLabel>
							<FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
								<Textarea
									rows={15}
									{...field}
									className="resize-none"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="bg-primary-500"
				>
					Post Thread
				</Button>
			</form>
		</Form>
	);
}

export default PostThread;
