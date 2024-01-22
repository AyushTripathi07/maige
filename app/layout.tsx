import {Metadata, Viewport} from 'next'
import Providers from '~/components/dashboard/Providers'
import '~/styles/globals.css'
import {italiana, roboto} from '~/utils/fonts'

const title = 'Maige'
const description = 'AI-powered codebase actions.'
const preview = {
	url: '/preview.png',
	width: 1200,
	height: 630,
	alt: 'Maige logo'
}

export const viewport: Viewport = {
	themeColor: '#000'
}

export const metadata: Metadata = {
	title,
	description,
	metadataBase: new URL('https://maige.app'),
	alternates: {
		canonical: '/',
		languages: {
			'en-US': '/en-US'
		}
	},
	openGraph: {
		title,
		description,
		url: 'maige.app',
		siteName: title,
		type: 'website',
		images: preview
	},
	twitter: {
		title,
		creator: '@RubricLabs',
		card: 'summary_large_image',
		images: preview,
		description
	}
}

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html
			lang='en'
			className={`${italiana.variable} ${roboto.className}`}>
			<body>
				<Providers>
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	)
}
