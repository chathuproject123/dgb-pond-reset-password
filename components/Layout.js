import Head from 'next/head'

export default function Layout({ children, title = 'DGB Pond' }) {
  return (
    <>
      <Head>
        <title>{title} | DGB Pond</title>
        <meta name="description" content="DGB Pond Password Reset" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  )
}
