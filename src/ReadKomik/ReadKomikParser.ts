import {FlatMangaReaderParser} from "../FlatMangaReaderParser";

export class ReadKomikParser extends FlatMangaReaderParser {
    parsePages($: CheerioStatic): string[] {
        return this.parsePagesFromScript($)
    }
}