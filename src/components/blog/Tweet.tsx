import { EmbeddedTweet, TweetNotFound } from 'react-tweet';

import { POST_TWEETS } from '@/app/d/production/sections/post-tweets';

/**
 * A tweet in a post: react-tweet's card, centred, as the landing site
 * frames it. The landing site fetches the tweet by id while rendering; this
 * renders the record the production mirror vendors, so the build makes no
 * network call.
 */
export default function Tweet({ id }: { id?: string }) {
  const tweet = id ? POST_TWEETS[id] : undefined;
  return <div className='blog-tweet'>{tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />}</div>;
}
