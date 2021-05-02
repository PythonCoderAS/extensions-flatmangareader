import {FlatMangaReader} from "../FlatMangaReader";
import {HomeSection, Request, RequestManager, SourceInfo, TagType} from "paperback-extensions-common";

const BASE = "https://flamescans.org"

export const FlameScansInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.3",
    name: "FlameScans",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from FlameScans",
    language: "en",
    hentaiSource: false,
    websiteBaseURL: BASE,
    sourceTags: [
        {
            text: "Notifications",
            type: TagType.GREEN
        }
    ]
}

export class FlameScans extends FlatMangaReader {
    baseUrl: string = BASE;

    alternateTitleSeparator: string = " | ";
    mangaPageDirectory: string = "series";
    mangaSourceDirectory: string = "series";

    readonly requestManager: RequestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 30000
    });

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const options: Request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        const offset = $(this.mangaTileGroupSelector).length - 3;
        sectionCallback(createHomeSection({
            id: "top_today",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this),
            title: "Top Today"
        }))
        sectionCallback(createHomeSection({
            id: "update",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, offset, null, "div.utao"),
            title: "Latest Update",
            view_more: true
        }))
        sectionCallback(createHomeSection({
            id: "latest_action",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, offset + 1, null, "div.utao"),
            title: "Latest Action Manhwa"
        }))
        sectionCallback(createHomeSection({
            id: "recommended",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, offset + 2),
            title: "Recommendations"
        }))
        this.applyHomePageSections(sectionCallback, this.parser.parseTop($, this.baseUrl, this.mangaSourceDirectory))
    }
}