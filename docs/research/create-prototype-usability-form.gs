/**
 * Builds the prototype usability survey as a Google Form.
 *
 * HOW TO RUN
 *   1. https://script.google.com  ->  New project
 *   2. Delete the sample code, paste this file in, Save
 *   3. Run  ->  createPrototypeUsabilityForm
 *   4. Authorise (your own account, creating your own form)
 *   5. View -> Logs for the live and edit URLs
 *
 * Re-running creates a SECOND form on a new URL. There is no
 * update-prototype-usability-form.gs yet; if this form is already live and
 * collecting responses, copy the patching pattern from
 * docs/research/update-wishlist-form.gs rather than re-running this file.
 *
 * ---------------------------------------------------------------------------
 * SCOPE - 15 required questions + 2 optional, across 6 pages, ~4 minutes.
 *
 * Unlike create-wishlist-form.gs, this is NOT about a respondent's real
 * wishlist - it is a post-task usability instrument for panel testers who
 * have just spent a few minutes on the LIVE prototype
 * (wishlist-reconnection-prototype.vercel.app) using its fixed demo catalog
 * and seeded 30-item wishlist. See prototype-usability-survey.md for the full
 * rationale; the short version:
 *
 *   Q3   found a saved item while searching        -> L1, reconnection view rate
 *   Q4   understood WHY it appeared                 -> panel-sizing.md's own >=80% target
 *   Q6-8 decision confidence / good enough / gaps    -> L2, doubt-resolution (self-report)
 *   Q9   recovery from an unavailable variant        -> panel-sizing.md's named usability Q
 *   Q10  decision vs. confirmation-toast              -> tests README Improvement 3 directly
 *   Q11  which action noticed/tapped first            -> self-report half of the S4.4 swapped-fill check
 *   Q12-13 comparison and pairing                     -> Compare screen thesis + provisional pairing evidence
 *   Q14  "reminder or different"                      -> the CS1 test, asked straight
 *
 * No branching, unlike the wishlist form. Every respondent used the same
 * seeded demo, so task-specific questions carry a "didn't do this" /
 * "didn't run into this" option instead of a page skip - branching is the
 * most fragile part of the Forms API (see update-form-runbook.md) and this
 * form is meant to run unmoderated at panel scale, where a silently broken
 * branch costs the most responses before anyone notices.
 * ---------------------------------------------------------------------------
 */

function createPrototypeUsabilityForm() {
  var form = FormApp.create("Five minutes on the prototype");

  // The live prototype URL, named once so the description, the consent
  // question's help text and the confirmation screen all stay in sync - the
  // link is repeated in three places because Google Forms renders plain
  // description text and help text as unstyled paragraphs, and a bare domain
  // without a scheme is not reliably auto-linked by every client. Using the
  // full https:// form on its own line is what makes it clickable rather
  // than just readable.
  var PROTOTYPE_URL = "https://wishlist-reconnection-prototype.vercel.app";

  form.setDescription(
    "Thanks for trying the prototype. Before answering, please spend a few minutes on " +
      "it with these tasks:\n\n" +
      "Open the prototype here:\n" +
      PROTOTYPE_URL + "\n\n" +
      "  1. Search for one of: shirt, jeans, kurta, handbag.\n" +
      "  2. If something you'd saved shows up, tap into it and look at what's shown.\n" +
      "  3. Try to add it to your bag or buy it - and if a size or the item itself " +
      "isn't available, see what the app does next.\n" +
      "  4. If you have time, open two similar saved items and compare them.\n\n" +
      "Then come back here. It's about 4 minutes, 15 required questions.\n\n" +
      "Completely anonymous - no email, no name. Used only for a student case study " +
      "and reported as aggregate numbers.",
  );

  applySetting(form, "setProgressBar", true);
  applySetting(form, "setShuffleQuestions", false);
  applySetting(form, "setCollectEmail", false);
  applySetting(form, "setLimitOneResponsePerUser", false);
  applySetting(form, "setAllowResponseEdits", false);
  applySetting(form, "setShowLinkToRespondAgain", false);

  // Repeated here, not just in the description, so it is still visible at
  // the exact moment someone is about to tick consent and start - the
  // description scrolls out of view on a phone once the questions begin.
  applySetting(form, "setConfirmationMessage",
    "Thanks! If you'd like to explore the prototype again, it's here: " + PROTOTYPE_URL,
  );

  /* ---------------------------- Page 1 ---------------------------- */

  form
    .addCheckboxItem()
    .setTitle(
      "Happy for your anonymous answers to be used in a student case study?",
    )
    .setHelpText("Prototype link, if you need it again: " + PROTOTYPE_URL)
    .setChoiceValues(["Yes"])
    .setRequired(true);

  // Frames every later question with a safe "didn't do this" instead of a
  // branch. No navigation is attached, so this cannot fail the way the
  // wishlist form's branching can.
  form
    .addCheckboxItem()
    .setTitle("Which of these did you manage to do just now? Tick all that apply.")
    .setChoiceValues([
      "Found something I'd saved earlier while searching",
      "Opened it and looked at the details shown",
      "Tried to add it to my bag or buy it",
      "Compared it against a similar saved item",
      "None of the above - I did something else",
    ])
    .setRequired(true);

  /* ---------------------------- Page 2 ----------------------------
   * Comprehension. Always shown - everyone attempted the search task.
   * ---------------------------------------------------------------- */

  form
    .addPageBreakItem()
    .setTitle("Finding what you'd saved")
    .setHelpText("About the search you just ran.");

  form
    .addMultipleChoiceItem()
    .setTitle("Were you able to find something you had saved earlier while searching?")
    .setChoiceValues([
      "Yes, easily",
      "Yes, but I had to look for it",
      "No, I didn't notice it",
      "I didn't have anything saved that matched what I searched",
    ])
    .setRequired(true);

  // The panel-sizing.md >=80% comprehension target lands directly on this
  // question's top option.
  form
    .addMultipleChoiceItem()
    .setTitle("When it appeared, did you understand why it was being shown to you?")
    .setChoiceValues(["Yes, clearly", "Sort of", "No, not really"])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("What, if anything, was confusing about it?")
    .setHelpText('Skip this if you answered "Yes, clearly" above.')
    .setRequired(false);

  /* ---------------------------- Page 3 ----------------------------
   * Decision confidence - the self-report half of doubt-resolution (L2),
   * and the "good enough for your goal" question this round was asked for.
   * ---------------------------------------------------------------- */

  form
    .addPageBreakItem()
    .setTitle("Deciding on that item")
    .setHelpText("Still about the item you opened.");

  form
    .addMultipleChoiceItem()
    .setTitle(
      "How confident did the information on screen make you feel about buying it or not?",
    )
    .setChoiceValues([
      "Not at all confident",
      "A little confident",
      "Somewhat confident",
      "Confident",
      "Extremely confident",
    ])
    .setRequired(true);

  // The sharpest question on the form. "Helped, but I'd still check
  // elsewhere" is a partial L2 failure even if the confidence score above
  // came back high.
  form
    .addMultipleChoiceItem()
    .setTitle(
      "Was that information good enough to decide, or would you still check elsewhere?",
    )
    .setChoiceValues([
      "Good enough to decide",
      "Helped, but I'd still check somewhere else",
      "Not really useful",
    ])
    .setRequired(true);

  // Same test wishlist-survey.md's Q9 runs on the idea of a fix, now run on
  // the actual one. If the answer names something the screen already said,
  // that's a UI/legibility problem. If it names something the screen
  // genuinely does not say, the module has a real gap.
  form
    .addParagraphTextItem()
    .setTitle(
      "What, if anything, would you still need to know before you'd buy it or delete it?",
    )
    .setHelpText("Whatever would actually settle it. One line is fine.")
    .setRequired(true);

  /* ---------------------------- Page 4 ----------------------------
   * Recovery and mechanics.
   * ---------------------------------------------------------------- */

  form.addPageBreakItem().setTitle("If something wasn't available");

  form
    .addMultipleChoiceItem()
    .setTitle(
      "If your saved size or the item itself wasn't available, was it clear what to do next?",
    )
    .setChoiceValues([
      "Yes, totally clear",
      "Somewhat clear",
      "Confusing",
      "I didn't run into this",
    ])
    .setRequired(true);

  // Tests README Improvement 3 directly: "the add is a decision point with
  // three real next moves, not a toast that vanishes."
  form
    .addMultipleChoiceItem()
    .setTitle(
      "When you tapped to buy or save from that module, did it feel like reaching a real decision, or just seeing a confirmation message?",
    )
    .setChoiceValues([
      "A real decision, with clear next steps",
      "Just a confirmation message",
      "Not sure",
    ])
    .setRequired(true);

  // Self-report companion to the S4.4 swapped-fill click telemetry. Treat a
  // mismatch between this answer and the logged click as a finding, not an
  // error - see prototype-usability-survey.md.
  form
    .addTextItem()
    .setTitle(
      'Which did you notice or tap first - "Buy from Wishlist" or "Compare options" - and why?',
    )
    .setHelpText("One sentence is fine. Leave blank if you didn't reach this screen.")
    .setRequired(false);

  /* ---------------------------- Page 5 ----------------------------
   * Comparison and pairing - optional tasks, so every question here carries
   * a "didn't do this" out rather than a branch.
   * ---------------------------------------------------------------- */

  form.addPageBreakItem().setTitle("Comparing and pairing");

  form
    .addMultipleChoiceItem()
    .setTitle(
      "If you compared two saved items, did reordering by what mattered to you actually help, or did it just reshuffle the same information?",
    )
    .setChoiceValues([
      "It helped me decide",
      "It just reshuffled the same information",
      "I didn't notice a difference",
      "I didn't compare two items",
    ])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle(
      'If a "complete the look" or pairing suggestion appeared, was it useful?',
    )
    .setChoiceValues([
      "Yes, it suggested something I'd actually pair it with",
      "It appeared but didn't feel relevant",
      "I didn't see one",
    ])
    .setRequired(true);

  /* ---------------------------- Page 6 ----------------------------
   * Overall, and the CS1 test asked straight.
   * ---------------------------------------------------------------- */

  form.addPageBreakItem().setTitle("Overall");

  form
    .addMultipleChoiceItem()
    .setTitle(
      "Overall, did this feel different from a normal reminder to go check your wishlist?",
    )
    .setChoiceValues([
      "Different, in a useful way",
      "Different, but not obviously better",
      "Basically the same as a reminder",
    ])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("One sentence - what's the one thing that would make this actually useful for you?")
    .setRequired(false);

  // Optional, same convention as wishlist-survey.md: describes the sample
  // and feeds no analysis, so it is not required.
  form
    .addMultipleChoiceItem()
    .setTitle("Age")
    .setChoiceValues(["Under 18", "18-24", "25-32", "33-40", "Over 40"])
    .setRequired(false);

  form.addTextItem().setTitle("Which city?").setRequired(false);

  Logger.log("Share this link:  " + form.getPublishedUrl());
  Logger.log("Edit it here:     " + form.getEditUrl());
}

/**
 * Calls form[name](value) if that method exists, and logs instead of
 * throwing if it does not. Used only for presentation settings.
 */
function applySetting(form, name, value) {
  if (typeof form[name] !== "function") {
    Logger.log(
      "Skipped " + name + " - not available in this version of the Forms API.",
    );
    return;
  }
  try {
    form[name](value);
  } catch (err) {
    Logger.log("Skipped " + name + " - " + err.message);
  }
}
