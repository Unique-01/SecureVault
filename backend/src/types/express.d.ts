import { TokenPayload } from "src/common/token/interface/token.interface.ts";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayloadPayload;
        }
    }
}
