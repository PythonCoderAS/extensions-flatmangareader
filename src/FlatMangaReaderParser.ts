import {Chapter, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, Tag} from "paperback-extensions-common";
import {FlatMangaReader} from "./FlatMangaReader";

export class FlatMangaReaderParser {

    readonly monthMap = new Map(Object.entries({
        "jan": 0,
        "feb": 1,
        "mar": 2,
        "apr": 3,
        "may": 4,
        "jun": 5,
        "jul": 6,
        "aug": 7,
        "sep": 8,
        "oct": 9,
        "nov": 10,
        "dec": 11
    }))

    readonly pageRegex = /ts_reader\.run\(([^\n;]+)\)/i


    parseManga($: CheerioStatic, mangaId: string, base: string, source: FlatMangaReader) {
        const summary = $("div.entry-content p").first().text().replaceAll(/\s{2,}/g, "").trim();
        let titles: string[] = [$("h1.entry-title").first().text().trim()]
        const alternatives = $("span.alternative").first().text();
        const altParts = alternatives.split(source.alternateTitleSeparator)
        if (altParts.length > 0 && altParts[0].trim()) {
            titles = titles.concat(altParts)
        }
        const rating = Number($('div[itemprop="ratingValue"]').first().text())
        const parts: (string | null)[] = [
            null, // Author
            null, // Artist
            null // Last Updated On,
        ];
        const selector = $("div.tsinfo div");
        selector.map((index, element) => {
            const value = $("i", element).first().text().trim()
            const name = $(element).first().children().remove().end().text().replace(/\s{2,}/, " ").trim().toLowerCase();
            switch (name) {
                case "author":
                case "authors":
                case "author(s)":
                    parts[0] = value
                    break;
                case "artist":
                case "artists":
                case "artist(s)":
                    parts[1] = value
                    break;
                case "updated on":
                    parts[2] = value
            }
        })
        const tags: Tag[] = [];
        $('a[rel=tag]', $("div.info-desc")).map((index, element) => {
            tags.push(createTag({
                id: element.attribs["href"].replace(`${base}/genres/`, ""),
                label: $(element).text()
            }))
        })
        const statusPart = selector.first().text().trim().toLowerCase();
        let status: MangaStatus
        if (statusPart === "ongoing") {
            status = MangaStatus.ONGOING;
        } else {
            status = MangaStatus.COMPLETED;
        }
        const image = $('div[itemprop="image"] img').first();
        const followCount: string | undefined = ($("div.bmc").first().text().match(/\d+/) || [])[0]
        const mangaObj: Manga = {
            image: image.attr("src") || "",
            rating: rating || 0,
            status: status,
            titles: titles,
            id: mangaId,
            desc: summary,
            tags: [createTagSection({
                id: "genres",
                label: "Genres",
                tags: tags
            })],
            follows: followCount ? undefined : Number(followCount)
        }
        if (parts[0] && parts[0]?.trim() !== "-") {
            mangaObj.author = parts[0];
        }
        if (parts[1] && parts[1]?.trim() !== "-") {
            mangaObj.artist = parts[1];
        }
        if (parts[2] && parts[2]?.trim() !== "-") {
            mangaObj.lastUpdate = parts[2];
        }
        return createManga(mangaObj);
    }

    parseMangaAlternate($: CheerioStatic, mangaId: string, base: string, source: FlatMangaReader) {
        const summary = $("div.entry-content p").first().text().replaceAll(/\s{2,}/g, "").trim();
        let titles: string[] = [$("h1.entry-title").first().text().trim()]
        const alternatives = $("span.alternative").first().text();
        const altParts = alternatives.split(source.alternateTitleSeparator)
        if (altParts.length > 0 && altParts[0].trim()) {
            titles = titles.concat(altParts)
        }
        const rating = Number($('div[itemprop="ratingValue"]').first().text())
        const parts: (string | null)[] = [
            null, // Author
            null, // Artist
            null // Last Updated On
        ]
        $("div.fmed").map((index, element) => {
            const name = $("b", element).text().trim().toLowerCase();
            const value = $("span", element).first().text().trim()
            switch (name) {
                case "author":
                case "authors":
                case "author(s)":
                    parts[0] = value
                    break;
                case "artist":
                case "artists":
                case "artist(s)":
                    parts[1] = value
                    break;
                case "updated on":
                    parts[2] = value
            }
        })
        const tags: Tag[] = [];
        $('a[rel=tag]', $("div.infox")).map((index, element) => {
            tags.push(createTag({
                id: element.attribs["href"].replace(`${base}/genres/`, ""),
                label: $(element).text()
            }))
        })
        const statusPart = $("div.tsinfo div").first().text().trim().toLowerCase();
        let status: MangaStatus
        if (statusPart === "ongoing") {
            status = MangaStatus.ONGOING;
        } else {
            status = MangaStatus.COMPLETED;
        }
        const image = $('div[itemprop="image"] img').first();
        const followCount: string | undefined = ($("div.bmc").first().text().match(/\d+/) || [])[0]
        const mangaObj: Manga = {
            image: image.attr("src") || "",
            rating: rating || 0,
            status: status,
            titles: titles,
            id: mangaId,
            desc: summary,
            tags: [createTagSection({
                id: "genres",
                label: "Genres",
                tags: tags
            })],
            follows: followCount ? undefined : Number(followCount)
        }
        if (parts[0] && parts[0]?.trim() !== "-") {
            mangaObj.author = parts[0];
        }
        if (parts[1] && parts[1]?.trim() !== "-") {
            mangaObj.artist = parts[1];
        }
        if (parts[2] && parts[2]?.trim() !== "-") {
            mangaObj.lastUpdate = parts[2];
        }
        return createManga(mangaObj);
    }

    parseChapterList($: CheerioStatic, mangaId: string, base: string, langCode: LanguageCode) {
        const chapterList: Chapter[] = []
        $("#chapterlist li").map((index, element) => {
            const number = element.attribs["data-num"] || "0";
            const linkId = $("a", element).attr("href");
            if (linkId) {
                const id = linkId.replace(base + "/", "").replace(/\/$/, "")
                const chapterObj: Chapter = {
                    id: id,
                    mangaId: mangaId,
                    chapNum: Number(number),
                    langCode: langCode
                }
                const dateParts = $("span.chapterdate", element).first().text().replace(",", "").split(" ");
                if (dateParts.length === 3) {
                    chapterObj.time = new Date(Number(dateParts[2]), this.monthMap.get(dateParts[0].toLowerCase()) || 0, Number(dateParts[1]))
                }
                chapterList.push(createChapter(chapterObj));
            }
        })
        return chapterList;
    }

    parsePages($: CheerioStatic) {
        const pages: string[] = [];
        $('article[id] img[loading="lazy"]').map((index, element) => {
            pages.push(element.attribs["src"] || "")
        })
        return pages;
    }

    parsePagesFromScript($: CheerioStatic): string[] {
        const match = $.root().html()?.match(this.pageRegex);
        const map: Map<string, string[]> = new Map()
        if (match) {
            const data = JSON.parse(match[1]);
            if (data.sources && data.defaultSource) {
                for (let i = 0; i < data.sources.length; i++) {
                    const source = data.sources[i];
                    if (source.source && source.images) {
                        map.set(source.source, source.images)
                    }
                }
                const returnData = map.get(data.defaultSource);
                if (!returnData) {
                    return ([...map.entries()][0] || [])[1] || [];
                } else {
                    return returnData;
                }
            }
        }
        return [];
    }

    parseMangaTile($: CheerioStatic, element: CheerioElement, base: string, mangaSourceDirectory: string) {
        const link = $("a", element);
        const linkId = link.attr("href")
        const title = link.attr("title")
        if (linkId && title) {
            return createMangaTile({
                id: linkId.replace(`${base}/${mangaSourceDirectory}/`, "").replace(/\/$/, ""),
                image: $("img", link).attr("src") || "",
                title: createIconText({
                    text: title
                })
            })
        }
    }

    parseMangaTileGroup($: CheerioStatic, base: string, mangaSourceDirectory: string, source: FlatMangaReader, num: number = 0, selector: string | null = null, childSelector: string | null = null) {
        const tiles: MangaTile[] = [];
        if (selector === null) {
            selector = source.mangaTileGroupSelector;
        }
        if (childSelector === null) {
            childSelector = source.mangaTileSelector;
        }
        $(childSelector, $(selector).toArray()[num]).map((index, element) => {
            const result = this.parseMangaTile($, element, base, mangaSourceDirectory);
            if (result) {
                tiles.push(result);
            }
        })
        return tiles;
    }

    parseTopTile($: CheerioStatic, element: CheerioElement, base: string, mangaSourceDirectory: string) {
        const link = $("h2 a", element).first()
        const linkId = link.attr("href")
        if (linkId) {
            return createMangaTile({
                id: linkId.replace(`${base}/${mangaSourceDirectory}/`, "").replace(/\/$/, ""),
                image: $("img", element).attr("src") || "",
                title: createIconText({
                    text: link.text().trim()
                })
            })
        }
    }

    parseTopTiles($: CheerioStatic, element: CheerioElement, base: string, mangaSourceDirectory: string) {
        const tiles: MangaTile[] = [];
        $("li", element).map((index, element1) => {
            const result = this.parseTopTile($, element1, base, mangaSourceDirectory);
            if (result) {
                tiles.push(result)
            }
        })
        return tiles;
    }

    parseTop($: CheerioStatic, base: string, mangaSourceDirectory: string) {
        const sections: HomeSection[] = [];
        const items = $("#wpop-items > div.serieslist").toArray()
        sections.push(createHomeSection({
            id: "top_weekly",
            items: this.parseTopTiles($, items[0], base, mangaSourceDirectory),
            title: "Top Weekly",
        }))
        sections.push(createHomeSection({
            id: "top_monthly",
            items: this.parseTopTiles($, items[1], base, mangaSourceDirectory),
            title: "Top Monthly",
        }))
        sections.push(createHomeSection({
            id: "top_all",
            items: this.parseTopTiles($, items[2], base, mangaSourceDirectory),
            title: "Top of All Time",
        }))
        return sections;
    }
}