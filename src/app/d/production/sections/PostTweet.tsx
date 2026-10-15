import { EmbeddedTweet, TweetNotFound } from 'react-tweet';

import { POST_TWEETS } from './post-tweets';

/**
 * PRODUCTION · a tweet in a post, as live's
 * apps/landing/src/components/blog/Tweet.tsx frames it: react-tweet's card,
 * centred, with 32px above and below. Live fetches the tweet by id while
 * rendering; this mirror renders the record vendored in post-tweets.ts.
 */
export default function PostTweet({ id }: { id?: string }) {
  const tweet = id ? POST_TWEETS[id] : undefined;
  return <div className='blog-tweet-embed pba-tweet not-prose'>{tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />}</div>;
}
