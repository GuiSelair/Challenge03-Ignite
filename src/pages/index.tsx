import { GetStaticProps } from 'next';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Head from 'next/head';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';
// import commonStyles from '../styles/common.module.scss';
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

function formatDateInAllPosts(posts) {
  return posts.map(post => ({
    ...post,
    first_publication_date: format(
      parseISO(post.first_publication_date),
      'dd LLL yyyy',
      {
        locale: ptBR,
      }
    ),
  }));
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [isShowMoreLoadButton, setIsShowMoreLoadButton] = useState(
    !!postsPagination.next_page
  );
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  async function handleLoadMorePosts() {
    try {
      const morePostsResultRaw = await fetch(postsPagination.next_page);
      const morePostsResult: PostPagination = await morePostsResultRaw.json();
      morePostsResult.results = formatDateInAllPosts(morePostsResult.results);

      if (!morePostsResult.next_page) setIsShowMoreLoadButton(false);

      setPosts(old => [...old, ...morePostsResult.results]);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Head>
        <title>SpaceTraveling</title>
      </Head>
      <main className={styles.container}>
        <ul>
          {posts.map(post => (
            <li key={post.uid} className={styles.postContent}>
              <Link href={`/post/${post.uid}`}>
                <a>{post.data.title}</a>
              </Link>
              <span>{post.data.subtitle}</span>

              <section className={styles.postDetails}>
                <div>
                  <FiCalendar />
                  <span>{post.first_publication_date}</span>
                </div>
                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </section>
            </li>
          ))}
        </ul>
        {isShowMoreLoadButton && (
          <button
            type="button"
            className={styles.loadMorePosts}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  postsResponse.results = formatDateInAllPosts(postsResponse.results);
  console.log(postsResponse);
  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
