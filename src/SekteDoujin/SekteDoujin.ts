import {FlatMangaReader} from "../FlatMangaReader";
import {HomeSection, Request, SourceInfo, TagType} from "paperback-extensions-common";
import {SekteDoujinParser} from "./SekteDoujinParser";

const BASE = "https://75.119.132.111"

export const SekteDoujinInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.1",
    name: "SekteDoujin",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from SekteDoujin",
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
            text: "Indonesian",
            type: TagType.GREY
        }
    ]
}

export class SekteDoujin extends FlatMangaReader {
    baseUrl: string = BASE;
    mangaSourceDirectory: string = "manga";
    mangaPageDirectory: string = "manga";

    readonly parser: SekteDoujinParser = new SekteDoujinParser();

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const options: Request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        sectionCallback(createHomeSection({
            id: "hot_komik_update",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this),
            title: "Hot Komik Update"
        }))
        sectionCallback(createHomeSection({
            id: "project",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 1, null, "div.utao"),
            title: "Project Update"
        }))
        sectionCallback(createHomeSection({
            id: "update",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 2, null, "div.utao"),
            title: "Latest Update",
            view_more: true
        }))
        this.applyHomePageSections(sectionCallback, this.parser.parseTop($, this.baseUrl, this.mangaSourceDirectory))
    }
}