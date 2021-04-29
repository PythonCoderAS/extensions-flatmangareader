import {FlatMangaReaderParser} from "../FlatMangaReaderParser";
import {AsuraScans} from "./AsuraScans";

export class AsuraScansParser extends FlatMangaReaderParser {
    parseManga($: CheerioStatic, mangaId: string, base: string, source: AsuraScans) {
        return this.parseMangaAlternate($, mangaId, base, source)
    }
}