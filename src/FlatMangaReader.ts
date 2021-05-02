import {
    Chapter,
    ChapterDetails,
    HomeSection,
    LanguageCode,
    Manga,
    MangaUpdates,
    PagedResults,
    Request,
    RequestManager,
    SearchRequest,
    Source,
} from "paperback-extensions-common"
import {FlatMangaReaderParser} from "./FlatMangaReaderParser";

export abstract class FlatMangaReader extends Source {

    /**
     * The base URL of the website, <b>without</b> a trailing slash.
     */
    abstract baseUrl: string;

    /**
     * The language of the source.
     */
    language: LanguageCode = LanguageCode.ENGLISH;

    /**
     * The part of the URL that precedes every manga. For example, https://www.website.com/comics/1
     * has the source directory of "comics".
     */
    mangaSourceDirectory: string = "manga";

    /**
     * The segment of the URL that brings up the paged manga views. For example,
     * https://www.website.com/series/?page=1 has the page directory of "series".
     */
    mangaPageDirectory: string = "manga";

    /**
     * The selector for a group of Manga Tiles. This is not for the top weekly/monthly/of all time tiles, but instead
     * for the tiles in the "latest updates" category as well as the search page and directory pages.
     */
    mangaTileGroupSelector: string = "div.listupd";

    /**
     * The selector for each tile inside of the group of manga tiles.
     */
    mangaTileSelector: string = "div.bs";

    /**
     * The seperator the source uses for the alternative titles.
     */
    alternateTitleSeparator: string | RegExp = ", "


    readonly requestManager: RequestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 10000
    });

    readonly parser: FlatMangaReaderParser = new FlatMangaReaderParser()

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options: Request = createRequestObject({
            url: this.getMangaShareUrl(mangaId),
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        return this.parser.parseManga($, mangaId, this.baseUrl, this);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options: Request = createRequestObject({
            url: this.getMangaShareUrl(mangaId),
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        return this.parser.parseChapterList($, mangaId, this.baseUrl, this.language);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {

        const options: Request = createRequestObject({
            url: `${this.baseUrl}/${chapterId}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: this.parser.parsePages($),
            longStrip: false
        });
    }

    async searchRequest(query: SearchRequest, metadata: { page?: number | null } | null | undefined): Promise<PagedResults> {
        if (typeof metadata !== "object" && metadata !== null) {
            metadata = {page: metadata};
        } else if (metadata === null) {
            metadata = {};
        }
        let page = 1;
        if (metadata.page) {
            page = metadata.page;
        }
        if (page === null) {
            return createPagedResults({results: [], metadata: {page: null}});
        }
        const options: Request = createRequestObject({
            url: `${this.baseUrl}/page/${page}/?s=${query.title}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        const tiles = this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this);
        let newPage: number | null = page + 1;
        if (tiles.length === 0) {
            newPage = null;
        }
        metadata.page = newPage
        if (newPage === null) {
            return createPagedResults({results: [], metadata: {page: null}});
        }
        return createPagedResults({
            results: tiles,
            metadata: metadata
        });
    }

    getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/${this.mangaSourceDirectory}/${mangaId}`;
    }

    getCloudflareBypassRequest(): Request {
        return createRequestObject({
            method: "GET",
            url: this.baseUrl
        });
    }

    async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let metadata: { page?: number | null } | null | undefined = null;
        while (true) {
            if (ids.length === 0) {
                return;
            }
            const results: PagedResults = await this.getViewMoreItems("update", metadata);
            const tiles = results.results;
            metadata = results.metadata || {}
            const idsToSend: string[] = []
            if (!(metadata && metadata.page)) {
                return;
            }
            if (tiles.length === 0) {
                return;
            }
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                if (ids.includes(tile.id)) {
                    ids = ids.splice(ids.indexOf(tile.id), 1)
                    idsToSend.push(tile.id)
                }
            }
            if (idsToSend) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: idsToSend
                }))
            }
        }
    }

    /**
     * Generic implementation. This will not work for some websites, which have one-or-more sections preceding the
     * "latest updates" section.
     */
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
        sectionCallback(createHomeSection({
            id: "recommended",
            items: this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this, 2),
            title: "Recommendations"
        }))
        this.applyHomePageSections(sectionCallback, this.parser.parseTop($, this.baseUrl, this.mangaSourceDirectory))
    }

    applyHomePageSections(sectionCallback: (section: HomeSection) => void, sections: HomeSection[]) {
        for (let i = 0; i < sections.length; i++) {
            sectionCallback(sections[i]);
        }
    }


    async getViewMoreItems(homepageSectionId: string, metadata: { page?: number | null } | null | undefined): Promise<PagedResults> {
        if (typeof metadata !== "object" && metadata !== null) {
            metadata = {page: metadata};
        } else if (metadata === null) {
            metadata = {};
        }
        let page = 1;
        if (metadata.page) {
            page = metadata.page;
        }
        if (page === null) {
            return createPagedResults({results: [], metadata: {page: null}});
        }
        const options: Request = createRequestObject({
            url: `${this.baseUrl}/${this.mangaPageDirectory}/?order=${homepageSectionId}&page=${page}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        const tiles = this.parser.parseMangaTileGroup($, this.baseUrl, this.mangaSourceDirectory, this);
        let newPage: number | null = page + 1;
        if (tiles.length === 0) {
            newPage = null;
        }
        metadata.page = newPage
        if (newPage === null) {
            return createPagedResults({results: [], metadata: {page: null}});
        }
        return createPagedResults({
            results: tiles,
            metadata: metadata
        });
    }

    async getWebsiteMangaDirectory(metadata: { page?: number | null } | null | undefined): Promise<PagedResults> {
        return await this.getViewMoreItems("update", metadata);
    }
}