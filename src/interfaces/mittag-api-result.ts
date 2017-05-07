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
