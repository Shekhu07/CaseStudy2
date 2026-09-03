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
 * SCOPE - 15 required questions + 5 optional (20 total), across 6 pages, ~5
 * minutes. (The optional five are the "didn't reach this / didn't do this"
 * items plus the two sample-description questions at the end - not required
 * because a respondent can validly never hit those screens.)
 *
 * FEATURE COVERAGE - every bullet in the page-1 "What this prototype
 * offers" block has a question that tests it: search-reconnection (Q2),
 * the confidence/fit signal (Q5, Q7, Q9), recovery from an unavailable size
 * (Q11), comparison (Q14), pairing (Q15), the tap-to-buy decision point
 * (Q12). Nothing was added to that page-1 list without a question behind it.
 *
 * There is no upfront "what did you do just now?" checklist. It used to
 * exist solely to give every later task-specific question a safe
 * "didn't do this" out instead of Google Forms branching - but every
 * task-specific question already carries its own such option directly
 * (Q2's "I didn't have anything saved that matched," Q11's "I didn't run
 * into this," Q14-15's "I didn't compare"/"I didn't see one" - note that
 * page 3's Q5-Q10 carry no such out, which is why prototype-usability-survey.md
 * requires the Q2 cross-tab exclusion at analysis time), so the
 * checklist was pure redundancy asked before the respondent had answered
 * anything else. Dropped, not replaced - no branching logic depended on it.
 *
 * BLIND-TESTING PASS - two questions used to name the "correct" answer
 * inside their own options (decision vs. "just a pop-up"; different vs.
 * "same as a reminder"), which primes the respondent toward the flattering
 * answer before they've formed their own impression. Both are now asked
 * neutrally - see prototype-usability-survey.md, "Blind-testing pass" - and
 * two of the prose-labeled ordinal questions are now true addScaleItem
 * Likert scales (1-5) instead of custom-labeled multiple choice, so they can
 * be read back as a mean rather than just a distribution of radio buttons.
 *
 * Unlike create-wishlist-form.gs, this is NOT about a respondent's real
 * wishlist - it is a post-task usability instrument for panel testers who
 * have just spent a few minutes on the LIVE prototype
 * (wishlist-reconnection-prototype.vercel.app) using its fixed demo catalog
 * and seeded 30-item wishlist. See prototype-usability-survey.md for the full
 * rationale; the short version:
 *
 *   Q2   found a saved item while searching        -> L1, reconnection view rate
 *   Q3   understood WHY it appeared                 -> panel-sizing.md's own >=80% target
 *   Q5   decision confidence                          -> L2, doubt-resolution (self-report), true 1-5 scale item
 *   Q6   good enough to decide, or still checking elsewhere -> L2, doubt-resolution (self-report)
 *   Q7   did the screen resolve the doubt             -> new 1-5 scale item, direct answer to constraint 2/3
 *   Q8   matched, exceeded or fell short of the page-1 description -> recovers some of the blind-testing
 *                                                       signal given up by "What this prototype offers"
 *   Q9   gaps, in their own words                     -> L2, doubt-resolution (self-report)
 *   Q10  which doubt is actually holding them back   -> closed-choice replay of the corpus's own
 *                                                       named-doubt taxonomy (fit 46.2%, trust 9.7%,
 *                                                       Part 2) - lets self-report be tallied straight
 *                                                       against the corpus split, not just read for quotes
 *   Q11  recovery from an unavailable variant        -> panel-sizing.md's named usability Q
 *   Q12  what happened on tap-to-buy, asked neutrally -> tests README Improvement 3, blind (no "correct" option named)
 *   Q13  which action noticed/tapped first            -> self-report half of the S4.4 swapped-fill check
 *   Q14-15 comparison and pairing                     -> Compare screen thesis + provisional pairing evidence
 *   Q16  standalone usefulness, no reminder comparison -> the CS1 test, asked blind - the free text right
 *                                                       after it is where an unprompted "just like a
 *                                                       reminder" comparison can surface on its own
 *   Q18  real revisit trigger, off the demo           -> panel-scale check of Part 2 SS2.4's
 *                                                       "revisit is already served by notifications"
 *                                                       assumption - the same thing interview-guide.md
 *                                                       Q6 asks 6 people, asked here at n=300-500
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

  // The numbered task steps live only in the "Before you start" section
  // header below, not here too - this description used to repeat them, so
  // page 1 showed the same four steps twice. Kept short: welcome, link,
  // anonymity note. The steps themselves are what needed to survive
  // scrolling, and a page-1 form item does that; this banner text doesn't.
  form.setDescription(
    "Thanks for trying the prototype - a few minutes, then some quick questions:\n\n" +
      PROTOTYPE_URL + "\n\n" +
      "About 5 minutes total. Anonymous - no email, no name. Used only for a " +
      "student case study, reported as group totals only, never your own " +
      "answers alone.",
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

  // A form item, not just the top-of-form description - it stays part of
  // the question flow on page 1 instead of scrolling away the moment the
  // page loads, which is what the plain setDescription() text does on a
  // phone. addSectionHeaderItem() doesn't add a page break, so this and the
  // consent checkbox below are still both page 1.
  form
    .addSectionHeaderItem()
    .setTitle("Before you start")
    .setHelpText(
      "Open the prototype in another tab, try the steps below, then come " +
        "back here:\n\n" +
        PROTOTYPE_URL + "\n\n" +
        "  1. Search: shirt, jeans, kurta, or handbag.\n" +
        "  2. Tap a saved item that shows up. Look at what's shown.\n" +
        "  3. Try to add it to your bag or buy it. If a size or the item is " +
        "out, see what happens next.\n" +
        "  4. Time permitting: open two similar saved items and compare them.\n\n" +
        "About 5 minutes total, including the questions below.",
    );

  // Plain-language feature list, sourced from the prototype's own README
  // (~/MVP_OPUS/README.md) - stripped of internal names (DC-01, E12, gate
  // labels) since a respondent doesn't need them. NOTE: this trades away
  // blind status on Q3, Q5, Q7, Q11 and Q14 - see prototype-usability-survey.md,
  // "What this prototype offers" - stated once here, not re-flagged per
  // question below.
  form
    .addSectionHeaderItem()
    .setTitle("What this prototype offers")
    .setHelpText(
      "A few things to look out for while you try it:\n\n" +
        "  - Finds items you already saved when you search for something " +
        "similar, instead of you having to remember and dig through your " +
        "wishlist.\n" +
        "  - Shows why it's a good match and what's still uncertain (fit, " +
        "availability), not just a plain product card.\n" +
        "  - If your saved size or item isn't available, gives you real " +
        "next steps instead of a dead end.\n" +
        "  - Lets you compare a few saved items side by side, sorted by " +
        "what matters most to you.\n" +
        "  - Suggests other saved items that would pair well with the one " +
        "you're looking at.\n" +
        "  - When you add or buy something, gives you real next moves - " +
        "not just a confirmation message that disappears.",
    );

  form
    .addCheckboxItem()
    .setTitle("OK to use your anonymous answers in a student case study?")
    .setHelpText("Prototype link, if you need it again: " + PROTOTYPE_URL)
    .setChoiceValues(["Yes"])
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
    .setTitle("Did you find something you'd saved earlier while searching?")
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
    .setTitle("Did you understand why it appeared?")
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

  // True 1-5 Likert scale (not custom-labeled multiple choice) so this can
  // be read back as a mean, not just a distribution.
  form
    .addScaleItem()
    .setTitle("How confident did that screen make you feel about buying it or not?")
    .setBounds(1, 5)
    .setLabels("Not at all confident", "Extremely confident")
    .setRequired(true);

  // The sharpest question on the form. "Helped, but I'd still check
  // elsewhere" is a partial L2 failure even if the confidence score above
  // came back high.
  form
    .addMultipleChoiceItem()
    .setTitle("Was that enough to decide, or would you still check elsewhere?")
    .setChoiceValues([
      "Good enough to decide",
      "Helped, but I'd still check somewhere else",
      "Not really useful",
    ])
    .setRequired(true);

  // New scale item - the direct, quantifiable answer to "did the solution
  // address the pain point," asked as a claim to agree/disagree with rather
  // than folded into the confidence or good-enough questions above. Plain-
  // language pass: "cleared up what I was unsure about" reads easier than
  // "addressed what was making me unsure about the item."
  form
    .addScaleItem()
    .setTitle("This screen cleared up what I was unsure about.")
    .setBounds(1, 5)
    .setLabels("Strongly disagree", "Strongly agree")
    .setRequired(true);

  // Recovers some of the blind-testing signal given up by "What this
  // prototype offers" on page 1 (see prototype-usability-survey.md). It
  // can't undo the fact that the respondent was told what to expect, but it
  // separates "this matched the description" from "this genuinely told me
  // more than the description did" - the second is a real finding, the
  // first mostly confirms the copy on page 1 was accurate.
  form
    .addMultipleChoiceItem()
    .setTitle("Compared to what page 1 described, was this screen...")
    .setChoiceValues([
      "About what I expected",
      "More than I expected",
      "Less than I expected",
      "I didn't read page 1 closely",
    ])
    .setRequired(true);

  // Same test wishlist-survey.md's Q9 runs on the idea of a fix, now run on
  // the actual one. If the answer names something the screen already said,
  // that's a UI/legibility problem. If it names something the screen
  // genuinely does not say, the module has a real gap.
  form
    .addParagraphTextItem()
    .setTitle("What would you still need to know before you'd buy it or delete it?")
    .setHelpText("Whatever would actually settle it. One line is fine.")
    .setRequired(true);

  // Closed-choice replay of the corpus's own named-doubt taxonomy (Part 2:
  // fit 46.2% of every named doubt, trust 9.7%, return-friction, price).
  // The free-text question above catches gaps the screen doesn't cover; this
  // one turns the same moment into a number that lines up directly against
  // the corpus split, so a mismatch (say, price dominating self-report while
  // the corpus says fit) is a tally, not something that needs re-coding
  // free text to see. showOtherOption keeps an escape hatch without a branch.
  form
    .addMultipleChoiceItem()
    .setTitle("What's the main thing still holding you back on this item?")
    .setChoiceValues([
      "Not sure it will fit me",
      "Not sure it's good quality or genuine",
      "Still thinking about the price",
      "Returning it would be a hassle if I got it wrong",
      "Nothing - I've already decided",
    ])
    .showOtherOption(true)
    .setRequired(true);

  /* ---------------------------- Page 4 ----------------------------
   * Recovery and mechanics.
   * ---------------------------------------------------------------- */

  form.addPageBreakItem().setTitle("If something wasn't available");

  form
    .addMultipleChoiceItem()
    .setTitle("If your size or item wasn't available, was it clear what to do next?")
    .setChoiceValues([
      "Yes, totally clear",
      "Somewhat clear",
      "Confusing",
      "I didn't run into this",
    ])
    .setRequired(true);

  // Tests README Improvement 3 ("the add is a decision point with three real
  // next moves, not a toast that vanishes") without naming either outcome as
  // the good one - blind-testing pass, see prototype-usability-survey.md.
  form
    .addMultipleChoiceItem()
    .setTitle("What happened when you tapped to buy or save it?")
    .setChoiceValues([
      "It opened next steps or choices for me to pick from",
      "It showed a brief confirmation and that was it",
      "Not sure / don't remember",
    ])
    .setRequired(true);

  // Self-report companion to the S4.4 swapped-fill click telemetry. Treat a
  // mismatch between this answer and the logged click as a finding, not an
  // error - see prototype-usability-survey.md.
  form
    .addTextItem()
    .setTitle('"Buy from Wishlist" or "Compare options" - which did you notice or tap first, and why?')
    .setHelpText("One sentence. Leave blank if you didn't reach this screen.")
    .setRequired(false);

  /* ---------------------------- Page 5 ----------------------------
   * Comparison and pairing - optional tasks, so every question here carries
   * a "didn't do this" out rather than a branch.
   * ---------------------------------------------------------------- */

  form.addPageBreakItem().setTitle("Comparing and pairing");

  form
    .addMultipleChoiceItem()
    .setTitle("If you compared two items, did sorting them by what mattered to you actually help?")
    .setChoiceValues([
      "Yes, it helped me decide",
      "No, it just moved things around without helping",
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
   * Overall - the CS1 test, asked blind. The "reminder" comparison is the
   * researcher's frame, not the respondent's, so it no longer appears in a
   * question they see - see prototype-usability-survey.md, "Blind-testing
   * pass." A genuine "this is just like a reminder" reaction can still
   * surface unprompted in the free text right below, which is a stronger
   * signal than asking them to confirm a comparison they were handed.
   * ---------------------------------------------------------------- */

  form.addPageBreakItem().setTitle("Overall");

  form
    .addScaleItem()
    .setTitle("Overall, this was useful to me on its own.")
    .setBounds(1, 5)
    .setLabels("Strongly disagree", "Strongly agree")
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("One sentence: what would make this actually useful for you?")
    .setRequired(false);

  // Off the demo, deliberately. Part 2 SS2.4 assumes revisit is "already
  // served by notifications and price-drop alerts" - that assumption has had
  // zero interview sessions run against it as of the last STATUS.md update.
  // This is the same question interview-guide.md asks 6 people, asked here
  // at panel scale, about real wishlists rather than the seeded demo. If most
  // people tick "I go looking on my own", that is a direct contradiction of
  // the notifications assumption, at a sample size the interviews can't reach
  // before the deadline.
  form
    .addCheckboxItem()
    .setTitle("On your real wishlists (not this demo), what actually brings you back to look at a saved item?")
    .setHelpText("Check all that apply. Think about the last few times, not in general.")
    .setChoiceValues([
      "A notification or price-drop alert",
      "I go looking on my own, without any reminder",
      "Someone else mentions it or sends me something similar",
      "I mostly don't go back to things I've saved",
    ])
    .setRequired(true);

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
