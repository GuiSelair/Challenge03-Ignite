import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div>
        <Link href="/">
          <a>
            <Image
              src="/images/logo.png"
              width={238}
              height={26}
              objectFit="contain"
              alt="logo"
            />
          </a>
        </Link>
      </div>
    </header>
  );
}
