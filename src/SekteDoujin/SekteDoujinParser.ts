import {FlatMangaReaderParser} from "../FlatMangaReaderParser";

export class SekteDoujinParser extends FlatMangaReaderParser{
    parsePages($: CheerioStatic): string[] {
        return this.parsePagesFromScript($)
    }
}