import Head from 'next/head'
import Info from '../components/Info'
import Nav from '../components/Nav'
import Transcribe from '../components/Transcribe'
import styles from '../styles/Home.module.css'

export default function Home () {
  return (
    <div className={styles.container}>
      <Head>
        <title>Voice | Winterdelta</title>
        <meta name='description' content='AI Transcription' />
      </Head>

      <main className={styles.main}>
        <Nav />
        <Transcribe />
        {/* <Info /> */}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}
