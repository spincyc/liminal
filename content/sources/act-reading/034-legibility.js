"use strict";

// Fact-check: Context-dependent line-length effects: https://journals.uc.edu/index.php/vl/article/view/5671

module.exports = {
  id: "act-reading-p034",
  type: "humanities",
  title: "The Reading Machine",
  intro: "This original passage discusses typography and the research into legibility.",
  content: `Anybody who has designed a page has been told that serif type is easier to read than
sans serif, that the small strokes finishing each letter guide the eye along the line. It is
the most durable claim in typography and the evidence for it is thin to the point of
embarrassment.

The claim can be traced. It appears in trade manuals from the 1920s, is repeated without
citation through the middle of the century, and is attached, when a source is given at all,
to a handful of studies from the 1920s and 1930s whose method would not now be accepted.
Those studies typically compared a serif face with a sans face at the same nominal point
size — which is not the same visual size, since faces of one point size differ substantially
in the height of their lowercase letters — and measured reading speed on passages short
enough that a difference of a few words a minute could arise from anything at all.

When the comparison is made properly, controlling for the height of the lowercase, the
spacing between letters, the length of the line, and the reader's prior exposure, the
difference between serif and sans serif is small and inconsistent in direction. Some studies
find one faster; some find the other; most find nothing worth reporting. The variable that
does show a large and repeatable effect is familiarity. Readers are fastest with the faces
they read most, and what they read most changes by decade and by medium, which is enough on
its own to explain the pattern of results across a century of studies.

This is not an argument that typography does not matter. Arrangement can affect reading
even when letter shape is held constant. Line length is one example: in some layouts,
excessively long lines can reduce accuracy in finding the next line, while very short
ones repeatedly interrupt a sentence. There is no universal character count that gives
every reader the best result. Screen movement, text size, task, and reading conditions
can change both performance and preference, and the layout people prefer is not always
the one they read fastest. Spacing between lines is another variable: crowding can make
tracking difficult, while excessive separation can weaken the visible grouping of a
paragraph. Contrast between text and background also matters, particularly for readers
whose vision makes low-contrast text hard to distinguish. These are reasons to test a
layout in its intended setting, not a formula for ranking every possible page. The
resulting findings are boring: they concern arrangement rather than the distinctive
shapes of letters. Yet findings that hold up for the readers and conditions being
studied provide dependable practical guidance. Their lack of glamour does not diminish
the value of a repeatable improvement in how somebody reads.

There is a further reason the serif claim survived, and it is worth naming because it
applies well beyond type. The claim is useful. A designer arguing for a decision needs a
reason that sounds like a fact, and "serifs guide the eye" is a better sentence in a meeting
than "I prefer this one." Claims that settle arguments cheaply are selected for, and they
persist in a field regardless of their evidential standing, because the thing they are
useful for is not being true.

The honest position is more demanding and less quotable. Legibility is a relation between a
typeface, a size, a medium, a purpose, and a reader, and no property of the letters alone
determines it. A face that performs well set at eleven points on coated paper may fail on a
low-resolution screen, and a face designed for a road sign read at speed by a driver has
requirements that have nothing in common with a face for a novel. The question "is this
typeface legible" has no answer. The question "is this typeface legible at this size, in
this medium, for this reader, doing this" has an answer, and it usually has to be tested
rather than argued.`,
  questions: [
    {
      subskill: "main idea",
      family: "central-claim",
      difficulty: "Medium",
      stem: "The passage argues chiefly that:",
      key: "legibility depends on conditions rather than letter shape.",
      wrong: [
        ["sans serif faces are easier to read than serif faces.", "The passage says the difference is small and inconsistent in direction."],
        ["typographic choices have little effect on reading at all.", "The passage names line length, spacing, and contrast as large effects."],
        ["early legibility studies were deliberately misreported.", "Their method is criticised, but no dishonesty is alleged."],
      ],
      why: "The final paragraph says legibility \"is a relation between a typeface, a size, a medium, a purpose, and a reader, and no property of the letters alone determines it.\"",
      steps: [
        "Find the sentence defining legibility in the last paragraph.",
        "Check that the option leaves room for the effects the fourth paragraph reports.",
      ],
      hint: "The closing paragraph reformulates the question itself.",
    },
    {
      subskill: "locate detail",
      family: "stated-detail",
      difficulty: "Easy",
      stem: "According to the passage, the early studies compared faces set at:",
      key: "the same nominal point size.",
      wrong: [
        ["the same lowercase letter height.", "That is the control the passage says proper comparisons require."],
        ["the same line length in characters.", "Line length is discussed later as an effect in its own right."],
        ["the same contrast against the page.", "Contrast is raised in a different paragraph, not in the criticism."],
      ],
      why: "The passage says those studies \"typically compared a serif face with a sans face at the same nominal point size — which is not the same visual size.\"",
      steps: [
        "Find the sentence describing the old method.",
        "Take the quantity it says was held equal.",
      ],
      hint: "The complaint is that this quantity is not visual size.",
    },
    {
      subskill: "cause and effect",
      family: "cause-of-a-result",
      difficulty: "Easy",
      stem: "The passage identifies a possible cost of excessively long lines in some layouts as reduced:",
      key: "accuracy in finding the next line.",
      wrong: [
        ["speed in recognising individual letters.", "Letter recognition is not what long lines are said to affect."],
        ["the ability to judge a paragraph's length.", "No effect on judging paragraph size is described."],
        ["contrast between the text and the page.", "Contrast is a separate variable discussed elsewhere."],
      ],
      why: "The passage says that excessively long lines can reduce accuracy in finding the next line in some layouts. It qualifies this as a context-dependent effect rather than a universal character-count rule.",
      steps: [
        "Locate the example concerning excessively long lines.",
        "Identify the particular reading action that the passage says can become less accurate.",
      ],
      hint: "Look for the difficulty of moving from one line to the next.",
    },
    {
      subskill: "connotation",
      family: "connotative-attitude",
      difficulty: "Easy",
      stem: "In describing the findings about arrangement as “boring,” the author conveys an attitude of:",
      key: "little excitement coupled with respect for their reliability.",
      wrong: [
        ["irritation at claims that have never been tested properly.", "The author values findings that hold up for the readers and conditions studied; the word does not criticise a lack of testing."],
        ["dismissal of results too obvious to deserve further attention.", "The surrounding sentence stresses the findings’ dependable practical effect rather than dismissing them."],
        ["regret that the findings have attracted so much public interest.", "The passage does not describe public interest in these findings or regret about their reception."],
      ],
      why: "The passage calls the findings “boring” because they concern ordinary arrangement, then praises dependable practical guidance and repeatable improvements. The word conveys little glamour within an approving judgment of their value.",
      steps: [
        "Identify the negative association of the word boring.",
        "Read the surrounding praise of reliable effects.",
        "Combine the muted excitement with the author’s respect for the findings.",
      ],
      hint: "The author’s lack of excitement does not amount to a lack of respect.",
    },
    {
      subskill: "logical inference",
      family: "supported-inference",
      difficulty: "Medium",
      stem: "The passage implies that a study finding serif faces faster in 1935 and slower in 2015 would:",
      key: "be consistent with familiarity driving the result.",
      wrong: [
        ["show that one of the two studies was fraudulent.", "The passage explains shifting results without alleging misconduct."],
        ["prove that letter shape has no effect whatever.", "The passage says the difference is small, not that it is absent."],
        ["indicate that reading speed has declined over time.", "No claim about changes in overall reading speed is made."],
      ],
      why: "The passage says readers \"are fastest with the faces they read most, and what they read most changes by decade and by medium, which is enough on its own to explain the pattern of results across a century of studies.\"",
      steps: [
        "Find the variable the passage says has a large repeatable effect.",
        "Ask what that variable predicts about results in different decades.",
      ],
      hint: "One factor changes with time and medium.",
    },
    {
      subskill: "function",
      family: "function-of-a-paragraph",
      difficulty: "Medium",
      stem: "The fourth paragraph functions in the passage mainly to:",
      key: "prevent the argument from proving too much.",
      wrong: [
        ["supply the evidence for the serif claim.", "The paragraph concerns arrangement rather than letter shape."],
        ["explain why early studies used short passages.", "The short passages are criticised in the second paragraph."],
        ["show that older readers read more slowly.", "The paragraph describes difficulty with low-contrast text without establishing that older readers generally read more slowly."],
      ],
      why: "The fourth paragraph opens by rejecting the conclusion that typography does not matter. It explains how arrangement can have useful effects in the intended reading setting, keeping the criticism of a simple serif rule from becoming a dismissal of all typography.",
      steps: [
        "Read the paragraph's opening sentence.",
        "Ask what conclusion it is written to block.",
      ],
      hint: "The paragraph starts by denying something.",
    },
    {
      subskill: "claims and evidence",
      family: "claim-and-support",
      difficulty: "Medium",
      stem: "Which detail best supports the passage's charge that the early studies were poorly designed?",
      key: "Their passages were too short to detect a real difference.",
      wrong: [
        ["Their results were repeated without citation for decades.", "This concerns how the claim spread, not how the studies were run."],
        ["Their authors worked before modern screens existed.", "The era of the work is not itself a methodological fault."],
        ["Their findings have since been contradicted by others.", "Later disagreement is evidence about the claim, not about the method."],
      ],
      why: "The passage says the passages were \"short enough that a difference of a few words a minute could arise from anything at all,\" alongside the failure to equalise visual size.",
      steps: [
        "Separate criticisms of the studies from criticisms of the claim's transmission.",
        "Choose the detail describing something done inside a study.",
      ],
      hint: "A design flaw has to be something in the experiment.",
    },
    {
      subskill: "reasoning",
      family: "evaluating-an-explanation",
      difficulty: "Hard",
      stem: "The passage's explanation for why the serif claim survived rests on the idea that a claim can persist because it:",
      key: "does a job unrelated to whether it is correct.",
      wrong: [
        ["is easier to test than the alternatives are.", "The passage says the honest position has to be tested, not that the claim was."],
        ["was published in the most respected journals.", "Trade manuals, not journals, are named as the source."],
        ["is supported by the experience of most readers.", "No appeal to readers' own impressions is made in the passage."],
      ],
      why: "The passage says \"claims that settle arguments cheaply are selected for, and they persist in a field regardless of their evidential standing, because the thing they are useful for is not being true.\"",
      steps: [
        "Identify what the passage says the claim is useful for.",
        "Note that the usefulness is separate from its truth.",
        "Reject options that appeal to evidence or authority.",
      ],
      hint: "The explanation is about what the sentence accomplishes in a meeting.",
      trap: "Reading the account of the claim's survival as a claim about its evidence.",
    },
    {
      subskill: "strengthen or weaken",
      family: "weakening-a-position",
      difficulty: "Hard",
      stem: "Which finding, if true, would most weaken the passage's position?",
      key: "Serif faces stay faster once familiarity is equalised.",
      wrong: [
        ["Readers report preferring serif faces for long books.", "Stated preference is not the measure the passage is discussing."],
        ["Line length effects are smaller on screens than on paper.", "A weaker effect for one variable does not restore the serif claim."],
        ["Early studies were funded by makers of serif typefaces.", "This would strengthen the passage's scepticism, not weaken it."],
      ],
      why: "The passage's case is that once visual size, spacing, line length, and exposure are controlled, the serif difference is \"small and inconsistent in direction.\" A durable advantage under those controls would contradict it directly.",
      steps: [
        "State what the passage predicts happens under proper controls.",
        "Look for the finding that would falsify that prediction.",
        "Reject findings that support the passage or address other variables.",
      ],
      hint: "The weakening finding must survive the controls the passage names.",
      trap: "Choosing a fact that discredits the old studies, which is the passage's own position.",
    },
    {
      subskill: "author's purpose",
      family: "purpose-of-a-passage",
      difficulty: "Medium",
      stem: "The author contrasts two versions of the question about a typeface in order to:",
      key: "show that the useful question specifies conditions.",
      wrong: [
        ["argue that legibility cannot be measured at all.", "The passage says the fuller question has an answer that can be tested."],
        ["recommend that designers stop consulting research.", "The passage recommends testing, which is research."],
        ["establish that road signs are the hardest case.", "Road signs are one example of differing requirements."],
      ],
      why: "The passage says \"the question 'is this typeface legible' has no answer,\" while the version naming size, medium, reader, and task \"has an answer, and it usually has to be tested rather than argued.\"",
      steps: [
        "Compare the two questions as the passage states them.",
        "Note what the second adds and what the passage says follows.",
      ],
      hint: "One question is missing everything the last paragraph listed.",
    },
    {
      subskill: "organization",
      family: "passage-structure",
      difficulty: "Hard",
      stem: "The passage develops its case by moving from:",
      key: "a claim, its weak evidence, what does matter, and why it survives.",
      wrong: [
        ["a definition, two examples, and a practical recommendation.", "The passage does not open with a definition; legibility is defined at the end."],
        ["a history of typography followed by a survey of research.", "No history of the craft is given, only of one claim."],
        ["two opposing positions and a judgement between them.", "Only one claim is examined; no rival position is set against it."],
      ],
      why: "The passage states the serif claim, traces and faults its evidence, identifies variables with real effects, explains why the claim persists, and closes by reformulating the question.",
      steps: [
        "Label each paragraph with the job it performs.",
        "Check the sequence in the option against those labels.",
        "Reject options describing structures the passage does not have.",
      ],
      hint: "The fifth paragraph asks a different kind of question from the first four.",
      trap: "Assuming a critical essay must be structured as a debate.",
    },
  ],
};
