import {FlatMangaReaderParser} from "../FlatMangaReaderParser";
import {Manga, MangaStatus, Tag} from "paperback-extensions-common";
import {FlatMangaReader} from "../FlatMangaReader";

export class AsuraScansParser extends FlatMangaReaderParser {
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
}