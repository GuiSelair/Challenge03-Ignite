import { useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { asHTML, asText } from '@prismicio/helpers';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const postContentBody = useMemo(() => {
    const postContent = post.data.content.map(content => {
      return {
        heading: content.heading,
        body: asHTML(content.body),
      };
    });

    return postContent;
  }, [post]);

  const estimatedReadingTime = useMemo(() => {
    const getArrayOfWords = post.data.content.reduce(
      (arrayOfWords, postContent) => {
        arrayOfWords.push(...asText(postContent.body).split(' '));
        return arrayOfWords;
      },
      []
    );

    const totalReading = Math.ceil(getArrayOfWords.length / 200);
    return totalReading;
  }, [post]);

  console.log(estimatedReadingTime);

  if (!post) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <img
        className={styles.bannerContainer}
        src={post.data.banner.url}
        alt={post.data.title}
      />
      <main className={styles.container}>
        <h1>{post.data.title}</h1>
        <section className={styles.details}>
          <div>
            <FiCalendar />
            <span>{post.first_publication_date}</span>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>{estimatedReadingTime} min</span>
          </div>
        </section>

        <section className={styles.content}>
          {postContentBody.map(content => (
            <>
              <h3>{content.heading}</h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: content.body,
                }}
              />
            </>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const post = await prismic.getByUID('posts', String(params.slug));

  console.log(JSON.stringify(post, null, 2));
  return {
    props: {
      post: {
        ...post,
        first_publication_date: format(
          parseISO(post.first_publication_date),
          'dd LLL yyyy',
          {
            locale: ptBR,
          }
        ),
      },
    },
    revalidate: 60 * 60,
  };
};
