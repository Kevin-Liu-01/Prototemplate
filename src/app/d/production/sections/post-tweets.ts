import type { Tweet } from 'react-tweet/api';

/**
 * PRODUCTION · the one tweet a vendored post embeds
 * (supporting-open-source-software: <Tweet id='2090135549780848662' />),
 * as the public X syndication API (cdn.syndication.twimg.com, the source
 * react-tweet reads) returned it on 2026-10-15. Live fetches it when the
 * page renders; this mirror keeps the record so the build makes no network
 * call. The like and reply counts are that day's. The record is shaped to
 * react-tweet's Tweet type: the account's numeric id is left empty, the
 * video's duration and empty media info are left out, and the entity lists
 * and colour palette the API omits are empty; the renderer reads none of
 * them.
 */
export const POST_TWEETS: Readonly<Record<string, Tweet>> = {
  '2090135549780848662': {
    "__typename": "Tweet",
    "favorite_count": 194,
    "lang": "en",
    "possibly_sensitive": false,
    "created_at": "2026-08-19T17:55:22.000Z",
    "display_text_range": [
      0,
      173
    ],
    "entities": {
      "hashtags": [],
      "urls": [],
      "user_mentions": [],
      "symbols": [],
      "media": [
        {
          "display_url": "pic.x.com/tYbZ1qRgLY",
          "expanded_url": "https://x.com/generaltxn/status/2090135549780848662/video/1",
          "indices": [
            174,
            197
          ],
          "url": "https://t.co/tYbZ1qRgLY"
        }
      ]
    },
    "id_str": "2090135549780848662",
    "text": "We’re trying something new: giving away $15,000 to developers building open-source projects. To apply, tag your favorite open-source developer or link your project below! ⭐️ https://t.co/tYbZ1qRgLY",
    "user": {
      "id_str": "",
      "name": "General Translation",
      "screen_name": "generaltxn",
      "is_blue_verified": false,
      "profile_image_shape": "Square",
      "verified": false,
      "verified_type": "Business",
      "profile_image_url_https": "https://pbs.twimg.com/profile_images/1901703151838990336/HbEaiJIr_normal.jpg"
    },
    "edit_control": {
      "edit_tweet_ids": [
        "2090135549780848662"
      ],
      "editable_until_msecs": "1787165722000",
      "edits_remaining": "5",
      "is_edit_eligible": false
    },
    "mediaDetails": [
      {
        "display_url": "pic.x.com/tYbZ1qRgLY",
        "expanded_url": "https://x.com/generaltxn/status/2090135549780848662/video/1",
        "ext_media_availability": {
          "status": "Available"
        },
        "ext_media_color": {
          "palette": []
        },
        "indices": [
          174,
          197
        ],
        "media_url_https": "https://pbs.twimg.com/amplify_video_thumb/2090135525449699328/img/DsBUOqWb20kJ4H6u.jpg",
        "original_info": {
          "focus_rects": [],
          "height": 1080,
          "width": 1920
        },
        "sizes": {
          "large": {
            "h": 1080,
            "resize": "fit",
            "w": 1920
          },
          "medium": {
            "h": 675,
            "resize": "fit",
            "w": 1200
          },
          "small": {
            "h": 383,
            "resize": "fit",
            "w": 680
          },
          "thumb": {
            "h": 150,
            "resize": "crop",
            "w": 150
          }
        },
        "type": "video",
        "url": "https://t.co/tYbZ1qRgLY",
        "video_info": {
          "aspect_ratio": [
            16,
            9
          ],
          "variants": [
            {
              "content_type": "application/x-mpegURL",
              "url": "https://video.twimg.com/amplify_video/2090135525449699328/pl/-dAzEFGbve3YVVq9.m3u8"
            },
            {
              "bitrate": 256000,
              "content_type": "video/mp4",
              "url": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/480x270/kHrj8W-Bo55q3Op2.mp4"
            },
            {
              "bitrate": 832000,
              "content_type": "video/mp4",
              "url": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/640x360/xhhhdfWbNheOBRAV.mp4"
            },
            {
              "bitrate": 2176000,
              "content_type": "video/mp4",
              "url": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/1280x720/5sgZFQvheQj86RI_.mp4"
            },
            {
              "bitrate": 10368000,
              "content_type": "video/mp4",
              "url": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/1920x1080/hPaQvFlER33CIRkr.mp4"
            }
          ]
        }
      }
    ],
    "photos": [],
    "video": {
      "aspectRatio": [
        16,
        9
      ],
      "contentType": "media_entity",
      "durationMs": 8498,
      "mediaAvailability": {
        "status": "available"
      },
      "poster": "https://pbs.twimg.com/amplify_video_thumb/2090135525449699328/img/DsBUOqWb20kJ4H6u.jpg",
      "variants": [
        {
          "type": "application/x-mpegURL",
          "src": "https://video.twimg.com/amplify_video/2090135525449699328/pl/-dAzEFGbve3YVVq9.m3u8"
        },
        {
          "type": "video/mp4",
          "src": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/480x270/kHrj8W-Bo55q3Op2.mp4"
        },
        {
          "type": "video/mp4",
          "src": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/640x360/xhhhdfWbNheOBRAV.mp4"
        },
        {
          "type": "video/mp4",
          "src": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/1280x720/5sgZFQvheQj86RI_.mp4"
        },
        {
          "type": "video/mp4",
          "src": "https://video.twimg.com/amplify_video/2090135525449699328/vid/avc1/1920x1080/hPaQvFlER33CIRkr.mp4"
        }
      ],
      "videoId": {
        "type": "tweet",
        "id": "2090135549780848662"
      },
      "viewCount": 0
    },
    "conversation_count": 151,
    "news_action_type": "conversation",
    "isEdited": false,
    "isStaleEdit": false
  },
};
