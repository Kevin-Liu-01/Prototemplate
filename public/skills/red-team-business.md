# Red-Team Business

Use this when the user wants the business or product attacked before the market does it for free.

## Inputs

Gather only what is necessary:

- product or project description
- target customer
- business model or pricing
- distribution channel
- current traction or constraints
- what decision the audit should inform

If any of these are missing, proceed with explicit assumptions unless the missing fact changes the answer.

## Seven Lenses

Run the audit through these lenses, adapted from the Claude Red Team Mode bookmark:

1. **Competitor War Game**: how a ruthless competitor steals users, undercuts positioning, or makes the product irrelevant within 12 months.
2. **Customer Betrayal Sim**: the honest cancellation email from a once-happy user.
3. **Investor Teardown**: the three holes a skeptical investor would press on, plus the question the team cannot yet answer.
4. **Single Point Of Failure Scan**: people, tool/platform, revenue, supply-chain, and channel dependencies.
5. **Market Shift Scenario**: three plausible 18-month shifts and the early-warning signs.
6. **Pricing Pressure Test**: why a price-sensitive buyer says no, the churn threshold, and the cheaper substitute.
7. **Attack Surface Report**: top vulnerabilities ranked by likelihood and severity, plus the blind spot outside the builder's current frame.

## Output Shape

Return:

- **Verdict**: one paragraph naming the largest risk.
- **Critical vulnerabilities**: ranked table with likelihood, severity, evidence, and mitigation.
- **Adversarial narratives**: concise competitor/customer/investor versions.
- **Signals to watch**: what would prove the risk is real.
- **Next moves**: 3-5 actions that harden the plan.
- **Non-issues**: fears that look dramatic but are not load-bearing.

## Rules

- Be concrete. Name the move, channel, substitute, failure mode, or missing evidence.
- Do not use generic startup advice unless it directly follows from the user's context.
- Treat model output as hypotheses. Recommend checks that can falsify the scary story.
- If the project is early, optimize for learning speed. If it is live, optimize for risk reduction and retention.
- Link durable insights back to `wiki/concepts/red-team-your-business.md` when updating the wiki.
