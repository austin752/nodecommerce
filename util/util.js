exports.userEmail = ((req, res, next) =>{
    console.log(session.user.email)
    return userEmail = req.session.user.email;
});

module.exports = userEmail;