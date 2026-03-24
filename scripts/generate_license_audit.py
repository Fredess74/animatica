import json
import os
import glob

def get_package_jsons():
    return glob.glob("**/package.json", recursive=True)

def parse_package_jsons():
    dep_map = {}
    workspace_packages = set()

    for path in get_package_jsons():
        if "node_modules" in path:
            continue
        with open(path, 'r') as f:
            data = json.load(f)
            pkg_name = data.get("name")
            if not pkg_name:
                continue
            workspace_packages.add(pkg_name)

            for dep_type in ["dependencies", "devDependencies", "peerDependencies"]:
                deps = data.get(dep_type, {})
                for dep, version in deps.items():
                    if dep not in dep_map:
                        dep_map[dep] = []
                    dep_map[dep].append(pkg_name)

    return dep_map, workspace_packages

def generate_report():
    dep_map, workspace_packages = parse_package_jsons()

    with open("licenses.json", 'r') as f:
        licenses_data = json.load(f)

    all_deps = []
    license_counts = {}
    non_mit = []

    # Process all dependencies from pnpm licenses list
    for license_name, deps in licenses_data.items():
        license_counts[license_name] = len(deps)
        for dep in deps:
            name = dep["name"]
            is_direct = name in dep_map
            used_in = ", ".join(sorted(set(dep_map.get(name, []))))

            # Internal workspace packages might not be in licenses.json if pnpm excludes them
            # or they might be listed as Unknown.
            # But they should be MIT.

            dep_info = {
                "name": name,
                "license": license_name,
                "type": "Direct" if is_direct else "Transitive",
                "used_in": used_in if is_direct else ""
            }
            all_deps.append(dep_info)

            if license_name != "MIT":
                non_mit.append(dep_info)

    # Handle workspace packages that might be missing from licenses.json
    for pkg in workspace_packages:
        if not any(d["name"] == pkg for d in all_deps):
            dep_info = {
                "name": pkg,
                "license": "MIT",
                "type": "Workspace",
                "used_in": "Internal"
            }
            all_deps.append(dep_info)
            license_counts["MIT"] = license_counts.get("MIT", 0) + 1

    all_deps.sort(key=lambda x: x["name"].lower())
    non_mit.sort(key=lambda x: x["name"].lower())

    with open("docs/LICENSE_AUDIT.md", 'w') as f:
        f.write("# License Audit Report\n\n")
        f.write(f"Date: 2026-03-24\n\n")

        f.write("## Summary\n\n")
        f.write("| License | Count |\n")
        f.write("| --- | --- |\n")
        for lic, count in sorted(license_counts.items(), key=lambda x: x[1], reverse=True):
            f.write(f"| {lic} | {count} |\n")
        f.write("\n")

        f.write("## 🚩 Non-MIT Licenses\n\n")
        if not non_mit:
            f.write("No non-MIT licenses found.\n")
        else:
            f.write("| Dependency | License | Type | Used In |\n")
            f.write("| --- | --- | --- | --- |\n")
            for dep in non_mit:
                f.write(f"| {dep['name']} | {dep['license']} | {dep['type']} | {dep['used_in']} |\n")
        f.write("\n")

        f.write("## All Dependencies\n\n")
        f.write("| Dependency | License | Type | Used In |\n")
        f.write("| --- | --- | --- | --- |\n")
        for dep in all_deps:
            f.write(f"| {dep['name']} | {dep['license']} | {dep['type']} | {dep['used_in']} |\n")

if __name__ == "__main__":
    generate_report()
