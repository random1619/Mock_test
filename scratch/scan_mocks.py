import os
import re

root_dir = r"c:\Users\gagan\Downloads\Mocks\pundits\oliveboard"

stats = {
    "TestApp": 0,
    "CBTExam": 0,
    "Unknown": 0,
    "files": []
}

for root, dirs, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".html"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8", errors="ignore") as file_obj:
                content = file_obj.read()
                
                has_testapp = "class TestApp" in content or "this.qs =" in content
                has_cbtexam = "class CBTExam" in content or "const questions =" in content
                
                if has_cbtexam:
                    stats["CBTExam"] += 1
                    t = "CBTExam"
                elif has_testapp:
                    stats["TestApp"] += 1
                    t = "TestApp"
                else:
                    stats["Unknown"] += 1
                    t = "Unknown"
                
                stats["files"].append({
                    "name": f,
                    "type": t,
                    "path": path
                })

print(f"Total HTML files: {len(stats['files'])}")
print(f"CBTExam: {stats['CBTExam']}")
print(f"TestApp: {stats['TestApp']}")
print(f"Unknown: {stats['Unknown']}")
