import Link from 'next/link'
import {timeAgo} from '~/utils'

export function Repositories({projects}: {projects: any[]}) {
	return (
		<div className='grid w-full gap-4 sm:grid-cols-4'>
			{projects.map(project => (
				<Link
					className='relative flex h-36 w-full cursor-pointer flex-col justify-between rounded-lg border-2 border-border border-opacity-20 p-4 py-3.5 transition-all hover:border-opacity-100'
					href={`/dashboard/repo/${project.id}`}
					key={project.id}>
					<div className='flex w-full items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='relative'>
								<div className='h-6 w-6 rounded-full bg-foreground' />
								<p className='absolute left-0 right-0 top-1/2 m-auto -translate-y-1/2 text-center font-medium leading-none text-secondary'>
									{project.name.charAt(0).toUpperCase()}
								</p>
							</div>
							<p className='text-lg'>{project.name}</p>
						</div>
					</div>
					<div className='flex flex-col gap-1'>
						<span className='font-medium'>
							{project.customInstructions.length} Custom Instructions
						</span>
						<span className='text-sm text-zinc-500'>
							Added {timeAgo(project.createdAt)}
						</span>
					</div>
				</Link>
			))}
		</div>
	)
}
