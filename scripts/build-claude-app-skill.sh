#!/usr/bin/env bash
# Rebuilds claude-app-skill/roblox-forge-skill.zip (the upload for the Claude app / claude.ai)
# from the plugin's agents, skills, commands, and templates. Run after changing the plugin.
set -euo pipefail
cd "$(dirname "$0")/.."

plugin=plugins/roblox-forge
out=claude-app-skill
skill="$out/roblox-forge"

rm -rf "$out"
mkdir -p "$skill/team" "$skill/knowledge" "$skill/workflows" "$skill/templates"

cp scripts/claude-app-SKILL.md "$skill/SKILL.md"
cp "$plugin"/agents/*.md "$skill/team/"
cp "$plugin"/commands/*.md "$skill/workflows/"
for dir in "$plugin"/skills/*/; do
	cp "$dir/SKILL.md" "$skill/knowledge/$(basename "$dir").md"
done
cp -R "$plugin/skills/roblox-project-setup/templates/." "$skill/templates/"

(cd "$out" && zip -qrX roblox-forge-skill.zip roblox-forge)
echo "Built $out/roblox-forge-skill.zip"
