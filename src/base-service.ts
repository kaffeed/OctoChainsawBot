import * as Promise from "promise";
import * as http from "http";
import { IReadOnlyService } from "./interfaces/services";
import { inject } from "aurelia-dependency-injection";

export abstract class BaseService<T> implements IReadOnlyService<T> {

    constructor(protected _apiEndpoint: string) {
    }

    public fetchAll() : Promise<T> {
        return new Promise((resolve, reject) => {
            http.get(this._apiEndpoint, (result) => {
                console.log("Fetches result: ", result);
                var response = "";
                result.on("data", (chunk) => {
                    response += chunk;
                })

                result.on("end", () => {
                    var parsedResult = <T> JSON.parse(response);
                    console.log("Results serialized to JSON: ", parsedResult);
                    return resolve(parsedResult);
                })
            });
        });
    }
}
