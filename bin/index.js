#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var figlet = require('figlet');
var program = require('commander');
var inquirer = require('inquirer');
var clear = require('clear');
var exec = require('child_process').exec;
var cliProgress = require('cli-progress');
var ffmpeg = require('fluent-ffmpeg');
clear();
var Flixy = /** @class */ (function () {
    function Flixy(query, options) {
        this.apiUrl = "https://api.haikei.xyz/movies/flixhq/";
        this.query = query.replace(' ', '%20');
        this.options = options;
    }
    // Lookup Query on the API
    Flixy.prototype.lookup = function (lookup) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!lookup.query) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetch("".concat(this.apiUrl).concat(lookup.query))
                                .then(function (response) { return response.json(); })
                                .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.lookupData = data;
                                            return [4 /*yield*/, this.selectOption()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function (error) {
                                if (error) {
                                    console.error(error);
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!lookup.id) return [3 /*break*/, 4];
                        return [4 /*yield*/, fetch("".concat(this.apiUrl, "info?id=").concat(lookup.id))
                                .then(function (response) {
                                return response.json();
                            })
                                .then(function (data) {
                                _this.lookupDetails = data;
                            })
                                .catch(function (error) {
                                if (error) {
                                    console.error(error);
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(lookup.episodeId && lookup.mediaId)) return [3 /*break*/, 6];
                        return [4 /*yield*/, fetch("".concat(this.apiUrl, "watch?episodeId=").concat(lookup.episodeId, "&mediaId=").concat(lookup.mediaId))
                                .then(function (response) {
                                return response.json();
                            })
                                .then(function (data) {
                                _this.watchData = data;
                            })
                                .catch(function (error) {
                                if (error) {
                                    console.error(error);
                                }
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Flixy.prototype.selectOption = function () {
        return __awaiter(this, void 0, void 0, function () {
            var choices, selectedChoice;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        choices = this.cleanupMediaChoices();
                        if (!(choices.length === 0)) return [3 /*break*/, 1];
                        console.log('There are no valid choices.');
                        return [2 /*return*/];
                    case 1:
                        if (!(choices.length === 1)) return [3 /*break*/, 3];
                        selectedChoice = this.lookupData.results.find(function (c) { return c.formatted === choices[0]; });
                        return [4 /*yield*/, this.getDetails(selectedChoice.id)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.promptList('Select an option:', 'selected', choices, function (answer) { return __awaiter(_this, void 0, void 0, function () {
                            var selectedChoice;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        selectedChoice = this.lookupData.results.find(function (c) { return c.formatted === answer.selected; });
                                        return [4 /*yield*/, this.getDetails(selectedChoice.id)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Flixy.prototype.getDetails = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1, _a, e_2, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.lookup({ id: id })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        console.error(e_1);
                        return [3 /*break*/, 3];
                    case 3:
                        _a = this.lookupDetails.type;
                        switch (_a) {
                            case VideoType.Movie: return [3 /*break*/, 4];
                            case VideoType.Series: return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 12];
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.watch(this.lookupDetails)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _b.sent();
                        console.error(e_2);
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 12];
                    case 8:
                        _b.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.handleSeries(this.lookupDetails)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_3 = _b.sent();
                        console.error(e_3);
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    Flixy.prototype.handleSeries = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var episodesBySeason, selectedSeason, selectedEp, selectedSource, filename, seasons, episodes, referer, sources;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        episodesBySeason = {};
                        selectedSeason = [];
                        if (data.episodes) {
                            data.episodes.forEach(function (episode) {
                                if (episodesBySeason[episode.season] === undefined) {
                                    episodesBySeason[episode.season] = [];
                                    episodesBySeason[episode.season].push(episode);
                                }
                                else {
                                    episodesBySeason[episode.season].push(episode);
                                }
                            });
                        }
                        seasons = Array.from({ length: Object.keys(episodesBySeason).length }, function (_, i) { return i + 1; });
                        return [4 /*yield*/, this.promptList('Select a season:', 'season', seasons, function (answer) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    selectedSeason = episodesBySeason[answer.season];
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        selectedSeason.map(function (obj) {
                            obj.short = "[S".concat(obj.season.toString().padStart(2, '0'), "E").concat(obj.number.toString().padStart(2, '0'), "] ").concat(obj.title);
                            return obj;
                        });
                        episodes = selectedSeason.map(function (c) { return c.short; });
                        return [4 /*yield*/, this.promptList('Select an episode:', 'ep', episodes, function (answer) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    filename = "".concat(answer.ep);
                                    selectedEp = selectedSeason.find(function (c) { return c.short === answer.ep; });
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.lookup({ mediaId: this.lookupDetails.id, episodeId: selectedEp.id })];
                    case 3:
                        _a.sent();
                        referer = this.watchData.headers.Referer;
                        sources = this.watchData.sources.map(function (obj) { return obj.quality; });
                        return [4 /*yield*/, this.promptList('Select a quality:', 'source', sources, function (answer) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    selectedSource = this.watchData.sources.find(function (c) { return c.quality === answer.source; });
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        this.playback(selectedSource.url, referer, filename);
                        return [2 /*return*/];
                }
            });
        });
    };
    Flixy.prototype.watch = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedSource, referer, sources, filename;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.lookup({ mediaId: data.id, episodeId: data.episodes[0].id })];
                    case 1:
                        _a.sent();
                        referer = this.watchData.headers.Referer;
                        sources = this.watchData.sources.map(function (obj) { return obj.quality; });
                        filename = data.title;
                        return [4 /*yield*/, this.promptList('Select a quality:', 'source', sources, function (answer) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    selectedSource = this.watchData.sources.find(function (c) { return c.quality === answer.source; });
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        if (this.options.download) {
                            filename = undefined;
                            console.log(':( Downloading movies is not supported yet.');
                            console.log('Shall stream the movie instead.');
                        }
                        this.playback(selectedSource.url, referer, filename);
                        return [2 /*return*/];
                }
            });
        });
    };
    Flixy.prototype.playback = function (url, referer, filename) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.options.download && filename !== undefined) {
                    return [2 /*return*/, this.downloadStream(url, filename)];
                }
                try {
                    console.log(' ');
                    console.log("### Starting playback ###");
                    exec("mpv ".concat(url, " --cache=yes --http-header-fields=Referer: ").concat(referer));
                }
                catch (e) {
                    console.error(e);
                }
                return [2 /*return*/];
            });
        });
    };
    Flixy.prototype.promptList = function (message, name, choices, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer.prompt([{ type: 'list', message: message, name: name, choices: choices }])
                            .then(function (answer) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, callback(answer)];
                        }); }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Flixy.prototype.cleanupMediaChoices = function () {
        var _this = this;
        var choices = [];
        var broken = [];
        this.lookupData.results.map(function (obj) {
            if (obj.type === VideoType.Series && obj.seasons !== null) {
                obj.formatted = "[".concat(obj.type, "] ").concat(obj.title, " [").concat(obj.seasons, " Seasons]");
            }
            else if (obj.type === VideoType.Movie) {
                obj.formatted = "[".concat(obj.type, "] ").concat(obj.title, " [").concat(obj.releaseDate, "]");
            }
            else {
                broken.push(obj.id);
            }
            if (obj.formatted) {
                choices.push(obj.formatted);
            }
            return obj;
        });
        // Remove the Broken Stuff (null seasons, etc)
        broken.forEach(function (brokenId) {
            var index = _this.lookupData.results.findIndex(function (i) { return i.id === brokenId; });
            _this.lookupData.results.splice(index, 1);
        });
        return choices;
    };
    Flixy.prototype.downloadStream = function (url, filename) {
        var downloadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        console.log('Download:', filename);
        console.log('URL:', url);
        ffmpeg()
            .input(url)
            .inputOptions([
            "-headers \"Referer: ".concat(this.watchData.headers.Referer, "\""),
        ])
            .outputOptions([
            '-bsf:a aac_adtstoasc',
            '-vcodec copy',
            '-c copy',
            '-crf 50',
        ])
            .on('start', function (commandLine) {
            downloadBar.start(100, 0);
        })
            .on('progress', function (progress) {
            downloadBar.update(progress.percent.toFixed(2));
        })
            .on('error', function (err, stdout, stderr) {
            console.error('Cannot process video: ' + err.message);
        })
            .on('end', function () {
            console.log('\nProcessing finished !');
            downloadBar.stop();
        })
            .save("".concat(filename, ".mp4"));
        process.exit();
    };
    return Flixy;
}());
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var cliData_1, flixy, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log(figlet.textSync("Flixy CLI", { horizontalLayout: 'full' }));
                console.log(" ");
                cliData_1 = { query: '', options: [] };
                program
                    .version('1.0.0')
                    .description('Simple CLI tool to lookup a TV show or Movie and stream it.')
                    .argument('<string>', 'Movie/TV-Show Title to search for.')
                    .option('-d, --download', 'Download the media to a file.')
                    .action(function (str, options) {
                    cliData_1.query = str,
                        cliData_1.options = options;
                })
                    .parse(process.argv);
                flixy = new Flixy(cliData_1.query, cliData_1.options);
                return [4 /*yield*/, flixy.lookup({ query: cliData_1.query })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_4 = _a.sent();
                throw e_4;
            case 3: return [2 /*return*/];
        }
    });
}); })();
var VideoType;
(function (VideoType) {
    VideoType["Movie"] = "Movie";
    VideoType["Series"] = "TV Series";
})(VideoType || (VideoType = {}));
