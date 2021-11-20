import {HomeSection, Request, SourceInfo, TagType} from "paperback-extensions-common";
import {MangaGenkiParser} from "./MangaGenkiParser";
import {FlatMangaReader} from "../FlatMangaReader";

const BASE = "https://mangagenki.com"

export const MangaGenkiInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.2",
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
        },
        {
            text: "Deprecated - Will Not Be Updated",
            type: TagType.RED
        }
    ]
}

export class MangaGenki extends FlatMangaReader {
    baseUrl: string = BASE;
    readonly parser: MangaGenkiParser = new MangaGenkiParser()

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const options: Request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        sectionCallback(createHomeSection({
            id: "top_today",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this),
            title: "Top Today"
        }))
        sectionCallback(createHomeSection({
            id: "update",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 1, null, "div.utao"),
            title: "Latest Update",
            view_more: true
        }))
        this.applyHomePageSections(sectionCallback, this.parser.parseTop($, this.baseUrl, this.mangaSourceDirectory))
    }

}