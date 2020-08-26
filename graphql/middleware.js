const ifAuthenticated = (next) => (root, args, context, info) => {
    console.log(context.user)
    if(context.user) {        
        return next(root, args, context, info);
    }
    throw new Error('Not authorized');
}

const ifAdmin = (next) => (root, args, context, info) => {
    if(context.user.access === "admin") {
        return next(root, args, context, info);
    }
    throw new Error('Not authorized');
}

module.exports = {ifAuthenticated, ifAdmin};
