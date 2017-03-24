import { Menu, Restaurant } from './mittag-service';



export class FormatUtility {
    public FormatMenus(menus: Array<Menu>) : string {
        var result = "";

        menus.forEach(element => {
            this.formatMenu(element) + "\n";
        });
        
        return result;
    }

    public formatMenu(menu: Menu) : string {
        var formattedMenu = "";
        formattedMenu + "*" + menu.restaurantName + "*\n";
        formattedMenu + ""   
        return formattedMenu;   
    }

    public FormatRestaurant(restaurant: Restaurant) : string {
        var formattedRestaurant = "";
        return formattedRestaurant;
    }

    public FormatDate(date: Date) : string {
        var dd = date.getDate();
        var mm = date.getMonth()+1; //January is 0!
        var yyyy = date.getFullYear();

        return  yyyy + "-" + mm + "-" +dd;
    }
    
}