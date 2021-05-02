import {SourceInfo, TagType} from "paperback-extensions-common";
import {ManhwaX} from "../ManhwaX/ManhwaX";

const BASE = "https://mangagenki.com"

export const MangaGenkiInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.0",
    name: "MangaGenki",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from MangaGenki",
    language: "en",
    hentaiSource: false,
    websiteBaseURL: BASE,
    sourceTags: [
        {
            text: "Notifications",
            type: TagType.GREEN
        },
        {
          text: "18+",
          type: TagType.YELLOW
        }
    ]
}

export class MangaGenki extends ManhwaX {
    baseUrl: string = BASE;
}