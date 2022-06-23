import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Head from 'next/head';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>SpaceTraveling</title>
      </Head>
      <main className={styles.container}>
        <ul>
          {postsPagination.results.map(post => (
            <li key={post.uid} className={styles.postContent}>
              <Link href={`/post/${post.uid}`}>
                <a>{post.data.title}</a>
              </Link>
              <span>{post.data.subtitle}</span>

              <section className={styles.postDetails}>
                <div>
                  <FiCalendar />
                  <span>15 Mar 2021</span>
                </div>
                <div>
                  <FiUser />
                  <span>Joseph Oliveira</span>
                </div>
              </section>
            </li>
          ))}
        </ul>
        {!!postsPagination.next_page && (
          <button type="button" className={styles.loadMorePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
