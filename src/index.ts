#! /usr/bin/env node
const figlet = require('figlet');
const program = require('commander');
const inquirer = require('inquirer');
const clear = require('clear');
const exec = require('child_process').exec;
const cliProgress = require('cli-progress');
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');

clear();

class Flixy {
    apiUrl: string = "https://api.haikei.xyz/movies/flixhq/";
    query: string;
    options: any;


    lookupData: any;
    lookupDetails: any;
    watchData: any;

    constructor(query: string, options?: any) {
        this.query = query.replace(' ', '%20');
        this.options = options;
    }

    // Lookup Query on the API
    public async lookup(lookup: VideoLookup) {
        if (lookup.query) {
            await fetch(`${this.apiUrl}${lookup.query}`)
                .then((response: Response) => response.json())
                .then(async (data: any) => {
                    this.lookupData = data;
                    await this.selectOption();
                })
                .catch((error: any) => {
                    if (error) {
                        console.error(error);
                    }
                });
        } else if (lookup.id) {
            await fetch(`${this.apiUrl}info?id=${lookup.id}`)
                .then((response: Response) => {
                    return response.json();
                })
                .then((data: any) => {
                    this.lookupDetails = data;
                })
                .catch((error: any) => {
                    if (error) {
                        console.error(error);
                    }
                });
        } else if (lookup.episodeId && lookup.mediaId) {
            await fetch(`${this.apiUrl}watch?episodeId=${lookup.episodeId}&mediaId=${lookup.mediaId}`)
                .then((response: Response) => {
                    return response.json();
                })
                .then((data: any) => {
                    this.watchData = data;
                })
                .catch((error: any) => {
                    if (error) {
                        console.error(error);
                    }
                });
        }
    }

    private async selectOption() {
        const choices = this.cleanupMediaChoices();
        if (choices.length === 0) {
            console.log('There are no valid choices.');
            return;
        } else if (choices.length === 1) {
            const selectedChoice = this.lookupData.results.find((c: any) => c.formatted === choices[0]);
            await this.getDetails(selectedChoice.id);
        } else {
            await this.promptList('Select an option:', 'selected', choices, async (answer: any) => {
                const selectedChoice = this.lookupData.results.find((c: any) => c.formatted === answer.selected);
                await this.getDetails(selectedChoice.id);
            });
        }
    }

    private async getDetails(id: string) {
        try {
            await this.lookup({ id });
        } catch (e) {
            console.error(e);
        }

        switch (this.lookupDetails.type) {
            case VideoType.Movie: {
                try {
                    await this.watch(this.lookupDetails);
                } catch (e) {
                    console.error(e);
                }
                break;
            };
            case VideoType.Series: {
                try {
                    await this.handleSeries(this.lookupDetails);
                } catch (e) {
                    console.error(e);
                }
                break;
            };
        }
    }

    private async handleSeries(data: any) {
        const episodesBySeason: { [key: number]: any } = {};
        let selectedSeason: any[] = [];
        let selectedEp!: { id: any };
        let selectedSource!: { url: string };
        let filename!: string;

        if (data.episodes) {
            data.episodes.forEach((episode: any) => {
                if (episodesBySeason[episode.season] === undefined) {
                    episodesBySeason[episode.season] = [];
                    episodesBySeason[episode.season].push(episode);
                } else {
                    episodesBySeason[episode.season].push(episode);
                }
            });
        }

        const seasons = Array.from({ length: Object.keys(episodesBySeason).length }, (_, i) => i + 1);
        await this.promptList('Select a season:', 'season', seasons, async (answer: any) => {
            selectedSeason = episodesBySeason[answer.season];
        });

        selectedSeason.map((obj: any) => {
            obj.short = `[S${obj.season.toString().padStart(2, '0')}E${obj.number.toString().padStart(2, '0')}] ${obj.title}`;
            return obj;
        });

        const episodes = selectedSeason.map((c: any) => { return c.short; });
        await this.promptList('Select an episode:', 'ep', episodes, async (answer: any) => {
            filename = `${answer.ep}`;
            selectedEp = selectedSeason.find((c: any) => c.short === answer.ep);
        });

        await this.lookup({ mediaId: this.lookupDetails.id, episodeId: selectedEp.id });

        const referer = this.watchData.headers.Referer;
        const sources = this.watchData.sources.map((obj: any) => obj.quality);
        await this.promptList('Select a quality:', 'source', sources, async (answer: any) => {
            selectedSource = this.watchData.sources.find((c: any) => c.quality === answer.source);
        });

        this.playback(selectedSource.url, referer, filename);
    }

    private async watch(data: any) {
        let selectedSource!: { url: string };

        await this.lookup({ mediaId: data.id, episodeId: data.episodes[0].id });
        const referer = this.watchData.headers.Referer;
        const sources = this.watchData.sources.map((obj: any) => obj.quality);
        let filename = data.title;

        await this.promptList('Select a quality:', 'source', sources, async (answer: any) => {
            selectedSource = this.watchData.sources.find((c: any) => c.quality === answer.source);
        });

        if (this.options.download) {
            filename = undefined;
            console.log(':( Downloading movies is not supported yet.');
            console.log('Shall stream the movie instead.');
        }

        this.playback(selectedSource.url, referer, filename);
    }

    private async playback(url: string, referer: string, filename?: string) {
        if (this.options.download && filename !== undefined) {
            return this.downloadStream(url, filename);
        }

        try {
            console.log(' ');
            console.log(chalk.blue(`> 🎞 Streaming ${filename ? filename : 'Media'}...`));
            exec(`mpv ${url} --cache=yes --http-header-fields=Referer: ${referer}`);
        } catch (e) {
            console.error(e);
        }
    }

    private async promptList(message: string, name: string, choices: any[], callback: any) {
        await inquirer.prompt([{ type: 'list', message, name, choices }])
            .then(async (answer: any) => callback(answer));
    }

    private cleanupMediaChoices() {
        const choices: string[] = [];
        const broken: number[] = [];
        this.lookupData.results.map((obj: any) => {
            if (obj.type === VideoType.Series && obj.seasons !== null) {
                obj.formatted = `[${obj.type}] ${obj.title} [${obj.seasons} Seasons]`;
            } else if (obj.type === VideoType.Movie) {
                obj.formatted = `[${obj.type}] ${obj.title} [${obj.releaseDate}]`;
            } else {
                broken.push(obj.id);
            }
            if (obj.formatted) {
                choices.push(obj.formatted);
            }
            return obj;
        });

        // Remove the Broken Stuff (null seasons, etc)
        broken.forEach(brokenId => {
            const index = this.lookupData.results.findIndex((i: any) => i.id === brokenId);
            this.lookupData.results.splice(index, 1);
        });

        return choices;
    }

    private downloadStream(url: string, filename: string) {
        console.log(' ');
        const downloadBar = new cliProgress.SingleBar({
            format: chalk.blue('📥 Downloading:') + ' | ' + chalk.green('{bar}') + ' | {percentage}% | {value}/{total} Chunks',
            hideCursor: true
        }, cliProgress.Presets.shades_classic);

        ffmpeg()
            .input(url)
            .outputOptions([
                '-bsf:a aac_adtstoasc',
                '-vcodec copy',
                '-c copy',
                '-crf 50',
            ])
            .on('start', (commandLine: any) => {
                downloadBar.start(100, 0);
            })
            .on('progress', (progress: any) => {
                downloadBar.update(Math.floor(progress.percent));
            })
            .on('error', (err: any, stdout: any, stderr: any) => {
                console.error('Cannot process video: ' + err.message);
            })
            .on('end', () => {
                console.log(`\nDownload finished!', ${process.env.PWD}/${filename}.mp4`);
                downloadBar.stop();
                process.exit();
            })
            .save(`${filename}.mp4`);

    }   
}


(async () => {
    try {
        console.log(chalk.red(figlet.textSync(`Flixy CLI`, { horizontalLayout: 'full' })));
        console.log(" ");
        console.log("_____________________________________________________________________");
        console.log(" ");
        const cliData = { query: '', options: [] };

        program
            .version('1.0.2')
            .description('Simple CLI tool to lookup a TV show or Movie and stream it.')
            .option('-d, --download', 'Download the media to a file.')
            .argument('[string...]', 'Movie/TV-Show Title to search for.')
            .action(() => {
                cliData.query = program.args?.join(' ');
                cliData.options = program.opts();
            })
            .parse(process.argv);

        if (cliData.query === '') {
            console.log(chalk.yellow('Note: This is a pure alpha-state tool, things will/might break!'));
            console.log("_____________________________________________________________________");
            console.log(" ");
            await inquirer.prompt([{ message: 'Search:', name: 'query' }])
                .then(async (answer: any) => {
                    cliData.query = answer.query;
                    const flixy = new Flixy(cliData.query, cliData.options);
                    await flixy.lookup({ query: cliData.query });
                });
        } else {
            const flixy = new Flixy(cliData.query, cliData.options);
            await flixy.lookup({ query: cliData.query });
        }
    } catch (e) {
        throw e;
    }
})();

enum VideoType {
    Movie = 'Movie',
    Series = 'TV Series'
}

interface VideoLookup {
    id?: string,
    query?: string,
    episodeId?: string,
    mediaId?: string
}

