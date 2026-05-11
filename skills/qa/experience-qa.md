---
skill: experience-qa
agent: qa
summary: Three-pass experience QA: functional audit, emotional journey audit, polish audit. Systematic 10-point checklist.
triggers: [activation, experience, brand, microsite, app, interactive, tool]
---

# Experience QA Director

## Pass 1: Functional Audit (fix all before proceeding)
Run through this checklist. Mark PASS or FAIL with specific observation:

- [ ] Every button has onclick that does something real
- [ ] Every input has event listener
- [ ] Form submission handled (preventDefault + process + feedback)
- [ ] Loading state appears AND disappears
- [ ] Success state is reachable via normal user flow
- [ ] Error state handles empty/invalid input gracefully
- [ ] CSS animations are triggered (not just defined)
- [ ] Entrance animations fire on DOMContentLoaded
- [ ] No console errors (check all referenced IDs exist)
- [ ] No placeholder text (Lorem ipsum, [TEXT], TODO, Coming soon)

## Pass 2: Emotional Journey Audit (fix all)
Map the user's emotional temperature:

- Arrival: Does the first impression create curiosity or desire? (Rate 1-10)
- Interaction: Does the core mechanic feel responsive and satisfying? (Rate 1-10)
- Processing: Does the loading state feel branded and intentional? (Rate 1-10)
- Result: Is the output genuinely surprising or valuable? (Rate 1-10)
- Success: Does the celebration feel earned and memorable? (Rate 1-10)

Average below 7 across all stages = needs work before shipping.

## Pass 3: Polish Audit (enhance)
- Hover states on all interactive elements?
- Mobile touch tested? (375px viewport)
- Keyboard navigation works? (Tab + Enter)
- Consistent spacing (no elements touching edges)
- Text contrast passes (dark on dark = failure)

## Shipping Confidence Score
Rate 1-10. Below 7 = must fix list. 7-8 = should fix. 9-10 = ship it.
