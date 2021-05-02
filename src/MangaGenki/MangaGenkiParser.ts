import {FlatMangaReaderParser} from "../FlatMangaReaderParser";
import {MangaGenki} from "./MangaGenki";

export class MangaGenkiParser extends FlatMangaReaderParser {
    parseManga($: CheerioStatic, mangaId: string, base: string, source: MangaGenki) {
        return this.parseMangaAlternate($, mangaId, base, source)
    }
}