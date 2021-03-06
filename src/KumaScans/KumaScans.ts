import {SourceInfo, TagType} from "paperback-extensions-common";
import {ReadKomik} from "../ReadKomik/ReadKomik";
import {KumaScansParser} from "./KumaScansParser";

const BASE = "https://kumascans.com"

export const KumaScansInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.3",
    name: "KumaScans",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from KumaScans",
    language: "en",
    hentaiSource: false,
    websiteBaseURL: BASE,
    sourceTags: [
        {
            text: "Notifications",
            type: TagType.GREEN
        },
        {
            text: "Deprecated - Will Not Be Updated",
            type: TagType.RED
        }
    ]
}

export class KumaScans extends ReadKomik {
    baseUrl: string = BASE;
    alternateTitleSeparator: RegExp = /( \/ |, )/

    readonly parser: KumaScansParser = new KumaScansParser()
}