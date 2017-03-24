import { IReadOnlyService } from './interfaces/read-only-service';
import {Menu, MittagApiResult} from './interfaces/mittag-api-result';
import * as Promise from "promise";
import { FormatUtility } from './format-utility';
import * as http from 'http';
 
export class MittagService implements IReadOnlyService<Menu> {

    private cachedResult: MittagApiResult;
    private lastFetched: Date;
    private formatter: FormatUtility;
    private defaultRestaurants: Array<number> = [
        371091, // horst
        11154,  // Eiserne Hand
        180248, // REX
        2820,   // Alte Metzgerei
        42486   //lackinger
        ];

    constructor(private mittagApiKey: string) {
        console.log(`Mittag-Api key: ${mittagApiKey}`);
        this.formatter = new FormatUtility();

        this.fetchAll().then(x => {
            this.cachedResult = x;
            this.lastFetched = new Date();
        })
    }

    private menuCached() : boolean {
        return (this.cachedResult && this.formatter.FormatDate(this.lastFetched) === this.formatter.FormatDate(new Date()));
    }

    public fetchDefaults() : Promise<Array<Menu>> {
        return new Promise((resolve, reject) => {
            if (this.menuCached()) {
                resolve(this.cachedResult.menus.filter(x => this.defaultRestaurants.indexOf(x.restaurant.id) != -1));
            } else {
                this.fetchAll().then(x => {
                    resolve(x.menus.filter(y => this.defaultRestaurants.indexOf(y.restaurant.id) != -1));
                })
            }
        });
    }

    public fetchAll() : Promise<MittagApiResult> {
        return new Promise((resolve,reject) => {
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
                    return resolve(endresponse)
                });
            });
        });
    }

    // public fetchNearestRestaurants() : Promise<Array<string>> {
    //     if (this.menuCached()) {
    //         return new Promise((resolve, reject) => {
    //             resolve(this.cachedResult.menus.filter(x => {
    //                 return x.distance < 2;
    //             }))
    //         });
    //     } else {
    //     this.fetchAll().then(x => {
    //         return new Promise((resolve, reject) => {
    //             resolve(x => x.menus.filter(y => {return y.distance < 2}));
    //         });
    //     });
    //     }
    // }


    public get Result() : MittagApiResult {
        if (this.cachedResult && this.formatter.FormatDate(this.lastFetched) == this.formatter.FormatDate(new Date())) {
            return this.cachedResult;
        }
    }

    private get mittagApiUrl() : string {
        return `http://www.mittag.at/api/1/menus?lat=48.3123164&lon=14.298357&apikey=${this.mittagApiKey}&v=1.0`;
    }
}
