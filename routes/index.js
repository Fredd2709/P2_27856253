const ContactosController = require("../controller/ContactosController");
const contactosController = new ContactosController();
const passport = require('passport');
const indexController = require("../controller/indexController");
const Secuity = require("../controller/Security");
var express = require('express');
var router = express.Router();
require('dotenv').config()
/* GET home page. */
router.get('/', indexController);

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://p2-27856253.onrender.com/auth/github/callback",
    scope: 'user:email',
},
    function (accessToken, refreshToken, profile, cb) {
        try {
            // Intentar obtener el email directamente del perfil
            let email = profile.emails && profile.emails[0] && profile.emails[0].value;
            // Incluir el email en el perfil
            profile.email = email;
            return cb(null, profile);
        } catch (error) {
            return cb(error);
        }

    }
));

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (email == process.env.EMAIL && password == process.env.PASSWORD) {
        const token = jwt.sign({ email }, process.env.JWTSECRET, { expiresIn: '2h' });
        res.cookie("jwt", token);
        res.redirect("/contactos");
    } else {
        res.status(500).json({message:'No autorizado!'})
    }
})

router.get('/contactos', Secuity.protect, async (req, res) => {
    const contactos = await contactosController.contactosModel.obtenerAllContactos();
    const email = req.user.email;
    res.render('contactos', {
        get: contactos,
        emailgithub: email
    })
})

router.get('/login',Secuity.protectLogin,async(req,res) => {
    res.render('login');
})


router.post("/form-contact", contactosController.add);
router.get('/auth/github', passport.authenticate('github', {
    scope: ['user:email']
}));

router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        const email = req.user.email;
        const token = jwt.sign({ email }, process.env.JWTSECRET, { expiresIn: '2h' });
        res.cookie("jwt", token);
        res.redirect("/contactos");
    });


module.exports = router;
