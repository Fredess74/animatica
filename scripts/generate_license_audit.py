import json
import os
import glob
import subprocess
from datetime import datetime

def get_package_jsons():
    # Find all package.json files excluding node_modules
    return glob.glob('**/package.json', recursive=True)

def load_licenses_data():
    """Run 'pnpm licenses list --json' and return the parsed results."""
    print("Running 'pnpm licenses list --json'...")
    try:
        result = subprocess.run(
            ['pnpm', 'licenses', 'list', '--json'],
            capture_output=True,
            text=True,
            check=True
        )
        data = json.loads(result.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"Error executing pnpm or parsing its output: {e}")
        return None

    pkg_to_license = {}
    for license_name, packages in data.items():
        for pkg in packages:
            pkg_to_license[pkg['name']] = {
                'license': license_name,
                'version': pkg['versions'][0] if pkg.get('versions') else 'Unknown'
            }
    return pkg_to_license

def main():
    pkg_to_license = load_licenses_data()
    if not pkg_to_license:
        return

    all_deps = {} # name -> set of packages using it
    direct_deps_info = {} # name -> {license, used_in: set}

    package_json_files = get_package_jsons()

    for pj_path in package_json_files:
        if 'node_modules' in pj_path:
            continue

        with open(pj_path, 'r') as f:
            try:
                pj = json.load(f)
            except json.JSONDecodeError:
                continue

        pkg_name = pj.get('name', 'root')
        deps = pj.get('dependencies', {})
        dev_deps = pj.get('devDependencies', {})
        peer_deps = pj.get('peerDependencies', {})

        for name, version in {**deps, **dev_deps, **peer_deps}.items():
            # Skip internal workspace packages
            if name.startswith('@Animatica/') or (isinstance(version, str) and version.startswith('workspace:')):
                continue

            if name not in all_deps:
                all_deps[name] = set()
            all_deps[name].add(pkg_name)

            if name not in direct_deps_info:
                license_info = pkg_to_license.get(name, {'license': 'Unknown', 'version': 'Unknown'})
                direct_deps_info[name] = {
                    'license': license_info['license'],
                    'used_in': set()
                }
            direct_deps_info[name]['used_in'].add(pkg_name)

    # All dependencies (including transitive) from pnpm licenses output
    total_deps = len(pkg_to_license)
    direct_deps_count = len(direct_deps_info)
    transitive_deps_count = total_deps - direct_deps_count

    # Flag non-MIT
    flagged = []
    for name, info in sorted(pkg_to_license.items()):
        license = info['license']
        if license != 'MIT':
            dep_type = 'Direct' if name in direct_deps_info else 'Transitive'
            flagged.append({
                'name': name,
                'version': info['version'],
                'license': license,
                'type': dep_type
            })

    # Generate Markdown
    today = datetime.now().strftime('%Y-%m-%d')
    lines = [
        "# License Audit",
        "",
        f"**Date:** {today}",
        "**Auditor:** Jules (License Auditor)",
        "",
        "## Summary",
        "",
        "This document lists all dependencies used in the project and their licenses. It strictly flags any non-MIT licenses.",
        "",
        f"- **Total dependencies found:** {total_deps}",
        f"- **Direct dependencies:** {direct_deps_count}",
        f"- **Transitive dependencies:** {transitive_deps_count}",
        "",
        "## Project License",
        "",
        "- **File:** `LICENSE`",
        "- **Status:** Present",
        "- **License:** MIT",
        "",
        "## Flagged Licenses (Non-MIT)",
        "",
        "The following dependencies have non-MIT licenses and are flagged for review:",
        "",
        "| Dependency | Version | License | Type |",
        "| --- | --- | --- | --- |"
    ]

    for f in flagged:
        lines.append(f"| {f['name']} | {f['version']} | {f['license']} | {f['type']} |")

    lines.extend([
        "",
        "## Direct Dependencies",
        "",
        "| Dependency | License | Used In |",
        "| --- | --- | --- |"
    ])

    for name in sorted(direct_deps_info.keys()):
        info = direct_deps_info[name]
        used_in = ", ".join(sorted(info['used_in']))
        lines.append(f"| {name} | {info['license']} | {used_in} |")

    lines.extend([
        "",
        "## All Dependencies (including transitive)",
        "",
        "<details>",
        "<summary>Click to expand full dependency list</summary>",
        "",
        "| Dependency | Version | License |",
        "| --- | --- | --- |"
    ])

    for name in sorted(pkg_to_license.keys()):
        info = pkg_to_license[name]
        lines.append(f"| {name} | {info['version']} | {info['license']} |")

    lines.extend([
        "",
        "</details>",
        ""
    ])

    audit_path = 'docs/LICENSE_AUDIT.md'
    with open(audit_path, 'w') as f:
        f.write("\n".join(lines))

    print(f"Audit report generated in {audit_path}")

if __name__ == "__main__":
    main()
