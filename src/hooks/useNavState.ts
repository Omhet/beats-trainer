import { useSearchParams } from "react-router-dom";
import { SelectedView } from "../types/navigation";

export function useNavState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const songId = searchParams.get("songId");

    const viewParam = searchParams.get("view");
    const view: SelectedView | null =
        viewParam === SelectedView.Learn ? SelectedView.Learn :
        viewParam === SelectedView.Practise ? SelectedView.Practise :
        viewParam === SelectedView.Perform ? SelectedView.Perform :
        null;

    // No section param = full song (null)
    const section: string | null = searchParams.get("section");

    // Sets songId and view, optionally section (null = full song → no section param)
    function setSongView(newSongId: string, newView: SelectedView, newSection: string | null = null) {
        const params: Record<string, string> = { songId: newSongId, view: newView };
        if (newSection !== null) params.section = newSection;
        setSearchParams(params);
    }

    // Updates only the section param (null = full song → removes section param)
    function setSection(newSection: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (newSection === null) {
                next.delete("section");
            } else {
                next.set("section", newSection);
            }
            return next;
        });
    }

    return { songId, view, section, setSongView, setSection };
}
