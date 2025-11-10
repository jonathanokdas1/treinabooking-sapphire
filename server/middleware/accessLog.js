module.exports = (req, res, next) => {
    console.log('API log - ', req.originalUrl);
    next();
}
