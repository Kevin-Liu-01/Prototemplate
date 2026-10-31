import Link from 'next/link';

import Callout from '@/components/blog/Callout';
import GitHubLink from '@/components/blog/GitHubLink';

/**
 * The grants note that opens every open-source grantee post (gt-cloud
 * #5598): the posts write `<OpenSourceGrants />` and the words live here,
 * in the callout and with the repository chip the posts used before.
 */
export default function OpenSourceGrants() {
  return (
    <Callout>
      <p>
        <em>About General Translation Open-Source Grants</em>
      </p>
      <p>
        The open-source ethos is core to what we do at General Translation. Our flagship internationalization (i18n)
        libraries are open source under the MIT license.
      </p>
      <GitHubLink />
      <p>
        We’re now supporting other open-source developers who build and maintain software for the public good, starting
        with $15,000 in no-strings-attached funds as well as $75,000 in GT platform credits across fifteen developers.
        Nominations are rolling and still open! Read more <Link href='/blog/supporting-open-source-software'>here</Link>.
      </p>
    </Callout>
  );
}
