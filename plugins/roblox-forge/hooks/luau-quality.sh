#!/usr/bin/env bash
# PostToolUse hook: format and lint Luau files Claude just wrote.
# - StyLua formats the file in place (uses the project's stylua.toml if present).
# - Selene lints it when a selene.toml exists in the file's directory or a parent.
# Lint errors are reported back to Claude (exit 2) so it can fix them.
# Any missing tool or unexpected input is a silent no-op.

input="$(cat)"

if command -v jq >/dev/null 2>&1; then
	file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
else
	file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)"
fi

case "$file" in
	*.luau | *.lua) ;;
	*) exit 0 ;;
esac
[ -f "$file" ] || exit 0

if command -v stylua >/dev/null 2>&1; then
	stylua "$file" >/dev/null 2>&1
fi

command -v selene >/dev/null 2>&1 || exit 0

# Selene reads selene.toml from the working directory, so run from the nearest config.
dir="$(cd "$(dirname "$file")" && pwd)"
config_dir=""
while [ -n "$dir" ]; do
	if [ -f "$dir/selene.toml" ]; then
		config_dir="$dir"
		break
	fi
	parent="$(dirname "$dir")"
	[ "$parent" = "$dir" ] && break
	dir="$parent"
done
[ -n "$config_dir" ] || exit 0

abs_file="$(cd "$(dirname "$file")" && pwd)/$(basename "$file")"
output="$(cd "$config_dir" && selene --display-style quiet "$abs_file" 2>&1)"

# Only surface real lint diagnostics ("path:line:col: error[rule]: ..."). If Selene itself
# fails (e.g. it can't fetch the Roblox API dump offline), stay out of the way.
diagnostics="$(printf '%s\n' "$output" | grep -E ':[0-9]+:[0-9]+: error\[')"
if [ -n "$diagnostics" ]; then
	echo "Selene found lint errors in $file — please fix them:" >&2
	printf '%s\n' "$diagnostics" >&2
	exit 2
fi
exit 0
