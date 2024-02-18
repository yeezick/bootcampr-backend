export const getApiVersion = async (req, res) => {
    try {
        const currentVersion = process.env.npm_package_version

        res.status(200).json({
            version: currentVersion
        });
    } catch (error) {
        res.status(500).json({
            message: 'Unable to get service version.',
            error: error.message,
        });
    }
};
