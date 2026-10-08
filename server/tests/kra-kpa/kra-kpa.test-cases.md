# KRA & KPA Test Cases

## Test setup

Use the following users in the same company:

- Employee A in Department A
- Employee B in Department A
- Manager A configured as Department A's manager
- Manager B configured as another department's manager
- HR user
- Top Management user

Create at least one active employee in Department A for the Lead dropdown.

## 1. Role-based access

| ID | Role | Test | Steps | Expected result |
|---|---|---|---|---|
| RB-01 | Employee | Open own Self KRA page | Log in as Employee A and open Self KRA | Page and Add Self KRA button are visible |
| RB-02 | Employee | Lead field visibility | Open the Add Self KRA form | Lead field is hidden; Employee A is assigned as lead by the backend |
| RB-03 | Employee | Review section visibility | Open a Self KPA edit form | Review Details section is hidden |
| RB-04 | Employee | Delete access | Select a Self KRA and Self KPA row | Delete icon is not shown |
| RB-05 | Manager | Lead selection | Log in as Manager A and add a Self KRA for Department A | Lead dropdown shows active Department A users |
| RB-06 | Manager | Manager review fields | Open a completed Self KPA edit form | Manager Comments, Review Status and Closed On are available; Manager Rating is the last field; rating dates and HR Rating are hidden |
| RB-07 | Manager | Department delete access | Select a Department A Self KRA or Self KPA | Delete icon is shown |
| RB-08 | Other manager | Cross-department delete access | Log in as Manager B and view Department A records | Delete action is unavailable or rejected |
| RB-09 | HR | Full KPA review form | Open a completed Self KPA edit form | HR can edit every KPA and manager-review field available to the department manager, plus HR Comments and HR Rating; rating dates remain hidden |
| RB-10 | HR | Delete access | Select a Self KRA or Self KPA | Delete icon is not shown |
| RB-11 | Top Management | Review access | Open a completed Self KPA edit form | Manager-review fields are visible; HR Rating and HR Rating Date are hidden |
| RB-12 | Top Management | Delete access | Select a Self KRA or Self KPA | Delete icon is shown |
| RB-13 | Employee | Department-page bypass | Open KRA & KPA and select Department KPA | Department KPA page is skipped and the employee's own Self KPA/Self KRA tabs open |
| RB-14 | Single-department manager | Department-page bypass | Open KRA & KPA and select Department KPA | Department KPA page is skipped and that department's member list opens |
| RB-15 | HR | All-department access | Open KRA & KPA > Department KPA and open departments | All company departments are listed and HR can open their employee lists |
| RB-16 | HR | KPA details access | Open a Self KPA edit form for any department | KPA Details remains visible and Month is disabled |
| RB-17 | Department table | Open KRA & KPA > Department KPA | Table title is DEPARTMENT-WISE PENDING KPA & KRA and each department shows separate Pending KPA and Pending KRA counts |
| RB-18 | Member table | Open a department's Member Wise KPA page | Title ends with MEMBER WISE PENDING KRA & KPA; Pending KPA appears before Pending KRA for every member |
| RB-19 | Employee | KPA edit fields | Open an existing Self KPA edit form | Only Resource Comment is available and the form section has no border |
| RB-20 | HR | KPA edit access | Open a KPA edit form | Edit action is available and HR Comments can be updated |

## 2. Self KRA creation and recurrence

| ID | Test | Steps | Expected result |
|---|---|---|---|
| KRA-01 | Required fields | Submit Add Self KRA without title, description or the required lead | Form is not submitted; each missing field shows its inline required error without a browser tooltip |
| KRA-02 | Create template | Enter title, description and lead where applicable; save | One Self KRA template is created and appears as Pending |
| KRA-03 | Daily recurrence | Create a KRA today, then select tomorrow in the day picker | The same active KRA appears as Pending for tomorrow |
| KRA-04 | Before start date | Select a date before the KRA was created | The KRA does not appear |
| KRA-05 | Complete occurrence | Select today's row and click Mark as Done | Today's occurrence moves to the completed table |
| KRA-06 | Next-day status | Complete today's KRA, then select the next day | The KRA appears again as Pending |
| KRA-07 | Duplicate completion | Try to complete the same KRA twice for the same date | Second completion is rejected |
| KRA-08 | Completion authorization | View a KRA as a user who is not its assigned lead | Mark as Done is not shown; direct API request is rejected |
| KRA-09 | Creator without assignment | Open a KRA as its creator when another user is the assigned lead | Mark as Done is not shown |
| KRA-10 | Assigned lead completion | Open a manager-created KRA as its assigned lead | Mark as Done is enabled |
| KRA-11 | Future occurrence | Select a date after today | KRA remains visible as Pending, but Mark as Done is not shown |
| KRA-12 | Future completion API | Send a completion request with a future occurrence date | Request is rejected and no completion record is created |
| KRA-13 | Past occurrence actions | Select a date before today | The Actions column is not shown |
| KRA-14 | Today's actions | Select today | Mark as Done is shown to the assigned lead and Edit is shown to authorized users |
| KRA-15 | Non-today API actions | Send an edit or completion request with a past or future occurrence date | Request is rejected without changing the template or creating a completion |
| KRA-16 | Future occurrence actions | Select a date after today | The Actions column is not shown |

## 3. Self KRA snapshot history

| ID | Test | Steps | Expected result |
|---|---|---|---|
| KS-01 | Snapshot creation | Complete a Self KRA for a selected day | Completion collection stores occurrence date, title, description, employee, lead, creator, completed time and completed user |
| KS-02 | Edit after completion | Complete today's KRA, then edit its template title or description | Today's completed entry keeps its original values |
| KS-03 | Future snapshot | After editing the template, complete it on a later date | Later completion contains the updated template values |
| KS-04 | Completion uniqueness | Inspect completion records for one template and date | Only one completion exists for that template/date pair |
| KS-05 | Archive history | Delete/archive a KRA that has a completed occurrence | It stops repeating on future dates, while its completed historical entry remains available |

## 4. Self KPA creation and completion

| ID | Test | Steps | Expected result |
|---|---|---|---|
| KPA-01 | Required fields | Submit Add Self KPA without target or deadline | Form is not submitted; each missing field shows its inline required error without a browser tooltip |
| KPA-02 | Automatic month | Create a Self KPA | The current month is assigned automatically without showing a Month field in the add form |
| KPA-03 | Default state | Create a valid Self KPA | KPA Status, Review Status and Final Closure are Pending |
| KPA-04 | Completion authorization | Open a KPA as a user who did not create it | Mark as Done is not shown; direct API request is rejected |
| KPA-05 | Complete KPA | As the KPA creator, enter Resource Comment and click Mark as Done | KPA Status becomes Completed, but the record remains in the active table while Final Closure is Pending |
| KPA-06 | Missing completion comment | Try Mark as Done without Resource Comment | Completion is blocked |
| KPA-07 | Delayed days on time | Complete a KPA on or before its deadline and open its view modal | Delayed Days is 0 |
| KPA-08 | Delayed days when late | Complete a KPA after its deadline and open its view modal | Delayed Days equals closing date minus deadline in calendar days |

## 5. Self KPA review flow

| ID | Test | Steps | Expected result |
|---|---|---|---|
| RV-01 | Review disabled before completion | Open a Pending KPA as Manager A | Review Status is disabled and a short completion-required message appears at the end of the form |
| RV-02 | Manager rating | Complete a KPA and close its review, then add Manager Rating | Manager Rating unlocks only after Review Status is Closed; its automatic date is stored but not shown in the form or view modal |
| RV-03 | HR review dependency | Open a completed KPA as HR before Manager Rating is added | HR Comments and HR Rating are disabled and a short manager-rating-required message appears at the end of the form |
| RV-04 | HR review enabled | Add Manager Rating, then reopen as HR | HR Comments and HR Rating are enabled |
| RV-05 | Final closure pending | View the KPA table before HR Rating is added | Final Closure displays Pending |
| RV-06 | Final closure completed | Add HR Rating 0 or 1 and save | Final Closure displays Closed and the KPA moves to the completed table |
| RV-07 | Changes required | Manager selects Changes Required and adds Manager Comments | KPA Status returns to Pending; Review Status remains Changes Required |
| RV-08 | Re-completion | The KPA creator marks a Changes Required KPA done again | KPA Status becomes Completed; Review Status remains Changes Required |
| RV-09 | Close review | Manager selects Closed | Closed On is stored; Review Status displays Closed |
| RV-10 | Review options | Open the Review Status dropdown | Only Changes Required and Closed are selectable; Pending is the automatic default |
| RV-11 | Rating before closure | Try to add Manager or HR Rating before Review Status is Closed | Rating is disabled in the form and a direct API request is rejected |
| RV-12 | Manager review tracking | Add Manager Comments, change Review Status to Changes Required, and later close it | Each review event is appended to the timeline with the comment snapshot, reviewing user, and exact date and time |
| RV-13 | Re-completion tracking | Mark a KPA done, request changes, and mark it done again | Every Mark as Done action appears in the completion timeline with the user, resource comment, and exact date and time |
| RV-14 | Repeated changes required | After the employee re-completes a KPA, save Changes Required again | Another Changes Required event is added to the review timeline and the KPA returns to Pending |
| RV-15 | HR comments dependency | Try to add HR Comments before Manager Rating through the form and API | HR Comments is disabled in the form and the API rejects the update |

## 6. Tables and view modal

| ID | Test | Steps | Expected result |
|---|---|---|---|
| UI-01 | KRA table separation | Complete a Self KRA | Pending and completed records appear in separate tables |
| UI-02 | KPA table separation | Complete a Self KPA, then complete final closure through HR Rating | The KPA appears in the completed table only after final closure |
| UI-03 | KPA workflow columns | View the Self KPA table | KPA Status, Review Status and Final Closure columns are visible |
| UI-04 | KRA assigned-by value | View a Self KRA | Assigned By shows the user who created the KRA |
| UI-05 | KPA details modal | Click a KPA target | View-only modal shows KPA Details, Review Details and Delayed Days |
| UI-06 | Completed table view | Click the KRA Title or KPA Target in a completed table | Correct KRA/KPA details modal opens and no Action column is shown |
| UI-07 | KPA view sections | Open a KPA view modal | Manager Review and HR Review are shown as separate sections |
| UI-08 | KPA month edit | Open an existing KPA edit form as an authorized user | Month is visible but disabled |
| UI-09 | KPA edit review sections | Open a KPA edit modal as HR | Manager Review and HR Review are displayed as separate bordered sections |

## Result recording

For each test, record:

- Pass or Fail
- Tested user role
- Test date
- Short failure note or screenshot reference
