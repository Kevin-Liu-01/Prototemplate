/**
 * THE REAL LEGAL LIBRARY, VENDORED — all seven published documents, complete.
 *
 * The live site reads Markdown from the generaltranslation/legal submodule
 * (apps/landing/legal/en-US/*.md) through apps/landing/src/lib/legal.ts and
 * renders it with next-mdx-remote. Neither the submodule nor the MDX pipeline
 * exists in this repo, so each document is carried over as a typed block tree
 * and rendered by ./LegalDocument.tsx.
 *
 * Nothing is trimmed, reworded, summarized or invented. Every string below is
 * the source file's own text: route, title, description and lastUpdated are the
 * frontmatter and H1; every heading, paragraph, list item and table row is
 * present, in source order. `##` headings carry the id rehype-slug mints for
 * them, so the aside's Contents links at the document's true section structure.
 * (README.md sits in the same directory and reads as a published `.md`, but its
 * frontmatter has no `description`/`last_updated`, so lib/legal.ts drops it —
 * the live count is seven.)
 *
 * Generated from the submodule, then verified string by string against it: each
 * value is a verbatim substring of its source file. Regenerate rather than
 * hand-edit if the submodule moves.
 */

/**
 * One list item. The source's lists are all LOOSE (items separated by blank
 * lines), which remark renders as `<li><p>…</p></li>` — and the Acceptable Use
 * Policy's lettered sub-clauses are further paragraphs of their item, carrying
 * their own literal "a." / "b." marks. So an item is a run of paragraphs.
 */
export type LegalListItem = { paras: readonly string[] };

/**
 * A block of document body. `text` accepts the inline marks the source
 * Markdown actually uses: `**bold**`, `` `code` ``, `[label](href)` and the
 * `<br />` the privacy policy's tables break their cells with.
 */
export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h3'; text: string }
  /* the Terms' 10.2(a)-style clauses and the DPA's Schedule I go four deep */
  | { kind: 'h4'; text: string }
  | { kind: 'list'; ordered?: boolean; items: readonly LegalListItem[] }
  | {
      kind: 'table';
      head: readonly string[];
      rows: readonly (readonly string[])[];
    };

/** One `##` section, keyed by the id rehype-slug gives its heading. */
export type LegalSection = {
  id: string;
  heading: string;
  blocks: readonly LegalBlock[];
};

export type LegalDoc = {
  /** The Markdown file's basename — the route segment the live site serves. */
  route: string;
  /** The document's H1. */
  title: string;
  /** Frontmatter `description`. */
  description: string;
  /** Frontmatter `last_updated`, ISO, exactly as the file stores it. */
  lastUpdated: string;
  /** Everything above the first `##` heading. */
  preamble: readonly LegalBlock[];
  sections: readonly LegalSection[];
};

/* lib/legal.ts formats the frontmatter date this way; same formatter, so the
   aside reads "July 31, 2026" the way the live document does. */
const LEGAL_DATE = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});

/** ISO `last_updated` -> the live page's long form. */
export function formatLegalDate(iso: string): string {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number);
  return LEGAL_DATE.format(new Date(Date.UTC(year, month - 1, day)));
}


const ACCEPTABLE_USE: LegalDoc = {
  route: 'acceptable-use',
  title: 'Acceptable Use Policy',
  description: 'Acceptable use guidelines for General Translation’s services.',
  lastUpdated: '2026-05-09',
  preamble: [
    { kind: 'p', text: 'This Acceptable Use Policy (**AUP**) contains rules that apply to the use of any products, services, or offerings of General Translation, Inc. (**General Translation**, **us**, **we**, or **our**) (such products, services, or offerings, the **Services**) by you or your users (collectively, **you**). Your use of the Services must comply with this AUP. This AUP is not exhaustive and may be updated by General Translation at any time by posting a revised version on its website.' },
    {
      kind: 'list',
      ordered: true,
      items: [
        {
          paras: [
            '**Safety and Security.** You will not use the Services in any manner that endangers yourself or others, including without limitation:',
            'a. to incite, facilitate, promote, support, or celebrate violence of any kind, including sexual violence, terrorism, or hate-based violence;',
            'b. to investigate, promote, support or aid suicide or other self-harm;',
            'c. to abuse or exploit children, including by facilitating minor grooming, trafficking, sextortion, or abuse or distributing, promoting, or celebrating material that depicts child sexual abuse (including AI-generated material)',
          ],
        },
        {
          paras: [
            '**Privacy and Respect.** You will not upload, store, post, or transmit content that:',
            'a. Is obscene, defamatory, deceptive, harassing, abusive, threatening, hateful, or discriminatory;',
            'b. Violates anyone else\'s intellectual property, privacy, publicity or other rights, including via misuse of anyone else\'s likeness, image, voice, name, identity, or private information;',
            'c. Shames, harasses, humiliates, bullies, intimidates, denigrates, or celebrates the pain of any person; or',
            'd. Celebrates animal neglect, abuse, or cruelty.',
          ],
        },
        {
          paras: [
            '**Engage Honorably.** You will not use the Services to:',
            'a. Create any content designed to undermine democratic processes or mislead voters;',
            'b. Engage in lobbying, advocacy, or campaigning based on false or misleading information; or',
            'c. Incite or glorify any of the foregoing.',
          ],
        },
        {
          paras: [
            '**Prohibited Conduct.** You will not and will not attempt to:',
            'a. Commit any unlawful act, including fraud, scams, impersonation, or acquisition and exchange of illegal or controlled substances or other illegal materials;',
            'b. Transmit spam or other unsolicited communications to other users;',
            'c. Use the Services in violation of data, privacy or other applicable laws or regulations;',
            'd. Engage in any activity that we determine in our sole discretion will cause liability to us or is otherwise objectionable.',
          ],
        },
        { paras: ['**Others.** You will not use the Services to prompt or encourage others to commit any of the actions above.'] },
      ],
    },
    { kind: 'p', text: 'We may monitor compliance with this AUP. If we determine that you or your content violates this AUP, we may remove your content or suspend your access to the Services.' },
    { kind: 'p', text: 'We may report any activity that we suspect violates any law or regulation to appropriate authorities. Such reporting may include disclosing relevant information.' },
    { kind: 'p', text: 'If you become aware of any suspected violation of this AUP, please notify us at [acceptable-use@generaltranslation.com](mailto:acceptable-use@generaltranslation.com) and provide a full explanation of the bases for the violation.' },
  ],
  sections: [],
};

const COOKIE_POLICY: LegalDoc = {
  route: 'cookie-policy',
  title: 'Cookie Policy',
  description: 'How General Translation uses cookies and similar technologies.',
  lastUpdated: '2026-07-17',
  preamble: [
    { kind: 'p', text: 'General Translation, Inc. (“**General Translation**,” “**we**,” “**our**,” and/or “**us**”) values the privacy of individuals who use our website, www.generaltranslation.com, including subdomains of that website (collectively, the “Site”). This cookie policy (“**Cookie Policy**”) explains how we use cookies, what types of cookies we use, and how you can block cookies. The Cookie Policy forms part of our Privacy Policy.' },
  ],
  sections: [
    {
      id: 'our-use-of-cookies',
      heading: 'Our Use of Cookies',
      blocks: [
        { kind: 'p', text: 'We and our third-party partners may collect personal data using cookies, which are small files of letters and numbers that we store on your browser or the hard drive of your computer. They contain information that is transferred to your computer’s hard drive. We and our third-party partners may also use pixel tags and web beacons on our Site. These are tiny graphic images placed on web pages or in our emails that allow us to determine whether you have performed a specific action. We use cookies, beacons, invisible tags, and similar technologies (collectively “**Cookies**”) to collect information about your browsing activities and to distinguish you from other users of our Site. This aids your experience when you use our Site and allows us to improve the functionality of our Site. Cookies can be used for performance management (i.e., collecting information on how our Site is being used for analytics purposes). They can also be used for functionality management, enabling us to make your visit more efficient by, for example, remembering language preferences, passwords, and log-in details. Below is an overview of the types of Cookies we and third parties may use to collect personal data.' },
      ],
    },
    {
      id: 'the-types-of-cookies-that-we-use',
      heading: 'The Types of Cookies That We Use',
      blocks: [
        { kind: 'h3', text: 'Strictly Necessary Cookies' },
        { kind: 'p', text: 'Some Cookies are strictly necessary to make our Site available to you. Disabling these Cookies may make certain features and Site unavailable, and we cannot provide you with our Site without this type of Cookies. We use the following necessary Cookies:' },
        {
          kind: 'table',
          head: ['Name', 'More Information', 'Retention'],
          rows: [
            ['`cookie_consent`', 'Stores your cookie consent preference so that you are not asked to accept or reject cookies on every visit.', '1 year'],
            ['`gt_theme`', 'Stores your preferred color theme (light, dark, or system) so that your preference is preserved across pages and visits.', '1 year'],
            ['`generaltranslation.locale`', 'Stores your selected language preference so the site can display content in your chosen locale.', 'Session'],
            ['`generaltranslation.locale-routing-enabled`', 'Records whether locale-based URL routing is active for your session.', 'Session'],
            ['`generaltranslation.referrer-locale`', 'Tracks the locale of the previous page during navigation to ensure correct language handling across page transitions.', 'Session'],
            ['`generaltranslation.locale-reset`', 'Transient flag that signals the middleware to honor a manual locale switch. Deleted by middleware after handling.', 'Session (transient)'],
            ['`gt-dash-auth`', 'Indicates whether you are currently signed into the General Translation dashboard. Used to redirect signed-in users to the dashboard from the homepage.', 'Session'],
            ['`gt_auth.session_token`', 'Stores your authenticated session token when you sign into the General Translation dashboard. Required to keep you logged in. (Also set as `__Secure-gt_auth.session_token` over HTTPS in production.)', '7 days'],
            ['`gt_auth.dont_remember`', 'Set when the "remember me" option is not selected during sign-in.', 'Session'],
            ['`gt-superuser`', 'JWT granting temporary admin access for internal impersonation. Set by the admin panel, read and cleared by the dashboard.', '4 hours'],
            ['`signin_error_code`', 'Temporarily stores an SSO enforcement error code (e.g. `sso_required`) to display on the sign-in page.', '60 seconds'],
            ['`signin_error_message`', 'Temporarily stores the human-readable error message for SSO enforcement.', '60 seconds'],
            ['`signin_error_email`', 'Temporarily stores the user\'s email when an SSO enforcement error occurs.', '60 seconds'],
          ],
        },
        { kind: 'h3', text: 'Analytical Cookies' },
        { kind: 'p', text: 'Analytical Cookies allow us to understand how visitors use our Site.' },
        { kind: 'p', text: 'They do this by collecting information about site visits and page views.' },
        { kind: 'p', text: 'Analytical Cookies also help us measure advertising campaign performance and improve site content.' },
        { kind: 'p', text: 'We use the following analytical Cookies:' },
        {
          kind: 'table',
          head: ['Name', 'More Information', 'Retention'],
          rows: [
            ['`_ga`', 'Set by Google Analytics to distinguish unique users by assigning a randomly generated identifier. Used to calculate visitor, session, and campaign data for the site\'s analytics reports.', '2 years'],
            ['`_ga_<container-id>`', 'Set by Google Analytics to persist session state across page requests.', '2 years'],
            ['`ph_<token>_posthog`', 'Set by PostHog for product analytics and, for signed-in users, session replay. Stores a unique identifier for the user session. For visitors, only stored as a cookie after analytics consent via the cookie banner (otherwise held in memory only); for signed-in users, stored under our Terms of Service, which cover analytics and session recording.', '1 year'],
            ['`_gcl_au`', 'Set by Google Ads to store and track conversions. Used to attribute which ad click led a visitor to the site.', '90 days'],
          ],
        },
      ],
    },
    {
      id: 'how-to-block-cookies',
      heading: 'How to Block Cookies',
      blocks: [
        { kind: 'p', text: 'You can block Cookies by setting your internet browser to block some or all Cookies. However, if you use your browser settings to block all Cookies (including essential Cookies) you may not be able to access all or parts of our Site. By using our Site, you consent to our use of Cookies and our processing of personal data collected through such Cookies, in accordance with our Cookie Policy and Privacy Policy. You can withdraw your consent at any time by deleting placed Cookies and disabling Cookies in your browser.' },
        { kind: 'p', text: 'You can change your browser settings to block or notify you when you receive a Cookie, delete Cookies or browse our Site using your browser’s anonymous usage setting. Please refer to your browser instructions or help screen to learn more about how to adjust or modify your browser settings. If you do not agree to our use of Cookies or similar technologies which store information on your device, you should change your browser settings accordingly.' },
        { kind: 'p', text: 'Please note that if you delete or choose not to accept Cookies from our Site, you may not be able to utilize the features of our Site to its fullest potential. Where required by applicable law, you will be asked to consent to certain Cookies and similar technologies before we use or install them on your computer or other device.' },
      ],
    },
    {
      id: 'changes-to-this-cookie-policy',
      heading: 'Changes to This Cookie Policy',
      blocks: [
        { kind: 'p', text: 'We will post any adjustments to the Cookie Policy on this page, including if we add or remove any Cookies from our Site, and the revised version will be effective when it is posted.' },
      ],
    },
    {
      id: 'contact-information',
      heading: 'Contact Information',
      blocks: [
        { kind: 'p', text: 'If you have any questions, comments, or concerns about our use of Cookies, please email us at [privacy@generaltranslation.com](mailto:privacy@generaltranslation.com).' },
      ],
    },
  ],
};

const CREDIT_TERMS: LegalDoc = {
  route: 'credit-terms',
  title: 'Credit Terms',
  description: 'Terms governing General Translation credits.',
  lastUpdated: '2026-05-18',
  preamble: [
    { kind: 'p', text: 'These **Credit Terms** are an agreement between you (**Customer**) and General Translation, Inc. (**General Translation**, **we**, **us**, or **our**). When Customer purchases or otherwise accepts from us any credit or other unit of consumption redeemable for use of our products, services, or offerings (such credits, **Credits**) (such products, services, or offerings, **Services**), Customer agrees that these Credit Terms apply. If Customer does not accept these Credit Terms, Customer may not purchase or otherwise accept Credits. These Credit Terms may be updated by General Translation at any time by posting a revised version on its website.' },
    {
      kind: 'list',
      ordered: true,
      items: [
        { paras: ['These Credit Terms are effective upon Customer\'s purchase or receipt of Credits and unless an earlier period is specified or agreed in the terms of Customer\'s purchase (**Order**), Credits will expire at the end of the subscription period under which such Credit was issued, but in no event greater than one year from purchase or issuance. Customer\'s Order may contain additional information, conditions, or requirements for Customer\'s Credits. In the case of a conflict between this Agreement and the Order, the Order will prevail.'] },
        { paras: ['We may allow Customer to redeem Credits for Services. Although our pricing page may contain details about the number of credits required to be exchanged for certain Services, Credits are not currency, are not redeemable for cash, have no equivalent in fiat currency and do not act as a substitute for fiat currency, and do not constitute personal property. Customer may not exchange Credits with other users or sell Credits. Any attempt to transfer Credits is a material breach of Customer obligations to us.'] },
        { paras: ['Customer may use Credits only as permitted by General Translation in connection with the Services. Customer\'s right to use Credits terminates immediately upon any violation of any contract pertaining to the Services, any suspension or termination of Customer\'s account, or a discontinuation of the Services.'] },
        { paras: ['Credits are one-time-use only. Except as required by law, Credits are non-refundable. Customer will not receive refunds for partially used credits, unused credits upon expiration, or credits remaining upon cancellation of a paid subscription. All exchanges of Credits for Services are final. For other technical failures, we may, at our sole discretion, issue replacement Credits on a case-by-case basis, but we are under no obligation to do so.'] },
        { paras: ['General Translation reserves the right to modify, limit, or discontinue the Credit system or the quantities of credits required to exchange for Services at any time. If Customer continues to use Credits after any such change, such usage constitutes Customer\'s continued acceptance of these Credit Terms as modified.'] },
      ],
    },
  ],
  sections: [],
};

const DATA_PROCESSING: LegalDoc = {
  route: 'data-processing',
  title: 'Data Processing Agreement',
  description: 'Data processing terms for General Translation customer personal data.',
  lastUpdated: '2026-05-21',
  preamble: [
    { kind: 'p', text: 'This Data Processing Agreement (“**DPA**”) forms part of the Terms of Service or other written agreement between General Translation and Customer for the provision of the Services (“**Agreement**”). Unless otherwise defined in this DPA, capitalized terms used in this DPA will have the meaning given to them in the Agreement. In the event of a conflict between the terms of this DPA and the Agreement, the terms of this DPA will control to the extent of such conflict.' },
  ],
  sections: [
    {
      id: '1-scope',
      heading: '1. Scope',
      blocks: [
        { kind: 'h3', text: '1.1. Roles of Parties' },
        { kind: 'p', text: 'Customer is the “controller” and “business” (as such terms are defined under applicable privacy and data protection law (“**Data Protection Law**”) and General Translation is the “processor” and “service provider” (as such terms are defined under applicable Data Protection Law) for any Processing of Customer Personal Data. Each Party will comply with its respective obligations under applicable Data Protection Law in connection with the Services and Customer Personal Data.' },
        { kind: 'h3', text: '1.2. Scope of Processing' },
        { kind: 'p', text: 'The subject matter, nature and purpose of General Translation’s Processing of Customer Personal Data, the types of Customer Personal Data Processed by General Translation, and categories of applicable data subjects are set out in Schedule I to DPA.' },
      ],
    },
    {
      id: '2-customer-personal-data',
      heading: '2. Customer Personal Data',
      blocks: [
        { kind: 'h3', text: '2.1. Customer Personal Data Processing' },
        { kind: 'p', text: 'General Translation will only Process Customer Personal Data to provide the Services and in accordance with Customer’s documented instructions, which are set forth in this DPA, the Agreement, or otherwise provided by Customer to General Translation in writing (“**Documented Instructions**”). Unless prohibited by applicable Law, General Translation will inform Customer if General Translation is subject to a legal obligation that requires General Translation to Process Customer Personal Data in contravention of Customer’s Documented Instructions.' },
        { kind: 'h3', text: '2.2. General Translation Responsibilities' },
        { kind: 'p', text: 'General Translation will not (a) “sell” or “share” (as such terms are defined in the California Consumer Privacy Act (“**CCPA**”)) Customer Personal Data, (b) retain, use, or disclose Customer Personal Data for any purpose other than in accordance with the Documented Instructions, (c) retain, use, or disclose Customer Personal Data outside of the direct business relationship between Customer and General Translation, nor (d) except as otherwise permitted under applicable Data Protection Law, combine Customer Personal Data with personal data that General Translation receives from or on behalf of any third party.' },
      ],
    },
    {
      id: '3-subprocessors',
      heading: '3. Subprocessors',
      blocks: [
        { kind: 'h3', text: '3.1. Authorization' },
        { kind: 'p', text: 'Customer provides general authorization for General Translation to engage the subprocessors listed at [generaltranslation.com/legal/subprocessors](https://generaltranslation.com/legal/subprocessors) (“**Subprocessors**”). General Translation will (a) enter into a contractual agreement with each Subprocessor that imposes data protection obligations that are substantially as protective as General Translation’s obligations under this DPA to the extent applicable to the nature of the services provided by such Subprocessor and (b) remain responsible for the acts and omissions of the Subprocessors’ Processing of Customer Personal Data under this DPA.' },
        { kind: 'h3', text: '3.2. Notice of New Subprocessors' },
        { kind: 'p', text: 'General Translation will provide Customer reasonable advance notice prior to appointing any new Subprocessor. Customer may object to the appointment of such new Subprocessor within 15 days of the date of such notice on reasonable privacy or security grounds by providing General Translation written notice of its objection. In the event that Customer objects to General Translation’s appointment of a new Subprocessor, Customer and General Translation will work together in good faith to address any such objection.' },
      ],
    },
    {
      id: '4-assistance',
      heading: '4. Assistance',
      blocks: [
        { kind: 'h3', text: '4.1. Data Subject Rights' },
        { kind: 'p', text: 'General Translation will (a) promptly forward to Customer any request it receives from “data subjects” or “consumers” (as such terms are defined under applicable Data Protection Law) to exercise their rights under applicable Data Protection Law relating to Customer Personal Data, (b) advise such data subjects and consumers to submit such requests directly to Customer, and (c) provide Customer with reasonable assistance as necessary for Customer to fulfil its obligations under applicable Data Protection Laws to respond to such requests.' },
        { kind: 'h3', text: '4.2. Cooperation' },
        { kind: 'p', text: 'Taking into account the nature of the Processing, General Translation will provide Customer with reasonable assistance as necessary for Customer to fulfil its obligations under applicable Data Protection Laws, including to conduct data protection impact assessments and consultations with regulatory authorities. General Translation may charge Customer a reasonable fee for such assistance under this Section 4.2.' },
      ],
    },
    {
      id: '5-security',
      heading: '5. Security',
      blocks: [
        { kind: 'h3', text: '5.1. Security Measures' },
        { kind: 'p', text: 'General Translation has implemented and will maintain the Security Measures described on General Translation’s Trust Center at [**trust.generaltranslation.com**](https://trust.generaltranslation.com/). The Parties acknowledge that the Security Measures provide an appropriate level of security for the risks of the Processing of Customer Personal Data under the Agreement. General Translation may update or modify the Security Measures provided that such updates and modifications do not materially decrease the overall security of the Services.' },
        { kind: 'h3', text: '5.2. Security Incident' },
        { kind: 'p', text: 'General Translation will notify Customer without undue delay and in any case within 72 hours after becoming aware of any breach of the Security Measures that results in unauthorized access to, or disclosure or use of, Customer Personal Data (“**Security Incident**”). General Translation will assist Customer in complying with Customer’s obligations under applicable Data Protection Law by making reasonable efforts to provide Customer with information relating to the Security Incident. General Translation will also use reasonable efforts to investigate the Security Incident and mitigate the effects and remediate the causes of the Security Incident.' },
        { kind: 'h3', text: '5.3. Audit Reports and Certifications' },
        { kind: 'p', text: 'General Translation is audited against established industry standards such as SOC 2 Type II and ISO 27001. Upon Customer’s written request, General Translation will provide to Customer with General Translation’s audit reports or certifications, or other information reasonably necessary to demonstrate compliance with this DPA.' },
        { kind: 'h3', text: '5.4. Audits' },
        { kind: 'p', text: 'Upon Customer’s written request, no more than once every 12 months, General Translation will permit Customer to audit General Translation’s controls applicable to its Processing of Customer Personal Data and compliance with this DPA (“**Audit**”), provided that such Audit is conducted at Customer’s sole cost, during normal business hours, in a manner that causes minimal disruption, and in accordance with mutually agreed upon scope and terms.' },
      ],
    },
    {
      id: '6-international-data-transfers',
      heading: '6. International Data Transfers',
      blocks: [
        { kind: 'h3', text: '6.1. Data Transfers' },
        { kind: 'p', text: 'Customer authorizes General Translation to conduct transfers of Customer Personal Data to countries deemed to have an adequate level of data protection by the European Commission or the applicable competent regulatory authority on the basis of adequate safeguards in accordance with Data Protection Law or pursuant to (a) the contractual clauses annexed to the European Commission’s Implementing Decision 2021/914 of 4 June 2021 on standard contractual clauses for the transfer of Personal Data to third countries pursuant to Regulation (EU) 2016/679 of the European Parliament and of the Council, as amended, superseded, or replaced from time to time (“**EU SCCs**”) or (b) the International Data Transfer Addendum to the EU Commission Standard Contractual Clauses issued by the UK Information Commissioner, Version B1.0, in force 21 March 2022, as amended, superseded or replaced from time to time (“**UK Addendum**”).' },
        { kind: 'h3', text: '6.2. EU Data Transfers' },
        { kind: 'p', text: 'For transfers of Customer Personal Data from the European Union, General Translation and Customer conclude Module 2 (controller-to-processor) of the EU SCCs and, if Customer is a processor on behalf of a third-party controller, Module 3 (Processor-to-Subprocessor) of the EU SCCs, which are incorporated herein and completed as follows: (a) the “data exporter” is Customer; (b) the “data importer” is General Translation; (c) the optional docking clause in Clause 7 is implemented; (d) option 2 of Clause 9(a) is implemented and the time period therein is specified in Section 3.2; (e) the optional redress clause in Clause 11(a) is struck; (f) option 1 in Clause 17 is implemented; (g) the governing law is the law of Ireland and the courts in Clause 18(b) are the Courts of Dublin, Ireland; and (h) Annex I and Annex II to Module 2 and 3 of the EU SCCs are Schedule I to DPA and the Security Measures, respectively. For transfers of Customer Personal Data from Switzerland, any dispute arising from these EU SCCs relating to Swiss Data Protection Laws will be resolved by the courts of Switzerland and data subjects who have their habitual residence in Switzerland may bring claims under the EU SCCs before the courts of Switzerland.' },
        { kind: 'h3', text: '6.3. UK Data Transfers' },
        { kind: 'p', text: 'For transfers of Customer Personal Data from the United Kingdom, General Translation and Customer conclude the UK Addendum, which is incorporated herein and completed as follows: (a) in Table 1, the “Exporter” is Customer and the “Importer” is General Translation, their details are set forth in this DPA and the Agreement; (b) in Table 2, the first option is selected and the “Approved EU SCCs” are the EU SCCs referred to in Section 6.2; (c) in Table 3, Annexes 1 (A and B) and II to the “Approved EU SCCs” are Schedule I to DPA and the Security Measures, respectively; and (d) in Table 4, both the “Importer” and the “Exporter” can terminate the UK Addendum.' },
      ],
    },
    {
      id: '7-misc',
      heading: '7. Misc',
      blocks: [
        { kind: 'h3', text: '7.1. Limitation of Liability' },
        { kind: 'p', text: 'General Translation’s aggregate liability arising out of or related to this DPA, whether in contract, tort or under any other theory of liability, shall be subject to the “Limitations of Liability” section of the Agreement.' },
        { kind: 'h3', text: '7.2. Term' },
        { kind: 'p', text: 'The term of this DPA coincides with the term of the Agreement and terminates upon expiration or earlier termination of the Agreement.' },
      ],
    },
    {
      id: 'schedule-i-to-dpa',
      heading: 'Schedule I to DPA',
      blocks: [
        { kind: 'h3', text: 'Description of Processing' },
        { kind: 'h3', text: '1. List of Parties' },
        { kind: 'h4', text: 'Data exporter' },
        { kind: 'p', text: '**Name:** Customer.' },
        { kind: 'p', text: '**Activities relevant to the data transferred under these Clauses:** Customer receives the Services as described in the Agreement and General Translation provides Customer Personal Data to General Translation in that context.' },
        { kind: 'p', text: '**Role (controller/processor):** Controller.' },
        { kind: 'h4', text: 'Data importer' },
        { kind: 'p', text: '**Name:** General Translation.' },
        { kind: 'p', text: '**Activities relevant to the data transferred under these Clauses:** General Translation provides the Services to Customer as described in the Agreement and Processes Customer Personal Data on behalf of Customer in that context.' },
        { kind: 'p', text: '**Role (controller/processor):** Processor on behalf of Customer.' },
        { kind: 'h3', text: '2. Categories of Data Subjects' },
        { kind: 'p', text: 'Customer and Customer’s users.' },
        { kind: 'h3', text: '3. Categories of Personal Data Transferred' },
        { kind: 'p', text: 'Customer Personal Data, the content of which is determined and controlled by Customer.' },
        { kind: 'h3', text: '4. Sensitive Data Transferred (If Applicable)' },
        { kind: 'p', text: 'Sensitive data transferred (if applicable) and applied restrictions or safeguards that fully take into consideration the nature of the data and the risks involved, such as for instance strict purpose limitation, access restrictions (including access only for staff having followed specialized training), keeping a record of access to the data, restrictions for onward transfers or additional security measures: N/A' },
        { kind: 'h3', text: '5. Frequency of the Transfer' },
        { kind: 'p', text: 'The frequency of the International Data Transfer (e.g., whether the Personal Data is transferred on a one-off or continuous basis): On a continuous basis.' },
        { kind: 'h3', text: '6. Nature of the Processing' },
        { kind: 'p', text: 'The Customer Personal Data will be processed and transferred as described in the Agreement and DPA.' },
        { kind: 'h3', text: '7. Purposes of the International Data Transfer and Further Processing' },
        { kind: 'p', text: 'The Customer Personal Data will be transferred and further processed for the provision of the Services as described in the Agreement and DPA.' },
        { kind: 'h3', text: '8. Duration of Processing' },
        { kind: 'p', text: 'The period for which the Personal Data will be retained, or, if that is not possible, the criteria used to determine that period: Customer Personal Data will be retained for as long as necessary taking into account the purpose of the Processing, and in compliance with applicable laws, including laws on the statute of limitations and Data Protection Law.' },
        { kind: 'h3', text: '9. Sub-Processor Transfers' },
        { kind: 'p', text: 'For International Data Transfer to (Sub)Processors, also specify subject matter, nature, and duration of the Processing: For the subject matter and nature of the Processing, reference is made to the Agreement and DPA. The Processing will take place for the duration of the Agreement.' },
        { kind: 'h3', text: '10. Competent Supervisory Authority' },
        { kind: 'p', text: 'The competent authority for the Processing of Customer Personal Data relating to data subjects located in the EEA is the Supervisory Authority of Ireland.' },
        { kind: 'p', text: 'The competent authority for the Processing of Customer Personal Data relating to data subjects located in the UK is the UK Information Commissioner.' },
        { kind: 'p', text: 'The competent authority for the Processing of Customer Personal Data relating to data subjects located in Switzerland is the Swiss Federal Data Protection and Information Commissioner.' },
        { kind: 'h3', text: '11. Technical and Organizational Measures' },
        { kind: 'p', text: 'General Translation will implement security safeguards designed to protect the security, confidentiality and integrity of Personal Data as described on General Translation’s Trust Center at [**trust.generaltranslation.com**](https://trust.generaltranslation.com/).' },
      ],
    },
  ],
};

const PRIVACY_POLICY: LegalDoc = {
  route: 'privacy-policy',
  title: 'Privacy Policy',
  description: 'How General Translation collects, uses, and discloses personal data.',
  lastUpdated: '2026-07-17',
  preamble: [
    { kind: 'p', text: 'This privacy policy (“**Privacy Policy**”) describes the types of personal data that General Translation, Inc. (“**General Translation**,” “**we**,” “**our**,” and/or “**us**”) collects, uses, and discloses from individuals (“**you**” or “**your**”) who use our website at [**generaltranslation.com**](https://generaltranslation.com) along with our related websites, software-as-a-service AI-powered APIs and dashboard for localization, other downloadable applications, and other services provided by us (collectively, the “**Service**”). As used in this Privacy Policy, “personal data” means any information relating to an identified or identifiable individual.' },
    { kind: 'p', text: 'This Privacy Policy does not apply to the extent we process personal data in the role of a processor or service provider on behalf of our customers. In that context, our customers are the data controllers, and our processing of that personal data is governed by our applicable customer contracts, including any Data Processing Agreement entered into with that customer (“**DPA**”). In the event of a conflict between this Privacy Policy and the DPA, the terms of the DPA will control.' },
    { kind: 'p', text: 'You acknowledge the collection, use, disclosure, procedures, and other processing described in this Privacy Policy.' },
  ],
  sections: [
    {
      id: 'personal-data-we-collect',
      heading: 'Personal Data We Collect',
      blocks: [
        { kind: 'p', text: 'We may collect a variety of personal data from or about you or your devices from various sources, as described below. Where applicable, we indicate whether and why you must provide us with your personal data, as well as the consequences of failing to do so. If you do not provide your personal data when requested, you may not be able to use the full extent of the Service if that personal data is necessary to provide you with the Service or if we are legally required to collect it.' },
        { kind: 'h3', text: 'Personal Data You Provide to Us' },
        { kind: 'p', text: '**Account Information.** We collect the data you provide to create, update, or manage your account, including, for example, your name, professional title, company name, address, phone number, and email address.' },
        { kind: 'p', text: '**Service.** We collect the personal data you provide when you use the Service.' },
        { kind: 'p', text: '**Communications.** If you contact us directly, we may receive personal data about you, such as your name, email address, the contents of a message or attachments that you may send to us. When you sign up for news and updates, we will collect your email address and other personal data. When you communicate with us online, our third-party vendors may receive and store these communications on our behalf. When we send you emails, we may use embedded pixels or other technologies to track information about your receipt and interaction with our emails, such as whether and when you open them, whether you access any links included in our emails, how long you read our emails, whether you forward our emails and to whom, your Location Information (described below), and your Device Information (described below), to learn how to deliver a better user experience and improve the Service.' },
        { kind: 'p', text: '**Careers.** If you decide that you wish to apply for a job with us, you may submit your contact information and your resume online. We will collect the information you choose to provide on your resume, such as your education and employment experience.' },
        { kind: 'p', text: '**Payment Information.** If you make a payment to us, your payment-related information, such as credit card or other financial information, is collected by our third-party payment processor on our behalf.' },
        { kind: 'h3', text: 'Personal Data We Collect When You Use the Service' },
        { kind: 'p', text: '**Location Information.** We may collect and infer your general location information, including, for example, by collecting and using your internet protocol (IP) address.' },
        { kind: 'p', text: '**Device Information.** We may receive information about your device and software, including computer or mobile device’s operating system type and version, manufacturer and model, browser type, screen resolution, RAM and disk size, CPU usage, device type (e.g., phone, tablet), IP address, unique identifiers (including identifiers used for advertising purposes), language settings, mobile device carrier, and radio/network information (e.g., Wi-Fi, LTE, 3G).' },
        { kind: 'p', text: '**Usage Information.** We automatically receive information about your interactions with the Service, like pages or screens you viewed, how long you spent on a page or screen, the website you visited before browsing to the Service, navigation paths between pages or screens, information about your activity on a page or screen, and access times and duration of access.' },
        { kind: 'p', text: '**Outputs.** We will collect any information you choose to provide in your inputs, and this information may be reproduced in the outputs.' },
        { kind: 'p', text: '**Information from Cookies and Similar Technologies.** We and our third-party partners may collect information using cookies, beacons, invisible tags, and similar technologies (collectively “**Cookies**”) to provide functionality and to distinguish you from other users of our websites or products and services. For more information, please see our Cookie Policy (generaltranslation.com/legal/cookie-policy), which includes information on how to control or opt out of these Cookies.' },
        { kind: 'h3', text: 'Personal Data We Receive from Other Sources' },
        { kind: 'p', text: '**Information from Third-Party Services.** If you choose to link the Service to a third-party account, such as Google or GitHub, we may receive information about you, including your username, profile picture, and other information associated with your account on that third-party service that is made available to us based on your account settings on that service.If you wish to limit the information available to us, you should visit the privacy settings of your third-party accounts to learn about your options.' },
        { kind: 'p', text: '**Marketing Partners and Event Co-Sponsors.** We may collect information from our joint marketing partners and event co-sponsors.' },
        { kind: 'p', text: '**Information from Third-Party Sources.** We may collect publicly available information from third-party sites, such as government agencies, public records, and other publicly available sources. We also collect data from private sources, such as data providers, social media platforms, and data licensors.' },
      ],
    },
    {
      id: 'how-we-use-the-personal-data-we-collect',
      heading: 'How We Use the Personal Data We Collect',
      blocks: [
        { kind: 'p', text: 'We use the personal data we collect:' },
        {
          kind: 'list',
          items: [
            { paras: ['To provide, maintain, improve, debug, administer, and enhance the Service;'] },
            { paras: ['To understand your preferences and analyze how you use the Service and develop new products, services, features, and functionality;'] },
            { paras: ['To personalize your experience on the Service such as by providing tailored recommendations;'] },
            { paras: ['To communicate with you, provide you with relevant updates and other information, provide information that you request, respond to comments and questions, and otherwise provide customer support;'] },
            { paras: ['For marketing and advertising purposes, such as developing and providing promotional and advertising materials that may be relevant, valuable or otherwise of interest to you;'] },
            { paras: ['To facilitate the connection of third-party services or applications;'] },
            { paras: ['To generate anonymized or aggregated data containing only de-identified, non-personal data that we may use for any lawful purposes;'] },
            { paras: ['To facilitate the connection of third-party services or applications;'] },
            { paras: ['To facilitate transactions and payments;'] },
            { paras: ['To find and prevent fraud and abuse, resolve disputes, or respond to trust and safety issues that may arise;'] },
            { paras: ['For compliance purposes, including enforcing our contracts or other legal rights, or as may be required by applicable laws and regulations or requested by any judicial process or governmental agency; and'] },
            { paras: ['For other purposes for which we provide specific notice at the time the information is collected.'] },
          ],
        },
      ],
    },
    {
      id: 'legal-bases-for-processing-european-personal-data',
      heading: 'Legal Bases for Processing European Personal Data',
      blocks: [
        { kind: 'p', text: 'If you are located in the European Economic Area (“**EEA**”) or the United Kingdom (“**UK**”), we only process your personal data when we have a valid “legal basis,” including as set forth below.' },
        {
          kind: 'list',
          items: [
            { paras: ['**Consent.** We may process your personal data where you have consented to certain processing of your personal data.'] },
            { paras: ['**Contractual Necessity.** We may process your personal data where required to provide you with the Service. For example, we may need to process your personal data to respond to your inquiries or requests.'] },
            { paras: ['**Compliance with a Legal Obligation.** We may process your personal data where we have a legal obligation to do so. For example, we may process your personal data to comply with tax, labor and accounting obligations.'] },
            { paras: ['**Legitimate Interests.** We may process your personal data where we or a third party have a legitimate interest in processing your personal data. Specifically, we have a legitimate interest in using your personal data for internal analytics purposes, to understand how our members, customers and potential customers use our website, and otherwise to improve the safety, security, and performance of the Service. We only rely on our or a third party’s legitimate interests to process your personal data when these interests are not overridden by your rights and interests.'] },
          ],
        },
        { kind: 'p', text: 'We have set out below the legal bases we rely on in respect of the relevant purposes for which we use your personal data – for more information on these purposes and the data types involved, see the “How We Use the Personal Data We Collect” section above and the description of associated data disclosure relevant to such purposes set out in the “How We Disclose the Personal Data We Collect” section below.' },
        {
          kind: 'table',
          head: ['**Purpose**', '**Categories of personal data involved**', '**Legal basis**'],
          rows: [
            ['Service delivery and operations', 'Contact information<br />Demographic information<br />Account information<br />Communications information<br />Transactional information<br />Payment information<br />Device information', '**Contractual Necessity.**<br />**Legitimate Interests.** We have a legitimate interest in ensuring the ongoing security and proper operation of our Service, our business, and associated IT services, systems, and networks.'],
            ['Service personalization', 'Demographic information<br />Account information<br />Transactional information<br />Device information<br />Online activity information', '**Legitimate Interests.** We have a legitimate interest in providing you with a good service via the Service, which is personalized to you and that remembers your selections and preferences.<br />**Consent,** in respect of any optional processing relevant to personalization (including processing directly associated with any optional cookies used for this purpose).'],
            ['Research and development', 'Any and all data types relevant in the circumstances', '**Legitimate Interests.** We have a legitimate interest in taking steps to preserve our users’ privacy as we research how they use our Service.'],
            ['Direct marketing', 'Contact information<br />Demographic information<br />Account information<br />Transactional information<br />Marketing information<br />Communication interaction information', '**Legitimate Interests.** We have a legitimate interest in promoting our operations and goals as an organization and sending marketing communications for that purpose.<br />**Consent,** in circumstances or in jurisdictions where consent is required under applicable data protection laws to the sending of any given marketing communications.'],
            ['Service improvement and analytics', 'Contact information<br />Demographic information<br />Communications information<br />Account information', '**Legitimate Interests.** We have a legitimate interest in providing you with a good service and analyzing how you use it so that we can improve it over time, as well as developing and growing our business. For account holders, this includes product analytics and records of their use of the Service, as described in our Terms of Service.<br />**Consent,** in respect of any optional cookies used for this purpose by visitors who do not hold an account.'],
            ['Compliance and protection', 'Any and all data types relevant in the circumstances', '**Compliance with Law.**<br />**Legitimate Interests.** Where Compliance with Law is not applicable, we have a legitimate interest in participating in, supporting, and following legal processes and requests, including through cooperation with authorities. We may also have a legitimate interest in ensuring the protection, maintenance, and enforcement of our rights, property, and/or safety.'],
            ['To create aggregated, de-identified and/or anonymized data', 'Any and all data types relevant in the circumstances', '**Legitimate interest.** We have a legitimate interest in taking steps to preserve the privacy of our users.'],
            ['Further uses', 'Any and all data types relevant in the circumstances', 'The original legal basis relied upon, if the relevant further use is compatible with the initial purpose for which the personal data was collected.<br />**Consent,** if the relevant further use is not compatible with the initial purpose for which the personal data was collected.'],
          ],
        },
      ],
    },
    {
      id: 'how-we-disclose-the-personal-data-we-collect',
      heading: 'How We Disclose the Personal Data We Collect',
      blocks: [
        { kind: 'p', text: '**Partners and Affiliates.** We may disclose any information we receive to our current or future affiliates for any of the purposes described in this Privacy Policy.' },
        { kind: 'p', text: '**Vendors and Service Providers.** We may disclose any information we receive to vendors and service providers retained in connection with the Service.' },
        { kind: 'p', text: '**AI Service Providers.** We may disclose information we receive to vendors that provide artificial intelligence services in order to provide you with the Service.' },
        { kind: 'p', text: '**Linked third-party services.** If you log into the Service with, or otherwise link your Service account to, a third-party service, such as Google or GitHub, we may share your personal data with that third-party service. You understand and agree that the use of your information by any linked third-party services will be governed by the privacy policies of these third-party services. We encourage you to review their privacy policies.' },
        { kind: 'p', text: '**Analytics Partners.** We use analytics services to collect and process certain analytics data, including session replays of users\' interactions with our dashboard. These services may also collect information about your use of other websites, apps, and online resources.' },
        { kind: 'p', text: '**As Required By Law and Similar Disclosures.** We may access, preserve, and disclose your information if we believe doing so is required or appropriate to:' },
        {
          kind: 'list',
          items: [
            { paras: ['Comply with law enforcement requests and legal process, such as a court order or subpoena;'] },
            { paras: ['Respond to your requests;'] },
            { paras: ['Protect your, our, or others’ rights, property, or safety;'] },
            { paras: ['Protect against legal liability; or'] },
            { paras: ['Investigate fraud or other unlawful activity.'] },
          ],
        },
        { kind: 'p', text: 'For the avoidance of doubt, the disclosure of your information may occur if you post any objectionable content on or through with the Service.' },
        { kind: 'p', text: '**Merger, Sale, or Other Asset Transfers.** We may transfer your personal data to service providers, advisors, potential transactional partners, or other third parties in connection with the consideration, negotiation, or completion of a corporate transaction in which we are acquired by or merged with another company or we sell, liquidate, or transfer all or a portion of our assets.' },
        { kind: 'p', text: '**Consent.** We may also disclose your information with your permission.' },
      ],
    },
    {
      id: 'google-user-data',
      heading: 'Google User Data',
      blocks: [
        { kind: 'p', text: 'This section describes how General Translation accesses, uses, stores, and shares data obtained through Google APIs (“**Google user data**”) when you use our Google Workspace add-on for Google Docs and Google Slides or a connected Google Drive integration. This section supplements the rest of this Privacy Policy; in the event of a conflict regarding Google user data, this section and the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy) control.' },
        { kind: 'p', text: '**Data Access.** With your authorization, we access:' },
        {
          kind: 'list',
          items: [
            { paras: ['Your Google account identifier and email address, to authenticate you and connect the add-on to your General Translation account;'] },
            { paras: ['The content of the Google Docs or Google Slides file you choose to translate; and'] },
            { paras: ['For a connected Google Drive integration, the Google Drive files within that integration’s authorized scope (for example, files in a shared drive to which access has been granted).'] },
          ],
        },
        { kind: 'p', text: 'The add-on requests the narrowest scopes available for its function, including the “current document only” scopes, so it can access only the file you are actively working in rather than your other Drive files.' },
        { kind: 'p', text: '**Use.** We use Google user data solely to provide the translation features you request, including identifying the file, translating its content, and creating translated copies. We do not use Google user data for advertising, we do not sell it, and we do not use it to train generalized artificial intelligence or machine-learning models.' },
        { kind: 'p', text: '**Storage.** We process the content of your files to generate translations and write the translated copies back to your Google Drive. Credentials used to access Google Drive are stored in encrypted form. We retain Google user data only as long as reasonably necessary to provide the Service, as described in the “Retention” section below.' },
        { kind: 'p', text: '**Sharing.** We do not transfer Google user data to others except as necessary to provide the Service or as required by law.' },
        { kind: 'p', text: '**Human Access.** We do not allow humans to read your Google user data except:' },
        {
          kind: 'list',
          items: [
            { paras: ['With your consent;'] },
            { paras: ['Where necessary for security purposes or to debug an issue, with your consent;'] },
            { paras: ['To comply with applicable law; or'] },
            { paras: ['Where the data has been aggregated and anonymized.'] },
          ],
        },
        { kind: 'p', text: '**Limited Use.** General Translation’s use and transfer of information received from Google APIs to any other app will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.' },
      ],
    },
    {
      id: 'your-choices',
      heading: 'Your Choices',
      blocks: [
        { kind: 'p', text: '**Marketing Communications.** You can unsubscribe from our promotional emails via the link provided in the emails. Even if you opt out of receiving promotional messages from us, you will continue to receive administrative messages from us.' },
        { kind: 'p', text: '**Do Not Track.** There is no accepted standard on how to respond to “Do Not Track” signals, and we do not respond to such signals.' },
        { kind: 'p', text: '**Your European Privacy Rights.** If you are located in the EEA or the UK, you have additional rights described below.' },
        {
          kind: 'list',
          items: [
            { paras: ['You may request access to the personal data we maintain about you, update, and correct inaccuracies in your personal data, restrict or object to the processing of your personal data, have your personal data anonymized or deleted, as appropriate, request not to be subject to a decision based solely on automated processing including profiling, or exercise your right to data portability to easily transfer your personal data to another company. In addition, you have the right to lodge a complaint with a supervisory authority, including in your country of residence, place of work or where an incident took place.'] },
            { paras: ['You may withdraw any consent you previously provided to us regarding the processing of your personal data at any time and free of charge. We will apply your preferences going forward and this will not affect the lawfulness of the processing before you withdrew your consent.'] },
          ],
        },
        { kind: 'p', text: 'You may exercise these rights by contacting us using the contact details at the end of this Privacy Policy. Before fulfilling your request, we may ask you to provide reasonable information to verify your identity. Please note that there are exceptions and limitations to each of these rights, and that while any changes you make will be reflected in active user databases instantly or within a reasonable period of time, we may retain personal data for backups, archiving, prevention of fraud and abuse, analytics, satisfaction of legal obligations, or where we otherwise reasonably believe that we have a legitimate reason to do so.' },
        { kind: 'p', text: 'If you choose not to provide us with personal data we collect, some features of the Service may not work as intended.' },
      ],
    },
    {
      id: 'third-parties',
      heading: 'Third Parties',
      blocks: [
        { kind: 'p', text: 'The Service may contain links to other websites, products, or services that we do not own or operate or permit you to integrate with third-party services. We are not responsible for the privacy practices of these third parties. Please be aware that this Privacy Policy does not apply to your activities on these third-party services or any data you disclose to these third parties. We encourage you to read their privacy policies before providing any data to them.' },
      ],
    },
    {
      id: 'retention',
      heading: 'Retention',
      blocks: [
        { kind: 'p', text: 'We retain personal data about you for as long as reasonably necessary to provide you with the Service, or otherwise in support of our business or commercial purposes. When you request that we do so, we take measures to delete your personal data or keep it in a form that does not permit identifying you when this personal data is no longer reasonably necessary for the purposes for which we process it, unless we are required by law to keep this information for a longer period. When we process personal data for our own purposes, we determine the retention period taking into account various criteria, such as the type of products and services provided to you, the nature and length of our relationship with you, possible re-enrollment with products and services, the impact on the products and services we provide to you if we delete some personal data from or about you, and mandatory retention periods provided by law and the statute of limitations.' },
      ],
    },
    {
      id: 'security',
      heading: 'Security',
      blocks: [
        { kind: 'p', text: 'We make reasonable efforts to protect your data by using security measures designed to safeguard the data we maintain. However, because no electronic transmission or storage of data can be entirely secure, we can make no guarantees as to the security or privacy of your data.' },
      ],
    },
    {
      id: 'childrens-privacy',
      heading: 'Children’s Privacy',
      blocks: [
        { kind: 'p', text: 'We do not knowingly collect, maintain, or use personal data from children under 16 years of age, and no part of the Service is directed to children. If you learn that a child has provided us with personal data in violation of this Privacy Policy, then you may alert us at [**privacy@generaltranslation.com**](mailto:privacy@generaltranslation.com).' },
      ],
    },
    {
      id: 'international-visitors',
      heading: 'International Visitors',
      blocks: [
        { kind: 'p', text: 'The Service is hosted in the United States (“**U.S.**”). If you choose to use the Service from the EEA, the UK or other regions of the world with laws governing data collection and use that may differ from U.S. law, then please note that you are transferring your personal data outside of those regions to the U.S. for storage and processing. We may transfer personal data from the EEA or the UK to the U.S. and other third countries based on European Commission-approved or UK Government-approved Standard Contractual Clauses, with your consent, to perform a contract with you, or otherwise in accordance with applicable data protection laws. We may also transfer your data from the U.S. to other countries or regions in connection with storage and processing of data, fulfilling your requests, and operating the Service. For more information about the tools that we use to transfer personal data, or to obtain a copy of the contractual safeguards we use for such transfers (if applicable), you can contact us as described below.' },
      ],
    },
    {
      id: 'changes-to-this-privacy-policy',
      heading: 'Changes to this Privacy Policy',
      blocks: [
        { kind: 'p', text: 'We will post any adjustments to the Privacy Policy on this page, and the revised version will be effective when it is posted.' },
      ],
    },
    {
      id: 'contact-information',
      heading: 'Contact Information',
      blocks: [
        { kind: 'p', text: 'General Translation is the data controller and is responsible for the processing of your personal data. If you have any questions, comments, or concerns about our processing activities, please email us at [**privacy@generaltranslation.com**](mailto:privacy@generaltranslation.com) or write to us at:' },
        { kind: 'p', text: 'General Translation' },
        { kind: 'p', text: '44 Montgomery St, STE 830' },
        { kind: 'p', text: 'San Francisco, CA 94104' },
      ],
    },
  ],
};

const SUBPROCESSORS: LegalDoc = {
  route: 'subprocessors',
  title: 'Subprocessors',
  description: 'List of subprocessors used by General Translation to provide its services.',
  lastUpdated: '2026-06-23',
  preamble: [
    { kind: 'p', text: 'General Translation uses the following subprocessors to assist in providing its services. This list is maintained in accordance with our [Data Processing Agreement](./data-processing.md).' },
    {
      kind: 'table',
      head: ['Subprocessor', 'Purpose', 'Location', 'Link'],
      rows: [
        ['Amazon Web Services (AWS)', 'Cloud infrastructure and hosting', 'United States', '[aws.amazon.com](https://aws.amazon.com)'],
        ['Stripe', 'Payment processing', 'United States', '[stripe.com](https://stripe.com)'],
        ['Metronome', 'Usage-based billing', 'United States', '[metronome.com](https://metronome.com)'],
        ['Cloudflare', 'CDN and edge network', 'United States', '[cloudflare.com](https://cloudflare.com)'],
        ['Vercel', 'Application hosting', 'United States', '[vercel.com](https://vercel.com)'],
        ['Daytona', 'Development sandboxes', 'United States', '[daytona.io](https://daytona.io)'],
        ['Modal', 'Serverless compute infrastructure', 'United States', '[modal.com](https://modal.com)'],
        ['Sentry', 'Error monitoring', 'United States', '[sentry.io](https://sentry.io)'],
        ['PostHog', 'Product analytics', 'United States', '[posthog.com](https://posthog.com)'],
        ['Render', 'Application hosting', 'United States', '[render.com](https://render.com)'],
        ['Neon', 'Database hosting', 'United States', '[neon.tech](https://neon.tech)'],
        ['PlanetScale', 'Database hosting', 'United States', '[planetscale.com](https://planetscale.com)'],
        ['Temporal', 'Workflow orchestration', 'United States', '[temporal.io](https://temporal.io)'],
        ['Google Cloud', 'Cloud infrastructure and hosting', 'United States', '[cloud.google.com](https://cloud.google.com)'],
        ['GitHub', 'Source code hosting and version control', 'United States', '[github.com](https://github.com)'],
        ['OpenAI', 'AI model provider', 'United States', '[openai.com](https://openai.com)'],
        ['Anthropic', 'AI model provider', 'United States', '[anthropic.com](https://anthropic.com)'],
        ['xAI', 'AI model provider', 'United States', '[x.ai](https://x.ai)'],
      ],
    },
  ],
  sections: [
    {
      id: 'notification-of-changes',
      heading: 'Notification of Changes',
      blocks: [
        { kind: 'p', text: 'General Translation will provide reasonable advance notice prior to appointing any new subprocessor, as described in our [Data Processing Agreement](./data-processing.md). Customers may subscribe to updates by contacting [support@generaltranslation.com](mailto:support@generaltranslation.com).' },
      ],
    },
  ],
};

const TERMS: LegalDoc = {
  route: 'terms',
  title: 'Terms of Service',
  description: 'Terms governing use of General Translation services.',
  lastUpdated: '2026-07-31',
  preamble: [
    { kind: 'p', text: 'These Terms of Service (including the other documents incorporated by reference herein, these “**Terms**”) are between General Translation, Inc., a Delaware corporation (“**General Translation,**” “**we**,” “**our**”, or “**us**,”) and you and are effective as of the date upon which you accept these Terms (“**Effective Date**”). General Translation and you are each a “**Party**” and, together, the “**Parties**.” “**Customer**” or “**you**” means in the case of an individual accepting these terms on their own behalf, such individual, or in the case of an individual accepting these terms on behalf of a company or other legal entity, the company or other legal entity for which such individual is accepting this Agreement.' },
    { kind: 'p', text: 'BY ACCEPTING THESE TERMS, EITHER BY CLICKING A BOX INDICATING ACCEPTANCE, EXECUTING ANOTHER DOCUMENT THAT REFERENCES THESE TERMS, USING (OR MAKING ANY PAYMENT FOR) ANY SERVICES (DEFINED BELOW) OR OTHERWISE AFFIRMATIVELY INDICATING ACCEPTANCE OF THESE TERMS CUSTOMER AGREES TO THESE TERMS. THE INDIVIDUAL ACCEPTING THESE TERMS REPRESENTS THAT THEY HAVE THE AUTHORITY TO BIND CUSTOMER TO THESE TERMS. IF SUCH INDIVIDUAL DOES NOT HAVE SUCH AUTHORITY, OR CANNOT OR DOES NOT AGREE WITH THESE TERMS, SUCH INDIVIDUAL MUST NOT ACCEPT THESE TERMS AND MAY NOT USE ANY SERVICES.' },
  ],
  sections: [
    {
      id: '1-general-translation-platform',
      heading: '1. General Translation Platform',
      blocks: [
        { kind: 'h3', text: '1.1. Ordering and Services' },
        { kind: 'p', text: 'You may execute one or more ordering documents or online forms or otherwise make a purchase with us that references or is made under these Terms and that specify the specific Services ordered by you (each, an “**Order**”). Subject to the terms and conditions of these Terms and the applicable Order, we will (a) provide to you our software-as-a-service AI-powered APIs and dashboard for localization (the “**GT Platform**”), and (b) any other services specified in these Terms (collectively, (a) and (b) the “**Services**”).' },
        { kind: 'h3', text: '1.2. Users' },
        { kind: 'p', text: 'Only your employees or contractors acting in such capacity (“**Users**”), using the mechanisms designated by us (“**Login Credentials**”), may access and use the GT Platform. Each User must keep its Login Credentials confidential and not share them with anyone else. You are responsible for your Users’ compliance with these Terms and all actions taken through your Login Credentials (excluding misuse of the Login Credentials caused by our breach of these Terms). You will promptly notify us if you become aware of any compromise of any Login Credentials.' },
        { kind: 'h3', text: '1.3. GT Software; Open Source and Source Available' },
        { kind: 'p', text: '**1.3(a).** If we deliver software to you under these Terms that is not GT Open Source or GT Source Available (each as defined below), then during the applicable Order Term and subject to the terms of these Terms, we hereby grant you a non-exclusive and non-sublicensable license to install and use on servers that you own or otherwise control (“**Customer Systems**”) the software applications provided by us that are used to facilitate access and use of the GT Platform (collectively, “**GT Software**”; and, together with GT Platform, and other technology provided by or on behalf of us “**GT Technology**”). You and your Users are responsible for installing all updates, modifications, or bug fixes to the GT Software, GT Open Source, and GT Source Available (each as defined below) that we provide or make available.' },
        { kind: 'p', text: '**1.3(b).** Use of the GT Platform may require you to use certain software that we have made available and identified as either (i) open-source software pursuant to an open source software license (“**GT Open Source**”) or (ii) source-available software pursuant to a source-available software license (“**GT Source Available**”). The terms of the applicable license will apply to such software instead of the terms of these Terms.' },
        { kind: 'h3', text: '1.4. Restrictions' },
        { kind: 'p', text: 'You will not (and will not permit anyone else to), directly or indirectly, do any of the following: (a) provide access to, distribute, sell, or sublicense the GT Technology to a third party (other than Users as permitted herein); (b) use the GT Technology on behalf of, or to provide any product or service to, third parties; (c) access or use the GT Technology to develop a similar or competing product or service; (d) reverse engineer, decompile, disassemble, or seek to access the source code or non-public application programming interfaces to the GT Technology, except to the extent expressly permitted by Laws (and then only with prior notice to us); (e) modify or create derivative works of the GT Technology or copy any element of the GT Technology (other than authorized copies of the GT Software); (f) remove or obscure any proprietary notices in the GT Technology; (g) publish benchmarks or performance information about the GT Technology; (h) interfere with the operation of the GT Technology, circumvent any access restrictions, or conduct any security or vulnerability test of the GT Technology; (i) transmit any viruses or other harmful materials to the GT Technology; (j) take any action that risks harm to others or to the security, availability, or integrity of the GT Technology; or (k) access or use the GT Technology in a manner that (i) violates any applicable relevant local, state, federal and international laws, regulations and conventions, including those related to privacy or data transfer, international communications, or export of data (collectively, “**Laws**”) or (ii) is inconsistent with the limitations set forth in an Order (if any) and the then-current version of our Acceptable Use Policy (posted at generaltranslation.com/legal/acceptable-use) and standard technical documentation for the Services that we make generally available to our customers (“**Documentation**”).' },
        { kind: 'h3', text: '1.5. Unpaid Access' },
        { kind: 'p', text: 'Notwithstanding anything to the contrary in these Terms, to the extent that you are accessing or using the Service on an unpaid basis, then the following provisions will be of no force or effect: 10.2 and 13.1.' },
      ],
    },
    {
      id: '2-third-party-platforms',
      heading: '2. Third-Party Platforms',
      blocks: [
        { kind: 'p', text: 'The GT Technology may support integration with third-party platforms or services not provided by us (“**Third-Party Platforms**”), including Third-Party Platforms which the GT Platform accesses at your direction using your credentials. Access to and use of Third-Party Platforms is subject to your agreement with the relevant provider and not these Terms. We do not control and have no liability for Third-Party Platforms, including their security, functionality, operation, availability, or interoperability with the GT Technology or how the Third-Party Platforms or their providers collect, access, use, disclose, transfer, transmit, store, host, or otherwise process (“**Process**”) Your Data. By enabling a Third-Party Platform to interact with the GT Technology, you authorize us to access and exchange Your Data with such Third-Party Platform on your behalf and to take actions under your account for Third-Party Platforms. To the extent an integration with a Third-Party Platform requires that we use your access credentials for such Third-Party Platform, you: (a) agree to provide such credentials, (b) represent and warrant that you have all necessary rights to provide such credentials and that such use does not breach any agreement between you and the Third-Party Platform, and (c) authorize us to use such credentials on your behalf in connection with the provision of the GT Technology. You acknowledge and agree that certain Third-Party Platforms may block or prevent the GT Technology from accessing the Third-Party Platform and that we make no representations or warranties with respect to the continued availability of Third-Party Platforms.' },
      ],
    },
    {
      id: '3-data',
      heading: '3. Data',
      blocks: [
        { kind: 'h3', text: '3.1. Use of Your Data' },
        { kind: 'p', text: 'You hereby grant us a non-exclusive, worldwide, sublicensable right to use, copy, store, transmit, transfer, modify, create derivative works from and otherwise Process data, materials, and information that you (including your Users) input into or otherwise provide or make available to us through the GT Technology or otherwise in connection with the Services (including data transmitted to us by the GT Platform or accessed through a Third-Party Platform) (collectively, “**Your Data**”) to: (a) provide Services to you; and (b) Process and generate artificial intelligence outputs through the GT Platform (“**Outputs**”).' },
        { kind: 'h3', text: '3.2. Ownership of Outputs' },
        { kind: 'p', text: 'To the extent that the generation of Outputs by the GT Platform results in the generation of new intellectual property rights, we hereby assign to you title to such intellectual property rights. For clarity, and without limitation, the foregoing assignment does not include any intellectual property rights in or to GT Technology, GT Open Source, or GT Source Available, improvements or derivatives thereof, or intellectual property rights which GT came to own other than as a result of such generation of Outputs.' },
        { kind: 'h3', text: '3.3. Feedback and Usage Data' },
        { kind: 'p', text: 'To the extent you provide us with feedback (including suggestions and comments for enhancements or functionality) regarding the GT Technology, or our products, services, or other technology (collectively, “**Feedback**”), we have the full and unrestricted right to use and exploit the Feedback or to incorporate Feedback into any products, services, technology, or other materials. We may collect and use data and information regarding you and your Users\' access to and use of the Services, including data about feature usage, session activity, performance metrics, error logs, configurations, and interactions with the GT Technology (collectively, "**Usage Data**"). Usage Data may be collected through cookies and similar technologies; by registering for an account or using the Services, you agree to such collection and recording. We have the right to use Usage Data for any lawful business purpose, including to operate, maintain, improve, and enhance the GT Technology and Services, to develop new products and services, to generate aggregated or de-identified analytics and benchmarking data, monitor usage and perform billing, and to fulfill our obligations under these Terms. Usage Data does not include Your Data. We retain all right, title, and interest in and to Usage Data.' },
        { kind: 'h3', text: '3.4. Reservation of Rights' },
        { kind: 'p', text: 'Neither Party grants the other any rights or licenses not expressly set out in these Terms. Without limiting the foregoing, except for the limited licenses granted in these Terms, (a) you retain all of your rights in and to the Your Data and (b) we and our licensors retain all of their rights in and to the GT Technology, GT Open Source, GT Source Available, and Usage Data.' },
      ],
    },
    {
      id: '4-customer-obligations',
      heading: '4. Customer Obligations',
      blocks: [
        { kind: 'p', text: 'You will provide and maintain the hardware, software, and other technology and infrastructure that you use to access and use the GT Technology, including Customer Systems and the security and protection of such Customer Systems. You are responsible for Your Data, including its content and accuracy, and will comply with Laws when accessing and using the GT Technology. You represent and warrant that you have sufficient rights to grant the rights and licenses provided herein and that you have made all disclosures, provided all notices, and has obtained all rights, consents, and permissions necessary for us to Process Your Data and exercise the rights granted to it in these Terms without violating or infringing Laws, third-party rights, or terms or policies that apply to the Your Data.' },
      ],
    },
    {
      id: '5-suspension-of-service',
      heading: '5. Suspension of Service',
      blocks: [
        { kind: 'p', text: 'We may immediately suspend your access to any or all of the GT Technology if: (a) you breach Section 1.4 (Restrictions) or Section 4 (Customer Obligations); (b) any payments required under these Terms are overdue by 30 days or more; (c) changes to Laws or new Laws require that we suspend the GT Technology (or any part thereof) or otherwise may impose additional liability on us; or (d) your actions risk harm to any of our other customers or the security, availability, or integrity of the GT Technology. Where practicable, we will use reasonable efforts to provide you with prior notice of the suspension (email sufficing). If the issue that led to the suspension is resolved, we will restore your access to the GT Technology.' },
      ],
    },
    {
      id: '6-privacy-policy',
      heading: '6. Privacy Policy',
      blocks: [
        { kind: 'p', text: 'Please read our Privacy Policy at generaltranslation.com/legal/privacy-policy, which explains how we collect and use data that constitutes “personal data,” “personal information,” “personally identifiable information,” under applicable privacy and data protection law (“**Personal Data**”).' },
      ],
    },
    {
      id: '7-data-processing-agreement',
      heading: '7. Data Processing Agreement',
      blocks: [
        { kind: 'p', text: 'Our Privacy Policy does not apply to our Processing of Your Data that constitutes Personal Data in our role as a “processor” or “service provider” to you under privacy and data protection law in the provision of the Services (“**Customer Personal Data**”). We will Process Customer Personal Data in accordance with the Data Processing Agreement posted at generaltranslation.com/legal/data-processing which is incorporated by reference.' },
      ],
    },
    {
      id: '8-security',
      heading: '8. Security',
      blocks: [
        { kind: 'p', text: 'We have implemented and will maintain an information security program as described at the Trust Center at trust.generaltranslation.com that includes reasonable and appropriate security measures designed to protect Your Data from unauthorized access, destruction, use, modification or disclosure (“**Security Measures**”). We will also conduct third-party audits of our Security Measures against established industry standards.' },
      ],
    },
    {
      id: '9-fees-and-taxes',
      heading: '9. Fees and Taxes',
      blocks: [
        { kind: 'h3', text: '9.1. Fees' },
        { kind: 'p', text: 'You will pay the fees selected in each Order (“**Fees**"). All Fees will be paid in U.S. dollars unless otherwise provided in an Order. Fees are invoiced as described in the Order. Orders may specify certain usage limitations and pricing tiers. Any usage or provision of Services in excess of the amounts or tiers specified in any Order will be charged at our then-current rates. Unless otherwise set forth in an Order, we may increase the Fees for any Order Renewal Term by providing written notice at least 30 days in advance of the first date of the applicable Order Renewal Term.' },
        { kind: 'h3', text: '9.2. Payment and Taxes' },
        { kind: 'p', text: 'Except as may be set forth in the applicable subscription plan, you will pay us (a) all Fees in advance of each billing cycle (monthly or annual, as selected by you at sign-up), and (b) all other Fees not due upfront, monthly within 30 days after the end of the month in which the Fees were accrued. Unless the Order provides otherwise, all Fees are due within 30 days of the invoice date. Late payments are subject to a service charge of 1.5% per month or the maximum amount allowed by Laws, whichever is less. All Fees are non-refundable except as may be set out in Section 10.2(a) and Section 13.4. You are responsible for any sales, use, GST, value-added, withholding, or similar taxes or levies that apply to your purchases hereunder, whether domestic or foreign, other than our income tax (“**Taxes**”). Fees are exclusive of all Taxes.' },
      ],
    },
    {
      id: '10-warranties-and-disclaimers',
      heading: '10. Warranties and Disclaimers',
      blocks: [
        { kind: 'h3', text: '10.1. Mutual Warranties' },
        { kind: 'p', text: 'Each Party represents, warrants, and covenants to the other Party that: (a) it is duly organized, validly existing, and in good standing in the jurisdiction of its incorporation; (b) the execution and delivery of these Terms by such Party and the transactions contemplated hereby have been duly and validly authorized by all necessary action on the part of such Party; (c) these Terms constitutes a valid and binding obligation of such Party that is enforceable in accordance with its terms; and (d) the entering into and performance of these Terms by such Party does not and will not violate, conflict with, or result in a material default under any other agreement or obligation by which such Party is or may become subject or bound.' },
        { kind: 'h3', text: '10.2. General Translation Warranty' },
        { kind: 'h4', text: '10.2(a). Performance Warranty' },
        { kind: 'p', text: 'We warrant to you that, during the Term the GT Technology will perform as described in the Documentation in all material respects (the “**Performance Warranty**”). If we breach the Performance Warranty and you, within 30 days of discovering the breach of the Performance Warranty, submits to us a written warranty claim identifying in reasonable detail the nature of the breach, then we will use reasonable efforts to correct the breach and cause the Performance Warranty to be satisfied. If we cannot do so within 30 days after receipt of a warranty claim that satisfies the requirements of the immediately foregoing sentence, (i) we will then refund to you any pre-paid, unused Fees for the terminated portion of the Term and (ii) you may terminate these Terms. This Section sets forth your exclusive remedy and our entire liability for breach of the Performance Warranty. Failure to install any updates will void the Performance Warranty.' },
        { kind: 'h4', text: '10.2(b). Exceptions' },
        { kind: 'p', text: 'Notwithstanding anything to the contrary, the representations and warranties set forth in Section 10.2(a) do not apply to: (i) issues caused by Your Data; (ii) issues caused by Your or Users’ misuse of or unauthorized modifications to the applicable Services or GT Software; (iii) issues in or caused by Third-Party Platforms or other third-party systems (including Customer Systems); (iv) use of the applicable Services or GT Software other than in accordance with the Documentation; (v) failure to obtain or maintain any integration with a Third-Party Platform.' },
        { kind: 'h3', text: '10.3. Disclaimers' },
        { kind: 'h4', text: '10.3(a). General' },
        { kind: 'p', text: 'EXCEPT AS EXPRESSLY PROVIDED IN SECTIONS 10.1 AND 10.2(a), THE GT TECHNOLOGY, ANY OUTPUT GENERATED FROM THE GT TECHNOLOGY AND ALL OTHER SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” WE, ON ITS OWN BEHALF AND ON BEHALF OF ITS SUPPLIERS AND LICENSORS, MAKE NO OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NONINFRINGEMENT. WE DO NOT WARRANT THAT YOU ACCESS TO OR USE OF THE GT TECHNOLOGY, ANY OUTPUT FROM THE GT TECHNOLOGY, OR RESULTS OF THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE OR THAT IT WILL REVIEW YOUR DATA (INCLUDING CONFIGURATIONS) FOR ACCURACY OR SUITABILITY. WE ARE NOT LIABLE FOR DELAYS, FAILURES, OR PROBLEMS INHERENT IN USE OF THE INTERNET, ELECTRONIC COMMUNICATIONS, OR OTHER SYSTEMS OUTSIDE OUR CONTROL, INCLUDING THIRD-PARTY PLATFORMS AND CUSTOMER SYSTEMS. YOU MAY HAVE OTHER STATUTORY RIGHTS, BUT ANY STATUTORILY REQUIRED WARRANTIES WILL BE LIMITED TO THE SHORTEST LEGALLY PERMITTED PERIOD.' },
        { kind: 'h4', text: '10.3(b). Artificial Intelligence' },
        { kind: 'p', text: 'WITHOUT LIMITING THE DISCLAIMERS SET FORTH IN SECTION 10.3(a), YOU ACKNOWLEDGE AND AGREE THAT: (I) THE GT TECHNOLOGY AND OUTPUT ARE NOT PROFESSIONAL ADVICE, INCLUDING LEGAL, DATA SECURITY, OR OTHERWISE, AND YOU WILL NOT RELY ON THE GT TECHNOLOGY OR OUTPUT AS A SUBSTITUTE FOR PROFESSIONAL ADVICE OR A SUBSTITUTE FOR YOUR OWN VERIFICATION OF THE ACTIONS PERFORMED BY GT TECHNOLOGY; (II) THE GT TECHNOLOGY RELIES ON ARTIFICIAL INTELLIGENCE TECHNOLOGY TO OPERATE AND MAY PRODUCE INACCURATE OR ERRONEOUS OUTPUT; (III) YOU ARE RESPONSIBLE FOR INDEPENDENTLY EVALUATING OUTPUT AND ANY OTHER INFORMATION YOU RECEIVE FROM THE GT TECHNOLOGY AND DETERMINING WHAT ACTIONS TO TAKE OR REFRAIN FROM TAKING; AND (IV) YOU ARE SOLELY RESPONSIBLE FOR SETTING ANY PARAMETERS AND GUIDELINES FOR AGENTIC ASPECTS OF THE GT TECHNOLOGY AND FOR ASSURING THAT ANY ACTIONS TAKEN ARE CONSISTENT WITH YOUR INTENT. WE ARE NOT LIABLE FOR YOUR USE OF ANY OUTPUT OR FOR YOUR BUSINESS PRACTICES WITH RESPECT TO ANY OUTPUT (INCLUDING ANY REMEDIATION OR OTHER ACTIONS TAKEN BASED ON REPORTS). GT TECHNOLOGY MAY CONTAIN FUNCTIONALITY PROVIDING FOR HUMAN OVERSIGHT AND CONFIRMATION OF ANY AGENTIC ACTIONS. YOU DISABLE ANY SUCH OVERSIGHT AND CONFIRMATION FUNCTIONALITY AT YOUR OWN RISK.' },
      ],
    },
    {
      id: '11-term-and-termination',
      heading: '11. Term and Termination',
      blocks: [
        { kind: 'h3', text: '11.1. Term and Order Term' },
        { kind: 'p', text: 'The term of these Terms starts on the Effective Date and continues until termination in accordance with its terms (“**Term**”). Unless earlier terminated in accordance with these Terms or the applicable Order, each Order (a) will continue for the initial term specified in such Order (“**Initial Order Term**”) and (b) will automatically renew for successive terms equal in length to the Initial Order Term (each a “**Order Renewal Term**”), unless either Party provides written notice of non-renewal to the other Party at least 30 days (or such other period specified in the Order) prior to the end of the Initial Order Term or next Order Renewal Term (as applicable). The Initial Order Term and each Order Renewal Term are, collectively, the “**Order Term**” of the applicable Order.' },
        { kind: 'h3', text: '11.2. Termination' },
        { kind: 'p', text: 'Either Party may terminate these Terms (including any or all Orders) if the other Party: (a) fails to cure a material breach of these Terms (including a failure to pay Fees) within 30 days after notice; (b) ceases operation without a successor; or (c) seeks protection under a bankruptcy, receivership, trust deed, creditors’ arrangement, composition, or comparable proceeding, or if such a proceeding is instituted against that Party and not dismissed within 60 days. Without limiting the foregoing, either Party may also terminate these Terms at any time upon written notice to the other Party if no Orders are then in effect. The termination of an Order will not terminate these Terms or any other Order, but the termination of these Terms will immediately terminate all Orders unless otherwise agreed to by the Parties in writing.' },
        { kind: 'h3', text: '11.3. Effect of Termination' },
        { kind: 'p', text: 'Upon expiration or termination of a specific Order or these Terms, your access to and our obligations to provide the applicable terminated Services described will cease and you will promptly pay to us all unpaid Fees or other amounts that have accrued pursuant to any terminated Orders prior to the effective date of its expiration or termination. In addition, upon termination of these Terms, each Party will promptly return or delete Confidential Information of the other Party.' },
        { kind: 'h3', text: '11.4. Survival' },
        { kind: 'p', text: 'These Sections survive expiration or termination of these Terms: 1.4; 1.5; 3; 9; 11.3; 11.4; and 12 through 16. Except where an exclusive remedy is provided in these Terms, exercising a remedy under these Terms, including termination, does not limit other remedies a Party may have.' },
      ],
    },
    {
      id: '12-limitations-of-liability',
      heading: '12. Limitations of Liability',
      blocks: [
        { kind: 'h3', text: '12.1. Consequential Damages Waiver' },
        { kind: 'p', text: 'EXCEPT FOR LIABILITY ARISING FROM EXCLUDED CLAIMS (DEFINED BELOW), NEITHER PARTY (NOR ITS SUPPLIERS OR LICENSORS) WILL HAVE ANY LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS FOR ANY LOSS OF USE, LOST DATA, LOST PROFITS, FAILURE OF SECURITY MECHANISMS, INTERRUPTION OF BUSINESS, OR ANY INDIRECT, SPECIAL, INCIDENTAL, RELIANCE, OR CONSEQUENTIAL DAMAGES OF ANY KIND, EVEN IF INFORMED OF THEIR POSSIBILITY IN ADVANCE.' },
        { kind: 'h3', text: '12.2. Liability Cap' },
        { kind: 'p', text: 'EXCEPT FOR LIABILITY ARISING FROM EXCLUDED CLAIMS, EACH PARTY’S (AND ITS SUPPLIERS’ AND LICENSORS’) ENTIRE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS WILL NOT EXCEED IN AGGREGATE THE AMOUNTS PAID OR PAYABLE BY YOU TO US PURSUANT TO THESE TERMS DURING THE 12 MONTHS PRIOR TO THE DATE ON WHICH THE APPLICABLE CLAIM GIVING RISE TO THE LIABILITY AROSE UNDER THESE TERMS.' },
        { kind: 'h3', text: '12.3. Excluded Claims' },
        { kind: 'p', text: '“**Excluded Claims**” means: (a) your breach of Sections 1.4 or 4; (b) either Party’s breach of Section 14; and (c) amounts payable to third parties under the indemnifying Party’s obligations in Section 13.' },
        { kind: 'h3', text: '12.4. Nature of Claims and Failure of Essential Purpose' },
        { kind: 'p', text: 'The waivers and limitations in this Section 12 apply regardless of the form of action, whether in contract, tort (including negligence), strict liability or otherwise and will survive and apply even if any limited remedy in these Terms fails of its essential purpose.' },
      ],
    },
    {
      id: '13-indemnification',
      heading: '13. Indemnification',
      blocks: [
        { kind: 'h3', text: '13.1. Indemnification by General Translation' },
        { kind: 'p', text: 'We will either defend you from or settle any claim, proceeding, or suit (“**Claim**”) brought by a third party against you alleging that the GT Technology, when used by you in accordance with these Terms, infringes or misappropriates a third party’s patent, copyright, trademark, or trade secret, and we will indemnify and hold you harmless against any expenses, liabilities, damages and costs of any kind (including attorneys’ fees) resulting from any such Claim.' },
        { kind: 'h3', text: '13.2. Indemnification by Customer' },
        { kind: 'p', text: 'You will, at our request, defend us from or settle any Claim brought by a third party against us: (a) alleging facts that, if true, would result in your breach of Section 4 or (b) alleging that Your Data, when used by us in accordance with these Terms, infringe or misappropriate a third party’s intellectual property or proprietary right, and you will indemnify and hold us harmless against any expenses, liabilities, damages and costs of any kind (including attorneys’ fees) resulting from any such Claim.' },
        { kind: 'h3', text: '13.3. Procedures' },
        { kind: 'p', text: 'The indemnifying Party’s obligations in this Section 13 are subject to it receiving: (a) prompt written notice of the Claim (provided that failure to provide such notice promptly will not relieve the indemnifying Party of its obligations unless such failure materially prejudices the indemnifying Party); (b) the exclusive right to control and direct the investigation, defense, and settlement of the Claim, provided the indemnified Party may participate in the defense or settlement of any indemnifiable Claim hereunder at its expense with counsel of its choosing; and (c) all reasonably necessary cooperation of the indemnified Party, at the indemnifying Party’s expense for reasonable out-of-pocket costs. The indemnifying Party may not settle any Claim without the indemnified Party’s prior consent if settlement would require the indemnified Party to take or refrain from taking any action (other than relating to use of the GT Technology, when we are the indemnifying Party).' },
        { kind: 'h3', text: '13.4. Mitigation' },
        { kind: 'p', text: 'In response to an actual or potential Claim relating to infringement, misappropriation, or violation of intellectual property rights, if required by settlement or injunction or as we determine is necessary to avoid material liability, we may at our option: (a) procure rights for your continued use of the applicable GT Technology; (b) replace or modify the allegedly infringing portion of the applicable GT Technology to avoid infringement or misappropriation without reducing such overall functionality of such GT Technology; or (c) terminate these Terms and refund to you any pre-paid, unused Fees for the terminated portion of the Term.' },
        { kind: 'h3', text: '13.5. Exceptions' },
        { kind: 'p', text: 'Our obligations in this Section 13 do not apply: (a) to infringement or misappropriation resulting from your modification of the GT Technology or use of the GT Technology in combination with items not provided by us (including Third-Party Platforms, Customer Systems, or Your Data); (b) to unauthorized access to or use of the GT Technology; or (c) if you settle or makes any admissions about a Claim without our prior consent.' },
        { kind: 'h3', text: '13.6. Exclusive Remedy' },
        { kind: 'p', text: 'THIS SECTION 13 SETS OUT YOUR EXCLUSIVE REMEDY AND OUR ENTIRE LIABILITY REGARDING INFRINGEMENT OR MISAPPROPRIATION OF THIRD-PARTY INTELLECTUAL PROPERTY RIGHTS WITH RESPECT TO THE SERVICES AND THESE TERMS.' },
      ],
    },
    {
      id: '14-confidentiality',
      heading: '14. Confidentiality',
      blocks: [
        { kind: 'h3', text: '14.1. Definition' },
        { kind: 'p', text: '“**Confidential Information**” means information disclosed to the receiving Party (“**Recipient**”) under these Terms that is designated by the disclosing Party (“**Discloser**”) as proprietary or confidential or that should be reasonably understood to be proprietary or confidential due to its nature and the circumstances of its disclosure. Our Confidential Information includes the terms and conditions of these Terms and the GT Technology (including any technical or performance information about the GT Technology).' },
        { kind: 'h3', text: '14.2. Obligations' },
        { kind: 'p', text: 'As Recipient, each Party will: (a) not disclose Discloser’s Confidential Information and will implement reasonable measures to prevent its disclosure to third parties except as permitted in these Terms, including Section 3.1; and (b) only use Confidential Information to fulfill its obligations and exercise its rights in these Terms. At Discloser’s request, Recipient will delete all Confidential Information, except, in the case where we are the Recipient, we may retain your Confidential Information to the extent required to continue to provide the GT Technology as contemplated by these Terms. Recipient may disclose Confidential Information to its employees, agents, contractors, and other representatives having a legitimate need to know (including, for us, the subcontractors referenced in Section 16.8) (collectively, “**Representatives**”), provided Recipient remains responsible for their compliance with this Section 14 and such Representatives are bound by written agreements (or, in the case of professional advisers like attorneys and accountants, ethical duties) imposing confidentiality and non-use obligations no less protective than this Section 14.' },
        { kind: 'h3', text: '14.3. Exclusions' },
        { kind: 'p', text: 'These confidentiality obligations do not apply to information that Recipient can document: (a) is or becomes public knowledge through no fault of the Recipient or its Representatives; (b) it rightfully knew or possessed prior to receipt under these Terms; (c) it rightfully received from a third party without breach of confidentiality obligations; or (d) it independently developed without using or referencing Confidential Information.' },
        { kind: 'h3', text: '14.4. Remedies' },
        { kind: 'p', text: 'Unauthorized use or disclosure of Confidential Information may cause substantial harm for which damages alone are an insufficient remedy. Discloser may seek appropriate equitable relief, in addition to other available remedies, for breach or threatened breach of this Section 14, without necessity of posting a bond or proving actual damages.' },
        { kind: 'h3', text: '14.5. Required Disclosures' },
        { kind: 'p', text: 'Nothing in these Terms prohibits Recipient from making disclosures of Confidential Information if required by Laws, subpoena, court order, or stock exchange rule, provided (if permitted by Laws) it notifies Discloser in advance and reasonably cooperates in any effort to obtain confidential treatment.' },
      ],
    },
    {
      id: '15-publicity',
      heading: '15. Publicity',
      blocks: [
        { kind: 'p', text: 'Nothing in these Terms grants either Party the right to use the name, brand, or logo of the other Party, and neither Party may publicly announce that the Parties have entered into these Terms, except with the other Party’s prior consent or as required by Laws. However, we may use your (or your parent company’s) name, brand, or logo for the purpose of identifying you as a licensee or customer on our website or in other promotional materials, or as part of a list of our customers in a press release or other public relations materials announcing your use of the GT Technology. We will cease further use at your written request.' },
      ],
    },
    {
      id: '16-general-terms',
      heading: '16. General Terms',
      blocks: [
        { kind: 'h3', text: '16.1. Assignment' },
        { kind: 'p', text: 'Neither Party may assign these Terms without the prior consent of the other Party, except that either Party may assign these Terms without the other Party’s consent in connection with a merger, reorganization, acquisition, or other transfer of all or substantially all its voting securities or assets to which these Terms relates to the other party involved in such transaction. Any non-permitted assignment is void. These Terms will bind and inure to the benefit of each Party’s permitted successors and assigns.' },
        { kind: 'h3', text: '16.2. Governing Law, Jurisdiction and Venue' },
        { kind: 'p', text: 'These Terms is governed by the laws of the State of California and the United States without regard to conflicts of laws provisions that would result in the application of the laws of another jurisdiction and without regard to the United Nations Convention on the International Sale of Goods. The jurisdiction and venue for actions related to these Terms will be the state and United States federal courts having jurisdiction over San Francisco, California, and both Parties submit to the personal jurisdiction of those courts.' },
        { kind: 'h3', text: '16.3. Notices' },
        { kind: 'p', text: 'Except as set out in these Terms, any notice or consent under these Terms must be in writing and sent to 44 Montgomery Street, San Francisco, CA 94104 in the case of notice to us, or the address that you share during registration in the case of notice to you, and will be deemed given: (a) upon receipt if by personal delivery; (b) upon receipt if by certified or registered U.S. mail (return receipt requested); (c) one day after dispatch if by a commercial overnight delivery service; or (d) upon the earlier of the receipt of a confirmation email or one day after sending if by email. Either Party may update its address with notice to the other Party pursuant to this Section. We may also send operational notices to you by email or through the GT Technology.' },
        { kind: 'h3', text: '16.4. Entire Agreement' },
        { kind: 'p', text: 'These Terms (which include all Orders) are the Parties’ entire agreement regarding its subject matter and supersedes any prior or contemporaneous agreements regarding its subject matter. In these Terms, headings are for convenience only and “including” and similar terms are to be construed without limitation. These Terms may be executed in counterparts (including electronic copies and PDFs), each of which is deemed an original and which together form one and the same agreement.' },
        { kind: 'h3', text: '16.5. Amendments' },
        { kind: 'p', text: 'Any amendments, modifications, or supplements to these Terms must be in writing and signed by each Party’s authorized representatives or, as appropriate, agreed through electronic means provided by us.' },
        { kind: 'h3', text: '16.6. Waivers and Severability' },
        { kind: 'p', text: 'Waivers must be signed by the waiving Party’s authorized representative and cannot be implied from conduct. If any provision of these Terms is held invalid, illegal, or unenforceable, such invalidity will not affect the remainder of these Terms, and the invalid, illegal, or unenforceable provision will be replaced by a valid provision that has as near as possible an effect to that of the invalid, illegal, or unenforceable provision as is reasonably practicable without such replacement provision risking similar invalidity, illegality, or unenforceability.' },
        { kind: 'h3', text: '16.7. Force Majeure' },
        { kind: 'p', text: 'Neither Party is liable for any delay or failure to perform any obligation under these Terms (except for a failure to pay Fees) due to events beyond its reasonable control, such as a strike, blockade, war, pandemic, act of terrorism, riot, Internet or utility failures, electrical failures, telephone communication system failures, change in Laws, refusal of government license, or natural disaster.' },
        { kind: 'h3', text: '16.8. Subcontractors' },
        { kind: 'p', text: 'We may use subcontractors and permit them to exercise our rights, but we remain responsible for their compliance with these Terms and for our overall performance under these Terms.' },
        { kind: 'h3', text: '16.9. Independent Contractors' },
        { kind: 'p', text: 'The Parties are independent contractors, not agents, partners, or joint venturers.' },
        { kind: 'h3', text: '16.10. Export' },
        { kind: 'p', text: 'You will comply with all relevant U.S. and foreign export and import Laws in using the GT Technology. You: (a) represent and warrant that you are not listed on any U.S. government list of prohibited or restricted parties or located in (or a national of) a country that is subject to a U.S. government embargo or that has been designated by the U.S. government as a “terrorist supporting” country; (b) agree not to access or use the GT Technology in violation of any U.S. export embargo, prohibition, or restriction; and (c) will not submit to the GT Technology any information controlled under the U.S. International Traffic in Arms Regulations.' },
        { kind: 'h3', text: '16.11. Government End-Users' },
        { kind: 'p', text: 'Elements of the GT Technology are commercial computer software. If you or any of your Users is an agency, department, or other entity of the United States Government, the use, duplication, reproduction, release, modification, disclosure, or transfer of the GT Technology or any related documentation of any kind, including technical data and manuals, is restricted by the terms of these Terms in accordance with Federal Acquisition Regulation 12.212 for civilian purposes and Defense Federal Acquisition Regulation Supplement 227.7202 for military purposes. The GT Technology was developed fully at private expense. All other use is prohibited.' },
        { kind: 'h3', text: '16.12. Conflicts in Interpretation' },
        { kind: 'p', text: 'Inconsistencies or conflicts between the terms of these Terms will be resolved with respect to such inconsistency or conflict in the following descending order of precedence: (a) the terms contained in the body of these Terms; (b) the terms of an Order (unless the Parties expressly state the provision of these Terms to be amended by the Order, in which case the Order will control with respect to such conflict); and (c) the Documentation.' },
      ],
    },
  ],
};

/* getAllLegalDocuments() sorts the library by title; same order here. */
export const LEGAL_DOCS: readonly LegalDoc[] = [
  ACCEPTABLE_USE,
  COOKIE_POLICY,
  CREDIT_TERMS,
  DATA_PROCESSING,
  PRIVACY_POLICY,
  SUBPROCESSORS,
  TERMS,
];

export function getLegalDoc(route: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.route === route);
}

/**
 * lib/legal.ts's normalizeLegalDocumentHref, plus this concept's base. The
 * submodule cross-links between documents as `./data-processing.md`; the live
 * site drops the `.md` and lets the browser resolve the rest against
 * /<locale>/legal/<route>. Here the document lives at
 * /d/<concept>/legal/<route>, so a relative sibling link is rewritten to that
 * absolute path instead — anything already absolute, anchored or schemed is
 * untouched.
 */
export function normalizeLegalHref(href: string, base: string): string {
  if (
    href.startsWith('/') ||
    href.startsWith('#') ||
    /^[a-z][a-z\d+.-]*:/i.test(href)
  ) {
    return href;
  }

  const route = href.replace(/^\.\//, '').replace(/\.md(?=([?#]|$))/, '');
  return `${base}/legal/${route}`;
}
