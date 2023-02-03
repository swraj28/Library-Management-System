const { userService, borrowerService } = require("../services");
const bcrypt = require("bcrypt-nodejs");
const { tokenHelper } = require("../helper");

module.exports = {
    getLoginForm: (req, res) => {
        res.render("form/login");
    },
    getSignUpForm: (req, res) => {
        res.render("form/signup");
    },
    getProfile: async (req, res, next) => {
        const userId = req.userId;
        const allPurchasedBooks = await borrowerService.findAllPurchasedBooks(userId, next);
        res.render("pages/profile", {books: allPurchasedBooks});
    },
    login: async (req, res, next) => {
        const {
            email,
            password
        } = req.body;
        const user = await userService.findUserByEmail(email, next);
        if (!user) {
            res.locals.message = "User does not exist with this email.";
            return res.redirect("/user/login")
        }
        // if (!(bcrypt.compare(password, user.password))) {
        //     res.locals.message = "Incorrect password.";
        //     return res.redirect("/user/login")
        // }

        console.log(req.body);

        // bcrypt.compare(req.body.password, user.password, function(err, results){

        //     res.locals.message = "Incorrect password.";
        //     return res.redirect("/user/login")
        //     // if(err){
        //     //     throw new Error(err)
        //     //  }
        //     //  if (results) {
        //     //     return res.status(200).json({ msg: "Login success" })
        //     // } else {
        //     //     return res.status(401).json({ msg: "Invalid credencial" })
        //     // }
        // })

        try{
            const userId = user._id;
            const token = await tokenHelper.sign({ userId: userId }, next);
            user.token = token;
            delete user._id;
            await userService.updateUser(user, userId, next);
            res.cookie("token", token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 1 });
            return res.redirect("/user/profile");
        }catch(e){
            console.log(e.toString());
        }
    },
    signup: async (req, res, next) => {
        const {
            email,
            password
        } = req.body;
        const user = await userService.findUserByEmail(email, next);
        if (user) {
            res.locals.message = "User already exists.";
            return res.redirect("/user/signup")
        }

        console.log(req.body);

        try{
            await bcrypt.hash(password, 10,null,(err,hash)=>{
                req.body.password = hash;
            });
            const newUser = await userService.createUser(req.body, next);
            return res.redirect("/user/login");
        }catch (e){
            console.log(e.toString());
        }
    }
}