// The dashboard's async pages import getGT from 'gt-next/server'; the port
// rewrites that path here, and the shim's getGT serves both.
export { getGT } from '@/components/plate/shims/gt-next';
