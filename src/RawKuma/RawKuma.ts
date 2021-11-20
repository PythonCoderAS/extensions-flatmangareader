import {LanguageCode, SourceInfo, TagType} from "paperback-extensions-common";
import {KumaScans} from "../KumaScans/KumaScans";

const BASE = "https://rawkuma.com"

export const RawKumaInfo: SourceInfo = {
    icon: "icon.png",
    version: "1.0.2",
    name: "RawKuma",
    author: "PythonCoderAS",
    authorWebsite: "https://github.com/PythonCoderAS",
    description: "Extension that pulls manga from RawKuma",
    language: "_unknown",
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

export class RawKuma extends KumaScans {
    baseUrl: string = BASE;
    language: LanguageCode = LanguageCode.UNKNOWN;
}