# Runbook — patching the live wishlist form

Applies `update-wishlist-form.gs` to a form that is **already published and
already collecting responses**. Ten minutes.

> **The one way to get this badly wrong:** pressing Run with
> `createWishlistForm` still selected in the function dropdown. That creates a
> second form on a new URL and leaves you with split data. Check the dropdown
> before every run — step 6.

---

## 0. Export the responses first

Non-negotiable, because everything after this writes to a live form.

Form → **Responses** → the green Sheets icon → **File → Download → CSV**.

Save it **outside this repo** — it contains contact details from the interview
opt-in. While you have it open, note anyone who answered **Yes** to
*"Happy to be contacted for that?"* and message them today. Interviews are the
schedule long pole; a contact you have already earned is worth more than the
survey row it came on.

## 1. Get the form id

Open the form's **edit** page. The URL looks like:

```
https://docs.google.com/forms/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
                                └──────────── this bit ────────────┘
```

Copy the part between `/d/` and `/edit`.

> The share link — `/forms/d/e/1FAIpQL.../viewform` — carries a **different**
> id. `openById()` cannot use it. It must be the edit-url id.

## 2. Open the Apps Script project

<https://script.google.com> → the project you created the form from.

If you cannot find it: the project is standalone (it was created from
script.google.com, not from the form), so it will **not** appear under the form's
Extensions menu. Look in **My Projects**, sorted by last modified.

## 3. Add the script as a second file

In the editor, **Files → + → Script**. Name it `updateWishlistForm` — Apps Script
adds the `.gs` itself.

Paste the whole of `docs/research/update-wishlist-form.gs` in, replacing the
stub `myFunction` it creates.

Both files coexist safely: no function name is defined twice.

## 4. Set the form id

At the top of the new file:

```js
var FORM_ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz";   // from step 1
var DRY_RUN = true;                             // leave this alone for now
```

## 5. Save

**Ctrl/Cmd + S**, or the floppy icon. Apps Script runs the *saved* version — an
unsaved edit is not the code that executes.

## 6. Select the right function, then Run

In the toolbar there is a **function dropdown**. It will probably still say
`createWishlistForm`.

**Change it to `updateExistingForm`.** Then press **Run**.

If Google asks for authorisation: **Review permissions** → your account →
*Advanced* → *Go to (project name)* → **Allow**. It may ask again even though the
project is already authorised, because opening a form by id is a different
permission from creating one.

## 7. Read the log

The **Execution log** opens at the bottom of the editor. (Older editor:
**View → Logs**.)

You should see something like:

```
=== DRY RUN - nothing will be written ===
Form: "What's sitting in your Wishlist?"
Responses already collected: 3

  WOULD retitle: "How often do you shop for clothes on Myn..."
  WOULD Q7: add the no-intent option
  ...
Applied: 8 | already current: 0 | failed: 0

DRY RUN - nothing was written. Set DRY_RUN = false and run again.
```

**Check three things before going further:**

- The form title is the one you expect — a wrong `FORM_ID` fails here, not later
- The response count matches what you have
- `failed: 0`. Any `FAIL` line means that patch found something it did not
  expect and stopped rather than guessing. Read it before continuing; the other
  patches are unaffected and will still apply.

## 8. Apply it

Change one line:

```js
var DRY_RUN = false;
```

**Save**, confirm the dropdown still says `updateExistingForm`, and **Run** again.

The log now says `DID` instead of `WOULD`, and ends with the manual checks.

## 9. The four checks the script will not do for you

It deliberately never touches branching. Open the form and verify by eye:

- [ ] **`Happy to be contacted for that?`** → three dots → *Go to section based on
      answer* → **No** points at **Submit form**.
      *This is the important one. It is what stops the form asking for contact
      details from people who just declined.*
- [ ] **`How many items are in it right now?`** → **0** and **I don't have a
      wishlist** both point at **About you**
- [ ] **Q2** → **Never - I don't shop on Myntra** points at **Submit form**
- [ ] The form is now **6 pages**, and *"Now think about the last thing you
      saved"* appears as a heading mid-page rather than as a page break

---

## Appendix — setting the two branches by hand

`wireBranch` fails soft: if the Forms API refuses the navigation it sets the
choices without it, logs `COULD NOT SET BRANCHING`, and the form goes live
looking fine. This happened on the 20 Aug build. **Check the execution log after
every run, and check the branches in Preview before sharing the link.**

Repairing by hand is more reliable than re-running the script, because the same
API call is liable to fail the same way.

**Q2 — Section 1.** Click the **⋮** on the question card, choose *Go to section
based on answer*, then:

| Option | Goes to |
|---|---|
| Once a week or more | Continue to next section |
| A few times a month | Continue to next section |
| Every month or two | Continue to next section |
| A few times a year | Continue to next section |
| **Never - I don't buy clothes on Myntra** | **Submit form** |

**Q3 — Section 2.** Same menu, then:

| Option | Goes to |
|---|---|
| **0** | **Section 5 (About you)** |
| 1-5 | Continue to next section |
| 6-15 | Continue to next section |
| 16-30 | Continue to next section |
| More than 30 | Continue to next section |
| **I don't have a wishlist** | **Section 5 (About you)** |

**Then prove it in Preview** — the eye icon. Nothing else counts as verification:

1. Answer Q2 "Never" → should land on the submit page immediately
2. Restart, answer Q2 anything else, Q3 = **0** → should jump to "About you",
   skipping Q4-Q12

Two traps:

- Once per-answer branching is on, the **"After section N"** footer dropdown no
  longer applies. It is not the control for this.
- **Set branching before editing any option's wording.** Editing an option's text
  can drop the navigation attached to it.

## 10. Afterwards

- **Re-running is safe.** Every patch is idempotent; a second run reports
  `already current` and changes nothing.
- **Record the patch time.** The log prints it. Responses collected *before* it
  answered a different Q2 and a Q7 with one fewer option — they do not pool on
  those two questions. They pool fine on the other twelve. One line in the deck's
  method note.
- **Mirror any hand-edit back into the repo.** Once the form is live,
  `create-wishlist-form.gs` stops being what is deployed unless you keep it in
  step. The repo is what the deck cites.
