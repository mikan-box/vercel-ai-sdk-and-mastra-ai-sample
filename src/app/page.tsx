import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      {/* <div>
      <a className={styles.demoLink} href="/vercel">Vercel AI SDK Demo</a>
      </div> */}
      <div>
      <a className={styles.demoLink} href="/mastra">Mastra AI Demo</a>
      </div>
    </div>
  );
}
