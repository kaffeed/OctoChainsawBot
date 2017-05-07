import { IMittagService, IReadOnlyService } from './interfaces/services';
import { MittagApiResult, Menu} from './interfaces/mittag-api-result';
import * as Promise from "promise";
import { FormatUtility } from './format-utility';
import * as http from 'http';
import { BaseService } from "./base-service";
import { inject } from "aurelia-dependency-injection/dist/aurelia-dependency-injection";
import { OctoChainsawSettings } from "./octo-chainsaw-settings";

@inject(FormatUtility, OctoChainsawSettings)
export class MittagService extends BaseService<MittagApiResult> implements IMittagService<Menu> {

    private _cachedResult: any;
    private _lastFetched: Date;

    private defaultRestaurants: Array<number> = [
        371091, // horst
        11154,  // Eiserne Hand
        180248, // REX
        2820,   // Alte Metzgerei
        42486   //lackinger
        ];

    constructor(private _settings: OctoChainsawSettings, private _formatter: FormatUtility)  {
        super(_settings.mittagApiKey);
        console.log(`*** Mittag-Api key: ${this._settings.mittagApiKey}`);
        this._formatter = new FormatUtility();

        this.fetchAll().then((x: MittagApiResult)=> {
            this._cachedResult = x;
            this._lastFetched = new Date();
        })
    }

    private menuCached() : boolean {
        return (this._cachedResult && this._formatter.FormatDate(this._lastFetched) === this._formatter.FormatDate(new Date()));
    }

    public fetchDefaults() : Promise<Array<Menu>> {
        return new Promise((resolve, reject) => {
            if (this.menuCached()) {
                resolve(this._cachedResult.menus.filter(x => this.defaultRestaurants.indexOf(x.restaurant.id) != -1));
            } else {
                this.fetchAll().then(x => {
                    resolve(x.menus.filter(y => this.defaultRestaurants.indexOf(y.restaurant.id) != -1));
                })
            }
        });
    }

    public get Result() : MittagApiResult {
        if (this._cachedResult && this._formatter.FormatDate(this._lastFetched) == this._formatter.FormatDate(new Date())) {
            return this._cachedResult;
        }
    }

    private get mittagApiUrl() : string {
        return `${this._apiEndpoint}${this._settings.mittagApiKey}`;
    }
}
