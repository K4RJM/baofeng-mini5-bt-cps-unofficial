# Baofeng Mini 5 BT CPS – Unofficial

Free, noncommercial browser software by K4RJM, prepared for GitHub Pages. Build 19 replaces the placeholder with a single-screen editor, preserving the user-tested build 18 radio core unchanged.

Build 19.1 adds trailing-zero completion for edited channel/VFO frequencies: `146.52` becomes `146.52000` on leaving the field or applying/saving. Blank transmit fields remain blank, excess precision is rejected rather than rounded, and untouched imported values remain unchanged. All 28 tests pass; protected radio/codec/validation files remain unchanged.

Build 19.2 places the workspace title, description and source badge on one compact line, removes the redundant workspace label, and reduces spacing around the status bar. Long descriptions truncate visually on narrow screens while their full text remains available to assistive technology. Radio behavior is unchanged.

Build 19.3 adds Help guidance that only native CPS DAT files are supported and explains using the same file with stock Baofeng CPS/cable or this app/Bluetooth.

Build 19.4 adds K4RJM's GitHub profile and QRZ callsign links below the developer credit. Both open in a new tab.

Build 19.5 adds expandable feature guides on the editing screens and a Help walkthrough covering files, channels, optional settings, VFOs and DTMF. It distinguishes signaling-code groups from channel groups, explains the radio’s built-in weather button, and marks unavailable presets and RepeaterBook import. Radio programming behavior is unchanged.

Build 19.6 adds a simplified interactive Mini 5 button diagram in Radio & help. Hover, keyboard focus or tap shows a tutorial, labels fixed versus assignable controls, and explains the workspace side-key assignment. The diagram only displays instructions; it sends no radio commands.

⚠ **Experimental Software — Radio Damage Risk**

Programming errors, software defects, or interrupted communication may render your radio inoperable. Always maintain a backup dat for use with official CPS and programming cable.

## Implemented

- System-aware dark/light appearance and manual override, responsive left navigation, fixed warning/progress and connection status.
- Blank workspace, 999 editable channels, edit/delete/add-above, batch deletion with empty-slot/renumber choice, drag reorder, keyboard-accessible Move, search, pagination and channel-operation undo. The extra 1,000th file record is preserved.
- Passive native CPS DAT import/export, original-read DAT backup, optional settings, upper/lower VFOs, DTMF and inherited validation/help.
- Single Bluetooth session for connect/read/write/verify. Read loads the editor directly and retains the connection. Backup confirmation, model checks, failure lock and no automatic write retries.
- Wireless CPS ON/scanning OFF preparation, manual CPS toggle after writing, and ten-minute idle warning with a 60-second disconnect countdown.
- Disabled RepeaterBook import preview, pending approval: no live API calls, token field, shared tokens or bundled data.

## Pending / limitations

Physical-radio testing of this interface and other variants; protocol-level post-write session fix; cable transport; firmware flashing; banks/zones; blank-template radio-writing approval. The previous user-tested build worked on Radio 100 / V0.05 / V1.7, which does not certify other radios.

RepeaterBook approval, CORS/identification, per-user tokens, export/attribution permission and approved limits remain pending. See [integration review](docs/REPEATERBOOK.md).

Read [SAFETY.md](docs/SAFETY.md) before programming. Blank workspaces support editing/export; Bluetooth writing requires loaded CPS or radio settings. Every write programs the complete CPS configuration.

## Run locally

No packages need installation. With Node.js 20 or newer:

```sh
npm test
npm start
```

Open `http://127.0.0.1:8726`. Serving is required for modules; double-clicking index.html is unsupported. Bluetooth additionally needs Web Bluetooth on the actual browser/OS; DAT editing remains available without it.

## Free GitHub Pages

Commit to `K4RJM/baofeng-mini5-bt-cps-unofficial`. In **Settings → Pages**, choose **GitHub Actions**. The workflow tests pull requests and deploys from main after passing tests and packaging. Only allowlisted public files are uploaded; tests, private DAT files and captures are excluded.

Expected address after successful deployment: `https://k4rjm.github.io/baofeng-mini5-bt-cps-unofficial/`. This is not confirmation of deployment. No paid server, secret or shared token required. All assets use relative paths for repository-subpath hosting. `npm run package` prepares dist/.

## Verification and provenance

`npm test` covers DAT round trips/rejection, channel preservation, writer/reader simulations, failure/no-retry behavior, decoder compatibility and protected-file hashes. Simulations are not hardware validation. See [verification notes](docs/VERIFICATION.md).

Build 18 core SHA-256 hashes are tracked in docs/protected-core.json. Changes require explicit safety review and approval before use on a radio.

Derived from [Mini 5 Studio by replicationbench](https://github.com/replicationbench/Mini5); [CHIRP](https://github.com/kk7ds/chirp) informed the approved BLE layout and native CPS captures informed DAT mapping. Modified source and notices are supplied under GPL v3; see [LICENSE](LICENSE). Not affiliated with Baofeng or RepeaterBook.
