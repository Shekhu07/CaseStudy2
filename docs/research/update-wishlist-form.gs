/**
 * Patches an ALREADY-PUBLISHED wishlist form up to the current spec in
 * create-wishlist-form.gs, without creating a new form and without disturbing
 * responses already collected.
 *
 * Use this instead of re-running createWishlistForm when the form is live.
 * FormApp.create() would make a SECOND form on a new URL and split your data.
 *
 * HOW TO RUN
 *   1. Open the form's EDIT url. It looks like:
 *        https://docs.google.com/forms/d/1AbCdEf.../edit
 *      Copy the id between /d/ and /edit into FORM_ID below.
 *      NOTE: the /forms/d/e/1FAIpQL.../viewform link carries a DIFFERENT id
 *      that openById() cannot use. It must be the edit-url id.
 *   2. Paste this file into the same Apps Script project, Save.
 *   3. Leave DRY_RUN = true and Run -> updateExistingForm. Read View -> Logs.
 *      Nothing is written on a dry run.
 *   4. If the plan looks right, set DRY_RUN = false and Run again.
 *
 * SAFE TO RUN TWICE. Every patch checks whether it has already been applied and
 * logs "already current" instead of doing it again.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT DOES NOT FIX
 *
 * Two of these patches change what a question MEANS, and no script can
 * retroactively fix answers already given to the older wording:
 *
 *   Q2  "shop for clothes" -> "buy clothes"        - a different variable
 *   Q7  gains "Nothing is stopping me..."          - a different denominator
 *
 * Responses collected before this runs are not comparable on those two
 * questions. They pool fine on the other twelve. The response sheet carries
 * timestamps, so the affected rows stay identifiable - find the run time in the
 * log and treat earlier rows as n-3 (or whatever your count is) on Q2 and Q7.
 * State it once in the deck's method note. Do not quietly pool them.
 *
 * And FOUR CHANGES IN THE SPEC ARE HAND WORK. The script detects each one and
 * prints what to do; it will not do them for you, because each would destroy
 * something on the way:
 *
 *   a) Q2 still offers "Never - I don't shop on Myntra" under a stem that now
 *      asks how often you BUY. Rewriting it means rewriting the choice list,
 *      which drops the screen-out branch that choice carries.
 *   b) The last-30-days pair (opens, bought) must move ABOVE the wishlist count,
 *      onto page 2. Below it they sit on the far side of the count's branch, so
 *      anyone answering "0" - including anyone who bought everything they had
 *      saved - is skipped past the purchase question. Moving items by script
 *      re-indexes the form under the branch that points into it. Delete the page
 *      break the pair leaves empty while you are in there.
 *   c) The interview opt-in and its contact field must go. Deleting a live
 *      question orphans the answers already given to it - not a call a patch
 *      script should make silently on data you have already collected.
 *   d) Only if an EARLIER run of this script converted "Now think about the last
 *      thing you saved" into a section header: it has to become a page break
 *      again. The spec gives the item questions their own page. Retitling a
 *      break is safe; rebuilding one under a live branch is not.
 *
 * Until (b) is done by hand the live form under-counts the north-star question.
 * It is two drags in the editor; do it.
 * ---------------------------------------------------------------------------
 */

var FORM_ID = "PASTE_THE_EDIT_URL_ID_HERE";
var DRY_RUN = true;


function updateExistingForm() {
  if (FORM_ID === "PASTE_THE_EDIT_URL_ID_HERE") {
    throw new Error("Set FORM_ID first - the id from the /forms/d/<ID>/edit url.");
  }

  var form = FormApp.openById(FORM_ID);
  Logger.log(DRY_RUN ? "=== DRY RUN - nothing will be written ===" : "=== APPLYING CHANGES ===");
  Logger.log('Form: "' + form.getTitle() + '"');
  Logger.log("Responses already collected: " + form.getResponses().length);
  Logger.log("");

  var done = [], skipped = [], failed = [];

  function patch(label, fn) {
    try {
      var result = fn();
      if (result === SKIP) { skipped.push(label); Logger.log("  ok  " + label + " - already current"); }
      else { done.push(label); Logger.log((DRY_RUN ? "  WOULD " : "  DID  ") + label); }
    } catch (err) {
      failed.push(label + " - " + err.message);
      Logger.log("  FAIL " + label + " - " + err.message);
    }
  }

  /* --- 1. Retitles. Titles only; choices are never touched, because Q2's
     choices carry the screen-out branch and rewriting them would drop it. --- */

  [
    ["How often do you shop for clothes on Myntra?",
     "How often do you buy clothes on Myntra?"],
    ["In the last 30 days, how many times did you open it?",
     "In the last 30 days, how many times did you open your wishlist?"],
    ["In the last 30 days, did you buy anything FROM it?",
     "In the last 30 days, did you buy anything from your wishlist?"],
    ["Why did you save it rather than buy it?",
     "Why did you save that item rather than buy it?"],
    ["What's the single biggest thing stopping you?",
     "What's the single biggest thing stopping you from buying that item?"],
    ["What would you need to know to decide today - buy it, or delete it?",
     "What would you need to know to decide on that item today - buy it, or delete it?"],

    // The three below were fixed in the spec while reading the LIVE form, and
    // then only ever applied to create-wishlist-form.gs - which is not what is
    // deployed. Without these the live form keeps the old wording forever.
    ["How many items are in it right now?",
     "How many items are in your wishlist right now?"],
    ["When two or three saved items are close alternatives, what usually happens?",
     "When you've saved a few similar things and can only really buy one, what usually happens?"],
    ["Across your whole wishlist, which of these are true of at least one item?",
     "Thinking about everything in your wishlist - which of these apply to anything in there?"]
  ].forEach(function (pair) {
    patch('retitle: "' + truncate(pair[0]) + '"', function () {
      return retitle(form, pair[0], pair[1]);
    });
  });

  /* --- 2. Q7 gains the no-intent option. --- */

  patch("Q7: add the no-intent option", function () {
    return addChoice(
      form,
      ["What's the single biggest thing stopping you from buying that item?",
       "What's the single biggest thing stopping you?"],
      "Nothing is stopping me - I'm not actually planning to buy it"
    );
  });

  /* --- 3. Q8 help text. --- */

  patch("Q8: widen the help text", function () {
    return setHelp(
      form,
      ["Did you try to find that out? Tick everywhere you looked."],
      'Still about that same item. Tick as many as apply - and if there was ' +
      'nothing to look up, just tick "I didn\'t try".'
    );
  });

  /* --- 4. Page 3 is the one-item page, and its break carries that framing in
     its title. It used to be titled "The last thing you saved" and sat one page
     lower; with the last-30-days pair moving up to page 2 (see patch 7), this
     break becomes the top of the item page and says so.

     An earlier revision of this script turned that break into a SECTION HEADER,
     to merge two pages. The spec no longer does that - the reorder gives the
     item questions a page to themselves - so if a previous run already converted
     it, this asks for it back rather than pretending the form is current. --- */

  patch("page 3: title the item page", function () {
    var TITLE = "Now think about the last thing you saved";
    var HELP =
      "Look at the most recent item you saved and haven't bought. " +
      "All four questions on this page are about that one item.";

    var hdr = findByTitle(form, TITLE);
    if (hdr && hdr.getType() === FormApp.ItemType.SECTION_HEADER) {
      Logger.log("");
      Logger.log('  BY HAND: "' + TITLE + '" is a section header, left over from');
      Logger.log("  the old merged page. The spec now gives the item questions their own");
      Logger.log("  page. Add a page break above the \"why did you save that item\" question");
      Logger.log("  with that title and delete the header.");
      return SKIP;
    }

    var brk = findFirstByTitles(form, [TITLE, "The last thing you saved"]);
    if (!brk) return SKIP;
    if (brk.getTitle() === TITLE && brk.getHelpText() === HELP) return SKIP;
    if (!DRY_RUN) {
      brk.asPageBreakItem().setTitle(TITLE).setHelpText(HELP);
    }
    return null;
  });

  /* --- 5. Age and city became OPTIONAL. They are the only two questions on
     the form that feed no analysis - they describe the sample and nothing else -
     and they sit at exactly the point a respondent is most likely to abandon.
     Required on a live form, they cost completions and buy nothing. --- */

  [["Age"], ["Which city?"]].forEach(function (titles) {
    patch("make " + titles[0] + " optional", function () {
      return makeOptional(form, titles);
    });
  });

  /* --- 6. Q2's screen-out option still says "shop" under a stem that now asks
     how often you BUY - the same ambiguity, moved from the stem into the answer.
     The script will not touch it: that choice carries the screen-out branch, and
     the only way to edit a choice from Apps Script is to rewrite the whole list,
     which drops the navigation on every choice in it. Flag it. --- */

  patch("check Q2's screen-out wording", function () {
    var it = findFirstByTitles(form, [
      "How often do you buy clothes on Myntra?",
      "How often do you shop for clothes on Myntra?"
    ]);
    if (!it) return SKIP;
    var choices = it.asMultipleChoiceItem().getChoices();
    var stale = false;
    for (var i = 0; i < choices.length; i++) {
      if (choices[i].getValue() === "Never - I don't shop on Myntra") stale = true;
    }
    if (!stale) return SKIP;
    Logger.log("");
    Logger.log('  BY HAND: Q2 still offers "Never - I don\'t shop on Myntra" while the');
    Logger.log("  question now asks how often you BUY. Edit that option to read");
    Logger.log('  "Never - I don\'t buy clothes on Myntra" - then RE-SET its branching to');
    Logger.log("  Submit form, because editing an option's text can drop the navigation");
    Logger.log("  attached to it. Check it in Preview afterwards.");
    return SKIP;
  });

  /* --- 7. The last-30-days pair must sit ABOVE the wishlist count, not below
     it. Below, they are on the far side of the count's branch: anyone answering
     "0" - which includes anyone who bought everything they had saved - is sent
     to About you without ever being asked whether they bought anything. That is
     the north-star question censoring exactly the cases it exists to count.

     Not scripted. moveItem() re-indexes a form that has a branch pointing into
     it, and the branch is the thing we are protecting. Two drags by hand. --- */

  patch("check the last-30-days questions come first", function () {
    var count = findFirstByTitles(form, [
      "How many items are in your wishlist right now?",
      "How many items are in it right now?"
    ]);
    var opens = findFirstByTitles(form, [
      "In the last 30 days, how many times did you open your wishlist?",
      "In the last 30 days, how many times did you open it?"
    ]);
    if (!count || !opens) return SKIP;
    if (opens.getIndex() < count.getIndex()) return SKIP;
    Logger.log("");
    Logger.log("  BY HAND: the two last-30-days questions still sit AFTER the wishlist");
    Logger.log("  count, so they are behind its branch. Anyone answering \"0\" - including");
    Logger.log("  anyone who bought everything they had saved - skips the purchase");
    Logger.log("  question, and the north-star number reads low.");
    Logger.log("  Drag both onto page 2, ABOVE the count question. The count must stay");
    Logger.log("  LAST on that page or its branch stops working.");
    Logger.log("");
    Logger.log("  Then deal with the page break they used to live under - and WHICH");
    Logger.log("  action is right depends on what else is on that page:");
    if (itemQuestionsShareThePairsPage(form, opens)) {
      Logger.log("    On this form the item questions sit on that same page. DO NOT delete");
      Logger.log("    the break - once the pair moves up it becomes the top of the item");
      Logger.log("    page, which is what the spec wants. Deleting it would push the item");
      Logger.log("    questions onto page 2, leaving the count no longer last on its page");
      Logger.log("    and its branch dead. The retitle patch above renames it for you.");
    } else {
      Logger.log("    On this form that break heads an empty page once the pair moves up.");
      Logger.log("    Delete it.");
    }
    Logger.log("  Re-check the branch and Preview afterwards.");
    return SKIP;
  });

  /* --- 8. The interview opt-in and its contact field were REMOVED from the
     spec: the six walkthrough participants are recruited directly, so the form
     has no recruiting job and no reason to hold anyone's email.

     This script will not delete them for you. Deleting a live question also
     orphans its collected answers, and that is not a call a patch script should
     make silently on data you have already gathered. It flags them instead. --- */

  patch("check for the removed opt-in", function () {
    var optIn = findByTitle(form, "Happy to be contacted for that?");
    var contact = findByTitle(form, "Email or WhatsApp number");
    if (!optIn && !contact) return SKIP;
    Logger.log("");
    Logger.log("  NOTE: this form still has the interview opt-in and/or contact field.");
    Logger.log("  They are no longer in the spec. Delete them BY HAND once you have");
    Logger.log("  saved any contact details already collected - and remember the form");
    Logger.log("  description promises anonymity, so an email field left in place");
    Logger.log("  contradicts it.");
    return SKIP;
  });

  /* --- Summary + the checks a human still has to do. --- */

  Logger.log("");
  Logger.log("Applied: " + done.length + " | already current: " + skipped.length + " | failed: " + failed.length);
  failed.forEach(function (f) { Logger.log("  FAILED: " + f); });

  if (DRY_RUN) {
    Logger.log("");
    Logger.log("DRY RUN - nothing was written. Set DRY_RUN = false and run again.");
    return;
  }

  Logger.log("");
  Logger.log("NOW CHECK BY HAND - the script deliberately does not touch branching:");
  Logger.log('  1. Under "How many items are in your wishlist right now?" (this run may have');
  Logger.log('     just retitled it), 0 and "I don\'t have a wishlist" must still point at');
  Logger.log('     "About you". Retitling a question does not disturb its branching, but');
  Logger.log("     check it rather than assume it.");
  Logger.log('  2. Under Q2, the "Never" option must still point at "Submit form" - and see');
  Logger.log("     the note above about its wording.");
  Logger.log('  3. "Now think about the last thing you saved" heads its own page, with the');
  Logger.log("     four item questions under it and nothing else.");
  Logger.log("  4. Page count. The spec is 5 pages: the screen / your wishlist / the item /");
  Logger.log("     your wishlist in general / About you. You only get there after the hand");
  Logger.log("     steps this script printed above - moving the last-30-days pair, deleting");
  Logger.log("     the page break they left empty, and deleting the opt-in and contact page.");
  Logger.log("     A higher count before those is expected, not a failed run.");
  Logger.log("");
  Logger.log("AND REMEMBER: responses collected before now are not comparable on Q2 or Q7.");
  Logger.log("Patched at: " + new Date());
}


/* ------------------------------ helpers ------------------------------ */

var SKIP = "__skip__";

function truncate(s) { return s.length > 44 ? s.substring(0, 44) + "..." : s; }

function findByTitle(form, title) {
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === title) return items[i];
  }
  return null;
}

function findFirstByTitles(form, titles) {
  for (var i = 0; i < titles.length; i++) {
    var it = findByTitle(form, titles[i]);
    if (it) return it;
  }
  return null;
}

function retitle(form, oldTitle, newTitle) {
  if (findByTitle(form, newTitle)) return SKIP;
  var it = findByTitle(form, oldTitle);
  if (!it) throw new Error('not found under either wording: "' + truncate(oldTitle) + '"');
  if (!DRY_RUN) it.setTitle(newTitle);
  return null;
}

/**
 * Appends one option to a multiple-choice question.
 *
 * Refuses if any existing choice carries page navigation: setChoices() is the
 * only way to add one, and rebuilding the list would silently drop the
 * navigation. None of the questions this script touches should have any - if
 * this throws, something is not what we think it is, and stopping is correct.
 */
function addChoice(form, titles, newChoice) {
  var it = findFirstByTitles(form, titles);
  if (!it) throw new Error("question not found under any known wording");
  var mc = it.asMultipleChoiceItem();
  var choices = mc.getChoices();

  for (var i = 0; i < choices.length; i++) {
    if (choices[i].getValue() === newChoice) return SKIP;
    if (choices[i].getGotoPage() || choices[i].getPageNavigationType()) {
      throw new Error("this question carries branching - refusing to rewrite its choices. Add the option by hand.");
    }
  }
  if (!DRY_RUN) {
    mc.setChoiceValues(choices.map(function (c) { return c.getValue(); }).concat([newChoice]));
  }
  return null;
}

/**
 * Flips a question to optional. Idempotent: a question that is already optional
 * reports "already current" rather than being written again.
 */
function makeOptional(form, titles) {
  var it = findFirstByTitles(form, titles);
  if (!it) throw new Error("question not found under any known wording");
  // isRequired()/setRequired() live on the TYPED item, not on the generic Item
  // that getItems() hands back - so this has to cast before it can ask.
  var q = asQuestion(it);
  if (!q.isRequired()) return SKIP;
  if (!DRY_RUN) q.setRequired(false);
  return null;
}

/**
 * True if the one-item questions live on the SAME page as the last-30-days pair
 * - i.e. this form still carries the 3+4 merge an earlier revision of this
 * script applied.
 *
 * It decides whether the page break above the pair may be deleted once the pair
 * moves to page 2. Merged, that break becomes the top of the item page and
 * deleting it would spill the item questions onto page 2, leaving the count no
 * longer last on its page and its branch dead. Unmerged, the break heads an
 * empty page and should go.
 *
 * Scans forward from the pair for the first item question, stopping at the first
 * page break.
 */
function itemQuestionsShareThePairsPage(form, opens) {
  var items = form.getItems();
  var ITEM_QUESTIONS = [
    "Why did you save that item rather than buy it?",
    "Why did you save it rather than buy it?"
  ];
  for (var i = opens.getIndex() + 1; i < items.length; i++) {
    if (items[i].getType() === FormApp.ItemType.PAGE_BREAK) return false;
    for (var q = 0; q < ITEM_QUESTIONS.length; q++) {
      if (items[i].getTitle() === ITEM_QUESTIONS[q]) return true;
    }
  }
  return false;
}

/**
 * Casts a generic Item to its typed form. Throws on page breaks and section
 * headers, which are not questions and have no required flag.
 */
function asQuestion(it) {
  var t = it.getType();
  if (t === FormApp.ItemType.MULTIPLE_CHOICE) return it.asMultipleChoiceItem();
  if (t === FormApp.ItemType.CHECKBOX) return it.asCheckboxItem();
  if (t === FormApp.ItemType.TEXT) return it.asTextItem();
  if (t === FormApp.ItemType.PARAGRAPH_TEXT) return it.asParagraphTextItem();
  if (t === FormApp.ItemType.LIST) return it.asListItem();
  if (t === FormApp.ItemType.SCALE) return it.asScaleItem();
  throw new Error('"' + it.getTitle() + '" is not a question (' + t + ')');
}

function setHelp(form, titles, help) {
  var it = findFirstByTitles(form, titles);
  if (!it) throw new Error("question not found under any known wording");
  if (it.getHelpText() === help) return SKIP;
  if (!DRY_RUN) it.setHelpText(help);
  return null;
}
