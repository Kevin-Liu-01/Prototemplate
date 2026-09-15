/**
 * Home: dividers (C1 item 2).
 *
 * The wedge rule: a single row of horizontal wedges that divides a tablet's
 * head register from its body, the way a ruled line divides lines of text on
 * a tablet. The drawing is a CSS mask tile (styles.css, .ct-wrule), so the
 * element is empty and paints in the ornament token; this component exists
 * so every section places the divider through one name.
 */
export default function WedgeRule() {
  return <div className='ct-wrule' aria-hidden='true' />;
}
