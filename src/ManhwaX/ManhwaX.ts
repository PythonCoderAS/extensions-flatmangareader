import {FlatMangaReader} from "../FlatMangaReader";
import {HomeSection, Request, SourceInfo, TagType} from "paperback-extensions-common";
import {ManhwaXParser} from "./ManhwaXParser";

const BASE = "https://manhwax.com"

export const ManhwaXInfo: SourceInfo = {
    icon: "icon.jpeg",
    version: "1.0.1",
    name: "ManhwaX",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from ManhwaX",
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
        },
        {
            text: "Cloudflare",
            type: TagType.RED
        }
    ]
}

export class ManhwaX extends FlatMangaReader {
    baseUrl: string = BASE;
    readonly parser: ManhwaXParser = new ManhwaXParser();
    mangaSourceDirectory: string = "manga";
    mangaPageDirectory: string = "manga";

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const options: Request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        sectionCallback(createHomeSection({
            id: "update",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 0, null, "div.utao"),
            title: "Latest Update",
            view_more: true
        }))
        sectionCallback(createHomeSection({
            id: "recommended",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 1),
            title: "Recommendations"
        }))
        this.applyHomePageSections(sectionCallback, this.parser.parseTop($, this.baseUrl, this.mangaSourceDirectory))
    }
}