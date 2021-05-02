import {FlatMangaReaderParser} from "../FlatMangaReaderParser";
import {KumaScans} from "./KumaScans";
import {Manga} from "paperback-extensions-common";

export class KumaScansParser extends FlatMangaReaderParser {
    parseManga($: CheerioStatic, mangaId: string, base: string, source: KumaScans): Manga {
        return this.parseMangaAlternate($, mangaId, base, source);
    }
}