import {ApplicationProvider} from 'lib/components/dashboard/ApplicationProvider'
import {getServerSession} from 'next-auth'
import {Toaster} from 'sonner'
import {authOptions} from '~/authOptions'
import {MainNavigation} from '~/components/dashboard/Navigation'
import {DashboardHeader} from '~/components/dashboard/Navigation/Header'

export default async function RootLayout({
	children
}: {
	children: React.ReactNode
}) {
	const session = await getServerSession(authOptions)
	return (
		<div>
			<Toaster />
			<ApplicationProvider>
				<MainNavigation />
				<div className='xl:px-24'>{children}</div>
			</ApplicationProvider>
		</div>
	)
}
