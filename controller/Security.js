const jwt = require('jsonwebtoken');
const { promisify } = require('util');
require('dotenv').config()
exports.protect = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            const tokenAuthorized = await promisify(jwt.verify)(token, process.env.JWTSECRET);
            if (tokenAuthorized) {
                req.user = tokenAuthorized
                return next();
            }
        } catch (error) {
            console.log(error);
        }
    }

    res.redirect("/login");
};


// Middleware para prevenir el acceso a /login si ya está autenticado
exports.protectLogin = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            const tokenAuthorized = await promisify(jwt.verify)(token, process.env.JWTSECRET);
            if (tokenAuthorized) {
                return res.redirect('/contactos');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return next();
};
