import styles from '../styles/Info.module.css'
import Link from 'next/link'

export default function Info () {
  return (
    <div className={styles.container}>
      <div className={styles.label}>AI-powered transcription</div>
      <Link href='https://docs.google.com/document/d/1JsKRLWsMte-kEZ1H1YVTBJg4rIaQF0rWn3T9tdu0ZQ4/edit?usp=sharing'>
        <a className={styles.btnLink}>Proposal</a>
      </Link>
    </div>
  )
}
