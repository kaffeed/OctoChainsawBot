import { FormatUtility } from './format-utility';
var http = require('http');

export interface OpenTime {
    openHour: number;
    openMinute: number;
    closeHour: number;
    closeMinute: number;
    timezone: string;
    weekday: number;
}

export interface Price {
    price: number;
    currency: string;
    description: string;
}

export interface LunchTime {
    openHour: number;
    openMinute: number;
    closeHour: number;
    closeMinute: number;
    timezone: string;
    weekday: number;
}

export interface Restaurant {
    name: string;
    street: string;
    streetNr: string;
    state: string;
    zipCode: string;
    city: string;
    telephone: string;
    vegetarianOption?: boolean;
    lat: number;
    lon: number;
    id: number;
    openTimes: OpenTime[];
    urlName: string;
    url: string;
    prices: Price[];
    info: string;
    lunchTimes: LunchTime[];
}

export interface Menu {
    restaurantName: string;
    menu: string;
    distance: number;
    restaurant: Restaurant;
}

export interface MittagApiResult {
    menus: Menu[];
}

export class MittagService {
    private cachedResult: MittagApiResult;
    private lastFetched: Date;
    private formatter: FormatUtility;

    constructor(private mittagApiKey: string) {
        console.log(`Mittag-Api key: ${mittagApiKey}`);
        this.formatter = new FormatUtility();
    }

    public FetchAllMenus(callback?) {
        http.get(this.mittagApiUrl, function(result) {
            console.log("Result", result);
            var response = "";
            result.on('data', function(chunk){
                response += chunk;
            });

            result.on('end', function(){
                var endresponse = <MittagApiResult> (JSON.parse(response));
                console.log("Got a response: ", endresponse);
                this.cachedResult = endresponse;             
                this.lastFetched = new Date();
                if (callback) {
                    callback(this.cachedResult);
                }   
            });
        });
    }

    public get Result() : MittagApiResult {
        if (this.cachedResult && this.formatter.FormatDate(this.lastFetched) == this.formatter.FormatDate(new Date())) {
            return this.cachedResult;
        }

        var callback = function(data) {
            return data;
        }

        this.FetchAllMenus(callback);
    }


    private get mittagApiUrl() : string {
        return `http://www.mittag.at/api/1/menus?lat=48.3123164&lon=14.298357&apikey=${this.mittagApiKey}&v=1.0`;
    }
}
