#! /usr/bin/env node
declare const figlet: any;
declare const program: any;
declare const inquirer: any;
declare const clear: any;
declare const exec: any;
declare const cliProgress: any;
declare const ffmpeg: any;
declare class Flixy {
    apiUrl: string;
    query: string;
    options: any;
    lookupData: any;
    lookupDetails: any;
    watchData: any;
    constructor(query: string, options?: any);
    lookup(lookup: VideoLookup): Promise<void>;
    private selectOption;
    private getDetails;
    private handleSeries;
    private watch;
    private playback;
    private promptList;
    private cleanupMediaChoices;
    private downloadStream;
}
declare enum VideoType {
    Movie = "Movie",
    Series = "TV Series"
}
interface VideoLookup {
    id?: string;
    query?: string;
    episodeId?: string;
    mediaId?: string;
}
