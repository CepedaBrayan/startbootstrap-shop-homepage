#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${GH_REPO:?GH_REPO is required}"
: "${RELEASE_COMMIT:?RELEASE_COMMIT is required}"
: "${PR_NUMBER:?PR_NUMBER is required}"
: "${MERGED_AT:?MERGED_AT is required}"

[[ "$RELEASE_COMMIT" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid commit SHA' >&2; exit 1; }
[[ "$PR_NUMBER" =~ ^[1-9][0-9]*$ ]] || { echo 'Invalid PR number' >&2; exit 1; }
[[ "$MERGED_AT" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T ]] || { echo 'Invalid merge timestamp' >&2; exit 1; }
git cat-file -e "${RELEASE_COMMIT}^{commit}"
if git ls-tree -r --name-only "$RELEASE_COMMIT" | grep -E '(^|/)\.env($|\.)' | grep -Ev '(^|/)\.env\.example$' >/dev/null; then
    echo 'Refusing to release a commit containing local environment files.' >&2
    exit 1
fi

merge_date="${MERGED_AT:0:10}"
tag="v${merge_date//-/.}.${PR_NUMBER}"

# Re-running a successful workflow must not create duplicate releases.
existing_draft=''
if existing_draft=$(gh release view "$tag" --json isDraft --jq .isDraft 2>/dev/null); then
    if [[ "$existing_draft" == 'false' ]]; then
        echo "Release $tag is already published."
        exit 0
    fi
fi

release_dir=$(mktemp -d)
trap 'rm -rf "$release_dir"' EXIT
archive="$release_dir/whatsapp-shop-${tag}-source.zip"
# Only tracked source at the merged commit: no dist, dependencies or local .env.
git archive --format=zip --prefix=whatsapp-shop/ --output="$archive" "$RELEASE_COMMIT"

if [[ "$existing_draft" != 'true' ]]; then
    gh release create "$tag" --target "$RELEASE_COMMIT" \
        --title "Release $tag" --generate-notes --draft
fi
# A failed upload leaves a recoverable draft, never a published empty release.
gh release upload "$tag" "$archive" --clobber
gh release edit "$tag" --draft=false
