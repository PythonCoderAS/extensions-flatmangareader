import {FlatMangaReader} from "../FlatMangaReader";
import {SourceInfo, TagType} from "paperback-extensions-common";
import {AsuraScansParser} from "./AsuraScansParser";

const BASE = "https://www.asurascans.com"

export const AsuraScansInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.6",
    name: "AsuraScans",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from AsuraScans",
    language: "en",
    hentaiSource: false,
    websiteBaseURL: BASE,
    sourceTags: [
        {
            text: "Notifications",
            type: TagType.GREEN
        },
        {
            text: "Cloudflare",
            type: TagType.RED
        }
    ]
}

export class AsuraScans extends FlatMangaReader {
    baseUrl: string = BASE;
    readonly parser: AsuraScansParser = new AsuraScansParser();
    mangaSourceDirectory: string = "comics";
    mangaPageDirectory: string = "manga";
}