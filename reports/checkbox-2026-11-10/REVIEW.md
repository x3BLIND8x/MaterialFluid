# Checkbox reference additions

Reviewed the reference source, adapters, API and tests; exact URLs/hashes are in source.json. The current source makes imperative state methods silent, despite older documentation describing emitted changes. User activation emits change with checked/value/valueAttribute/nativeEvent.

The shared Checkbox preserves its native button ref and authored tick/mixed animation while adding a real form input, source methods, required/error states, label placement and touch events. Enter submits without toggling; Space toggles. Web Components preserve rich label nodes, dirty/default checked state, required validation and reset semantics. The showcase provides Example Presets, Appearance, Content and Behavior, with parent/child aggregation and separate React/Web documentation. No Square, Elevated or public animation controls were added.

Final release validation is recorded in VALIDATION.md. Automated browser checks do not establish manual screen-reader or physical-device acceptance.
