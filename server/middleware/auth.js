import jwt from 'jsonwebtoken'


//Click Like button => auth middleware checks => like controller.

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const isCustomAuth = token.length < 500

        let decodedData;

        if (token && isCustomAuth) {
            decodedData = jwt.verify(token, 'test')

            req.userId = decodedData?.id
        } else {
            decodedData = jwt.decode(token);

            req.userId = decodedData?.sub;
        }
        console.log(req.userId)

        next()
    } catch (error) {
        console.log(error)
    }
}

export default auth;
