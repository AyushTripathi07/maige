import {getServerSession} from 'next-auth'
import {Suspense} from 'react'
import {authOptions} from '~/authOptions'
import {Landing} from '~/components/dashboard/Landing'
import {MainNavigation} from '~/components/dashboard/Navigation'
import {Repositories} from '~/components/dashboard/Repositories'
import {LargeHeading} from '~/components/dashboard/Text'
import prisma from '~/prisma'

export default async function Page() {
	const session = await getServerSession(authOptions)

	if (!session) return <Landing />

	const customer = await prisma.customer.findUnique({
		where: {
			githubUserId: session.user.githubUserId
		}
	})

	if (!customer) return <></> // need 404 here

	const projects = await prisma.project.findMany({
		where: {
			customerId: customer.id
		}
	})

	return (
		<div className='flex flex-col p-8'>
			<MainNavigation
				session={session}
				avatarUrl={session.user.image}
			/>
			<div className='flex flex-col items-center gap-8'>
				<LargeHeading>Select a Repository</LargeHeading>
				<Suspense fallback={<p>Loading...</p>}>
					<Repositories projects={projects} />
				</Suspense>
			</div>
		</div>
	)
}
