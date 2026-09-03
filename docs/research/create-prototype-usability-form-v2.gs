/**
 * Builds the prototype usability survey as a Google Form. Plain-language edition.
 *
 * HOW TO RUN
 *   1. https://script.google.com  ->  New project
 *   2. Delete the sample code, paste this file in, Save
 *   3. Run  ->  createPrototypeUsabilityFormV2
 *   4. Authorise (your own account, creating your own form)
 *   5. View -> Logs for the live and edit URLs
 *
 * Creates a NEW form on a new URL. v1's five responses stay where they are and
 * cannot be pooled with these -- different wording, different task list.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS ASKS, AND WHY (one line each, in form order)
 *
 *   Q2   did anything from the wishlist come back    -> reconnection worked at all
 *   Q3   was it theirs or seeded                     -> only their own carries intent
 *   Q4   was it clear why it showed up               -> the comprehension target
 *   Q5   what was confusing                          -> free text, only when Q4 isn't "yes"
 *   Q6   how sure about buying                       -> doubt resolution, self-report
 *   Q7   enough to decide, or check elsewhere        -> the sharper version of Q6
 *   Q8   did it answer the doubt                     -> the direct question
 *   Q9   versus what we said it does                 -> partial recovery of blind signal
 *   Q10  what stopped them buying                    -> corpus doubts AND the three the
 *                                                       v1 panel named for itself
 *   Q11  what would have settled it                  -> gap in the screen, or a UI miss
 *   Q12  out-of-stock recovery                       -> the named usability question
 *   Q13  what the add did                            -> tests the add-is-a-decision claim
 *   Q14  which button first                          -> pairs with the click log
 *   Q15  why that one                                -> optional colour on Q14
 *   Q16  did reordering the comparison help          -> the compare screen's whole thesis
 *   Q17  was the pairing useful                      -> needs task step 5 to be reachable
 *   Q18  useful overall                              -> asked without naming a comparison
 *   Q19  what would make it useful                   -> the softest signal; read, don't build
 *   Q20  what really brings them back                -> off the demo, tests the Part 2 premise
 *
 * LANGUAGE. Every stem is written to be read once, on a phone, by someone who does
 * not work in product. Short sentences, no jargon, no question carrying two asks.
 * Where a question needs context it gets one plain clause, not a preamble.
 *
 * THE WISHLIST IS PARTLY THEIRS. Task step 1 has respondents heart 2-3 things
 * before searching, and Q3 separates those from the seeded 30. Only a match on
 * something they chose is evidence that reconnection helps with an item somebody
 * actually wanted. The seeded items stay because the demo catalog is small and pure
 * self-selection would have people searching for things with no match.
 *
 * WHAT THIS CANNOT DO, and it belongs in the write-up: nobody can be made to
 * forget. The feature exists because saving and returning are separated by time.
 * Someone who hearts a shirt and searches for it ninety seconds later remembers it
 * perfectly. This shows whether the module is clear and useful. It cannot show that
 * it rescues a forgotten decision -- that needs the production ramp.
 *
 * NO BRANCHING. Every task-specific question carries its own "didn't do this"
 * option instead. A silently broken branch costs the most responses before anyone
 * notices, and this runs unmoderated.
 *
 * SCOPE - 22 questions, 6 pages, about 6 minutes.
 * ---------------------------------------------------------------------------
 */

function createPrototypeUsabilityFormV2() {
  var form = FormApp.create("Five minutes on the prototype");

  var PROTOTYPE_URL = "https://wishlist-reconnection-prototype.vercel.app";

  form.setDescription(
    "Thanks for helping out. Spend a few minutes in the app, then answer a few " +
      "questions about it.\n\n" +
      PROTOTYPE_URL +
      "\n\n" +
      "About 6 minutes in total. No name, no email. Your answers are used only " +
      "for a student project, and only as group totals.",
  );

  applySetting(form, "setProgressBar", true);
  applySetting(form, "setShuffleQuestions", false);
  applySetting(form, "setCollectEmail", false);
  applySetting(form, "setLimitOneResponsePerUser", false);
  applySetting(form, "setAllowResponseEdits", false);
  applySetting(form, "setShowLinkToRespondAgain", false);

  applySetting(
    form,
    "setConfirmationMessage",
    "Thanks! If you want another look, the app is here: " + PROTOTYPE_URL,
  );

  /* ---------------------------- Page 1 ---------------------------- */

  // A form item, not just the top-of-form description: the description scrolls
  // away on a phone the moment the questions begin, and these steps have to
  // survive that.
  form
    .addSectionHeaderItem()
    .setTitle("Before you start")
    .setHelpText(
      "Open the app in another tab, do the steps below, then come back here.\n\n" +
        PROTOTYPE_URL +
        "\n\n" +
        "The wishlist already has things in it. Add a couple of your own first, so " +
        "some of what you see is actually yours.\n\n" +
        "  1. On the home page, tap the heart on 2-3 things you'd really think " +
        "about buying.\n" +
        "  2. Search for one of: shirt, jeans, kurta, handbag. Pick the kind of " +
        "thing you just added, if you can.\n" +
        "  3. Tap something that shows up under \"From your Wishlist\". Read what " +
        "it says about that item, and try the \"Why did this appear?\" link.\n" +
        "  4. Try adding it to your bag. If your size or the item is gone, see " +
        "what it offers you.\n" +
        "  5. Open two wishlist items and compare them. Tap fit, delivery or " +
        "reviews to reorder what you see.\n" +
        "  6. Go back to the results and open an ordinary product - not a wishlist " +
        "one. Scroll to the bottom of that page.\n\n" +
        "About 6 minutes in all, questions included."
    );

  // WHAT TO TELL THEM, AND WHAT NOT TO.
  //
  // The rule this list follows: say WHERE a thing is, never whether it is any
  // good. "You can switch colour and the one you saved stays on screen" helps
  // somebody find a feature. "It gives you real next moves rather than a
  // confirmation that disappears" hands them the answer to a question further down.
  // v1 broke that rule once and it cost Q13 its blind status entirely.
  //
  // What is deliberately NOT described: what happens when you add something to
  // your bag. Step 4 sends them there; this list stays silent on the outcome, so
  // Q13 is the one question on the form still asked cold.
  //
  // The cost of a fuller list, stated once: Q4, Q12, Q16 and Q17 now measure
  // "could they find it and follow it", not "did they discover it unaided". That
  // is the right trade for a 6-minute unmoderated test -- you cannot test whether
  // somebody understood a screen they never reached -- but it is a trade, and the
  // write-up should say so rather than implying discovery was unprompted.
  form
    .addSectionHeaderItem()
    .setTitle("What you'll find in the app")
    .setHelpText(
      "So you know where to look. You don't have to try all of it.\n\n" +
        "  - Home page: tap the heart on anything to put it in your wishlist.\n" +
        "  - As you type a search: things from your wishlist show up above the " +
        "usual suggestions.\n" +
        "  - In the search results: a \"From your Wishlist\" group, showing the " +
        "colour and size you saved, whether it's in stock, and when it would " +
        "arrive. There's a \"Why did this appear?\" link as well.\n" +
        "  - On a wishlist item: a list of checks - sizing, fit, delivery, seller, " +
        "reviews. Each one says where it got that from, and shows \"?\" when it " +
        "can't say.\n" +
        "  - Switch the colour and the one you saved stays on screen beside it.\n" +
        "  - If your size has gone, it points you to the sizes that are left " +
        "instead of stopping there.\n" +
        "  - Compare: put wishlist items side by side and tap fit, delivery or " +
        "reviews to reorder them. There's a \"Help me decide\" as well.\n" +
        "  - At the bottom of any ordinary product page: \"Style it with your saved " +
        "items\" - things from your wishlist that go with what you're looking at.",
    );

  form
    .addCheckboxItem()
    .setTitle("Can we use your answers in a student project?")
    .setHelpText("No name, no email. Group totals only. App link: " + PROTOTYPE_URL)
    .setChoiceValues(["Yes"])
    .setRequired(true);

  /* ---------------------------- Page 2 ---------------------------- */

  form
    .addPageBreakItem()
    .setTitle("Finding something from your wishlist")
    .setHelpText("About the search you just did.");

  // Separates "didn't spot it" from "nothing matched" -- a UI failure and a
  // catalog failure, which v1 could not tell apart.
  form
    .addMultipleChoiceItem()
    .setTitle("When you searched, did anything from your wishlist come up?")
    .setChoiceValues([
      "Yes, I spotted it right away",
      "Yes, but I had to look for it",
      "No, I didn't notice any",
      "No, nothing in my wishlist matched",
    ])
    .setRequired(true);

  // The point of the hybrid task list. Only a match the respondent chose carries
  // any intent; a seeded item was never wanted, so a doubt "resolved" about one
  // was never open. store.ts tags hearted items USER_SAVED_ROLE, so this can be
  // checked against the log rather than trusted alone.
  form
    .addMultipleChoiceItem()
    .setTitle("Was it something you added, or something already in the wishlist?")
    .setChoiceValues([
      "Something I added",
      "Something already there",
      "Both",
      "Nothing came up",
    ])
    .setRequired(true);

  // The comprehension target lands on this question's top option.
  form
    .addMultipleChoiceItem()
    .setTitle("Was it clear why those items came up?")
    .setChoiceValues([
      "Yes, clear",
      "Sort of",
      "No, I couldn't tell why",
      "I didn't see them",
    ])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Was anything about it confusing?")
    .setHelpText("Only if something felt off. A few words is fine.")
    .setRequired(false);

  /* ---------------------------- Page 3 ----------------------------
   * Every question here has a way out, because page 2 lets someone say they
   * never found anything.
   * ---------------------------------------------------------------- */

  form
    .addPageBreakItem()
    .setTitle("Making up your mind")
    .setHelpText("About the item you opened. Skip these if you didn't open one.");

  // Optional: a scale has no "not applicable" position, and someone who never
  // opened an item would otherwise park on the midpoint.
  form
    .addScaleItem()
    .setTitle("How sure were you about whether to buy it?")
    .setHelpText("Being sure you don't want it counts too.")
    .setBounds(1, 5)
    .setLabels("Not sure at all", "Completely sure")
    .setRequired(false);

  // v1's third option judged the app rather than saying where they'd go next.
  form
    .addMultipleChoiceItem()
    .setTitle("Was that enough to decide, or would you check somewhere else first?")
    .setChoiceValues([
      "Enough to decide",
      "Helped, but I'd still check elsewhere",
      "I'd mostly have to look elsewhere",
      "I didn't open an item",
    ])
    .setRequired(true);

  // Optional for the same reason, plus one of its own: someone who had no doubt
  // cannot agree or disagree, and the midpoint would read as lukewarm agreement.
  form
    .addScaleItem()
    .setTitle("I had a doubt about the item, and this answered it.")
    .setHelpText("Skip if you had no doubt to begin with.")
    .setBounds(1, 5)
    .setLabels("Strongly disagree", "Strongly agree")
    .setRequired(false);

  // Restates the list rather than pointing at "page 1", which respondents do not
  // number and which scrolled off their phone minutes ago.
  form
    .addMultipleChoiceItem()
    .setTitle("We listed what this app is meant to do. What you saw was:")
    .setChoiceValues([
      "About what we said",
      "Better than we said",
      "Less than we said",
      "I don't remember that list",
    ])
    .setRequired(true);

  // TWO TAXONOMIES IN ONE QUESTION, and the second half was earned the hard way.
  //
  // The first four options are the corpus's own named doubts, so self-report still
  // tallies straight against Part 2's split (fit 46.2%, trust 9.7%) without needing
  // free text re-coded first.
  //
  // The next three come from the v1 run. Three of its five respondents picked
  // "Other" and wrote, in their own words: "too many similar options, can't tell
  // them apart", "could get out of style if it was in wishlist for too long", and
  // "how it will pair with others". Same shape, all three -- not a missing fact, an
  // unresolved decision. The corpus could not surface these because reviews are
  // written after delivery, about the product, and nobody reviews an item they saved
  // and never went back to. Leaving them in "Other" would have thrown away the
  // finding that most supports Part 4's problem statement.
  //
  // Keeping both halves in one list is the point: the tally shows how much of what
  // blocks a purchase the corpus could see, and how much it could not.
  //
  // v1's "I've already decided" pointed both ways -- decided to buy, decided not to
  // -- and was therefore uncountable. Replaced with a clear positive.
  form
    .addMultipleChoiceItem()
    .setTitle("What's the main thing stopping you from buying it?")
    .setChoiceValues([
      "Not sure it'll fit",
      "Not sure it's genuine or good quality",
      "The price",
      "Returning it would be a hassle",
      "Too many similar options, I can't tell them apart",
      "It might be out of style by now",
      "I don't know what it goes with",
      "Nothing, I'd be happy to buy it",
      "I didn't open an item",
    ])
    .showOtherOption(true)
    .setRequired(true);

  // Follows straight on from the question above and leans on that adjacency --
  // Forms has no answer piping, so these two must stay in this order, together.
  // Keeps the original diagnostic: name something the screen already showed and
  // it's a legibility problem; name something it doesn't say and there's a gap.
  form
    .addParagraphTextItem()
    .setTitle("What would the app have to show you to settle that?")
    .setHelpText("Whatever would actually decide it, either way. Leave blank if nothing was in the way.")
    .setRequired(false);

  /* ---------------------------- Page 4 ---------------------------- */

  form.addPageBreakItem().setTitle("If something was out of stock");

  form
    .addMultipleChoiceItem()
    .setTitle("If your size or the item was gone, was it clear what to do next?")
    .setChoiceValues([
      "Yes, totally clear",
      "Sort of clear",
      "Confusing",
      "This didn't happen to me",
    ])
    .setRequired(true);

  // Tests the "add is a decision point, not a toast" claim. Neither option is
  // named as correct. Still not fully blind -- nothing unmoderated is -- but it
  // no longer carries its own answer key on page 1.
  form
    .addMultipleChoiceItem()
    .setTitle("When you added it to your bag, what happened?")
    .setChoiceValues([
      "It gave me choices about what to do next",
      "It just showed a confirmation",
      "I don't remember",
      "I didn't add anything",
    ])
    .setRequired(true);

  // The countable half of what v1 buried in one optional text box. A mismatch
  // between this and the logged click is a finding about the button fills.
  form
    .addMultipleChoiceItem()
    .setTitle("Which did you notice first, \"Buy from Wishlist\" or \"Compare options\"?")
    .setChoiceValues([
      "Buy from Wishlist",
      "Compare options",
      "Both together",
      "I didn't get to that screen",
    ])
    .setRequired(true);

  form
    .addTextItem()
    .setTitle("Why that one?")
    .setHelpText("A few words. Skip if you're not sure.")
    .setRequired(false);

  /* ---------------------------- Page 5 ---------------------------- */

  form.addPageBreakItem().setTitle("Comparing, and what goes with what");

  // Names the actual tabs. v1 described the mechanic in the researcher's words
  // ("sorting them by what mattered to you"), which nobody would recognise.
  form
    .addMultipleChoiceItem()
    .setTitle(
      "On the compare screen you could tap fit, delivery, reviews and so on to reorder things. Did that help you decide?",
    )
    .setChoiceValues([
      "Yes, it helped",
      "It moved things around but didn't help",
      "I didn't notice any change",
      "I didn't use compare",
    ])
    .setRequired(true);

  // Reachable only because of task step 5 -- the search-results pairing strip is
  // harness-gated, and tapping a wishlist item goes to a screen with no pairing
  // at all. See STATUS.md item 3.
  form
    .addMultipleChoiceItem()
    .setTitle("If you saw \"Style it with your saved items\", was it any good?")
    .setChoiceValues([
      "Yes, I'd actually put those together",
      "I saw one, but it didn't fit",
      "I didn't see one",
    ])
    .setRequired(true);

  /* ---------------------------- Page 6 ---------------------------- */

  form.addPageBreakItem().setTitle("Last few");

  // No comparison named in the question. v1's "useful on its own" leaked the
  // researcher's frame and invited "on its own compared to what?".
  form
    .addScaleItem()
    .setTitle("This would be useful to me when I shop.")
    .setBounds(1, 5)
    .setLabels("Strongly disagree", "Strongly agree")
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("What would make it genuinely useful to you?")
    .setHelpText("One line is plenty.")
    .setRequired(false);

  // Off the demo, deliberately. Tests the assumption that coming back is already
  // handled by notifications and price-drop alerts.
  form
    .addCheckboxItem()
    .setTitle("On your own wishlist, not this demo: what actually makes you go back to something you saved?")
    .setHelpText("Tick all that apply. Think about the last few times, not in general.")
    .setChoiceValues([
      "A notification or price-drop alert",
      "I go and look on my own",
      "Someone mentions it, or sends me something like it",
      "I mostly don't go back",
    ])
    .setRequired(true);

  // "Under 18" removed: a tickbox is not consent from a minor, and it fed no
  // analysis.
  form
    .addMultipleChoiceItem()
    .setTitle("Age")
    .setChoiceValues(["18-24", "25-32", "33-40", "Over 40"])
    .setRequired(false);

  form.addTextItem().setTitle("Which city?").setRequired(false);

  Logger.log("Share this link:  " + form.getPublishedUrl());
  Logger.log("Edit it here:     " + form.getEditUrl());
}

/**
 * Calls form[name](value) if that method exists, logging instead of throwing if it
 * does not. Presentation settings only.
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
