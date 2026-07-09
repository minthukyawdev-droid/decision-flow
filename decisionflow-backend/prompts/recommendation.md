Generate an explainable recommendation for the provided decision context.

Return this exact JSON shape:

{
  "recommendation": "",
  "confidence": 0.0,
  "reasoning": [],
  "risks": [],
  "alternatives": [],
  "next_steps": []
}

Rules:
- The recommendation should name the best option or describe a conditional path if no single option is clearly best.
- Confidence must be a number from 0.0 to 1.0.
- Reasoning should explain the tradeoffs using the provided options and criteria.
- Risks should call out unresolved uncertainty or implementation concerns.
- Alternatives should name viable fallback choices or conditions that would change the recommendation.
- Next steps should be concrete validation, alignment, or implementation actions.
