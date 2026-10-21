University Research Department

Google Sites Handoff Guide

Website Rebuild Documentation — Day 13

1. Project Overview

The University Research Department project aims to create a fully functional, well-structured website within 15 days.

A total of nine people are working on the project, divided into three teams of three members each. The teams collaborate to plan, develop, organize, and document the website, ensuring that it meets the project's requirements and provides a clear, user-friendly experience.

The final website should have a consistent structure, meaningful content, accessible navigation, and working links and forms. This handoff guide documents the implementation decisions, Google Sites limitations, recommended workarounds, required assets, and final checks needed to ensure a smooth transition between teams.

2. Purpose of This Guide

This guide explains how to rebuild the existing website prototype in Google Sites. It documents the main differences between the prototype and Google Sites, the recommended alternatives for unsupported features, the required content and assets, and the checks that must be completed before the website is handed over.

The goal is to preserve the original website's content, navigation, visual identity, and usability as closely as possible within the limitations of Google Sites.

3. Website Structure

The rebuilt website should contain the following main sections, based on the existing prototype:

- About Us: Information about the organization, its regulations, people, partners, and collaborators.
- Projects: Project descriptions, images, categories, and status information.
- News and Events: News articles and event announcements organized by relevant categories.
- Contact: Contact information and an inquiry form.

The final page structure and content should be checked against the existing prototype before implementation.

4. Features That Require Adaptation

Google Sites does not support every interaction available in the original prototype. The following alternatives should be used during the rebuild.

Prototype feature| Google Sites limitation| Recommended implementation
Italian/English language switch| No built-in language switch| Create two linked language-specific page sets or provide both languages on the same pages.
Project filter pills| Cards cannot be filtered instantly in-page| Create separate pages for project statuses or organize projects into clearly labeled sections.
News and event filters| No native instant filtering of cards| Organize content using headings, categories, and separate pages where appropriate.
Different card layouts| Custom project, featured, and person card variants are limited| Recreate layouts using image-and-text blocks, tables, and consistent page sections.
Contact inquiry form| The prototype form does not submit data| Embed a Google Form and test its submission process.
Header dropdown menus (K-01)| Navigation menus support a limited hierarchy| Simplify the navigation and use linked overview pages for additional sections.
Field-level form validation| Custom validation messages and automatic focus on the first invalid field cannot be reproduced directly| Use Google Forms' built-in required fields and validation options.
Anchors and smooth scrolling| Navigation and scrolling behavior differ from the prototype| Link to supported page sections and use clear section headings.
External profile and website links| Links must be recreated manually| Add normal external links to profiles, CVs, publications, and organization websites.
Regulations PDF download| The file must be hosted and linked separately| Upload Regulations.pdf to Google Drive and add a suitable link to the About Us page.

5. Content and Assets

All content should be meaningful, consistent, and ready for publication. Placeholder text must not contain generic descriptions such as "Short description in two lines."

5.1 Required Assets

Asset| Source or license| Usage
image-16x9.svg| Created for this project; no external license required| Placeholder images across the website
photo-4x5.svg| Created for this project; no external license required| Portraits and people sections
Regulations.pdf| One-page placeholder document| About Us page
Inter font| SIL Open Font License; @fontsource/inter package| Website typography

Before publishing, confirm whether the placeholder assets should remain in the final version or be replaced with approved content. Check that all images and documents display correctly in Google Sites.

5.2 Content Guidelines

All content should be realistic, readable, and consistent with the purpose of the organization.

Projects

Each project should include:

- Project title
- Short introduction or description
- Status
- Theme or category
- Relevant image
- Optional external link

News and Events

Each item should include:

- Title
- Introduction or summary
- Publication date or event date, where relevant
- Type or category
- Language, where relevant
- Link to further information, if available

People

Each profile should include:

- Full name
- Role or professional affiliation
- Short biography
- Portrait, where available
- Optional external link

A person's link is optional and must point to an external destination, such as a social profile, CV, publication, or organization website. The destination should be agreed upon by the team leads. External links should open in a new tab where supported.

Contact

The Contact page should include the available contact information and an embedded Google Form for inquiries. The form must be tested to ensure that submissions are received by the intended recipient.

6. Language and Navigation

The original prototype includes Italian and English content. Since Google Sites does not provide a built-in language switch, the team must choose one of the following approaches.

Option A — Separate language-specific page sets

- Create an Italian version and an English version of the website.
- Provide visible links between the two versions.
- Keep the page structures and navigation consistent.

Option B — Both languages on the same pages

- Display the Italian and English text together.
- Use clear headings to distinguish the languages.
- Keep each section easy to scan.

The selected approach should be applied consistently across all pages.

7. Google Forms and External Links

The Contact form should be created in Google Forms and embedded into the Google Sites page.

Before handoff:

- Check all required fields.
- Configure relevant response validation.
- Submit a test response.
- Confirm that responses reach the intended destination.
- Review access and response permissions.

External links should be descriptive and clearly distinguishable from normal text. Test every link to ensure that it opens the correct destination. Links to external profiles, partner websites, CVs, and publications should open in a new tab where supported.

8. Implementation Workflow

1. Review the prototype. Identify all pages, content sections, navigation items, assets, and interactive features.
2. Prepare the content. Finalize page titles, descriptions, project entries, news items, people profiles, and contact information.
3. Create the site structure. Set up the main pages and navigation in Google Sites.
4. Rebuild page layouts. Use Google Sites text, image, table, and layout blocks to approximate the prototype.
5. Implement alternatives. Replace unsupported filters, dropdowns, language switching, and custom form behavior with the solutions described in this guide.
6. Add assets and links. Upload or link the required images, PDF, external profiles, and Google Form.
7. Review the design. Check typography, spacing, images, headings, and consistency between pages.
8. Test the website. Check navigation, language links, external links, the PDF, and form submissions.
9. Complete the handoff. Document remaining limitations, unresolved content, and decisions that still require approval.

9. Project Decisions and Technical Notes

The following project decisions must be preserved.

- D-18 — Fixed filter lists: Status, theme, type, and language filter values must remain consistent with the values defined by the project team.
- D-22 — Meaningful placeholder content: Placeholder content must use realistic names and complete, meaningful sentences.
- D-23 — Pull request checks: A pull request may be merged only when "npm run check" completes successfully.
- D-24 — List data structure: People, projects, and news list files must follow the structure "{title, intro, emptyState, items}".

These decisions primarily concern the original development workflow and content model. They should remain documented for the development team even though Google Sites uses a different implementation process.

10. Open Questions and Known Limitations of Google Sites

10.1 Known Limitations

Some features of the original prototype cannot be reproduced exactly in Google Sites. The following limitations and workarounds have been identified.

Feature| Known limitation| Proposed workaround
Dropdown menus| Limited navigation hierarchy and no full support for custom dropdown interactions| Simplify navigation and use overview pages with links to subpages.
Forms| Custom field-level error messages and automatic focus on the first invalid field are not directly supported| Embed a Google Form and use its built-in required fields and validation options.
Project filters| Project cards cannot be filtered instantly by status or theme using the standard interface| Create separate pages for different statuses or organize projects under category headings.
News and event filters| Instant filtering by type, topic, or language is not natively available| Organize items into clearly labeled sections or separate category pages.
Language switch| No built-in Italian/English language toggle| Create linked Italian and English page sets or display both languages on the same pages.
Anchor links| Section links are possible, but the prototype's smooth-scrolling behavior may not be reproduced| Use section links and clear headings wherever possible.

10.2 Open Questions to Resolve

The following questions should be discussed by the project teams before the final website is approved.

Navigation

- Which pages should appear in the main navigation?
- Should the website use separate overview pages for sections that originally used dropdown menus?
- How can users access subsections without making navigation too complicated?

Forms

- Which fields must be included in the Contact form
- Which fields should be required?
- Who should receive and manage form responses?
- Has the embedded Google Form been tested successfully?

Filters

- Should projects be divided into separate pages by status or displayed in sections on one page?
- How should users browse news and events by type, topic, and language?
- Which categories and status values must be used consistently?

Languages

- Should Italian and English content appear on separate pages or on the same pages?
- How will users switch between the two language versions?

Final implementation

- Which prototype features are essential, and which can be simplified?
- Are all external links, downloadable files, and page-section links working?
- Who is responsible for checking and approving the final Google Sites version?

10.3 Decisions and Follow-up

The project teams should agree on the proposed workarounds, assign responsibility for unresolved questions, and test the selected solutions before handoff.

Any feature that cannot be reproduced exactly should be documented clearly. The final website should prioritize clear navigation, accessible content, working forms and links, and a consistent user experience.

The open questions should remain marked as unresolved until the team has made and documented a decision.

11. Final Handoff Checklist

Before considering the Google Sites rebuild complete, verify the following:

- [ ] All required pages have been created.
- [ ] The page structure matches the agreed website plan.
- [ ] Italian and English content follows the selected language strategy.
- [ ] Projects, news, events, and people have meaningful content.
- [ ] All required images and assets are available.
- [ ] Regulations.pdf is accessible through the About Us page.
- [ ] The Contact form has been tested successfully.
- [ ] External links lead to the correct destinations.
- [ ] Navigation and section links work as expected.
- [ ] The site has been checked on desktop and mobile.
- [ ] Known Google Sites limitations and workarounds are documented.
- [ ] Open questions have been reviewed with the project teams.
- [ ] Decisions and unresolved issues have been recorded.
- [ ] Remaining issues and content decisions have been communicated to the receiving team.

12. Known Limitations and Future Improvements

The rebuilt website will not reproduce every interaction from the original prototype. In particular, instant card filtering, custom dropdown behavior, advanced form validation, and smooth scrolling may need to be simplified.

The priority is to deliver a functional, accessible, and consistent website that preserves the essential content and user journeys. Any remaining differences should be documented clearly so that the receiving team understands which features were adapted and why.

13. Handoff Completion

The website is ready for handoff when the agreed pages and content are present, essential links and form submissions have been tested, required assets are accessible, and the receiving team has a clear record of known limitations and outstanding decisions.

The handoff should also identify any unresolved questions, the person or team responsible for addressing them, and the next steps required to complete the rebuild.
