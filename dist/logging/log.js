"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDirectory = path_1.default.join(__dirname, 'logs');
const { format } = winston_1.default;
if (!fs_1.default.existsSync(logDirectory)) {
    fs_1.default.mkdirSync(logDirectory);
}
const logs = (service) => winston_1.default.createLogger({
    level: 'info',
    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
    defaultMeta: { service: service },
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDirectory, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30'
        })
    ]
});
// if (process.env.NODE_ENV !== 'production') {
//     logs.add(new winston.transports.Console({
//         format: winston.format.simple()
//     }));
// }
setInterval(() => {
    const files = fs_1.default.readdirSync(logDirectory);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    files.forEach(file => {
        const filePath = path_1.default.join(logDirectory, file);
        const fileStat = fs_1.default.statSync(filePath);
        if (fileStat.isFile() && fileStat.mtime < thirtyDaysAgo) {
            fs_1.default.unlinkSync(filePath);
        }
    });
}, 24 * 60 * 60 * 1000);
exports.default = logs;
//# sourceMappingURL=log.js.map