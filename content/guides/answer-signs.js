/**
 * Answer Signs — a study guide of legitimate test-taking "tells."
 *
 * These are probabilistic heuristics drawn from how standardized multiple-choice
 * tests are commonly written. They are study aids, NOT guarantees. Always try to
 * actually solve or reason through a question; use a tell only to break a genuine
 * tie or to sanity-check a choice. On timed sections, a good guess beats a blank.
 *
 * This content is original and self-contained. It is not affiliated with,
 * endorsed by, or sponsored by College Board or ACT, Inc.
 */
(function () {
  "use strict";

  window.PRACTICE_ANSWER_SIGNS = {
    version: "2026.1",
    updated: "2026-10-02",
    disclaimer:
      "These are heuristics, not rules. A well-written question can and will " +
      "punish a student who only pattern-matches. Solve first; use a tell to " +
      "break a tie, check your work, or make an educated guess when you are out " +
      "of time. Never leave a question blank — neither the SAT nor the ACT " +
      "penalizes wrong answers.",

    // High-level principles that apply to every section of both tests.
    principles: [
      {
        title: "Elimination beats selection",
        body:
          "You rarely need to prove the right answer. Prove three answers wrong " +
          "and the last one is correct by default. Cross off aggressively; one " +
          "unsupported part can invalidate a choice. First check whether the stem asks for a true statement, a false statement, an exception, or a speaker's view.",
        caution:
          "It fails when you eliminate for the wrong reason. If all four choices " +
          "end up crossed off, or you are left with none you can defend, your " +
          "reading of the question was off: reread the stem, don't pick the " +
          "least bad survivor.",
      },
      {
        title: "Support the answer with the relevant evidence",
        body:
          "For reading, use the passage and any supplied data. For Math, apply the mathematical rules and stated conditions. Check every part of the answer against the task.",
        caution:
          "Reading inferences can combine details from several places; they need not restate one sentence. ACT Science can also require introductory science knowledge, so this is not a rule to ignore everything learned in class.",
      },
      {
        title: "Check the strength of a claim",
        body:
          "Words such as always, never, every and only make strong claims. Check whether the passage or data support that strength. A cautious word such as may is not evidence that a choice is correct.",
        caution:
          "Both absolute and cautious choices can be right. Reject a choice for a mismatch with the evidence, not for a word it contains.",
      },
      {
        title: "Match meaning rather than style",
        body:
          "Compare what each choice actually claims with the evidence and the question. Plain wording, dramatic wording and a clean-looking number are not reliable indicators of the key.",
        caution:
          "A familiar or plausible statement can still answer the wrong question. Check the full claim and all the conditions.",
      },
      {
        title: "Test opposing choices separately",
        body:
          "Opposite choices can help identify a distinction to check, but both may be distractors. If two choices truly mean the same thing in context, neither can be the unique best answer.",
        caution:
          "Look-alike choices may differ in scope, conditions or attribution. Do not discard other choices just because an opposite pair is present.",
      },
      {
        title: "Match the requested scope and viewpoint",
        body:
          "Match the scope and viewpoint the question asks about. Check whether the choice describes the whole text, a specific part, the author, or a person the author discusses. A paraphrase does not have to copy the passage's verb tense.",
        caution:
          "It fails when the question asks about one part of the text, not the " +
          "whole, or about a view the author describes but rejects. Match the " +
          "scope and tone of what the question points to, not of the passage " +
          "as a whole.",
      },
    ],

    groups: [
      /* ---------------------------------------------------------------- */
      /* SAT — Reading & Writing                                           */
      /* ---------------------------------------------------------------- */
      {
        id: "sat-rw",
        test: "SAT",
        category: "Reading & Writing",
        title: "SAT Reading & Writing tells",
        intro:
          "The digital SAT Reading & Writing section is short-passage and " +
          "single-question. Use the text for reading and language rules for editing. Predict an answer in your own " +
          "words before you read the choices.",
        tells: [
          {
            name: "Predict before you peek",
            sign:
              "Cover the four choices, answer the question in your own words, " +
              "then find the choice that matches your prediction.",
            why:
              "An initial prediction can keep a tempting choice from steering your reading. Compare the meaning of every remaining choice; a prediction is a hypothesis to check, not an answer key.",
            example:
              "For a main-idea question, jot a 5-word summary of the passage, " +
              "then pick the choice closest to it.",
            caution:
              "If none of the choices matches your prediction, your prediction " +
              "was off — reread the relevant line, don't force a choice.",
          },
          {
            name: "Command-of-evidence: the answer must do the job",
            sign:
              "When asked which quotation or data point best supports a claim, " +
              "the answer must directly and completely support that exact claim — " +
              "not a nearby or related idea.",
            why:
              "Wrong choices are true statements from the passage that support a " +
              "different claim. Relevance to the specific claim is everything.",
            example:
              "If the claim is 'the material is unusually flexible,' a quote " +
              "about its color is out even if it's accurate.",
            caution:
              "For quantitative evidence (a table or graph), the correct choice " +
              "reads the data correctly AND ties it to the claim. Verify both.",
          },
          {
            name: "Words-in-context: substitute and reread",
            sign:
              "Plug each choice back into the sentence. The correct word keeps " +
              "the sentence's meaning and matches the surrounding tone.",
            why:
              "These questions test the meaning in context, not the dictionary's " +
              "most common definition. The 'obvious' meaning is usually the trap.",
            example:
              "'Novel' can mean 'a book' or 'new.' In 'a novel approach,' only " +
              "'new' fits — the common noun meaning is the distractor.",
            caution:
              "Common and less familiar meanings can both be correct. Read enough context to establish the intended sense; word difficulty does not decide it.",
          },
          {
            name: "Transitions: name the relationship first",
            sign:
              "Before looking at choices, decide the logical relationship between " +
              "the two sentences: same direction (also, moreover), contrast " +
              "(however, but), cause/effect (therefore, because), or example.",
            why:
              "Naming the relationship narrows the choices. Two transitions may express related ideas, so also check their specific meanings and the sentence grammar.",
            example:
              "If sentence 2 reverses sentence 1, only a contrast word " +
              "(however, nevertheless, by contrast) can be right.",
            caution:
              "Therefore can introduce a logical conclusion, not only a physical cause. For example needs an example; however and nevertheless express different kinds of contrast. Match the actual relationship.",
          },
          {
            name: "Rhetorical synthesis: obey the stated goal",
            sign:
              "The bulleted-notes questions tell you the writer's goal in the " +
              "prompt. The answer is the ONLY choice that accomplishes that exact " +
              "goal using the notes.",
            why:
              "A choice must be accurate to the notes and accomplish the stated purpose. Do not assume every distractor is factually accurate.",
            example:
              "If the goal is 'to emphasize a difference between the two studies,' " +
              "pick the choice that states a contrast, not the one that just lists " +
              "a fact.",
            caution:
              "Underline the goal words (emphasize, compare, introduce, " +
              "generalize) and check the choice against them literally.",
          },
          {
            name: "Grammar: see what changes across the choices",
            sign:
              "On Standard English Conventions questions, look down the four " +
              "choices before reading closely. What differs names the rule: " +
              "punctuation marks (boundaries), is/are (subject-verb agreement), " +
              "its/their (pronoun agreement), -ing or to-forms against full " +
              "verbs (verb finiteness), tenses, apostrophes (possessives and " +
              "plurals), or word order (modifier placement).",
            why:
              "Comparing choices helps identify the convention in play. Read the full sentence to determine the required grammar and meaning.",
            example:
              "If the choices are the forms study's, studies, studies' and " +
              "studys, decide how many studies there are and whether anything " +
              "belongs to them.",
            caution:
              "Length is not a signal here: concision is not one of the SAT's " +
              "official testing points, so never pick a choice for being " +
              "shorter. Some choices change two things at once; settle the " +
              "clearest rule first.",
          },
          {
            name: "Punctuation: test the two halves",
            sign:
              "For punctuation questions, identify independent clauses and interruptions. Two independent clauses can use a period, semicolon or comma plus coordinating conjunction; a colon or dash can also work when the relationship calls for it.",
            why:
              "The SAT recycles a small set of boundary rules. Classifying each " +
              "half as a complete or incomplete sentence resolves most of them " +
              "mechanically.",
            example:
              "A colon must follow a complete sentence and introduce an " +
              "explanation, list, or example.",
            caution:
              "A semicolon can also separate complex list items. Two punctuation choices cancel only if both produce equivalent, correct complete sentences in this exact context; check capitalization and the surrounding words.",
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* SAT — Math                                                        */
      /* ---------------------------------------------------------------- */
      {
        id: "sat-math",
        test: "SAT",
        category: "Math",
        title: "SAT Math tells",
        intro:
          "Math has real answers, so tells here are about avoiding trap choices " +
          "and using the structure of the answers — not guessing blind. The " +
          "choices themselves often leak information.",
        tells: [
          {
            name: "Plug in the answers (backsolving)",
            sign:
              "When the choices are numbers and the algebra is messy, test the " +
              "choices in the original equation. Start with B or C (the middle " +
              "values) so you can tell which direction to go.",
            why:
              "One of the four choices must be correct, so testing them converts " +
              "hard algebra into arithmetic you can verify.",
            example:
              "For 'x such that 3x - 7 = 2x + 4,' try the middle choice; adjust " +
              "up or down based on the result.",
            caution:
              "Check the requested quantity and every condition. Moving up or down after a middle choice works only when the tested relationship changes in one direction; for a quadratic or other nonmonotonic relationship, test remaining choices separately.",
          },
          {
            name: "Pick numbers for variables in the answers",
            sign:
              "If the question and all four choices contain variables, substitute " +
              "easy numbers (avoid 0 and 1), compute a target, then see which " +
              "choice hits the target.",
            why:
              "Abstract algebra becomes concrete arithmetic, and the trap choices " +
              "that only 'look' equivalent fall away.",
            example:
              "For 'which expression equals the perimeter,' let the side = 3 and " +
              "test each choice.",
            caution:
              "Use values allowed by every stated condition and keep denominators nonzero. A mismatch disproves equivalence, but a match at one or several values does not prove an identity; confirm the surviving expression algebraically when possible.",
          },
          {
            name: "The answer that skips a step is the trap",
            sign:
              "Distractors are the results of stopping one step early, or solving " +
              "for the wrong quantity. If a choice equals an intermediate value " +
              "you computed, be suspicious.",
            why:
              "Distractors can reflect a common intermediate result or wrong quantity. Its presence does not confirm that your work is right, and the exact mistake you make may not be listed.",
            example:
              "Solve for x = 4, but the question asks for x^2. '4' will be sitting " +
              "right there as a wrong choice; the answer is 16.",
            caution:
              "Re-read the last line of the problem before choosing. Underline " +
              "'least,' 'greatest,' 'not,' 'except,' and the exact unknown.",
          },
          {
            name: "Estimate and eliminate the impossible",
            sign:
              "Ballpark the answer's size and sign. A negative length, a " +
              "probability above 1, or a percent over 100 in a discount problem " +
              "is immediately out.",
            why:
              "Order-of-magnitude sense eliminates one or two choices for free, " +
              "even when you can't finish the computation.",
            example:
              "A 20% discount on $50 can't be more than $50; cross off any choice " +
              "≥ 50.",
            caution:
              "Estimation narrows the field; it rarely picks the single answer. " +
              "Use it to reduce, then compute among survivors.",
          },
          {
            name: "Grid-in reality check",
            sign:
              "On student-produced-response (grid-in) items there are no choices, " +
              "so verify by plugging your answer back into the original equation " +
              "and confirming units and reasonableness.",
            why:
              "Without choices there's no safety net; a quick back-substitution " +
              "catches sign errors and arithmetic slips.",
            example:
              "If you solved a rate problem and got 0.5 hours, confirm that half " +
              "an hour actually satisfies the given distance and speed.",
            caution:
              "Negative answers are allowed. You can enter up to 5 characters " +
              "for a positive answer and 6 for a negative one (the minus sign " +
              "counts). Enter a mixed number as an improper fraction or a " +
              "decimal (7/2 or 3.5), and a long decimal to the fourth digit " +
              "(.6666 or .6667 for 2/3, not .67).",
          },
          {
            name: "Geometry figures are usually drawn to scale (SAT)",
            sign:
              "Unless a figure says 'Note: figure not drawn to scale,' you can " +
              "measure or compare visually to estimate angles and lengths.",
            why:
              "A to-scale figure lets you eyeball which answer is plausible and " +
              "eliminate ones that clearly conflict with the picture.",
            example:
              "If an angle clearly looks obtuse, cross off any choice under 90°.",
            caution:
              "'Not drawn to scale' cancels this tell entirely — then trust only " +
              "the given measurements, never the drawing.",
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* ACT — English                                                     */
      /* ---------------------------------------------------------------- */
      {
        id: "act-english",
        test: "ACT",
        category: "English",
        title: "ACT English tells",
        intro:
          "ACT English is a fast grammar-and-rhetoric section (about 42 seconds " +
          "per question: 50 questions in 35 minutes). It rewards a small set of mechanical rules and a strong " +
          "bias toward concision.",
        tells: [
          {
            name: "Shortest correct answer wins",
            sign:
              "When choices preserve the required meaning, grammar and tone, remove unnecessary repetition. Evaluate DELETE or OMIT by reading the sentence and paragraph without the material.",
            why:
              "The ACT explicitly values concise, non-redundant writing. Extra " +
              "words are usually there to be removed.",
            example:
              "Between 'they returned back' and 'they returned,' pick 'returned' " +
              "— 'back' is redundant.",
            caution:
              "Only after meaning and grammar are equal. Never delete words the " +
              "sentence needs to stay complete or clear.",
          },
          {
            name: "Check for unnecessary repetition",
            sign:
              "Scan for two words that say the same thing: 'end result,' 'each " +
              "and every,' 'past history,' 'combine together,' 'small in size.' " +
              "Eliminate the choice that keeps both.",
            why:
              "ACT English assesses concise expression. Remove repetition only when it adds no needed meaning or rhetorical effect.",
            example:
              "'The reason is because' → 'The reason is' (or 'because').",
            caution:
              "Redundancy can hide across a clause, not just adjacent words. Read " +
              "the full sentence for repeated ideas.",
          },
          {
            name: "Answer changes tell you the tested rule",
            sign:
              "Look at what differs among the four choices. If only punctuation " +
              "changes, it's a punctuation question; if verb endings change, it's " +
              "agreement or tense.",
            why:
              "The variable across choices reveals exactly which rule to apply, " +
              "so you don't waste time checking the wrong thing.",
            example:
              "If choices differ only by its/it's/its'/their, the question is " +
              "about pronoun and apostrophe usage — go straight there.",
            caution:
              "Some questions change more than one thing. Handle the clearest " +
              "error first; it often eliminates two choices at once.",
          },
          {
            name: "Comma test: could a period go here?",
            sign:
              "If both sides of a comma are complete sentences, a plain comma is " +
              "wrong (comma splice). You need a period, semicolon, or " +
              "comma + FANBOYS conjunction.",
            why:
              "Independent-clause boundaries are the most tested punctuation idea " +
              "on the ACT, and this single check resolves most of them.",
            example:
              "'I ran, I was late' is a splice; 'I ran, so I was late' is fine.",
            caution:
              "This applies when the semicolon joins clauses. Semicolons also separate complex list items that already contain commas.",
          },
          {
            name: "Descriptive/rhetorical questions: read the whole context",
            sign:
              "For 'yes/no' or 'which choice best accomplishes X' questions, the " +
              "answer's reasoning half must be correct, and the choice must serve " +
              "the stated purpose using the surrounding paragraph.",
            why:
              "In yes/no questions, wrong choices often pair the right verdict " +
              "with a false reason. Both halves must hold.",
            example:
              "'Yes, because it introduces the topic' is wrong if the sentence " +
              "actually restates the conclusion.",
            caution:
              "These require reading before and after the underline, unlike pure " +
              "grammar items. Don't answer from the underlined words alone.",
          },
          {
            name: "Keep verb tense and pronouns consistent with the passage",
            sign:
              "Match each verb tense to its event time and each pronoun to its intended antecedent. Nearby verbs offer context, but a sentence can legitimately describe different times.",
            why:
              "Consistency questions are resolved by scanning nearby sentences, " +
              "not by ear.",
            example:
              "A past-tense account may correctly include a present-tense general fact. Look for the time relationship, not just matching endings.",
            caution:
              "Match the antecedent, not the nearest noun. In 'The team, after " +
              "three losses to rival schools, changed their lineup,' the " +
              "antecedent is 'team' (singular), so 'its' is the fix.",
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* ACT — Reading                                                     */
      /* ---------------------------------------------------------------- */
      {
        id: "act-reading",
        test: "ACT",
        category: "Reading",
        title: "ACT Reading tells",
        intro:
          "ACT Reading is time-pressured (about 67 seconds per question: 36 " +
          "questions in 40 minutes). Answers " +
          "are strictly text-based; the credited choice is provable with a line " +
          "reference, and 'literal and supported' beats 'insightful.'",
        tells: [
          {
            name: "Locate evidence for the whole claim",
            sign:
              "Justify the answer with relevant passage evidence. An inference may combine details from several sentences and need not be directly stated.",
            why:
              "ACT Reading is a proof exercise. Every credited answer has textual " +
              "evidence; attractive-but-unsupported choices are the traps.",
            example:
              "For 'the narrator feels ___,' find the sentence that shows the " +
              "feeling, then match the choice to it.",
            caution:
              "Use only conclusions the text supports. A plausible story based on outside knowledge is insufficient, while a supported inference is valid even without one matching line.",
          },
          {
            name: "Check absolute wording against the text",
            sign:
              "Check absolute words such as always, never and only against the passage. Keep them when justified and reject them when they overstate the evidence.",
            why:
              "The strength of the answer must fit the evidence. Neither absolute wording nor hedging establishes whether a choice is right.",
            example:
              "'The author completely rejects the theory' loses to 'the author " +
              "questions part of the theory.'",
            caution:
              "Occasionally a passage really is absolute (a definition, a law). " +
              "If the text itself is emphatic, an extreme choice can be right — " +
              "verify against the line.",
          },
          {
            name: "Beware the true-but-irrelevant choice",
            sign:
              "A choice can be a true statement about the passage yet not answer " +
              "the question asked. Re-check that the choice responds to THIS " +
              "question.",
            why:
              "The most common ACT Reading trap is a factually accurate detail " +
              "placed under the wrong question.",
            example:
              "The question asks for the main idea, but the choice states a real " +
              "minor detail. True, but wrong scope.",
            caution:
              "Match the choice to the question type: main idea wants the whole " +
              "passage; detail wants a specific line.",
          },
          {
            name: "Locate evidence from the question's cues",
            sign:
              "Use a line reference, distinctive term or paragraph topic to locate evidence. Do not assume the next question refers to a later part of the passage.",
            why:
              "The question itself is a better navigation cue than its number.",
            example:
              "If a question names a particular experiment, find that experiment and reread the surrounding sentences, wherever it appears.",
            caution:
              "Main ideas and inferences may require evidence from several parts of the passage, so do not stop at the first matching word.",
          },
          {
            name: "Opposite pairs flag the battleground",
            sign:
              "When two choices oppose each other, inspect what the passage actually says about that contrast. Keep evaluating the other choices too.",
            why:
              "A contrast can identify an issue to check, but it does not make either choice more likely to be right.",
            example:
              "'The tone is admiring' vs. 'the tone is critical' — settle the " +
              "tone from the text, then choose.",
            caution:
              "Not every opposite pair contains the answer; confirm with the " +
              "passage rather than assuming.",
          },
          {
            name: "Dual-passage: keep the sources separate",
            sign:
              "On paired passages, note which author holds which view. Wrong " +
              "choices swap the authors' positions or blend them.",
            why:
              "The classic paired-passage trap attributes Passage A's idea to " +
              "Passage B's author.",
            example:
              "If A is optimistic and B is cautious, a choice claiming B is " +
              "optimistic is out.",
            caution:
              "'Both authors would agree' choices must be supported by BOTH " +
              "texts, not just one.",
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* ACT — Science                                                     */
      /* ---------------------------------------------------------------- */
      {
        id: "act-science",
        test: "ACT",
        category: "Science",
        title: "ACT Science tells",
        intro:
          "ACT Science combines data interpretation, experimental reasoning and introductory science knowledge. Use the supplied evidence, and apply background knowledge when the task requires it.",
        tells: [
          {
            name: "Start with the supplied figure and context",
            sign:
              "For data questions, go straight to the table or graph named in the " +
              "question, read the axis labels and units, and trace the value. " +
              "Ignore the intro paragraph unless a question needs it.",
            why:
              "Many questions can be solved from supplied figures and text. Others require combining that information with introductory biology, chemistry, physics or Earth science.",
            example:
              "'As temperature increases, pressure ___' — follow the curve's " +
              "direction on the graph and read the trend.",
            caution:
              "Do not assume an outside-knowledge question is a misread. Use the stimulus first, then the science concept needed; review missing concepts after practice.",
          },
          {
            name: "Match the trend's direction",
            sign:
              "For a question about how Y changes as X increases, inspect the requested interval: Y may rise, fall, stay constant or change direction. Increasing together is not necessarily direct proportionality; decreasing is not necessarily inverse proportionality.",
            why:
              "Two of the four choices are usually 'increase/decrease' opposites; " +
              "reading the slope's sign eliminates half instantly.",
            example:
              "A downward-sloping line means 'as X increases, Y decreases.'",
            caution:
              "Check for a turning point — some curves rise then fall. Read the " +
              "specific interval the question asks about.",
          },
          {
            name: "Interpolate/extrapolate along the pattern",
            sign:
              "When asked for a value between or just beyond the data points, " +
              "continue the existing trend smoothly; the answer sits in the gap " +
              "or one step past the last point.",
            why:
              "The credited value follows the established pattern; wildly larger " +
              "or smaller choices break the trend and are traps.",
            example:
              "If a linear trend gives Y=10 at X=2 and Y=20 at X=4, then at X=3 the model predicts Y=15.",
            caution:
              "Only extrapolate for as far as the trend is stated to hold. Huge " +
              "jumps beyond the data are usually wrong.",
          },
          {
            name: "Conflicting-viewpoints: anchor each scientist's core claim",
            sign:
              "In the viewpoints passage, summarize each scientist/student's main " +
              "claim in a few words. Answers hinge on who believes what and what " +
              "evidence would strengthen or weaken each view.",
            why:
              "The traps swap positions between viewpoints or attach the wrong " +
              "evidence to a scientist.",
            example:
              "'Which finding supports Scientist 2?' — pick the data that fits " +
              "Scientist 2's specific claim, not a true fact that fits " +
              "Scientist 1.",
            caution:
              "'Strengthen' vs. 'weaken' flips the whole question. Underline " +
              "which one is being asked.",
          },
          {
            name: "Read every axis label and unit before answering",
            sign:
              "Note what each axis measures, its units, and its scale (linear vs. " +
              "log, and whether it starts at zero). Many wrong answers come from " +
              "misreading the scale.",
            why:
              "A single mis-scaled read produces a plausible but wrong value that " +
              "is waiting as a distractor.",
            example:
              "Equally spaced ticks labeled 1, 10, 100 and 1000 indicate a logarithmic scale; the steps multiply by 10. Zero cannot appear on an ordinary logarithmic axis.",
            caution:
              "Watch for multiple y-axes (left and right) on one graph, and make " +
              "sure you read the curve tied to the correct axis.",
          },
          {
            name: "Design questions: identify the single changed variable",
            sign:
              "Identify what the researchers change (independent variables), measure (dependent variables), and hold constant (controlled variables). Distinguish those constants from a control group or baseline used for comparison.",
            why:
              "Answers about 'why did they run Trial 3' or 'what does Trial 2 " +
              "test' turn on which variable moved while others were fixed.",
            example:
              "If only the catalyst amount differs across trials, the experiment " +
              "tests the effect of catalyst amount.",
            caution:
              "Some designs change more than one factor. Compare trials that isolate the factor asked about; a control group and a controlled variable are different ideas.",
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* ACT — Math                                                        */
      /* ---------------------------------------------------------------- */
      {
        id: "act-math",
        test: "ACT",
        category: "Math",
        title: "ACT Math tells",
        intro:
          "ACT Math has 45 questions in 50 minutes (about 67 seconds each), " +
          "each with four answer choices, arranged roughly easy-to-hard. Like SAT Math, the tells are about using the answer " +
          "choices and avoiding seeded mistakes — not blind guessing.",
        tells: [
          {
            name: "Difficulty rises with question number",
            sign:
              "Early questions (about 1–15) are usually straightforward; on late " +
              "questions (about 35–45), the 'obvious' answer is more likely a trap. " +
              "Trust an easy computation early; double-check an easy-looking " +
              "answer late.",
            why:
              "The ordered difficulty means a late question that feels trivial " +
              "probably hides a step you skipped.",
            example:
              "On question 43, if the answer came in one line, re-read for a " +
              "'not,' a unit change, or an extra condition.",
            caution:
              "Ordering is a tendency, not a guarantee. Don't talk yourself out " +
              "of a genuinely correct easy answer just because it's late.",
          },
          {
            name: "Backsolve with the four choices",
            sign:
              "When choices are numbers, test them in the problem. They're " +
              "listed in order, so start with B or C and move up or down.",
            why:
              "One choice must work; checking them is often faster and safer than " +
              "setting up and solving the algebra.",
            example:
              "'For what x is the expression zero?' — plug each choice until the " +
              "expression evaluates to 0.",
            caution:
              "Check all stated restrictions and the exact quantity asked. A middle choice tells you which direction to try only for a monotonic relationship; otherwise test the remaining choices separately.",
          },
          {
            name: "Pick numbers for variable-answer questions",
            sign:
              "If the answer choices contain variables, substitute simple numbers " +
              "(not 0 or 1) and compute a target to match.",
            why:
              "It converts abstract manipulation into arithmetic and exposes " +
              "choices that only look equivalent.",
            example:
              "'Which is equivalent to 2(x+3)?' — let x=4, target 14, test each " +
              "choice.",
            caution:
              "Choose values satisfying the conditions, with nonzero denominators. A mismatch rules a choice out; matching a few inputs does not prove equivalence. Confirm symbolically when possible.",
          },
          {
            name: "The 'trap' choice is your predictable mistake",
            sign:
              "Distractors equal the answer you'd get by forgetting to " +
              "distribute a negative, using diameter for radius, or leaving off a " +
              "unit conversion. Seeing your intermediate number as a choice is a " +
              "warning.",
            why:
              "ACT seeds the classic slip results so a careless solver lands on a " +
              "wrong choice that feels right.",
            example:
              "Forget to halve the diameter and you'll find that exact wrong area " +
              "sitting among the choices.",
            caution:
              "Slow down on the last step and the units. Re-read what quantity is " +
              "requested.",
          },
          {
            name: "Figures aren't guaranteed to scale — use given numbers",
            sign:
              "Unlike the SAT's default, ACT figures are not promised to be to " +
              "scale. Rely on the labeled measurements and relationships, not the " +
              "drawing's appearance.",
            why:
              "Eyeballing an ACT figure can mislead you because proportions may " +
              "be distorted.",
            example:
              "An angle that looks 90° may not be; only trust it if the figure or " +
              "text marks it as a right angle.",
            caution:
              "You can still use a figure for general layout and which points " +
              "connect — just not for precise measurement.",
          },
          {
            name: "Answer choices reveal the intended method",
            sign:
              "The form of the choices hints at the expected work: fractions " +
              "suggest exact arithmetic, π in the choices signals a circle " +
              "formula, radicals suggest the Pythagorean theorem or special " +
              "triangles.",
            why:
              "Reading the choices first tells you which tool the problem wants, " +
              "saving setup time.",
            example:
              "Choices full of √2 and √3 point to 45-45-90 or 30-60-90 triangle " +
              "ratios.",
            caution:
              "Let the choices guide, not dictate. Confirm the method actually " +
              "fits the given information.",
          },
        ],
      },
    ],
  };
})();
