### static analysis Testing

```bash
# Frontend & Backend (same command)
npx eslint . --ignore-pattern scripts/ --format json 2>/dev/null | jq 'reduce .[] as $file ({files: 0, errors: 0, warnings: 0}; .files += 1 | .errors += ($file.errorCount // 0) | .warnings += ($file.warningCount // 0)) | (.errors / .files) as $errPerFile | (.warnings / .files) as $warnPerFile | {score: (10 - ($errPerFile * 2 + $warnPerFile * 0.5) | if . < 0 then 0 elif . > 10 then 10 else . end), errors: .errors, warnings: .warnings, files: .files}'
```