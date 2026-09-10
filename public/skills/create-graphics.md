# Create Graphics

Turn a communication job into the smallest visual form that makes it clearer. Choose the output contract before choosing a rendering tool, preserve exact information as editable text or data, and verify the artifact at its real display size.

## Route The Artifact

| Need | Primary route | Deliverable |
| --- | --- | --- |
| Exact architecture, flow, comparison, or state model | self-contained HTML + inline SVG; use `diagram-to-html` when available | source HTML, SVG/PNG export, and cited data |
| Editable workshop or whiteboard diagram | `excalidraw-diagram-generator` | `.excalidraw` source plus rendered preview |
| Simple relationship already clear in Mermaid | Mermaid | Markdown source and rendered check |
| Website feature illustration or product representation | use `imagegen` only for visual exploration, then rebuild exact copy and geometry in HTML/SVG when text or structure matters | editable source plus final PNG/SVG/WebP |
| Pre-existing illustration or stock asset | resolve the exact asset, creator, primary distribution and current rights before download; use [[design-inspiration-galleries]] only as a discovery shelf | local asset plus rights receipt, attribution and source hash |
| Social infographic or editorial graphic | `diagram-to-html` or precise HTML/SVG composition | target-size export and editable source |
| Live screenshot/DOM annotation | [[fieldwork]] when available; otherwise screenshot plus an editable overlay | annotated source with node/version provenance |

Do not use a raster generator for tables, exact labels, metrics, system topology, or anything the reader must trust literally. Do not use Mermaid merely because it is quick when the requested artifact is a branded product graphic.

## Workflow

### 1. Define The Communication Job

Write one sentence for:

- audience;
- question the visual must answer;
- required facts, labels, and relationships;
- target surface and dimensions;
- editability, export, and accessibility requirements.

If the input contains claims or numbers, identify the source of truth before drawing.

If the output uses a pre-existing illustration, icon, photograph, font or other
stock asset, create a rights receipt before it enters the artifact. Record the
exact asset and product URLs, creator, terms URL and displayed revision, local
hash, download plan/account state, required attribution, count/price limits,
modification and client-transfer authority, redistribution/trademark/ML limits,
and intended product use. “Free,” zero price, a preview, a download button, or a
roundup's commercial-use label is not a license. Preserve rights-unresolved
sources as references, but fail closed on shipment.

### 2. Onboard The Visual System

Inspect the project's `Design.md`, CSS variables, tokens, typography, logo, screenshots, and existing product surfaces. If no system exists, propose a restrained local palette and type hierarchy instead of inventing a generic “AI brand.”

Name the visual fixtures being used and what each contributes. A fixture can guide composition, information density, interaction, or material treatment; it must not silently replace the product's identity.

### 3. Sketch Structure Before Styling

List every node, label, and connection. Delete anything that does not help answer the communication question. Prefer:

- one clear reading direction;
- visual density near 4/10 unless the format is explicitly technical;
- one or two accent focal points;
- meaningful grouping instead of nested rounded rectangles;
- direct labels instead of legends when space allows;
- conflict, uncertainty, and alternatives shown explicitly rather than averaged away.

For agent-analysis diagrams, show independent lenses before merge, preserve disagreement, and separate the devil's-advocate pass from the final verdict.

### 4. Build Deliberately

- Keep exact text selectable in HTML/SVG outputs.
- Use real interface screenshots or reconstructed product geometry for product representations; avoid fictional controls that imply nonexistent functionality.
- Prefer simple geometry, disciplined spacing, and a brand-specific skin over glassmorphism, glowing gradients, excessive pills, or decorative network lines.
- Treat gradients as earned emphasis. Use a gradient reference such as [[feralui-gradient-builder]] only when the brief supports it.
- Apply accessible contrast, useful alt text, and color-independent meaning.
- Make diagrams responsive or provide a mobile crop when the destination requires it.

### 5. Compare Variants

Produce two or three structurally meaningful variants when direction is uncertain. Vary hierarchy, framing, or diagram type—not arbitrary colors. State why one variant best answers the communication job.

### 6. Verify At Target Size

Check:

- every required fact and relationship is present and correct;
- no label is clipped, tiny, or rendered as unreliable generated text;
- the reading order is obvious in five seconds;
- contrast and non-color cues work;
- the artifact still reads at its embed/export size;
- source files reopen and remain editable;
- raster exports are sharp at 1x and 2x;
- the result resembles the product's visual system rather than a generic AI illustration.

## Proof Contract

Return:

1. the editable source;
2. the requested export formats;
3. a short rationale naming the communication job and selected route;
4. the data/source references used;
5. verification evidence at target dimensions;
6. any limitation, unresolved ambiguity, or font/license dependency.

When external assets are present, also return the rights receipt and prove that
the delivered files and attribution match it. A moodboard or source-shelf row is
not that receipt.

## Failure Modes

- generating a polished image before understanding the information;
- burning critical copy into a raster image;
- using a wall of rounded boxes and arrows as a substitute for hierarchy;
- adding gradients, glows, fake 3D, or glass because the subject is AI;
- copying a reference's brand instead of extracting a principle;
- beautifying a flow while deleting disagreement, cost, uncertainty, or failure states;
- delivering only a PNG when future editing is expected;
- claiming a diagram is verified without inspecting the rendered artifact.

## References

Read [quality-bar.md](references/quality-bar.md) when the result risks looking generic, when multiple source fixtures are involved, or when reviewing a finished artifact.
