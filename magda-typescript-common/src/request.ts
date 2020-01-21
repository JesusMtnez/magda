import request from "request";
import readPkgUp from "read-pkg-up";
const pkg = readPkgUp.sync().pkg;

// include user agent derived from package.json in all http requests
export default request.defaults({
    headers: {
        "User-Agent": "".concat(
            pkg.name.replace("/", "-").replace("@", ""),
            "/",
            pkg.version
        )
    }
});
