/**
 * Builds the wishlist survey as a Google Form.
 *
 * HOW TO RUN
 *   1. https://script.google.com  ->  New project
 *   2. Delete the sample code, paste this file in, Save
 *   3. Run  ->  createWishlistForm
 *   4. Authorise (your own account, creating your own form)
 *   5. View -> Logs for the live and edit URLs
 *
 * Re-running creates a SECOND form. Edit wording in the UI instead.
 *
 * ---------------------------------------------------------------------------
 * SCOPE - 11 questions, about 2 minutes, one free-text box.
 *
 * This form does only what a form is uniquely good at: counting things across
 * many people. Everything that needs a follow-up question is deliberately left
 * to the walkthrough interview, which is a better instrument for it.
 *
 * It measures exactly four things the 3,922-document corpus cannot:
 *   Q4  how often the wishlist is revisited   -> the assumed term in the Part 2 tree
 *   Q5  purchases from it in 30 days          -> the north-star metric itself
 *   Q6  why the item was saved                -> the intent split hidden in genuine_intent
 *   Q7  what is blocking it                   -> triangulates against the Part 1 themes
 * plus Q8, which is the test of whether the MVP resolves anything.
 *
 * Moved to the interview, where they are asked better: wishlist age, removal
 * behaviour, comparison-set size, occasion dates, the 0-10 still-want score,
 * out-of-app workarounds, and "what tipped it last time".
 * ---------------------------------------------------------------------------
 */

function createWishlistForm() {
  var form = FormApp.create("What's sitting in your wishlist?");

  form.setDescription(
    "I'm a product management fellow researching why clothes people genuinely want end up " +
    "sitting in a wishlist unbought. Two minutes, 11 questions.\n\n" +
    "Anonymous, used only for a student case study, reported as aggregate numbers.\n\n" +
    "HAVE YOUR PHONE HANDY - two questions ask you to glance at your actual wishlist, " +
    "because nobody remembers this accurately."
  );

  // Cosmetic settings only. Applied defensively because the Forms API renames
  // these occasionally, and a form with all its questions beats a run that died
  // on a progress bar. Anything that fails is logged and skipped.
  applySetting(form, "setProgressBar", true);
  applySetting(form, "setShuffleQuestions", false);
  applySetting(form, "setCollectEmail", false);            // asked at Q11 only, from opt-ins
  applySetting(form, "setLimitOneResponsePerUser", false); // sign-in suppresses completion
  applySetting(form, "setAllowResponseEdits", false);
  applySetting(form, "setShowLinkToRespondAgain", false);

  /* ---------------------------- Page 1 ---------------------------- */

  // Forms can only branch on multiple choice and dropdown, never checkboxes, so
  // this does not screen anyone out. Filter "None of these" at analysis time.
  // The real screen is Q3, which does branch.
  form.addCheckboxItem()
    .setTitle("Where do you shop for clothes?")
    .setChoiceValues([
      "Myntra",
      "AJIO",
      "Nykaa Fashion",
      "Amazon / Flipkart Fashion",
      "None of these"
    ])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle("Happy for your anonymous answers to be used in a student case study?")
    .setChoiceValues(["Yes"])
    .setRequired(true);

  /* ---------------------------- Page 2 ---------------------------- */

  form.addPageBreakItem()
    .setTitle("Your wishlist")
    .setHelpText("Open your Myntra wishlist and have a quick look before answering.");

  // Alone on its page ON PURPOSE. Google Forms only honours per-answer branching
  // on the LAST question of a section, and setChoices() throws "Invalid data
  // updating form" if you attach navigation to a question with anything after it.
  // If you add a question here, the branch below breaks.
  var q3 = form.addMultipleChoiceItem()
    .setTitle("How many items are in it right now?")
    .setRequired(true);

  /* ---------------------------- Page 3 ---------------------------- */

  form.addPageBreakItem().setTitle("The last 30 days");

  form.addMultipleChoiceItem()
    .setTitle("In the last 30 days, how many times did you open it?")
    .setChoiceValues(["Not once", "Once", "2-3 times", "4-10 times", "More than 10 times"])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("In the last 30 days, did you buy anything FROM it?")
    .setChoiceValues(["Yes, one item", "Yes, more than one", "No", "I don't remember"])
    .setRequired(true);

  /* ---------------------------- Page 4 ---------------------------- */

  form.addPageBreakItem()
    .setTitle("The last thing you saved")
    .setHelpText("Look at the most recent item you saved and haven't bought. These three are about that one item.");

  // The intent split. All of this collapses into genuine_intent in the Part 1
  // tags. "I honestly don't remember" is not a dead option - a high score on it
  // IS the finding, because it means the wishlist records no reason for itself.
  form.addMultipleChoiceItem()
    .setTitle("Why did you save it rather than buy it?")
    .setChoiceValues([
      "I wanted it, but wasn't sure about something (size, fabric, whether it'd suit me)",
      "I was saving it for an occasion coming up",
      "I was collecting a few similar options to choose between later",
      "I was waiting for the price to drop, or for a sale",
      "I just liked it - I wasn't really planning to buy it",
      "I was worried it would go out of stock",
      "I wanted to show someone before deciding",
      "I honestly don't remember"
    ])
    .setRequired(true);

  // Deliberately the Part 1 blocker taxonomy in plain language, so this
  // frequency table can be laid straight against the theme shares. Where the two
  // methods disagree is the point, not a problem.
  form.addMultipleChoiceItem()
    .setTitle("What's the single biggest thing stopping you?")
    .setChoiceValues([
      "Not sure it'll fit / which size to order",
      "Not sure about the fabric or quality",
      "Not sure it'll look like the photos",
      "Not sure it'll suit me or my body type",
      "I don't trust the seller or brand",
      "Returning it would be a hassle if it's wrong",
      "Costs more than I want to spend right now",
      "I'm waiting for a sale",
      "I already own something similar",
      "Can't decide between this and something else",
      "I don't need it yet",
      "I'd forgotten about it until now"
    ])
    .showOtherOption(true)
    .setRequired(true);

  // The only free-text box, and the sharpest test available of the MVP: if an
  // answer here is something our output would not tell them, we built a message
  // rather than a mechanism.
  form.addParagraphTextItem()
    .setTitle("What would you need to know to decide today - buy it, or delete it?")
    .setHelpText("Whatever would actually settle it. One line is fine.")
    .setRequired(true);

  /* ---------------------------- Page 5 ---------------------------- */

  var aboutYouPage = form.addPageBreakItem().setTitle("About you");

  form.addMultipleChoiceItem()
    .setTitle("Age")
    .setChoiceValues(["Under 18", "18-24", "25-32", "33-40", "Over 40"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("Which city?")
    .setRequired(true);

  /* ---------------------------- Page 6 ---------------------------- */

  form.addPageBreakItem()
    .setTitle("Last thing")
    .setHelpText(
      "I'm running a few 30-minute video calls where people walk me through their wishlist " +
      "item by item. No payment, no sales pitch - I'll share what I find if you're curious."
    );

  // Also alone on its page, for the same reason as q3.
  var q11 = form.addMultipleChoiceItem()
    .setTitle("Happy to be contacted for that?")
    .setRequired(true);

  /* ---------------------------- Page 7 ---------------------------- */

  var contactPage = form.addPageBreakItem()
    .setTitle("Thanks - how do I reach you?")
    .setHelpText("Used only to arrange the call, and deleted afterwards.");

  form.addTextItem()
    .setTitle("Email or WhatsApp number")
    .setRequired(true);

  /* --------------------------- Navigation -------------------------
   * Wired last: a choice can only point at a page break that exists.
   * ---------------------------------------------------------------- */

  q3.setChoices([
    q3.createChoice("0", aboutYouPage),
    q3.createChoice("1-5"),
    q3.createChoice("6-15"),
    q3.createChoice("16-30"),
    q3.createChoice("More than 30"),
    q3.createChoice("I don't have a wishlist", aboutYouPage)
  ]);

  q11.setChoices([
    q11.createChoice("Yes", contactPage),
    q11.createChoice("No", FormApp.PageNavigationType.SUBMIT)
  ]);

  Logger.log("Share this link:  " + form.getPublishedUrl());
  Logger.log("Edit it here:     " + form.getEditUrl());
}

/**
 * Calls form[name](value) if that method exists, and logs instead of throwing if
 * it does not. Used only for presentation settings - never for questions, which
 * must fail loudly.
 */
function applySetting(form, name, value) {
  if (typeof form[name] !== "function") {
    Logger.log("Skipped " + name + " - not available in this version of the Forms API.");
    return;
  }
  try {
    form[name](value);
  } catch (err) {
    Logger.log("Skipped " + name + " - " + err.message);
  }
}
