import * as fs from "fs";
import * as path from "path";

const SONGS_DIR = path.join(process.cwd(), "public/assets/songs");
const OUTPUT_FILE = path.join(SONGS_DIR, "index.json");

function generateSongIndex() {
    if (!fs.existsSync(SONGS_DIR)) {
        console.error(`Songs directory not found: ${SONGS_DIR}`);
        return;
    }

    const entries = [];
    const items = fs.readdirSync(SONGS_DIR);

    for (const item of items) {
        const itemPath = path.join(SONGS_DIR, item);
        if (!fs.statSync(itemPath).isDirectory()) continue;

        const metaFile = path.join(itemPath, "meta.json");
        if (!fs.existsSync(metaFile)) continue;

        const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));

        // Check for sections subdirectory
        const sectionsDir = path.join(itemPath, "sections");
        const sections = [];
        if (
            fs.existsSync(sectionsDir) &&
            fs.statSync(sectionsDir).isDirectory()
        ) {
            const sectionFiles = fs.readdirSync(sectionsDir);
            for (const file of sectionFiles) {
                if (file.endsWith(".mid")) {
                    sections.push(path.parse(file).name);
                }
            }
        }

        // Check for drumless track
        const hasDrumlessTrack = fs.existsSync(
            path.join(itemPath, "drumless.mp3"),
        );

        entries.push({
            ...meta,
            id: item,
            path: item,
            sections,
            hasDrumlessTrack,
        });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2));
    console.log(
        `Generated song index with ${entries.length} songs at ${OUTPUT_FILE}`,
    );
}

generateSongIndex();
