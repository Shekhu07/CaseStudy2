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
 * Re-running creates a SECOND form on a new URL. If the form is already
 * published, use update-wishlist-form.gs instead - it patches a live form in
 * place and leaves collected responses alone.
 *
 * ---------------------------------------------------------------------------
 * SCOPE - 15 questions across 6 pages, about 3 minutes, one free-text box.
 *
 * This form does only what a form is uniquely good at: counting things across
 * many people. Everything that needs a follow-up question is deliberately left
 * to the walkthrough interview, which is a better instrument for it.
 *
 * It measures exactly four things the 3,922-document corpus cannot (numbering
 * follows wishlist-survey.md, where the consent checkbox is Q1):
 *   Q4  how often the wishlist is revisited   -> the assumed term in the Part 2 tree
 *   Q5  purchases from it in 30 days          -> the north-star metric itself
 *   Q6  why the item was saved                -> the intent split hidden in genuine_intent
 *   Q7  what is blocking it                   -> triangulates against the Part 1 themes
 * plus Q9, the free-text box, which is the test of whether the MVP resolves anything.
 *
 * Q10 and Q11 were added later, after a peer's form showed both were survey-shaped
 * rather than interview-shaped - you want a share across many people, not a probe:
 *   Q10  why an item gets removed unbought -> abandonment, the other exit from the
 *        Part 2 tree; same taxonomy as Q7, so the two can be laid against each other
 *   Q11  what happens with close alternatives -> choice overload as observed
 *        behaviour, which no other instrument here measures at all
 *
 * Q8 and Q12 were added in a stress test of this form against Parts 2 and 4:
 *   Q8   did you try to resolve the doubt, and where did you look
 *        -> Part 4(c) "is it still unresolved at revisit", and Part 4(d)
 *           workarounds, which had no instrument at all after the original
 *           workaround question was cut
 *   Q12  which doubts co-occur across one person's whole list
 *        -> Part 4(a): the corpus CANNOT settle whether fit-uncertain and
 *           low-trust are one population or two, and Q7 cannot either, because
 *           it is single-select on a single item
 *
 * Moved to the interview, where they are asked better: wishlist age,
 * comparison-set size, occasion dates, the 0-10 still-want score, and "what
 * tipped it last time".
 * ---------------------------------------------------------------------------
 */

function createWishlistForm() {
  var form = FormApp.create("What's sitting in your wishlist?");

  form.setDescription(
    "I'm a product management fellow researching why clothes people genuinely want end up " +
    "sitting in a wishlist unbought. Three minutes, 14 questions.\n\n" +
    "Anonymous, used only for a student case study, reported as aggregate numbers.\n\n" +
    "HAVE YOUR PHONE HANDY - several questions ask you to look at your actual wishlist, " +
    "because nobody remembers this accurately."
  );

  // Cosmetic settings only. Applied defensively because the Forms API renames
  // these occasionally, and a form with all its questions beats a run that died
  // on a progress bar. Anything that fails is logged and skipped.
  applySetting(form, "setProgressBar", true);
  applySetting(form, "setShuffleQuestions", false);
  applySetting(form, "setCollectEmail", false);            // asked at the end only, from opt-ins
  applySetting(form, "setLimitOneResponsePerUser", false); // sign-in suppresses completion
  applySetting(form, "setAllowResponseEdits", false);
  applySetting(form, "setShowLinkToRespondAgain", false);

  /* ---------------------------- Page 1 ---------------------------- */

  form.addCheckboxItem()
    .setTitle("Happy for your anonymous answers to be used in a student case study?")
    .setChoiceValues(["Yes"])
    .setRequired(true);

  // The screen. Was a bare yes/no; reworked to a frequency question after a peer's
  // form showed the same tap can also describe the sample - "n% shop monthly or
  // more" is a method-note line the yes/no could never produce, and it lets Q4-Q10
  // be cut by shopping intensity for free.
  //
  // Two deliberate departures from the form it came from: it names Myntra rather
  // than "online" (AGENTS.md - Myntra claims are quoted Myntra-only), and it uses
  // time anchors rather than Very often / Often / Sometimes, which are not
  // comparable between two respondents and cannot enter a metric tree.
  //
  // Only "Never" screens out. Once-a-year shoppers stay in: they are the longest
  // deferrals in the sample and the most interesting wishlists in it.
  //
  // "buy", not "shop" - caught in the persona dry run. A shopper who browses four
  // evenings a month and buys every other month cannot answer "how often do you
  // shop" without inventing a rule, and each respondent invents a different one.
  // Purchase frequency is the variable the segmentation wants; browsing frequency
  // feeds nothing here.
  //
  // Last on its page because that is what branching requires.
  var q1 = form.addMultipleChoiceItem()
    .setTitle("How often do you buy clothes on Myntra?")
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

  form.addPageBreakItem()
    .setTitle("Your wishlist, and the last thing you saved")
    .setHelpText("Open your Myntra wishlist if you closed it - the first two need a number.");

  form.addMultipleChoiceItem()
    .setTitle("In the last 30 days, how many times did you open your wishlist?")
    .setChoiceValues(["Not once", "Once", "2-3 times", "4-10 times", "More than 10 times"])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("In the last 30 days, did you buy anything from your wishlist?")
    .setChoiceValues(["Yes, one item", "Yes, more than one", "No", "I don't remember"])
    .setRequired(true);

  /* --------- Same page: the frame changes from list to item ---------
   * This was page 4 until it was merged in. A page BREAK was doing two jobs -
   * splitting the form, and telling the respondent that the subject changes from
   * the whole wishlist to one specific item. addSectionHeaderItem keeps the second
   * job without the first: it renders as a titled block mid-page, so the scoping
   * instruction is still a heading rather than a line of body text.
   *
   * The questions on both sides of it were also reworded to name their subject
   * outright - "your wishlist" above, "that item" below - because "it" is no
   * longer disambiguated by a page heading.
   * ---------------------------------------------------------------- */

  form.addSectionHeaderItem()
    .setTitle("Now think about the last thing you saved")
    .setHelpText("Look at the most recent item you saved and haven't bought. The next four questions are about that one item.");

  // The intent split. All of this collapses into genuine_intent in the Part 1
  // tags. "I honestly don't remember" is not a dead option - a high score on it
  // IS the finding, because it means the wishlist records no reason for itself.
  form.addMultipleChoiceItem()
    .setTitle("Why did you save that item rather than buy it?")
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
  //
  // The last option was added after the persona dry run. Without it, a respondent
  // who told Q6 "I just liked it, I wasn't planning to buy it" is still FORCED to
  // name a blocker here, and picks the least-wrong one. Every window-shopper then
  // injects a spurious blocker into the term-C distribution - the single number
  // the whole Part 2 argument rests on. Cheap option, material correction.
  form.addMultipleChoiceItem()
    .setTitle("What's the single biggest thing stopping you from buying that item?")
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
      "I'd forgotten about it until now",
      "Nothing is stopping me - I'm not actually planning to buy it"
    ])
    .showOtherOption(true)
    .setRequired(true);

  // Q8 - added in the stress test against Part 4. It closes the single biggest
  // hole in this instrument.
  //
  // Part 4(c) says the corpus "sees the doubt once, never twice" and so cannot
  // show the doubt is STILL unresolved at revisit rather than resolved-and-
  // declined. Without this question the form has exactly the same blindness: Q7
  // records a doubt, and nothing establishes that the shopper tried to answer it
  // and could not.
  //
  // It does double duty. Part 4(d) - existing workarounds, and the thinnest
  // section in the whole case - currently has no instrument at all after the
  // original workaround question was cut, leaving six interviews to evidence it.
  // Six interviews give six anecdotes; this gives a distribution.
  //
  // "I tried, and still couldn't find out" is the option the argument rests on.
  // A high share is the root cause stated in the users' own behaviour: the doubt
  // is not laziness, it is unanswerable on the surface where it arises.
  form.addCheckboxItem()
    .setTitle("Did you try to find that out? Tick everywhere you looked.")
    .setHelpText("Still about that same item. Tick as many as apply - and if there was nothing to look up, just tick \"I didn't try\".")
    .setChoiceValues([
      "I didn't try",
      "The size chart on the product page",
      "The reviews or customer photos",
      "The ratings / fit feedback on the listing",
      "Asked a friend or family member",
      "Searched YouTube or Instagram for it",
      "Checked the brand's own site, or another app",
      "Went to a shop to see it in person",
      "Planned to order two sizes and return one",
      "I tried, and still couldn't find out"
    ])
    .setRequired(true);

  // The only free-text box, and the sharpest test available of the MVP: if an
  // answer here is something our output would not tell them, we built a message
  // rather than a mechanism.
  form.addParagraphTextItem()
    .setTitle("What would you need to know to decide on that item today - buy it, or delete it?")
    .setHelpText("Whatever would actually settle it. One line is fine.")
    .setRequired(true);

  /* ---------------------------- Page 4 ----------------------------
   * Both questions are about wishlist behaviour in general, not about the one
   * item the section above asks about - which is why they get their own page rather than
   * being appended there. They sit AFTER the q3 branch target below, so anyone
   * who reported an empty wishlist skips them, correctly: neither means anything
   * to someone with nothing saved.
   * ---------------------------------------------------------------- */

  form.addPageBreakItem().setTitle("Your wishlist in general");

  // Abandonment - the other exit from the Part 2 tree, and the half Q4/Q5 cannot
  // see. Phrased as "the last time" rather than "usually" so it recalls an event
  // instead of inviting a self-description. Options mirror Q7's taxonomy, so
  // blockers-that-stall and blockers-that-kill can be compared directly.
  form.addMultipleChoiceItem()
    .setTitle("The last time you removed something from your wishlist without buying it, why?")
    .setChoiceValues([
      "I found something better, here or elsewhere",
      "I stopped trusting it would be right - fit, fabric or quality",
      "The price never came down enough",
      "It went out of stock, or my size did",
      "I no longer needed it",
      "I changed my mind about wanting it",
      "I was only using the wishlist to shortlist, and it lost",
      "I couldn't find out enough about it to decide",
      "I've never removed anything without buying it"
    ])
    .showOtherOption(true)
    .setRequired(true);

  // Choice overload, as behaviour rather than feeling. "Buy none of them" is the
  // option that matters: it is the failure mode a comparison-shaped MVP would
  // have to clear, and nothing else in this research measures its size.
  form.addMultipleChoiceItem()
    .setTitle("When two or three saved items are close alternatives, what usually happens?")
    .setChoiceValues([
      "I pick one fairly quickly",
      "I go back and forth for a while, then buy one",
      "I go back and forth and end up buying none of them",
      "I go looking for more options instead of choosing",
      "This doesn't really happen to me"
    ])
    .setRequired(true);

  // Q12 - added in the stress test. Q7 asks for the single biggest blocker on ONE
  // item, so it cannot tell you whether one person carries several kinds of doubt.
  // That matters: Part 4(a) concedes the two segments overlap on 1 document in
  // 1,485, but flags it as a LABELLING ARTEFACT - the tagger allowed one segment
  // signal per document, so the corpus is structurally incapable of settling it.
  //
  // This is the only question in the project that can. Checkbox, person-level,
  // across the whole list. If fit and trust are routinely ticked together, then
  // "lead with fit, trust is the second wave" is the wrong roadmap and the MVP has
  // to serve both - which is a Part 5 decision, not a slide-wording decision.
  form.addCheckboxItem()
    .setTitle("Across your whole wishlist, which of these are true of at least one item?")
    .setChoiceValues([
      "I'm not sure it'll fit me",
      "I'm not sure about the fabric or quality",
      "I'm not sure it'll look like the photos",
      "I'm not sure it'll suit me or my body type",
      "I don't fully trust the seller or brand",
      "I'm waiting for the price to drop",
      "I'm saving it for an occasion",
      "None of these"
    ])
    .setRequired(true);

  /* ---------------------------- Page 5 ----------------------------
   * Also the branch target for an empty wishlist, so everything on it must be
   * answerable by someone who has never saved anything. Age, city and the
   * interview opt-in all qualify.
   * ---------------------------------------------------------------- */

  var aboutYouPage = form.addPageBreakItem().setTitle("About you");

  form.addMultipleChoiceItem()
    .setTitle("Age")
    .setChoiceValues(["Under 18", "18-24", "25-32", "33-40", "Over 40"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("Which city?")
    .setRequired(true);

  // The opt-in used to have a page to itself. It does not need one: branching only
  // requires the question to be LAST in its section, not alone in it. Folded in
  // here, and the call explanation moved from the page break onto the question.
  //
  // Nothing may be added after this question - see the note on q3.
  var qOptIn = form.addMultipleChoiceItem()
    .setTitle("Happy to be contacted for that?")
    .setHelpText(
      "I'm running a few 30-minute calls where people walk me through their wishlist item " +
      "by item. You'd share your screen so I can see it - camera off is completely fine. " +
      "No payment, no sales pitch, and I'll share what I find if you're curious."
    )
    .setRequired(true);

  /* ---------------------------- Page 6 ---------------------------- */

  var contactPage = form.addPageBreakItem()
    .setTitle("Thanks - how do I reach you?")
    .setHelpText("Used only to arrange the call, and deleted afterwards.");

  form.addTextItem()
    .setTitle("Email or WhatsApp number")
    .setRequired(true);

  /* --------------------------- Navigation -------------------------
   * Wired last: a choice can only point at a page break that exists.
   * ---------------------------------------------------------------- */

  var CONTINUE = FormApp.PageNavigationType.CONTINUE;

  wireBranch(q1, [
    ["Once a week or more", CONTINUE],
    ["A few times a month", CONTINUE],
    ["Every month or two", CONTINUE],
    ["A few times a year", CONTINUE],
    ["Never - I don't shop on Myntra", FormApp.PageNavigationType.SUBMIT]
  ], "\"Never - I don't shop on Myntra\" -> Submit form; everything else -> next section");

  // Every choice gets EXPLICIT navigation. Mixing navigated and un-navigated
  // choices in one setChoices() call is a known way to get "Invalid data updating
  // form", and CONTINUE is how you say "go to the next page" - naming the next
  // page break directly is what broke the opt-in question.
  wireBranch(q3, [
    ["0", aboutYouPage],
    ["1-5", CONTINUE],
    ["6-15", CONTINUE],
    ["16-30", CONTINUE],
    ["More than 30", CONTINUE],
    ["I don't have a wishlist", aboutYouPage]
  ], "0 and \"I don't have a wishlist\" -> About you; everything else -> next section");

  wireBranch(qOptIn, [
    ["Yes", CONTINUE],
    ["No", FormApp.PageNavigationType.SUBMIT]
  ], "No -> Submit form; Yes -> next section");

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


/**
 * Applies branching to a multiple-choice item, and degrades to a plain question
 * if the Forms API refuses it.
 *
 * Branching is the fiddliest corner of this API and the least valuable part of
 * the form - it spares a few people four irrelevant questions. A throw here would
 * cost you all fifteen questions instead, so on failure the choices are set without
 * navigation and the log says exactly what to click to restore it by hand.
 *
 * @param item   MultipleChoiceItem to wire
 * @param pairs  [[choiceText, navigationTargetOrType], ...]
 * @param label  what the branch should do, logged if it has to fall back
 */
function wireBranch(item, pairs, label) {
  try {
    item.setChoices(pairs.map(function (p) { return item.createChoice(p[0], p[1]); }));
  } catch (err) {
    item.setChoiceValues(pairs.map(function (p) { return p[0]; }));
    Logger.log(
      'COULD NOT SET BRANCHING on "' + item.getTitle() + '" - ' + err.message + '\n' +
      '  The question itself is fine and the form is usable as-is.\n' +
      '  To restore it: open the form, click the three dots under that question,\n' +
      '  choose "Go to section based on answer", then set:\n' +
      '    ' + label
    );
  }
}
