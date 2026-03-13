import json
import os
import glob
from datetime import date

def main():
    # Load licenses from generated JSON
    with open('licenses.json', 'r') as f:
        pnpm_licenses = json.load(f)

    pkg_ver_to_license = {}
    pkg_to_licenses = {}
    for license_name, packages in pnpm_licenses.items():
        for pkg in packages:
            name = pkg['name']
            if name not in pkg_to_licenses:
                pkg_to_licenses[name] = set()
            pkg_to_licenses[name].add(license_name)
            for ver in pkg.get('versions', []):
                pkg_ver_to_license[(name, ver)] = license_name

    # Find all package.json files
    package_json_files = glob.glob('**/package.json', recursive=True)
    package_json_files = [f for f in package_json_files if 'node_modules' not in f]

    direct_deps = {}
    all_workspace_packages = set()

    for pj_path in package_json_files:
        with open(pj_path, 'r') as f:
            data = json.load(f)
            all_workspace_packages.add(data.get('name'))

    for pj_path in package_json_files:
        with open(pj_path, 'r') as f:
            data = json.load(f)
            pkg_name = data.get('name', 'root')
            deps = {**data.get('dependencies', {}), **data.get('devDependencies', {}), **data.get('peerDependencies', {})}

            for dep, version in deps.items():
                if dep in all_workspace_packages or version.startswith('workspace:'):
                    continue
                if dep not in direct_deps:
                    # For direct deps, we might have multiple licenses if multiple versions are used across workspace
                    # but usually it's one per package in a flat-ish lockfile.
                    # We'll collect all licenses associated with this package name.
                    direct_deps[dep] = {
                        'licenses': pkg_to_licenses.get(dep, {'Unknown'}),
                        'used_in': set()
                    }
                direct_deps[dep]['used_in'].add(pkg_name)

    # All dependencies from pnpm
    all_pnpm_pkg_vers = set(pkg_ver_to_license.keys())
    all_pnpm_deps = set(name for name, ver in all_pnpm_pkg_vers)
    transitive_deps = all_pnpm_deps - set(direct_deps.keys())
    # Remove workspace packages from transitive (shouldn't be there usually but pnpm might list them)
    transitive_deps = transitive_deps - all_workspace_packages

    # Generate Report
    report = []
    report.append("# License Audit\n")
    report.append(f"**Date:** {date.today().isoformat()}")
    report.append("**Auditor:** Jules (License Auditor)\n")

    report.append("## Summary\n")
    report.append("This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.\n")
    report.append(f"Total dependencies found: {len(all_pnpm_deps)}")
    report.append(f"Direct dependencies: {len(direct_deps)}")
    report.append(f"Transitive dependencies: {len(transitive_deps)}\n")

    report.append("## Project License\n")
    has_license_file = os.path.exists('LICENSE')
    report.append(f"- **File:** `LICENSE`")
    report.append(f"- **Status:** {'Present' if has_license_file else 'Missing'}")
    report.append("- **License:** MIT\n")

    report.append("## Source Code Headers\n")
    header_check_file = 'packages/engine/src/index.ts'
    has_header = False
    if os.path.exists(header_check_file):
        with open(header_check_file, 'r') as f:
            content = f.read(500)
            if 'Copyright' in content or 'License' in content or 'MIT' in content:
                has_header = True
    report.append(f"- **Checked:** `{header_check_file}`")
    report.append(f"- **Result:** {'License header found.' if has_header else 'No license header found.'}\n")

    report.append("## Flagged Licenses (Non-MIT)\n")
    report.append("The following dependencies have non-MIT licenses:\n")
    report.append("| Dependency | Version | License | Type |")
    report.append("| --- | --- | --- | --- |")

    flagged = []

    def is_mit_compatible(license_str):
        if not license_str: return False
        l = license_str.upper()
        return 'MIT' in l or 'MIT-0' in l

    # Collect all for sorting
    all_flagged_rows = []

    for dep, info in direct_deps.items():
        for license in info['licenses']:
            if not is_mit_compatible(license):
                # Find versions for this license
                versions = [v for (n, v), l in pkg_ver_to_license.items() if n == dep and l == license]
                ver_str = ", ".join(sorted(versions)) if versions else "Unknown"
                all_flagged_rows.append((dep, ver_str, license, '**Direct**'))

    for (dep, ver), license in pkg_ver_to_license.items():
        if dep in direct_deps: continue
        if dep in all_workspace_packages: continue
        if not is_mit_compatible(license):
            all_flagged_rows.append((dep, ver, license, 'Transitive'))

    all_flagged_rows.sort()
    for row in all_flagged_rows:
        report.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} |")

    report.append("\n## Direct Dependencies\n")
    report.append("| Dependency | License | Used In |")
    report.append("| --- | --- | --- |")

    sorted_direct = sorted(direct_deps.items())
    for dep, info in sorted_direct:
        used_in = ", ".join(sorted(list(info['used_in'])))
        license_str = ", ".join(sorted(list(info['licenses'])))
        report.append(f"| {dep} | {license_str} | {used_in} |")

    report.append("\n## All Dependencies (including transitive)\n")
    report.append("<details>")
    report.append("<summary>Click to expand full dependency list</summary>\n")
    report.append("| Dependency | Version | License |")
    report.append("| --- | --- | --- |")

    all_sorted_pkg_vers = sorted(pkg_ver_to_license.keys())
    for dep, ver in all_sorted_pkg_vers:
        if dep in all_workspace_packages: continue
        report.append(f"| {dep} | {ver} | {pkg_ver_to_license[(dep, ver)]} |")

    report.append("\n</details>")

    with open('docs/LICENSE_AUDIT.md', 'w') as f:
        f.write("\n".join(report) + "\n")

if __name__ == "__main__":
    main()
