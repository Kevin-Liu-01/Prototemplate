/**
 * The real legal library, vendored. The live site reads Markdown from the
 * generaltranslation/legal submodule (apps/landing/legal/en-US/*.md) through
 * apps/landing/src/lib/legal.ts and renders it with next-mdx-remote; neither
 * the submodule nor the MDX pipeline exists here, so the documents are carried
 * over as a typed block tree instead.
 *
 * What is faithful:
 *   - route, title, description and lastUpdated are the files' own frontmatter
 *     and H1, untouched (lastUpdated stays the ISO `last_updated` string and is
 *     formatted at render time, the way lib/legal.ts formats it);
 *   - every `##` heading of each vendored document is present, in order, with
 *     the id rehype-slug would mint for it — so the aside's table of contents
 *     lists the document's true section structure;
 *   - all prose is the source text. Nothing is reworded or invented.
 *
 * What is trimmed: whole subsections, paragraphs, list items and table rows are
 * DROPPED, and a few long paragraphs stop early at a sentence or clause
 * boundary. This is a design study of the page, not a copy of the contract —
 * the live documents at generaltranslation.com/legal remain the real thing.
 *
 * Vendored here: terms, privacy-policy, acceptable-use, cookie-policy. The
 * remaining three documents in the submodule (data-processing, subprocessors,
 * credit-terms) are not carried over.
 */

/** One item of a list; `sub` carries the lettered sub-clauses the AUP uses. */
export type LegalListItem = { text: string; sub?: readonly string[] };

/**
 * A block of document body. `text` accepts the three inline marks the source
 * Markdown actually uses: `**bold**`, `` `code` `` and `[label](href)`.
 */
export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'list'; ordered?: boolean; items: readonly LegalListItem[] }
  | { kind: 'table'; head: readonly string[]; rows: readonly (readonly string[])[] };

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
  const [year, month, day] = iso.split('-').map(Number);
  return LEGAL_DATE.format(new Date(Date.UTC(year, month - 1, day)));
}

const TERMS: LegalDoc = {
  route: 'terms',
  title: 'Terms of Service',
  description: 'Terms governing use of General Translation services.',
  lastUpdated: '2026-07-31',
  preamble: [
    {
      kind: 'p',
      text: 'These Terms of Service (including the other documents incorporated by reference herein, these “**Terms**”) are between General Translation, Inc., a Delaware corporation (“**General Translation,**” “**we**,” “**our**”, or “**us**,”) and you and are effective as of the date upon which you accept these Terms (“**Effective Date**”). General Translation and you are each a “**Party**” and, together, the “**Parties**.”',
    },
    {
      kind: 'p',
      text: 'BY ACCEPTING THESE TERMS, EITHER BY CLICKING A BOX INDICATING ACCEPTANCE, EXECUTING ANOTHER DOCUMENT THAT REFERENCES THESE TERMS, USING (OR MAKING ANY PAYMENT FOR) ANY SERVICES (DEFINED BELOW) OR OTHERWISE AFFIRMATIVELY INDICATING ACCEPTANCE OF THESE TERMS CUSTOMER AGREES TO THESE TERMS. THE INDIVIDUAL ACCEPTING THESE TERMS REPRESENTS THAT THEY HAVE THE AUTHORITY TO BIND CUSTOMER TO THESE TERMS.',
    },
  ],
  sections: [
    {
      id: '1-general-translation-platform',
      heading: '1. General Translation Platform',
      blocks: [
        { kind: 'h3', text: '1.1. Ordering and Services' },
        {
          kind: 'p',
          text: 'You may execute one or more ordering documents or online forms or otherwise make a purchase with us that references or is made under these Terms and that specify the specific Services ordered by you (each, an “**Order**”). Subject to the terms and conditions of these Terms and the applicable Order, we will (a) provide to you our software-as-a-service AI-powered APIs and dashboard for localization (the “**GT Platform**”), and (b) any other services specified in these Terms (collectively, (a) and (b) the “**Services**”).',
        },
        { kind: 'h3', text: '1.2. Users' },
        {
          kind: 'p',
          text: 'Only your employees or contractors acting in such capacity (“**Users**”), using the mechanisms designated by us (“**Login Credentials**”), may access and use the GT Platform. Each User must keep its Login Credentials confidential and not share them with anyone else. You are responsible for your Users’ compliance with these Terms and all actions taken through your Login Credentials.',
        },
        { kind: 'h3', text: '1.4. Restrictions' },
        {
          kind: 'p',
          text: 'You will not (and will not permit anyone else to), directly or indirectly, do any of the following: (a) provide access to, distribute, sell, or sublicense the GT Technology to a third party (other than Users as permitted herein); (b) use the GT Technology on behalf of, or to provide any product or service to, third parties; (c) access or use the GT Technology to develop a similar or competing product or service; (d) reverse engineer, decompile, disassemble, or seek to access the source code or non-public application programming interfaces to the GT Technology, except to the extent expressly permitted by Laws; (e) modify or create derivative works of the GT Technology or copy any element of the GT Technology; (f) remove or obscure any proprietary notices in the GT Technology.',
        },
      ],
    },
    {
      id: '2-third-party-platforms',
      heading: '2. Third-Party Platforms',
      blocks: [
        {
          kind: 'p',
          text: 'The GT Technology may support integration with third-party platforms or services not provided by us (“**Third-Party Platforms**”), including Third-Party Platforms which the GT Platform accesses at your direction using your credentials. Access to and use of Third-Party Platforms is subject to your agreement with the relevant provider and not these Terms. We do not control and have no liability for Third-Party Platforms, including their security, functionality, operation, availability, or interoperability with the GT Technology or how the Third-Party Platforms or their providers collect, access, use, disclose, transfer, transmit, store, host, or otherwise process (“**Process**”) Your Data.',
        },
      ],
    },
    {
      id: '3-data',
      heading: '3. Data',
      blocks: [
        { kind: 'h3', text: '3.1. Use of Your Data' },
        {
          kind: 'p',
          text: 'You hereby grant us a non-exclusive, worldwide, sublicensable right to use, copy, store, transmit, transfer, modify, create derivative works from and otherwise Process data, materials, and information that you (including your Users) input into or otherwise provide or make available to us through the GT Technology or otherwise in connection with the Services (collectively, “**Your Data**”) to: (a) provide Services to you; and (b) Process and generate artificial intelligence outputs through the GT Platform (“**Outputs**”).',
        },
        { kind: 'h3', text: '3.2. Ownership of Outputs' },
        {
          kind: 'p',
          text: 'To the extent that the generation of Outputs by the GT Platform results in the generation of new intellectual property rights, we hereby assign to you title to such intellectual property rights.',
        },
        { kind: 'h3', text: '3.4. Reservation of Rights' },
        {
          kind: 'p',
          text: 'Neither Party grants the other any rights or licenses not expressly set out in these Terms. Without limiting the foregoing, except for the limited licenses granted in these Terms, (a) you retain all of your rights in and to the Your Data and (b) we and our licensors retain all of their rights in and to the GT Technology, GT Open Source, GT Source Available, and Usage Data.',
        },
      ],
    },
    {
      id: '4-customer-obligations',
      heading: '4. Customer Obligations',
      blocks: [
        {
          kind: 'p',
          text: 'You will provide and maintain the hardware, software, and other technology and infrastructure that you use to access and use the GT Technology, including Customer Systems and the security and protection of such Customer Systems. You are responsible for Your Data, including its content and accuracy, and will comply with Laws when accessing and using the GT Technology.',
        },
      ],
    },
    {
      id: '5-suspension-of-service',
      heading: '5. Suspension of Service',
      blocks: [
        {
          kind: 'p',
          text: 'We may immediately suspend your access to any or all of the GT Technology if: (a) you breach Section 1.4 (Restrictions) or Section 4 (Customer Obligations); (b) any payments required under these Terms are overdue by 30 days or more; (c) changes to Laws or new Laws require that we suspend the GT Technology (or any part thereof); or (d) your actions risk harm to any of our other customers or the security, availability, or integrity of the GT Technology. If the issue that led to the suspension is resolved, we will restore your access to the GT Technology.',
        },
      ],
    },
    {
      id: '6-privacy-policy',
      heading: '6. Privacy Policy',
      blocks: [
        {
          kind: 'p',
          text: 'Please read our Privacy Policy at generaltranslation.com/legal/privacy-policy, which explains how we collect and use data that constitutes “personal data,” “personal information,” “personally identifiable information,” under applicable privacy and data protection law (“**Personal Data**”).',
        },
      ],
    },
    {
      id: '7-data-processing-agreement',
      heading: '7. Data Processing Agreement',
      blocks: [
        {
          kind: 'p',
          text: 'Our Privacy Policy does not apply to our Processing of Your Data that constitutes Personal Data in our role as a “processor” or “service provider” to you under privacy and data protection law in the provision of the Services (“**Customer Personal Data**”). We will Process Customer Personal Data in accordance with the Data Processing Agreement posted at generaltranslation.com/legal/data-processing which is incorporated by reference.',
        },
      ],
    },
    {
      id: '8-security',
      heading: '8. Security',
      blocks: [
        {
          kind: 'p',
          text: 'We have implemented and will maintain an information security program as described at the Trust Center at trust.generaltranslation.com that includes reasonable and appropriate security measures designed to protect Your Data from unauthorized access, destruction, use, modification or disclosure (“**Security Measures**”). We will also conduct third-party audits of our Security Measures against established industry standards.',
        },
      ],
    },
    {
      id: '9-fees-and-taxes',
      heading: '9. Fees and Taxes',
      blocks: [
        { kind: 'h3', text: '9.1. Fees' },
        {
          kind: 'p',
          text: 'You will pay the fees selected in each Order (“**Fees**"). All Fees will be paid in U.S. dollars unless otherwise provided in an Order. Fees are invoiced as described in the Order. Orders may specify certain usage limitations and pricing tiers. Any usage or provision of Services in excess of the amounts or tiers specified in any Order will be charged at our then-current rates.',
        },
        { kind: 'h3', text: '9.2. Payment and Taxes' },
        {
          kind: 'p',
          text: 'Except as may be set forth in the applicable subscription plan, you will pay us (a) all Fees in advance of each billing cycle (monthly or annual, as selected by you at sign-up), and (b) all other Fees not due upfront, monthly within 30 days after the end of the month in which the Fees were accrued. Unless the Order provides otherwise, all Fees are due within 30 days of the invoice date. Late payments are subject to a service charge of 1.5% per month or the maximum amount allowed by Laws, whichever is less.',
        },
      ],
    },
    {
      id: '10-warranties-and-disclaimers',
      heading: '10. Warranties and Disclaimers',
      blocks: [
        { kind: 'h3', text: '10.1. Mutual Warranties' },
        {
          kind: 'p',
          text: 'Each Party represents, warrants, and covenants to the other Party that: (a) it is duly organized, validly existing, and in good standing in the jurisdiction of its incorporation; (b) the execution and delivery of these Terms by such Party and the transactions contemplated hereby have been duly and validly authorized by all necessary action on the part of such Party; (c) these Terms constitutes a valid and binding obligation of such Party that is enforceable in accordance with its terms.',
        },
        { kind: 'h3', text: '10.3. Disclaimers' },
        {
          kind: 'p',
          text: 'EXCEPT AS EXPRESSLY PROVIDED IN SECTIONS 10.1 AND 10.2(a), THE GT TECHNOLOGY, ANY OUTPUT GENERATED FROM THE GT TECHNOLOGY AND ALL OTHER SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” WE, ON ITS OWN BEHALF AND ON BEHALF OF ITS SUPPLIERS AND LICENSORS, MAKE NO OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NONINFRINGEMENT.',
        },
      ],
    },
    {
      id: '11-term-and-termination',
      heading: '11. Term and Termination',
      blocks: [
        { kind: 'h3', text: '11.1. Term and Order Term' },
        {
          kind: 'p',
          text: 'The term of these Terms starts on the Effective Date and continues until termination in accordance with its terms (“**Term**”). Unless earlier terminated in accordance with these Terms or the applicable Order, each Order (a) will continue for the initial term specified in such Order (“**Initial Order Term**”) and (b) will automatically renew for successive terms equal in length to the Initial Order Term (each a “**Order Renewal Term**”), unless either Party provides written notice of non-renewal to the other Party at least 30 days prior to the end of the Initial Order Term or next Order Renewal Term.',
        },
        { kind: 'h3', text: '11.4. Survival' },
        {
          kind: 'p',
          text: 'These Sections survive expiration or termination of these Terms: 1.4; 1.5; 3; 9; 11.3; 11.4; and 12 through 16. Except where an exclusive remedy is provided in these Terms, exercising a remedy under these Terms, including termination, does not limit other remedies a Party may have.',
        },
      ],
    },
    {
      id: '12-limitations-of-liability',
      heading: '12. Limitations of Liability',
      blocks: [
        { kind: 'h3', text: '12.1. Consequential Damages Waiver' },
        {
          kind: 'p',
          text: 'EXCEPT FOR LIABILITY ARISING FROM EXCLUDED CLAIMS (DEFINED BELOW), NEITHER PARTY (NOR ITS SUPPLIERS OR LICENSORS) WILL HAVE ANY LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS FOR ANY LOSS OF USE, LOST DATA, LOST PROFITS, FAILURE OF SECURITY MECHANISMS, INTERRUPTION OF BUSINESS, OR ANY INDIRECT, SPECIAL, INCIDENTAL, RELIANCE, OR CONSEQUENTIAL DAMAGES OF ANY KIND, EVEN IF INFORMED OF THEIR POSSIBILITY IN ADVANCE.',
        },
        { kind: 'h3', text: '12.2. Liability Cap' },
        {
          kind: 'p',
          text: 'EXCEPT FOR LIABILITY ARISING FROM EXCLUDED CLAIMS, EACH PARTY’S (AND ITS SUPPLIERS’ AND LICENSORS’) ENTIRE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS WILL NOT EXCEED IN AGGREGATE THE AMOUNTS PAID OR PAYABLE BY YOU TO US PURSUANT TO THESE TERMS DURING THE 12 MONTHS PRIOR TO THE DATE ON WHICH THE APPLICABLE CLAIM GIVING RISE TO THE LIABILITY AROSE UNDER THESE TERMS.',
        },
      ],
    },
    {
      id: '13-indemnification',
      heading: '13. Indemnification',
      blocks: [
        { kind: 'h3', text: '13.1. Indemnification by General Translation' },
        {
          kind: 'p',
          text: 'We will either defend you from or settle any claim, proceeding, or suit (“**Claim**”) brought by a third party against you alleging that the GT Technology, when used by you in accordance with these Terms, infringes or misappropriates a third party’s patent, copyright, trademark, or trade secret, and we will indemnify and hold you harmless against any expenses, liabilities, damages and costs of any kind (including attorneys’ fees) resulting from any such Claim.',
        },
        { kind: 'h3', text: '13.6. Exclusive Remedy' },
        {
          kind: 'p',
          text: 'THIS SECTION 13 SETS OUT YOUR EXCLUSIVE REMEDY AND OUR ENTIRE LIABILITY REGARDING INFRINGEMENT OR MISAPPROPRIATION OF THIRD-PARTY INTELLECTUAL PROPERTY RIGHTS WITH RESPECT TO THE SERVICES AND THESE TERMS.',
        },
      ],
    },
    {
      id: '14-confidentiality',
      heading: '14. Confidentiality',
      blocks: [
        { kind: 'h3', text: '14.1. Definition' },
        {
          kind: 'p',
          text: '“**Confidential Information**” means information disclosed to the receiving Party (“**Recipient**”) under these Terms that is designated by the disclosing Party (“**Discloser**”) as proprietary or confidential or that should be reasonably understood to be proprietary or confidential due to its nature and the circumstances of its disclosure. Our Confidential Information includes the terms and conditions of these Terms and the GT Technology.',
        },
        { kind: 'h3', text: '14.3. Exclusions' },
        {
          kind: 'p',
          text: 'These confidentiality obligations do not apply to information that Recipient can document: (a) is or becomes public knowledge through no fault of the Recipient or its Representatives; (b) it rightfully knew or possessed prior to receipt under these Terms; (c) it rightfully received from a third party without breach of confidentiality obligations; or (d) it independently developed without using or referencing Confidential Information.',
        },
      ],
    },
    {
      id: '15-publicity',
      heading: '15. Publicity',
      blocks: [
        {
          kind: 'p',
          text: 'Nothing in these Terms grants either Party the right to use the name, brand, or logo of the other Party, and neither Party may publicly announce that the Parties have entered into these Terms, except with the other Party’s prior consent or as required by Laws. However, we may use your (or your parent company’s) name, brand, or logo for the purpose of identifying you as a licensee or customer on our website or in other promotional materials. We will cease further use at your written request.',
        },
      ],
    },
    {
      id: '16-general-terms',
      heading: '16. General Terms',
      blocks: [
        { kind: 'h3', text: '16.2. Governing Law, Jurisdiction and Venue' },
        {
          kind: 'p',
          text: 'These Terms is governed by the laws of the State of California and the United States without regard to conflicts of laws provisions that would result in the application of the laws of another jurisdiction and without regard to the United Nations Convention on the International Sale of Goods. The jurisdiction and venue for actions related to these Terms will be the state and United States federal courts having jurisdiction over San Francisco, California, and both Parties submit to the personal jurisdiction of those courts.',
        },
        { kind: 'h3', text: '16.4. Entire Agreement' },
        {
          kind: 'p',
          text: 'These Terms (which include all Orders) are the Parties’ entire agreement regarding its subject matter and supersedes any prior or contemporaneous agreements regarding its subject matter. In these Terms, headings are for convenience only and “including” and similar terms are to be construed without limitation.',
        },
        { kind: 'h3', text: '16.9. Independent Contractors' },
        {
          kind: 'p',
          text: 'The Parties are independent contractors, not agents, partners, or joint venturers.',
        },
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
    {
      kind: 'p',
      text: 'This privacy policy (“**Privacy Policy**”) describes the types of personal data that General Translation, Inc. (“**General Translation**,” “**we**,” “**our**,” and/or “**us**”) collects, uses, and discloses from individuals (“**you**” or “**your**”) who use our website at [**generaltranslation.com**](https://generaltranslation.com) along with our related websites, software-as-a-service AI-powered APIs and dashboard for localization, other downloadable applications, and other services provided by us (collectively, the “**Service**”). As used in this Privacy Policy, “personal data” means any information relating to an identified or identifiable individual.',
    },
    {
      kind: 'p',
      text: 'This Privacy Policy does not apply to the extent we process personal data in the role of a processor or service provider on behalf of our customers. In that context, our customers are the data controllers, and our processing of that personal data is governed by our applicable customer contracts, including any Data Processing Agreement entered into with that customer (“**DPA**”).',
    },
  ],
  sections: [
    {
      id: 'personal-data-we-collect',
      heading: 'Personal Data We Collect',
      blocks: [
        {
          kind: 'p',
          text: 'We may collect a variety of personal data from or about you or your devices from various sources, as described below. Where applicable, we indicate whether and why you must provide us with your personal data, as well as the consequences of failing to do so.',
        },
        { kind: 'h3', text: 'Personal Data You Provide to Us' },
        {
          kind: 'p',
          text: '**Account Information.** We collect the data you provide to create, update, or manage your account, including, for example, your name, professional title, company name, address, phone number, and email address.',
        },
        {
          kind: 'p',
          text: '**Communications.** If you contact us directly, we may receive personal data about you, such as your name, email address, the contents of a message or attachments that you may send to us. When you sign up for news and updates, we will collect your email address and other personal data.',
        },
        {
          kind: 'p',
          text: '**Payment Information.** If you make a payment to us, your payment-related information, such as credit card or other financial information, is collected by our third-party payment processor on our behalf.',
        },
        { kind: 'h3', text: 'Personal Data We Collect When You Use the Service' },
        {
          kind: 'p',
          text: '**Location Information.** We may collect and infer your general location information, including, for example, by collecting and using your internet protocol (IP) address.',
        },
        {
          kind: 'p',
          text: '**Usage Information.** We automatically receive information about your interactions with the Service, like pages or screens you viewed, how long you spent on a page or screen, the website you visited before browsing to the Service, navigation paths between pages or screens, information about your activity on a page or screen, and access times and duration of access.',
        },
        {
          kind: 'p',
          text: '**Outputs.** We will collect any information you choose to provide in your inputs, and this information may be reproduced in the outputs.',
        },
        { kind: 'h3', text: 'Personal Data We Receive from Other Sources' },
        {
          kind: 'p',
          text: '**Information from Third-Party Services.** If you choose to link the Service to a third-party account, such as Google or GitHub, we may receive information about you, including your username, profile picture, and other information associated with your account on that third-party service that is made available to us based on your account settings on that service.',
        },
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
            { text: 'To provide, maintain, improve, debug, administer, and enhance the Service;' },
            {
              text: 'To understand your preferences and analyze how you use the Service and develop new products, services, features, and functionality;',
            },
            {
              text: 'To communicate with you, provide you with relevant updates and other information, provide information that you request, respond to comments and questions, and otherwise provide customer support;',
            },
            {
              text: 'To generate anonymized or aggregated data containing only de-identified, non-personal data that we may use for any lawful purposes;',
            },
            {
              text: 'To find and prevent fraud and abuse, resolve disputes, or respond to trust and safety issues that may arise;',
            },
            {
              text: 'For other purposes for which we provide specific notice at the time the information is collected.',
            },
          ],
        },
      ],
    },
    {
      id: 'legal-bases-for-processing-european-personal-data',
      heading: 'Legal Bases for Processing European Personal Data',
      blocks: [
        {
          kind: 'p',
          text: 'If you are located in the European Economic Area (“**EEA**”) or the United Kingdom (“**UK**”), we only process your personal data when we have a valid “legal basis,” including as set forth below.',
        },
        {
          kind: 'list',
          items: [
            {
              text: '**Consent.** We may process your personal data where you have consented to certain processing of your personal data.',
            },
            {
              text: '**Contractual Necessity.** We may process your personal data where required to provide you with the Service. For example, we may need to process your personal data to respond to your inquiries or requests.',
            },
            {
              text: '**Compliance with a Legal Obligation.** We may process your personal data where we have a legal obligation to do so. For example, we may process your personal data to comply with tax, labor and accounting obligations.',
            },
            {
              text: '**Legitimate Interests.** We may process your personal data where we or a third party have a legitimate interest in processing your personal data. We only rely on our or a third party’s legitimate interests to process your personal data when these interests are not overridden by your rights and interests.',
            },
          ],
        },
        {
          kind: 'table',
          head: ['Purpose', 'Categories of personal data involved', 'Legal basis'],
          rows: [
            [
              'Research and development',
              'Any and all data types relevant in the circumstances',
              '**Legitimate Interests.** We have a legitimate interest in taking steps to preserve our users’ privacy as we research how they use our Service.',
            ],
            [
              'To create aggregated, de-identified and/or anonymized data',
              'Any and all data types relevant in the circumstances',
              '**Legitimate interest.** We have a legitimate interest in taking steps to preserve the privacy of our users.',
            ],
            [
              'Further uses',
              'Any and all data types relevant in the circumstances',
              'The original legal basis relied upon, if the relevant further use is compatible with the initial purpose for which the personal data was collected.',
            ],
          ],
        },
      ],
    },
    {
      id: 'how-we-disclose-the-personal-data-we-collect',
      heading: 'How We Disclose the Personal Data We Collect',
      blocks: [
        {
          kind: 'p',
          text: '**Partners and Affiliates.** We may disclose any information we receive to our current or future affiliates for any of the purposes described in this Privacy Policy.',
        },
        {
          kind: 'p',
          text: '**Vendors and Service Providers.** We may disclose any information we receive to vendors and service providers retained in connection with the Service.',
        },
        {
          kind: 'p',
          text: '**AI Service Providers.** We may disclose information we receive to vendors that provide artificial intelligence services in order to provide you with the Service.',
        },
        {
          kind: 'p',
          text: '**Analytics Partners.** We use analytics services to collect and process certain analytics data, including session replays of users’ interactions with our dashboard. These services may also collect information about your use of other websites, apps, and online resources.',
        },
        {
          kind: 'p',
          text: '**As Required By Law and Similar Disclosures.** We may access, preserve, and disclose your information if we believe doing so is required or appropriate to:',
        },
        {
          kind: 'list',
          items: [
            { text: 'Comply with law enforcement requests and legal process, such as a court order or subpoena;' },
            { text: 'Respond to your requests;' },
            { text: 'Protect your, our, or others’ rights, property, or safety;' },
            { text: 'Protect against legal liability; or' },
            { text: 'Investigate fraud or other unlawful activity.' },
          ],
        },
      ],
    },
    {
      id: 'google-user-data',
      heading: 'Google User Data',
      blocks: [
        {
          kind: 'p',
          text: 'This section describes how General Translation accesses, uses, stores, and shares data obtained through Google APIs (“**Google user data**”) when you use our Google Workspace add-on for Google Docs and Google Slides or a connected Google Drive integration. This section supplements the rest of this Privacy Policy; in the event of a conflict regarding Google user data, this section and the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy) control.',
        },
        { kind: 'p', text: '**Data Access.** With your authorization, we access:' },
        {
          kind: 'list',
          items: [
            {
              text: 'Your Google account identifier and email address, to authenticate you and connect the add-on to your General Translation account;',
            },
            { text: 'The content of the Google Docs or Google Slides file you choose to translate; and' },
            {
              text: 'For a connected Google Drive integration, the Google Drive files within that integration’s authorized scope.',
            },
          ],
        },
        {
          kind: 'p',
          text: '**Use.** We use Google user data solely to provide the translation features you request, including identifying the file, translating its content, and creating translated copies. We do not use Google user data for advertising, we do not sell it, and we do not use it to train generalized artificial intelligence or machine-learning models.',
        },
        {
          kind: 'p',
          text: '**Storage.** We process the content of your files to generate translations and write the translated copies back to your Google Drive. Credentials used to access Google Drive are stored in encrypted form.',
        },
      ],
    },
    {
      id: 'your-choices',
      heading: 'Your Choices',
      blocks: [
        {
          kind: 'p',
          text: '**Marketing Communications.** You can unsubscribe from our promotional emails via the link provided in the emails. Even if you opt out of receiving promotional messages from us, you will continue to receive administrative messages from us.',
        },
        {
          kind: 'p',
          text: '**Do Not Track.** There is no accepted standard on how to respond to “Do Not Track” signals, and we do not respond to such signals.',
        },
        {
          kind: 'p',
          text: '**Your European Privacy Rights.** If you are located in the EEA or the UK, you have additional rights described below.',
        },
        {
          kind: 'list',
          items: [
            {
              text: 'You may request access to the personal data we maintain about you, update, and correct inaccuracies in your personal data, restrict or object to the processing of your personal data, have your personal data anonymized or deleted, as appropriate, or exercise your right to data portability to easily transfer your personal data to another company.',
            },
            {
              text: 'You may withdraw any consent you previously provided to us regarding the processing of your personal data at any time and free of charge.',
            },
          ],
        },
      ],
    },
    {
      id: 'third-parties',
      heading: 'Third Parties',
      blocks: [
        {
          kind: 'p',
          text: 'The Service may contain links to other websites, products, or services that we do not own or operate or permit you to integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any data to them.',
        },
      ],
    },
    {
      id: 'retention',
      heading: 'Retention',
      blocks: [
        {
          kind: 'p',
          text: 'We retain personal data about you for as long as reasonably necessary to provide you with the Service, or otherwise in support of our business or commercial purposes. When you request that we do so, we take measures to delete your personal data or keep it in a form that does not permit identifying you when this personal data is no longer reasonably necessary for the purposes for which we process it, unless we are required by law to keep this information for a longer period.',
        },
      ],
    },
    {
      id: 'security',
      heading: 'Security',
      blocks: [
        {
          kind: 'p',
          text: 'We make reasonable efforts to protect your data by using security measures designed to safeguard the data we maintain. However, because no electronic transmission or storage of data can be entirely secure, we can make no guarantees as to the security or privacy of your data.',
        },
      ],
    },
    {
      id: 'childrens-privacy',
      heading: 'Children’s Privacy',
      blocks: [
        {
          kind: 'p',
          text: 'We do not knowingly collect, maintain, or use personal data from children under 16 years of age, and no part of the Service is directed to children. If you learn that a child has provided us with personal data in violation of this Privacy Policy, then you may alert us at [**privacy@generaltranslation.com**](mailto:privacy@generaltranslation.com).',
        },
      ],
    },
    {
      id: 'international-visitors',
      heading: 'International Visitors',
      blocks: [
        {
          kind: 'p',
          text: 'The Service is hosted in the United States (“**U.S.**”). If you choose to use the Service from the EEA, the UK or other regions of the world with laws governing data collection and use that may differ from U.S. law, then please note that you are transferring your personal data outside of those regions to the U.S. for storage and processing. We may transfer personal data from the EEA or the UK to the U.S. and other third countries based on European Commission-approved or UK Government-approved Standard Contractual Clauses.',
        },
      ],
    },
    {
      id: 'changes-to-this-privacy-policy',
      heading: 'Changes to this Privacy Policy',
      blocks: [
        {
          kind: 'p',
          text: 'We will post any adjustments to the Privacy Policy on this page, and the revised version will be effective when it is posted.',
        },
      ],
    },
    {
      id: 'contact-information',
      heading: 'Contact Information',
      blocks: [
        {
          kind: 'p',
          text: 'General Translation is the data controller and is responsible for the processing of your personal data. If you have any questions, comments, or concerns about our processing activities, please email us at [**privacy@generaltranslation.com**](mailto:privacy@generaltranslation.com) or write to us at:',
        },
        { kind: 'p', text: 'General Translation' },
        { kind: 'p', text: '44 Montgomery St, STE 830' },
        { kind: 'p', text: 'San Francisco, CA 94104' },
      ],
    },
  ],
};

/* The AUP is the one document in the library with no `##` headings — it is a
   preamble, five numbered rules and a closing note. Carried over as written,
   which means its page renders with no table of contents. */
const ACCEPTABLE_USE: LegalDoc = {
  route: 'acceptable-use',
  title: 'Acceptable Use Policy',
  description: 'Acceptable use guidelines for General Translation’s services.',
  lastUpdated: '2026-05-09',
  preamble: [
    {
      kind: 'p',
      text: 'This Acceptable Use Policy (**AUP**) contains rules that apply to the use of any products, services, or offerings of General Translation, Inc. (**General Translation**, **us**, **we**, or **our**) (such products, services, or offerings, the **Services**) by you or your users (collectively, **you**). Your use of the Services must comply with this AUP. This AUP is not exhaustive and may be updated by General Translation at any time by posting a revised version on its website.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        {
          text: '**Safety and Security.** You will not use the Services in any manner that endangers yourself or others, including without limitation:',
          sub: [
            'to incite, facilitate, promote, support, or celebrate violence of any kind, including sexual violence, terrorism, or hate-based violence;',
            'to investigate, promote, support or aid suicide or other self-harm;',
            'to abuse or exploit children, including by facilitating minor grooming, trafficking, sextortion, or abuse or distributing, promoting, or celebrating material that depicts child sexual abuse (including AI-generated material)',
          ],
        },
        {
          text: '**Privacy and Respect.** You will not upload, store, post, or transmit content that:',
          sub: [
            'Is obscene, defamatory, deceptive, harassing, abusive, threatening, hateful, or discriminatory;',
            'Violates anyone else’s intellectual property, privacy, publicity or other rights, including via misuse of anyone else’s likeness, image, voice, name, identity, or private information;',
            'Shames, harasses, humiliates, bullies, intimidates, denigrates, or celebrates the pain of any person; or',
            'Celebrates animal neglect, abuse, or cruelty.',
          ],
        },
        {
          text: '**Engage Honorably.** You will not use the Services to:',
          sub: [
            'Create any content designed to undermine democratic processes or mislead voters;',
            'Engage in lobbying, advocacy, or campaigning based on false or misleading information; or',
            'Incite or glorify any of the foregoing.',
          ],
        },
        {
          text: '**Prohibited Conduct.** You will not and will not attempt to:',
          sub: [
            'Commit any unlawful act, including fraud, scams, impersonation, or acquisition and exchange of illegal or controlled substances or other illegal materials;',
            'Transmit spam or other unsolicited communications to other users;',
            'Use the Services in violation of data, privacy or other applicable laws or regulations;',
            'Engage in any activity that we determine in our sole discretion will cause liability to us or is otherwise objectionable.',
          ],
        },
        {
          text: '**Others.** You will not use the Services to prompt or encourage others to commit any of the actions above.',
        },
      ],
    },
    {
      kind: 'p',
      text: 'We may monitor compliance with this AUP. If we determine that you or your content violates this AUP, we may remove your content or suspend your access to the Services.',
    },
    {
      kind: 'p',
      text: 'We may report any activity that we suspect violates any law or regulation to appropriate authorities. Such reporting may include disclosing relevant information.',
    },
    {
      kind: 'p',
      text: 'If you become aware of any suspected violation of this AUP, please notify us at [acceptable-use@generaltranslation.com](mailto:acceptable-use@generaltranslation.com) and provide a full explanation of the bases for the violation.',
    },
  ],
  sections: [],
};

const COOKIE_POLICY: LegalDoc = {
  route: 'cookie-policy',
  title: 'Cookie Policy',
  description: 'How General Translation uses cookies and similar technologies.',
  lastUpdated: '2026-07-17',
  preamble: [
    {
      kind: 'p',
      text: 'General Translation, Inc. (“**General Translation**,” “**we**,” “**our**,” and/or “**us**”) values the privacy of individuals who use our website, www.generaltranslation.com, including subdomains of that website (collectively, the “Site”). This cookie policy (“**Cookie Policy**”) explains how we use cookies, what types of cookies we use, and how you can block cookies. The Cookie Policy forms part of our Privacy Policy.',
    },
  ],
  sections: [
    {
      id: 'our-use-of-cookies',
      heading: 'Our Use of Cookies',
      blocks: [
        {
          kind: 'p',
          text: 'We and our third-party partners may collect personal data using cookies, which are small files of letters and numbers that we store on your browser or the hard drive of your computer. We and our third-party partners may also use pixel tags and web beacons on our Site. We use cookies, beacons, invisible tags, and similar technologies (collectively “**Cookies**”) to collect information about your browsing activities and to distinguish you from other users of our Site.',
        },
      ],
    },
    {
      id: 'the-types-of-cookies-that-we-use',
      heading: 'The Types of Cookies That We Use',
      blocks: [
        { kind: 'h3', text: 'Strictly Necessary Cookies' },
        {
          kind: 'p',
          text: 'Some Cookies are strictly necessary to make our Site available to you. Disabling these Cookies may make certain features and Site unavailable, and we cannot provide you with our Site without this type of Cookies. We use the following necessary Cookies:',
        },
        {
          kind: 'table',
          head: ['Name', 'More Information', 'Retention'],
          rows: [
            [
              '`cookie_consent`',
              'Stores your cookie consent preference so that you are not asked to accept or reject cookies on every visit.',
              '1 year',
            ],
            [
              '`gt_theme`',
              'Stores your preferred color theme (light, dark, or system) so that your preference is preserved across pages and visits.',
              '1 year',
            ],
            [
              '`generaltranslation.locale`',
              'Stores your selected language preference so the site can display content in your chosen locale.',
              'Session',
            ],
            [
              '`gt-dash-auth`',
              'Indicates whether you are currently signed into the General Translation dashboard. Used to redirect signed-in users to the dashboard from the homepage.',
              'Session',
            ],
            [
              '`gt_auth.session_token`',
              'Stores your authenticated session token when you sign into the General Translation dashboard. Required to keep you logged in.',
              '7 days',
            ],
          ],
        },
        { kind: 'h3', text: 'Analytical Cookies' },
        {
          kind: 'p',
          text: 'Analytical Cookies allow us to understand how visitors use our Site. They do this by collecting information about site visits and page views. Analytical Cookies also help us measure advertising campaign performance and improve site content. We use the following analytical Cookies:',
        },
        {
          kind: 'table',
          head: ['Name', 'More Information', 'Retention'],
          rows: [
            [
              '`_ga`',
              'Set by Google Analytics to distinguish unique users by assigning a randomly generated identifier. Used to calculate visitor, session, and campaign data for the site’s analytics reports.',
              '2 years',
            ],
            [
              '`_ga_<container-id>`',
              'Set by Google Analytics to persist session state across page requests.',
              '2 years',
            ],
            [
              '`ph_<token>_posthog`',
              'Set by PostHog for product analytics and, for signed-in users, session replay. Stores a unique identifier for the user session.',
              '1 year',
            ],
            [
              '`_gcl_au`',
              'Set by Google Ads to store and track conversions. Used to attribute which ad click led a visitor to the site.',
              '90 days',
            ],
          ],
        },
      ],
    },
    {
      id: 'how-to-block-cookies',
      heading: 'How to Block Cookies',
      blocks: [
        {
          kind: 'p',
          text: 'You can block Cookies by setting your internet browser to block some or all Cookies. However, if you use your browser settings to block all Cookies (including essential Cookies) you may not be able to access all or parts of our Site. By using our Site, you consent to our use of Cookies and our processing of personal data collected through such Cookies, in accordance with our Cookie Policy and Privacy Policy. You can withdraw your consent at any time by deleting placed Cookies and disabling Cookies in your browser.',
        },
        {
          kind: 'p',
          text: 'Please note that if you delete or choose not to accept Cookies from our Site, you may not be able to utilize the features of our Site to its fullest potential. Where required by applicable law, you will be asked to consent to certain Cookies and similar technologies before we use or install them on your computer or other device.',
        },
      ],
    },
    {
      id: 'changes-to-this-cookie-policy',
      heading: 'Changes to This Cookie Policy',
      blocks: [
        {
          kind: 'p',
          text: 'We will post any adjustments to the Cookie Policy on this page, including if we add or remove any Cookies from our Site, and the revised version will be effective when it is posted.',
        },
      ],
    },
    {
      id: 'contact-information',
      heading: 'Contact Information',
      blocks: [
        {
          kind: 'p',
          text: 'If you have any questions, comments, or concerns about our use of Cookies, please email us at [privacy@generaltranslation.com](mailto:privacy@generaltranslation.com).',
        },
      ],
    },
  ],
};

/* getAllLegalDocuments() sorts the library by title; same order here. */
export const LEGAL_DOCS: readonly LegalDoc[] = [
  ACCEPTABLE_USE,
  COOKIE_POLICY,
  PRIVACY_POLICY,
  TERMS,
];

export function getLegalDoc(route: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.route === route);
}

/* The library's own date span, derived from the frontmatter rather than
   restated (ISO dates sort lexicographically). */
const UPDATED = LEGAL_DOCS.map((doc) => doc.lastUpdated).sort();
export const LEGAL_UPDATED_FROM = UPDATED[0] ?? '';
export const LEGAL_UPDATED_TO = UPDATED[UPDATED.length - 1] ?? '';
