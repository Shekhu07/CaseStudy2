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
     "What would you need to know to decide on that item today - buy it, or delete it?"]
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

  /* --- 4. Page 3 heading now covers both halves of the merged page. --- */

  patch("page 3: retitle for the merged page", function () {
    var it = findByTitle(form, "The last 30 days");
    if (!it) return SKIP;
    if (!DRY_RUN) {
      it.asPageBreakItem()
        .setTitle("Your wishlist, and the last thing you saved")
        .setHelpText("Open your Myntra wishlist if you closed it - the first two need a number.");
    }
    return null;
  });

  /* --- 5. Merge pages 3+4: the page break becomes an in-page section header,
     so the "one specific item" framing survives without splitting the form. --- */

  patch("merge pages 3+4 (page break -> section header)", function () {
    if (findByTitle(form, "Now think about the last thing you saved")) return SKIP;
    var brk = findByTitle(form, "The last thing you saved");
    if (!brk) return SKIP;
    assertNotANavigationTarget(form, brk);
    var idx = brk.getIndex();
    var help = brk.asPageBreakItem().getHelpText();
    if (!DRY_RUN) {
      form.deleteItem(brk);
      var hdr = form.addSectionHeaderItem()
        .setTitle("Now think about the last thing you saved")
        .setHelpText(help || "Look at the most recent item you saved and haven't bought. " +
                             "The next four questions are about that one item.");
      form.moveItem(hdr.getIndex(), idx);
    }
    return null;
  });

  /* --- 6. The interview opt-in and its contact field were REMOVED from the
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
  Logger.log('  1. Under "How many items are in it right now?", 0 and "I don\'t have a wishlist"');
  Logger.log('     must still point at "About you".');
  Logger.log('  2. Under Q2, "Never - I don\'t shop on Myntra" must still point at "Submit form".');
  Logger.log("  3. The form should now be 5 pages, ending on \"About you\".");
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

function setHelp(form, titles, help) {
  var it = findFirstByTitles(form, titles);
  if (!it) throw new Error("question not found under any known wording");
  if (it.getHelpText() === help) return SKIP;
  if (!DRY_RUN) it.setHelpText(help);
  return null;
}

/**
 * Deleting a page break that some choice navigates TO would silently break that
 * branch. Neither break this script removes should be a target - verify rather
 * than assume.
 */
function assertNotANavigationTarget(form, pageBreak) {
  var id = pageBreak.getId();
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    var t = items[i].getType();
    if (t !== FormApp.ItemType.MULTIPLE_CHOICE && t !== FormApp.ItemType.LIST) continue;
    var choices = (t === FormApp.ItemType.MULTIPLE_CHOICE)
      ? items[i].asMultipleChoiceItem().getChoices()
      : items[i].asListItem().getChoices();
    for (var c = 0; c < choices.length; c++) {
      var target = choices[c].getGotoPage();
      if (target && target.getId() === id) {
        throw new Error('"' + items[i].getTitle() + '" navigates to this page break - refusing to delete it.');
      }
    }
  }
}
