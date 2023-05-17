const isAuthenticatedVendor = asyncErrorHandler(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.vendor = await Vendor.findById(decoded.id);

    if (!req.vendor) {
        return next(new ErrorHandler('Vendor not found.', 404));
    }

    next();
});
