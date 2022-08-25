import styles from '../styles/Info.module.css'
import Link from 'next/link'

export default function Info () {
  return (
    <div className={styles.container}>
      <div className={styles.label}>AI-powered transcription</div>
      <Link href='/'>
        <a className={styles.btnLink}>Proposal</a>
      </Link>
    </div>
  )
}
