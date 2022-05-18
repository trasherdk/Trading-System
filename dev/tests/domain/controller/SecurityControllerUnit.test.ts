import {SecurityController} from "../../../src/domain/SecurityController";

let controller: SecurityController;
const guestID: number = 1;
const username: string = "username";
const longUsername: string = "abcdefghijklmnopqrstuvwxyzABCDEF";
const emptyUsername: string = "";
const password: string = "123456789";
const shortPassword: string = "123";

describe('SecurityController - tests', function () {

    beforeEach(function () {
        controller = new SecurityController();
    })

    test("Access Marketplace - valid Guest ID", () => {
        controller.accessMarketplace(guestID);
        expect(controller.activeGuests).toContain(guestID);
    })

   test("Access Marketplace - invalid Guest ID", () => {
       controller.activeGuests.add(guestID);

       expect(function() { controller.accessMarketplace(guestID) }).toThrow(new Error(`There already exists a guest with ${guestID} in the marketplace`));
   })

    test("Register - valid input", () => {
        controller.register(username, password);
        expect(controller.users.get(username)).toBeDefined()
    })

    test("Register - username already exists", () => {
        controller.users.set(username, password);

        expect(function() { controller.register(username, password) }).toThrow(new Error(`A member with the username ${username} already exists`));
    })

    test("Register - invalid password", () => {
        expect(function() { controller.register(username, shortPassword) }).toThrow(new RangeError(`Password is too short and must contain at least ${controller.MINIMUM_PASSWORD_LENGTH} characters`));
    })

    test("Register - long username", () => {
        expect(function() { controller.register(longUsername, password) }).toThrow(new Error(`Username '${longUsername}' cannot be empty or longer than 31 characters`));
    })

    test("Register - empty username", () => {
        expect(function() { controller.register(emptyUsername, password) }).toThrow(new Error(`Username '${emptyUsername}' cannot be empty or longer than 31 characters`));
    })

    test("Login - valid input", () => {
        //valid register
        controller.users.set(username, password);

        controller.login(username, password);
        expect(controller.loggedInMembers).toContain(username);
    })

    test("Login - username does not exist", () => {
        expect(function() { controller.login(username, password) }).toThrow(new Error(`A member with the username '${username}' does not exist`));
    })

    test("Login - member already logged in", () => {
        //valid register
        controller.users.set(username, password);

        //valid login
        controller.loggedInMembers.add(username);

        expect(function() { controller.login(username, password) }).toThrow(new Error(`The member ${username} is already logged into the system`));
    })

    test("Login - invalid password", () => {
        //valid register
        controller.users.set(username, password);

        expect(function() { controller.login(username, shortPassword) }).toThrow(new Error(`The password is invalid, please try again`));
    })

    test("Logout - valid input", () => {
        //valid register
        controller.users.set(username, password);

        //valid login
        controller.loggedInMembers.add(username);

        controller.logout(username);
        expect(controller.loggedInMembers).not.toContain(username);
    })

    test("Logout - username does not exist", () => {
        expect(function() { controller.logout(username) }).toThrow(new Error(`A member with the username '${username}' does not exist`));
    })

    test("Logout - member is not logged in", () => {
        //valid register
        controller.users.set(username, password);

        expect(function() { controller.logout(username) }).toThrow(new Error(`The member ${username} is not currently logged in`));
    })

    test("Exit Marketplace - valid Guest ID", () => {
        //valid access marketplace
        controller.activeGuests.add(guestID);

        controller.exitMarketplace(guestID);
        expect(controller.activeGuests).not.toContain(guestID);
    })

    test("Exit - Invalid Guest ID", () => {
        expect(function() { controller.exitMarketplace(guestID) }).toThrow(new Error(`There is no guest with ${guestID} currently in the marketplace`));
    })
});
