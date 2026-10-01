import PlateFrame, {
  type PlateFrameProps,
} from '@/components/plate/frame/PlateFrame';

type AuthShellProps = Pick<PlateFrameProps, 'picture'> & {
  /**
   * Which material the field draws: 0 (default) the rain and the globe for
   * the sign-in screens, 1 a mood picture for the screens that follow
   * sign-in (consent, device, CLI wizard).
   */
  scene?: PlateFrameProps['scene'];
  children: React.ReactNode;
};

/**
 * Page shell for the auth screens: the shared plate frame, signed out, so
 * the foot carries the copyright and no sign out. Scene 1 draws the earth
 * unless `picture` names another picture; scene 0 draws no picture. The
 * page's content is the shell's only child so the route tests can reach
 * it. The gallery renders its own frame around every state, so the page
 * components under this folder do not use the shell; it is here for a
 * standalone mount of one page.
 */
export default function AuthShell({
  scene = 0,
  picture,
  children,
}: AuthShellProps) {
  return (
    <PlateFrame
      scene={scene}
      picture={picture ?? (scene === 1 ? 'earth' : undefined)}
      homeLabel='General Translation home'
    >
      {children}
    </PlateFrame>
  );
}
