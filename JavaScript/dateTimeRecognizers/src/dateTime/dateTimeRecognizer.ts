import { IModel, Recognizer, Culture } from "recognizers-text-number";
import { IDateTimeModel, DateTimeModel } from "./models";
import { BaseMergedParser, BaseMergedExtractor, DateTimeOptions } from "./baseMerged";
import { EnglishCommonDateTimeParserConfiguration } from "./english/baseConfiguration";
import { EnglishMergedExtractorConfiguration, EnglishMergedParserConfiguration } from "./english/mergedConfiguration";

export default class DateTimeRecognizer extends Recognizer {
    static readonly instance: DateTimeRecognizer = new DateTimeRecognizer();

    private constructor() {
        super();

        // English models
        this.registerModel("DateTimeModel", Culture.English, new DateTimeModel(
            new BaseMergedParser(new EnglishMergedParserConfiguration(new EnglishCommonDateTimeParserConfiguration())),
            new BaseMergedExtractor(new EnglishMergedExtractorConfiguration(), DateTimeOptions.None)
        ));
    }

    getDateTimeModel(culture: string = "", fallbackToDefaultCulture: boolean = true): IDateTimeModel {
        return this.getModel("DateTimeModel", culture, fallbackToDefaultCulture);
    }

    public static getSingleCultureInstance(cultureCode: string, options: DateTimeOptions = DateTimeOptions.None): DateTimeRecognizer {
        return new DateTimeRecognizer();
    }
}