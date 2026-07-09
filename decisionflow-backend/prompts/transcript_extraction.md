Extract structured decision information from the provided content.

Return this exact JSON shape:

{
  "decision_topic": "",
  "options": [],
  "criteria": [],
  "stakeholders": [],
  "risks": [],
  "action_items": []
}

Rules:
- Use short strings in arrays.
- Include only information supported by the content.
- Prefer explicit option names over generic labels.
- Criteria should be evaluation factors, not actions.
- Risks should be potential downsides, blockers, or uncertainties.
- Action items should be concrete next steps or owners when present.
- If the decision topic is implied, summarize it in one sentence.
