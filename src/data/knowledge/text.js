export const TEXT_KNOWLEDGE = {
  // --- Platforms ---
  "Medium": {
    "rule": "Prioritize 'Read Ratio' over clicks; the algorithm promotes content that is read to the bottom, not just opened.",
    "mechanic": "Use the 'Curated Collections' feature and broad tags (e.g., 'Life', 'Startup') to trigger the internal recommendation engine, which drives 70% of traffic.",
    "pitfall": "Posting generic blog content without engagement; Medium is a social network, and failing to comment on other articles stifles your own algorithmic reach."
  },
  "Substack": {
    "rule": "You must own the 'Subscribe' Call-to-Action (CTA); unlike Medium, Substack is an email capture engine, not a discovery engine.",
    "mechanic": "The 'Recommendation Network' is the primary growth driver; write content that other newsletters would want to recommend to their audience.",
    "pitfall": "Focusing on SEO keywords instead of 'Voice'; Substack readers pay for personality and niche expertise, not generic search answers."
  },
  "WordPress": {
    "rule": "You are responsible for your own SEO and distribution; there is no internal algorithm to save you.",
    "mechanic": "Utilizing 'Cornerstone Content' structure—linking several smaller posts to one definitive guide—drastically improves domain authority.",
    "pitfall": "Ignoring site speed and mobile optimization; Google penalizes slow WordPress sites regardless of content quality."
  },
  "Ghost": {
    "rule": "Leverage the native 'Memberships' and 'Tiers' architecture to segment free vs. paid content immediately.",
    "mechanic": "Ghost's clean code structure offers superior SEO performance out-of-the-box compared to bloated CMSs; emphasize speed in the writing style (short, punchy).",
    "pitfall": "Over-customizing the theme with heavy JavaScript, which negates the platform's core speed advantage."
  },
  "LinkedIn Article": {
    "rule": "Articles are for 'Evergreen Authority', not viral reach; use them to house deep-dive technical content linked from short-form posts.",
    "mechanic": "LinkedIn Articles are indexed by Google (unlike posts); treat them as SEO assets with proper H1/H2 tags.",
    "pitfall": "Expecting immediate engagement; Articles have low initial reach but a long tail lifespan compared to the 24-hour cycle of posts."
  },
  "White Paper": {
    "rule": "The tone must be 'Educational', not 'Salesy'; the goal is to define a problem so well that your solution becomes the only logical conclusion.",
    "mechanic": "Use the 'Problem-Agitation-Solution' (PAS) framework disguised as industry analysis to psychologically prime the reader.",
    "pitfall": "Using subjective adjectives (e.g., 'revolutionary', 'amazing'); stick to hard data and objective metrics to maintain credibility."
  },
  "Press Release": {
    "rule": "The opening paragraph (Lead) must answer Who, What, When, Where, and Why immediately; journalists rarely read past the first 50 words.",
    "mechanic": "Including a 'Multimedia' folder link (high-res images/logos) drastically increases the chance of pick-up by busy editors.",
    "pitfall": "Burying the lede; if the news isn't in the headline and first sentence, the release is discarded."
  },
  "Internal Memo": {
    "rule": "Adhere to the 'BLUF' (Bottom Line Up Front) principle; the decision or request must be the very first sentence.",
    "mechanic": "Numbered lists and bold key terms increase retention by 40% in corporate environments compared to dense paragraphs.",
    "pitfall": "Including 'fluff' or pleasantries; internal memos are operational documents, not social correspondence."
  },
  "Research Paper": {
    "rule": "You must pre-emptively address the limitations of your own study; failure to do so invalidates the work in the eyes of peer reviewers.",
    "mechanic": "The 'Abstract' is the marketing copy of the paper; it must explicitly state the 'Novelty' of the finding to get cited.",
    "pitfall": "Confusing 'Correlation' with 'Causation' in the Results section; use tentative language ('suggests', 'indicates') rather than definitive claims."
  },
  "Thesis": {
    "rule": "Every chapter must explicitly tie back to the central research question; 'orphan' chapters that don't advance the main argument must be cut.",
    "mechanic": "Define your terms in the introduction; ambiguity in definitions is the primary attack vector during a thesis defense.",
    "pitfall": "Scope creep; attempting to solve a world problem instead of answering a specific, narrow question rigorously."
  },
  "Grant Proposal": {
    "rule": "Align your goals strictly with the funder's mission statement; a brilliant project that doesn't advance *their* specific metrics will be rejected.",
    "mechanic": "The 'Budget Narrative' is as important as the project description; specific, justified costs signal competence and feasibility.",
    "pitfall": "Using academic jargon instead of clear, impact-focused language; reviewers are often generalists, not specialists in your niche."
  },

  // --- Target Audience ---
  "C-Suite Executives": {
    "rule": "Respect their time; use 'Bottom Line Up Front' (BLUF) and focus strictly on ROI, Risk, and Strategic Alignment.",
    "mechanic": "Executives make decisions based on 'Risk Mitigation'; framing your proposal as the 'safest' option is often more persuasive than the 'best' option.",
    "pitfall": "Explaining the 'How' (technical details) instead of the 'What' (outcomes) and 'Why' (business value)."
  },
  "Software Engineers": {
    "rule": "Do not market to them; show the code, the docs, and the trade-offs immediately.",
    "mechanic": "Acknowledging the 'Drawbacks' or 'Cons' of your solution builds immense trust; engineers are trained to find edge cases.",
    "pitfall": "Using buzzwords (e.g., 'synergy', 'game-changer'); this triggers immediate skepticism and loss of credibility."
  },
  "Investors (VCs)": {
    "rule": "Sell the 'Team' and the 'Market Size' first; the product is secondary and likely to change (pivot).",
    "mechanic": "FOMO (Fear Of Missing Out) is the primary psychological driver; emphasize momentum and social proof.",
    "pitfall": "Presenting a 'conservative' forecast; VCs need 'Power Law' returns (100x), not steady small growth."
  },
  "Hiring Managers": {
    "rule": "Map your skills directly to the keywords in the Job Description (JD); their initial scan is often automated or keyword-focused.",
    "mechanic": "Quantifiable results (e.g., 'Increased revenue by 20%') always beat responsibilities (e.g., 'Managed sales team').",
    "pitfall": "Being vague; general statements like 'hard worker' mean nothing without specific examples of output."
  },
  "Complete Beginners": {
    "rule": "Assume zero prior knowledge; define every acronym and concept using a 'Bridge' from a concept they already understand.",
    "mechanic": "The 'Curse of Knowledge' cognitive bias often makes experts skip steps; explicitly state the 'obvious' connecting logic.",
    "pitfall": "Using 'recursive' definitions (defining a term using another complex term)."
  },
  "5-Year Olds (ELI5)": {
    "rule": "Use concrete nouns (dog, ball, house) and verbs; abstract concepts must be converted into physical analogies.",
    "mechanic": "Narrative structure helps retention; frame the explanation as a story with a beginning, middle, and end.",
    "pitfall": "Condescension; simple language does not mean treating the audience as stupid, just inexperienced."
  },
  "Gen Z": {
    "rule": "Authenticity is the primary currency; overly polished or 'corporate' speak is immediately rejected as 'cringe'.",
    "mechanic": "Visual language (formatting, emojis, lowercase for effect) conveys tone as much as the words themselves.",
    "pitfall": "Trying too hard to use slang; if it feels forced, you will be mocked. Stick to direct, honest communication."
  },
  "Academics": {
    "rule": "Precision is paramount; vague qualifiers or sweeping generalizations without citation are instant disqualifiers.",
    "mechanic": "Structuring arguments using 'Thesis-Antithesis-Synthesis' demonstrates critical depth.",
    "pitfall": "Using emotional language; arguments must be built on logic and evidence, not sentiment."
  },
  "Gamers": {
    "rule": "Understand the meta; references must be accurate to the specific genre or game culture to avoid being labeled a 'normie'.",
    "mechanic": "Gamification of the text itself—using 'Level Up', 'Stats', or 'Quest' frameworks—increases engagement.",
    "pitfall": "Misusing terminology (e.g., confusing RPG with FPS mechanics); the community is hyper-critical of inaccuracy."
  },
  "Crypto Natives": {
    "rule": "'Don't Trust, Verify'; focus on on-chain data, code audits, and tokenomics rather than promises.",
    "mechanic": "Community signaling (e.g., 'WAGMI', 'L2') establishes in-group status, but must be used correctly.",
    "pitfall": "Shill vibes; overly promotional language suggests a 'Rug Pull' scam."
  },

  // --- Voice & Mimicry ---
  "Hemingway": {
    "rule": "Use the 'Iceberg Theory'; describe the action and surface details, leaving emotions and internal thoughts implied.",
    "mechanic": "Avoid adjectives and adverbs; rely on strong nouns and verbs. Use 'and' to connect simple clauses (Polysyndeton).",
    "pitfall": "Writing complex, winding sentences; keep it short, punchy, and declarative."
  },
  "Shakespearean": {
    "rule": "Employ Iambic Pentameter (da-DUM da-DUM) for a rhythmic flow, even in prose.",
    "mechanic": "Use archaic pronouns (Thou/Thee) and inverted syntax ('Goes he') to establish the era.",
    "pitfall": "Adding 'eth' to every word randomly; use it only for third-person singular verbs (e.g., 'he runneth')."
  },
  "Malcolm Gladwell": {
    "rule": "Start with a micro-anecdote (e.g., the texture of ketchup) and bridge it to a macro-sociological truth.",
    "mechanic": "Use the 'Curiosity Gap'; ask a question early on that isn't answered until the end.",
    "pitfall": "Being too direct; the style requires a meandering, storytelling journey before the point is made."
  },
  "Seth Godin": {
    "rule": "Be brief and punchy; write in short, one-sentence paragraphs that feel like poetry or a manifesto.",
    "mechanic": "Focus on 'Permission Marketing' and empathy; speak directly to the reader's fear of shipping work.",
    "pitfall": "Using jargon; Godin's style is deceptively simple and avoids corporate speak entirely."
  },
  "Oscar Wilde": {
    "rule": "Invert common proverbs or morality; find the paradox in every situation.",
    "mechanic": "Aestheticism above all; the prose should be beautiful and ornamental.",
    "pitfall": "Being earnest; the tone should be detached, witty, and slightly superior."
  },

  // --- Frameworks ---
  "AIDA": {
    "rule": "Follow the linear path: Attention -> Interest -> Desire -> Action. You cannot ask for Action before building Desire.",
    "mechanic": "The 'Interest' phase must focus on the reader's problem, while 'Desire' focuses on your solution's benefits.",
    "pitfall": "Skipping 'Interest' and jumping straight to the product pitch."
  },
  "PAS": {
    "rule": "Agitate the problem until it hurts; the reader must feel the emotional weight of the issue before you offer relief.",
    "mechanic": "The 'Solution' should feel like a relief valve opening after the pressure of 'Agitation'.",
    "pitfall": "Being too negative; ensure the Solution offers genuine hope and a clear path forward."
  },
  "Hero's Journey": {
    "rule": "The customer is the Hero, not your brand; your brand is the Guide (Yoda/Gandalf).",
    "mechanic": "Clearly define the 'Call to Adventure' (the trigger) and the 'Refusal of the Call' (the hesitation).",
    "pitfall": "Making the brand the hero who saves the day, which alienates the customer."
  },
  "Star-Chain-Hook": {
    "rule": "Start with a 'Star' (big idea/headline), follow with a 'Chain' (facts/logic), and end with a 'Hook' (Call to Action).",
    "mechanic": "The 'Chain' must be unbreakable; every sentence must logically lead to the next.",
    "pitfall": "A weak Star; if the opening concept isn't attention-grabbing, the Chain never gets read."
  }
};