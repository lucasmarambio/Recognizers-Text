import { Constants, TimeTypeConstants } from "./constants";
import { IExtractor, ExtractResult } from "../number/extractors"
import { IDateTimeParser, DateTimeParseResult } from "./parsers"
import { BaseDurationExtractor, BaseDurationParser } from "./baseDuration"
import { BaseTimeExtractor, BaseTimeParser } from "./baseTime"
import { BaseDateExtractor, BaseDateParser } from "./baseDate"
import { BaseDatePeriodExtractor, BaseDatePeriodParser } from "./baseDatePeriod"
import { BaseTimePeriodExtractor, BaseTimePeriodParser } from "./baseTimePeriod"
import { BaseDateTimeExtractor, BaseDateTimeParser } from "./baseDateTime"
import { BaseDateTimePeriodExtractor, BaseDateTimePeriodParser} from "./baseDateTimePeriod"
import { Token, DateTimeResolutionResult } from "./utilities";
import { RegExpUtility, StringUtility } from "./../utilities";

export interface ISetExtractorConfiguration {
    lastRegex: RegExp;
    eachPrefixRegex: RegExp;
    periodicRegex: RegExp;
    eachUnitRegex: RegExp;
    eachDayRegex: RegExp;
    beforeEachDayRegex: RegExp;
    setWeekDayRegex: RegExp;
    setEachRegex: RegExp;
    durationExtractor: BaseDurationExtractor;
    timeExtractor: BaseTimeExtractor;
    dateExtractor: BaseDateExtractor;
    dateTimeExtractor: BaseDateTimeExtractor;
    datePeriodExtractor: BaseDatePeriodExtractor;
    timePeriodExtractor: BaseTimePeriodExtractor;
    dateTimePeriodExtractor: BaseDateTimePeriodExtractor;
}

export class BaseSetExtractor implements IExtractor {
    private readonly extractorName = Constants.SYS_DATETIME_SET
    private readonly config: ISetExtractorConfiguration;
    
    constructor(config: ISetExtractorConfiguration) {
        this.config = config;
    }
    
    extract(source: string): Array<ExtractResult> {
        let tokens: Array<Token> = new Array<Token>()
        .concat(this.matchEachUnit(source))
        .concat(this.matchEachDuration(source))
        .concat(this.timeEveryday(source))
        .concat(this.matchEach(this.config.dateExtractor, source))
        .concat(this.matchEach(this.config.timeExtractor, source))
        .concat(this.matchEach(this.config.dateTimeExtractor, source))
        .concat(this.matchEach(this.config.datePeriodExtractor, source))
        .concat(this.matchEach(this.config.timePeriodExtractor, source))
        .concat(this.matchEach(this.config.dateTimePeriodExtractor, source))
        let result = Token.mergeAllTokens(tokens, source, this.extractorName);
        return result;
    }
    
    private matchEachUnit(source: string): Array<Token> {
        let ret = [];
        RegExpUtility.getMatches(this.config.periodicRegex, source).forEach(match => {
            ret.push(new Token(match.index, match.index + match.length))
        });
        RegExpUtility.getMatches(this.config.eachUnitRegex, source).forEach(match => {
            ret.push(new Token(match.index, match.index + match.length))
        });
        return ret;
    }
    
    private matchEachDuration(source: string): Array<Token> {
        let ret = [];
        this.config.durationExtractor.extract(source).forEach(er => {
            if (RegExpUtility.getMatches(this.config.lastRegex, er.text).length > 0) return;
            let beforeStr = source.substr(0, er.start);
            let matches = RegExpUtility.getMatches(this.config.eachPrefixRegex, beforeStr);
            if (matches && matches.length > 0) {
                ret.push(new Token(matches[0].index, er.start + er.length))
            }
        });
        return ret;
    }
    
    private timeEveryday(source: string): Array<Token> {
        let ret = [];
        this.config.timeExtractor.extract(source).forEach(er => {
            let afterStr = source.substr(er.start + er.length);
            if (StringUtility.isNullOrWhitespace(afterStr) && this.config.beforeEachDayRegex) {
                let beforeStr = source.substr(0, er.start);
                let beforeMatches = RegExpUtility.getMatches(this.config.beforeEachDayRegex, beforeStr);
                if (beforeMatches && beforeMatches.length > 0) {
                    ret.push(new Token(beforeMatches[0].index, er.start + er.length))
                }
            } else {
                let afterMatches = RegExpUtility.getMatches(this.config.eachDayRegex, afterStr);
                if (afterMatches && afterMatches.length > 0) {
                    ret.push(new Token(er.start, er.start + er.length + afterMatches[0].length))
                }
            }
        });
        return ret;
    }
    
    private matchEach(extractor: IExtractor, source: string): Array<Token> {
        let ret = [];
        RegExpUtility.getMatches(this.config.setEachRegex, source).forEach(match => {
            let trimmedSource = source.substr(0, match.index) + source.substr(match.index + match.length);
            extractor.extract(trimmedSource).forEach(er => {
                if (er.start <= match.index && (er.start + er.length) > match.index) {
                    ret.push(new Token(er.start, er.start + match.length + er.length));
                }
            });
        });
        RegExpUtility.getMatches(this.config.setWeekDayRegex, source).forEach(match => {
            let trimmedSource = source.substr(0, match.index) + match.groups('weekday').value + source.substr(match.index + match.length);
            extractor.extract(trimmedSource).forEach(er => {
                if (er.start <= match.index) {
                    let length = er.length + 1;
                    if (!StringUtility.isNullOrEmpty(match.groups('prefix').value)) {
                        length += match.groups('prefix').value.length;
                    }
                    ret.push(new Token(er.start, er.start + length));
                }
            });
        });
        return ret;
    }
}

export interface ISetParserConfiguration {
    durationExtractor: BaseDurationExtractor;
    durationParser: BaseDurationParser;
    timeExtractor: BaseTimeExtractor;
    timeParser: BaseTimeParser;
    dateExtractor: BaseDateExtractor;
    dateParser: BaseDateParser;
    dateTimeExtractor: BaseDateTimeExtractor;
    dateTimeParser: BaseDateTimeParser;
    datePeriodExtractor: BaseDatePeriodExtractor;
    datePeriodParser: BaseDatePeriodParser;
    timePeriodExtractor: BaseTimePeriodExtractor;
    timePeriodParser: BaseTimePeriodParser;
    dateTimePeriodExtractor: BaseDateTimePeriodExtractor;
    dateTimePeriodParser: BaseDateTimePeriodParser;
    unitMap: ReadonlyMap<string, string>;
    eachPrefixRegex: RegExp;
    periodicRegex: RegExp;
    eachUnitRegex: RegExp;
    eachDayRegex: RegExp;
    setWeekDayRegex: RegExp;
    setEachRegex: RegExp;
    getMatchedDailyTimex(text: string): { matched: boolean, timex: string };
    getMatchedUnitTimex(text: string): { matched: boolean, timex: string };
}

export class BaseSetParser implements IDateTimeParser {
    public static readonly ParserName = Constants.SYS_DATETIME_SET;
    private readonly config: ISetParserConfiguration;
    
    constructor(configuration: ISetParserConfiguration) {
        this.config = configuration;
    }
    
    parse(er: ExtractResult, referenceDate?: Date): DateTimeParseResult | null {
        if (!referenceDate) referenceDate = new Date();
        let value = null;
        if (er.type === BaseSetParser.ParserName) {
            let innerResult = this.parseEachUnit(er.text);
            if (!innerResult.success) {
                innerResult = this.parseEachDuration(er.text);
            }
            
            if (!innerResult.success) {
                innerResult = this.parserTimeEveryday(er.text);
            }
            
            // NOTE: Please do not change the order of following function
            // datetimeperiod>dateperiod>timeperiod>datetime>date>time
            if (!innerResult.success) {
                innerResult = this.parseEach(this.config.dateTimePeriodExtractor, this.config.dateTimePeriodParser, er.text);
            }
            
            if (!innerResult.success) {
                innerResult = this.parseEach(this.config.datePeriodExtractor, this.config.datePeriodParser, er.text);
            }
            
            if (!innerResult.success) {
                innerResult = this.parseEach(this.config.timePeriodExtractor, this.config.timePeriodParser, er.text);
            }
            
            if (!innerResult.success) {
                innerResult = this.parseEach(this.config.dateTimeExtractor, this.config.dateTimeParser, er.text);
            }
            
            if (!innerResult.success) {
                innerResult = this.parseEach(this.config.dateExtractor, this.config.dateParser, er.text);
            }
            
            if (!innerResult.success) {
                innerResult = this.parseEach(this.config.timeExtractor, this.config.timeParser, er.text);
            }
            
            if (innerResult.success) {
                innerResult.futureResolution = new Map<string, string>(
                    [
                        [TimeTypeConstants.SET, innerResult.futureValue]
                    ]);
                    
                    innerResult.pastResolution = new Map<string, string>(
                        [
                            [TimeTypeConstants.SET, innerResult.pastValue]
                        ]);
                        
                        value = innerResult;
                    }
                }
                
                let ret = new DateTimeParseResult(er);
                ret.value = value,
                ret.timexStr = value === null ? "" : value.timex,
                ret.resolutionStr = ""
                
                return ret;
            }
            
            private parseEachDuration(text: string): DateTimeResolutionResult {
                let ret = new DateTimeResolutionResult();
                let ers = this.config.durationExtractor.extract(text);
                if (ers.length !== 1 || text.substring(ers[0].start + ers[0].length || 0)) {
                    return ret;
                }
                
                let beforeStr = text.substring(0, ers[0].start || 0);
                let matches = RegExpUtility.getMatches(this.config.eachPrefixRegex, beforeStr);
                if (matches.length) {
                    let pr = this.config.durationParser.parse(ers[0], new Date());
                    ret.timex = pr.timexStr;
                    ret.futureValue = ret.pastValue = "Set: " + pr.timexStr;
                    ret.success = true;
                    return ret;
                }
                
                return ret;
            }
            
            private parseEachUnit(text: string): DateTimeResolutionResult {
                let ret = new DateTimeResolutionResult();
                // handle "daily", "weekly"
                let matches = RegExpUtility.getMatches(this.config.periodicRegex, text);
                if (matches.length) {
                    let getMatchedDailyTimex = this.config.getMatchedDailyTimex(text);
                    if (!getMatchedDailyTimex.matched) {
                        return ret;
                    }
                    
                    ret.timex = getMatchedDailyTimex.timex;
                    ret.futureValue = ret.pastValue = "Set: " + ret.timex;
                    ret.success = true;
                    
                    return ret;
                }
                
                // handle "each month"
                matches = RegExpUtility.getMatches(this.config.eachUnitRegex, text);
                if (matches.length && matches[0].length === text.length) {
                    let sourceUnit = matches[0].groups("unit").value;
                    if (sourceUnit && this.config.unitMap.has(sourceUnit)) {
                        let getMatchedUnitTimex = this.config.getMatchedUnitTimex(sourceUnit);
                        if (!getMatchedUnitTimex.matched) {
                            return ret;
                        }

                        if (!StringUtility.isNullOrEmpty(matches[0].groups('other').value)) {
                            getMatchedUnitTimex.timex = getMatchedUnitTimex.timex.replace('1', '2');
                        }
                        
                        ret.timex = getMatchedUnitTimex.timex;
                        ret.futureValue = ret.pastValue = "Set: " + ret.timex;
                        ret.success = true;
                        return ret;
                    }
                }
                
                return ret;
            }
            
            private parserTimeEveryday(text: string): DateTimeResolutionResult {
                let ret = new DateTimeResolutionResult();
                let ers = this.config.timeExtractor.extract(text);
                if (ers.length !== 1) {
                    return ret;
                }
                
                let afterStr = text.replace(ers[0].text, "");
                let matches = RegExpUtility.getMatches(this.config.eachDayRegex, afterStr);
                if (matches.length) {
                    let pr = this.config.timeParser.parse(ers[0], new Date());
                    ret.timex = pr.timexStr;
                    ret.futureValue = ret.pastValue = "Set: " + ret.timex;
                    ret.success = true;
                    return ret;
                }
                
                return ret;
            }
            
            private parseEach(extractor: IExtractor, parser: IDateTimeParser, text: string): DateTimeResolutionResult {
                let ret = new DateTimeResolutionResult();
                let success = false;
                let er: ExtractResult;
                let match = RegExpUtility.getMatches(this.config.setEachRegex, text).pop();
                if (match) {
                    let trimmedText = text.substr(0, match.index) + text.substr(match.index + match.length);
                    let ers = extractor.extract(trimmedText);
                    if (ers.length === 1 && ers[0].length === trimmedText.length) {
                        er = ers[0];
                    }
                }
                match = RegExpUtility.getMatches(this.config.setWeekDayRegex, text).pop();
                if (match) {
                    let trimmedText = text.substr(0, match.index) + match.groups('weekday').value + text.substr(match.index + match.length);
                    let ers = extractor.extract(trimmedText);
                    if (ers.length === 1 && ers[0].length === trimmedText.length) {
                        er = ers[0];
                    }
                }
                if (er) {
                    let pr = parser.parse(er);
                    ret.timex = pr.timexStr;
                    ret.futureValue = `Set: ${pr.timexStr}`;
                    ret.pastValue = `Set: ${pr.timexStr}`;
                    ret.success = true;
                    return ret;
                }
                return ret;
            }
        }
        