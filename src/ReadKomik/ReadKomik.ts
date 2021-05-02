import {FlatMangaReader} from "../FlatMangaReader";
import {HomeSection, Request, SourceInfo, TagType} from "paperback-extensions-common";

const BASE = "https://readkomik.com"

export const ReadKomikInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.4",
    name: "ReadKomik",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from ReadKomik",
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

export class ReadKomik extends FlatMangaReader {
    baseUrl: string = BASE;

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
            id: "project",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 1, null, "div.utao"),
            title: "Project Update",
            view_more: true
        }))
        sectionCallback(createHomeSection({
            id: "update",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 2, null, "div.utao"),
            title: "Latest Update",
            view_more: true
        }))
        sectionCallback(createHomeSection({
            id: "recommended",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 3),
            title: "Recommendations"
        }))
        this.applyHomePageSections(sectionCallback, this.parser.parseTop($, this.baseUrl, this.mangaSourceDirectory))
    }
}