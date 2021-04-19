import {FlatMangaReaderParser} from "../FlatMangaReaderParser";

export class ReadKomikParser extends FlatMangaReaderParser {

    private readonly pageRegex = /ts_reader\.run\(([^\n;]+)\)/i

    parsePages($: CheerioStatic): string[] {
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
                }
            }
        }
        return [];
    }
}