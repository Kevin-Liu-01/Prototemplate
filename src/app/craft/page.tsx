import { redirect } from 'next/navigation';

/** The build log merged into the docs page — old links (and their
    #library anchors) follow the redirect. */
export default function CraftPage() {
  redirect('/docs');
}
