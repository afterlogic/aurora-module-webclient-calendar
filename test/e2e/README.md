# Desktop E2E (Playwright)

Scenarios for **CalendarWebclient**. Runner lives at the Aurora install root:

```bash
# from install root
npm run test:e2e-desktop
npm run test:e2e-desktop -- --setup "CalendarWebclient Chrome"
```

Shared helpers: `modules/CoreWebclient/test/e2e/helpers/` (`AURORA_E2E_ROOT`).
Domain helpers: `./helpers/` in this folder.

Filter Playwright UI / CLI by **file name**.

| File | What it covers |
|------|----------------|
| `calendar.spec.js` | Open Calendar, Day / Week / Month / Today |
| `calendar-events.spec.js` | Create / edit title / edit time / all-day / delete |
| `calendar-share.spec.js` | Create calendar and open share |
| `calendar-share-multiuser.spec.js` | PRIMARY shares → SECONDARY sees sidebar |

## Stand / helpers

- Knockout `click` on **New Event** does not receive a Playwright pointer click (jQuery handlers). The helper triggers `$(el).click()` like Files toolbar tests.
- Share dialog: Inputosaurus hides the native guests `<input>`. Use the visible `textbox` in `calendar-share-dialog`, pick `.ui-autocomplete` when shown (like Files share), blur the heading, then Save.
- After changing HTML `data-test-id` in templates, clear PHP template cache: `rm -f data/cache/templates-*.cache` from the install root.
- Multi-user share needs `E2E_LOGIN_SECONDARY` / `E2E_PASSWORD_SECONDARY` in `.env.e2e` (`calendar-share-multiuser.spec.js`).
