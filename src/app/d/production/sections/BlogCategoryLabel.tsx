import type { BlogCategory } from './blog-index-data';

type BlogCategoryLabelProps = {
  category: BlogCategory;
};

/**
 * The four category names. The shipped component wraps each in <T> for
 * translation (apps/landing/src/components/blog/BlogCategoryLabel.tsx);
 * this control renders the English string plainly.
 */
export default function BlogCategoryLabel({
  category,
}: BlogCategoryLabelProps) {
  if (category === 'Engineering') return <>Engineering</>;
  if (category === 'Craft') return <>Craft</>;
  if (category === 'Community') return <>Community</>;
  return <>News</>;
}
