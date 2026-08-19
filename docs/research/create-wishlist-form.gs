/**
 * Builds the wishlist survey as a Google Form.
 *
 * HOW TO RUN
 *   1. Go to https://script.google.com  ->  New project
 *   2. Delete the sample code, paste this file in, Save
 *   3. Run  ->  createWishlistForm
 *   4. Authorise when prompted (it is your own account creating your own form)
 *   5. The edit + live URLs are printed to the execution log (View -> Logs)
 *
 * Re-running creates a SECOND form. To change wording, edit the form in the UI
 * rather than re-running, or delete the old one first.
 *
 * Question numbering matches docs/research/wishlist-survey.md.
 */

function createWishlistForm() {
  var form = FormApp.create("What's sitting in your wishlist?");

  form.setDescription(
    "I'm a product management fellow researching why clothes people genuinely want end up " +
    "sitting in a wishlist unbought. Takes about 5 minutes.\n\n" +
    "There are no right answers, and I'm not selling anything. Responses are anonymous, used " +
    "only for a student case study, and reported as aggregate numbers - no names, no " +
    "individual responses shared.\n\n" +
    "YOU'LL NEED YOUR PHONE. A few questions ask you to open your wishlist and look at it, " +
    "because nobody remembers this stuff accurately from memory."
  );

  form.setProgressBarEnabled(true);
  form.setShuffleQuestions(false);
  form.setCollectEmail(false);          // email is asked for only at Q20, and only from opt-ins
  form.setLimitOneResponsePerUser(false); // requiring sign-in suppresses completion
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);

  /* ------------------------------------------------------------------ *
   * Page 1 - qualify and consent
   * ------------------------------------------------------------------ */

  // Google Forms can only branch on multiple-choice and dropdown, never on
  // checkboxes. Multi-select is the better data here, so this question does not
  // screen anyone out - filter "None of these" at analysis time instead. The
  // real screen is Q3, which is multiple choice and does branch.
  form.addCheckboxItem()
    .setTitle("Do you shop for clothes on any of these?")
    .setChoiceValues([
      "Myntra",
      "AJIO",
      "Nykaa Fashion",
      "Amazon / Flipkart Fashion",
      "None of these"
    ])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle("I'm happy for my anonymous answers to be used in a student case study.")
    .setChoiceValues(["Yes"])
    .setRequired(true);

  /* ------------------------------------------------------------------ *
   * Page 2 - the wishlist as it stands
   * ------------------------------------------------------------------ */

  form.addPageBreakItem()
    .setTitle("Your wishlist, right now")
    .setHelpText("Please actually open your Myntra wishlist before answering this section.");

  var q3 = form.addMultipleChoiceItem()
    .setTitle("How many items are in it right now?")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("Roughly how long has the oldest item been sitting there?")
    .setChoiceValues([
      "Less than a week",
      "1-4 weeks",
      "1-3 months",
      "3-6 months",
      "More than 6 months",
      "No idea"
    ])
    .setRequired(true);

  // The revisit rate. This is the term the Part 2 decomposition otherwise has to
  // assume, because no scraped source can observe it.
  form.addMultipleChoiceItem()
    .setTitle("In the last 30 days, how many times did you open your wishlist?")
    .setChoiceValues(["Not once", "Once", "2-3 times", "4-10 times", "More than 10 times"])
    .setRequired(true);

  // The north-star metric itself, self-reported.
  form.addMultipleChoiceItem()
    .setTitle("In the last 30 days, did you buy anything FROM your wishlist?")
    .setChoiceValues(["Yes, one item", "Yes, more than one", "No", "I don't remember"])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("In the last 30 days, did you remove anything without buying it?")
    .setChoiceValues(["Yes", "No", "I don't remember"])
    .setRequired(true);

  /* ------------------------------------------------------------------ *
   * Page 3 - one specific item
   * ------------------------------------------------------------------ */

  form.addPageBreakItem()
    .setTitle("One specific item")
    .setHelpText(
      "Now look at the item you saved MOST RECENTLY and haven't bought. " +
      "Answer the rest of this section about that one item."
    );

  form.addTextItem()
    .setTitle("What is it?")
    .setHelpText("Just the category - \"black kurta\", \"running shoes\".")
    .setRequired(true);

  // The intent split. Everything here currently collapses into genuine_intent in
  // the Part 1 tags. "I honestly don't remember" is not a dead option - a high
  // score on it IS the finding, because it means the wishlist keeps no record of
  // why anything is in it.
  form.addMultipleChoiceItem()
    .setTitle("When you saved it, which of these was closest to what was going through your head?")
    .setChoiceValues([
      "I wanted it, but wasn't sure about something (size, fabric, whether it'd suit me)",
      "I was saving it for a specific occasion coming up",
      "I was collecting a few similar options to choose between later",
      "I was waiting for the price to drop, or for a sale",
      "I just liked it - I wasn't really planning to buy it",
      "I was worried it would go out of stock",
      "I wanted to show someone before deciding",
      "I honestly don't remember"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("Is there a specific occasion or date you'd wear it for?")
    .setChoiceValues(["Yes", "No", "Not sure"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("If yes - what, and roughly when?")
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle("Do you have other similar items saved that you'd pick between?")
    .setChoiceValues([
      "Yes, 2-3 similar ones",
      "Yes, 4 or more",
      "No, it's the only one of its kind"
    ])
    .setRequired(true);

  // Deliberately the Part 1 blocker taxonomy in plain language, so the frequency
  // table this produces can be laid straight against the theme shares.
  form.addMultipleChoiceItem()
    .setTitle("What's the single biggest thing stopping you from buying it?")
    .setChoiceValues([
      "I'm not sure it'll fit / which size to order",
      "I'm not sure about the fabric or quality",
      "I'm not sure it'll look like the photos",
      "I'm not sure it'll suit me or my body type",
      "I don't trust the seller or the brand",
      "Returning it would be a hassle if it's wrong",
      "It costs more than I want to spend right now",
      "I'm waiting for a sale",
      "I already own something similar",
      "I can't decide between this and something else",
      "I don't need it yet",
      "I'd forgotten about it until now"
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addScaleItem()
    .setTitle("How sure are you that you still want it?")
    .setBounds(0, 10)
    .setLabels("Not at all", "Certain")
    .setRequired(true);

  // The sharpest test of the MVP. Read these verbatim before coding anything: if
  // an answer here is something our output would not tell them, we are building a
  // message rather than a mechanism.
  form.addParagraphTextItem()
    .setTitle("What's the one thing you'd need to know to decide today - buy it, or delete it?")
    .setHelpText("Whatever would actually settle it for you.")
    .setRequired(true);

  /* ------------------------------------------------------------------ *
   * Page 4 - workarounds, asked as past behaviour
   * ------------------------------------------------------------------ */

  form.addPageBreakItem().setTitle("What you do when you're unsure");

  // external_behaviour reads 2.2% in the scraped corpus, which is almost
  // certainly an artefact of people narrating outcomes rather than process.
  // NOTE: Forms cannot make "None of these" mutually exclusive via Apps Script.
  // Set it in the UI afterwards if you want it, or clean at analysis time.
  form.addCheckboxItem()
    .setTitle("In the last 3 months, which of these have you actually done for an item you were unsure about?")
    .setChoiceValues([
      "Screenshotted it and sent it to someone",
      "Searched YouTube or Google for reviews of it",
      "Checked the price on another app",
      "Went to a shop to see or try something similar",
      "Ordered two sizes meaning to return one",
      "Asked in a comment section or group chat",
      "Looked for photos from real buyers rather than the model shots",
      "None of these"
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Think of the last time you were unsure about something and bought it anyway. What tipped it?")
    .setRequired(false);

  /* ------------------------------------------------------------------ *
   * Page 5 - about you  (Q3 jumps here when there is no wishlist)
   * ------------------------------------------------------------------ */

  var aboutYouPage = form.addPageBreakItem().setTitle("About you");

  form.addMultipleChoiceItem()
    .setTitle("Age")
    .setChoiceValues(["Under 18", "18-24", "25-32", "33-40", "Over 40"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("Which city do you shop from?")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("How often do you buy clothes online?")
    .setChoiceValues([
      "Weekly",
      "A few times a month",
      "About once a month",
      "Every few months",
      "Rarely"
    ])
    .setRequired(true);

  /* ------------------------------------------------------------------ *
   * Page 6 - interview opt-in
   * ------------------------------------------------------------------ */

  form.addPageBreakItem()
    .setTitle("One more thing")
    .setHelpText(
      "I'm running a few 30-minute video calls where people walk me through their wishlist " +
      "item by item. It's genuinely useful and pretty fun. No payment, no sales pitch - " +
      "I'll share what I find if you're curious."
    );

  var q20 = form.addMultipleChoiceItem()
    .setTitle("Happy to be contacted for that?")
    .setRequired(true);

  /* ------------------------------------------------------------------ *
   * Page 7 - contact details, reached only by opting in
   * ------------------------------------------------------------------ */

  var contactPage = form.addPageBreakItem()
    .setTitle("Thank you - how do I reach you?")
    .setHelpText("Used only to arrange the call, and deleted afterwards.");

  form.addTextItem()
    .setTitle("Email or WhatsApp number")
    .setRequired(true);

  form.addTextItem()
    .setTitle("Roughly when suits you?")
    .setHelpText("e.g. weekday evenings, weekend mornings.")
    .setRequired(false);

  /* ------------------------------------------------------------------ *
   * Navigation - wired last, because a choice can only point at a page
   * break that already exists.
   * ------------------------------------------------------------------ */

  q3.setChoices([
    q3.createChoice("0", aboutYouPage),
    q3.createChoice("1-5"),
    q3.createChoice("6-15"),
    q3.createChoice("16-30"),
    q3.createChoice("31-50"),
    q3.createChoice("More than 50"),
    q3.createChoice("I don't have a wishlist", aboutYouPage)
  ]);

  q20.setChoices([
    q20.createChoice("Yes", contactPage),
    q20.createChoice("No", FormApp.PageNavigationType.SUBMIT)
  ]);

  Logger.log("Share this link:  " + form.getPublishedUrl());
  Logger.log("Edit it here:     " + form.getEditUrl());
}
