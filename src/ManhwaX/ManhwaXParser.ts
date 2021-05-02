import {FlatMangaReaderParser} from "../FlatMangaReaderParser";
import {ManhwaX} from "./ManhwaX";

export class ManhwaXParser extends FlatMangaReaderParser{
    parseManga($: CheerioStatic, mangaId: string, base: string, source: ManhwaX) {
        return this.parseMangaAlternate($, mangaId, base, source)
    }
}