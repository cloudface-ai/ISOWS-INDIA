"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const work_1 = require("./routes/work");
const license_1 = require("./routes/license");
const public_1 = require("./routes/public");
const payment_1 = require("./routes/payment");
const profile_1 = __importDefault(require("./routes/profile"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Serve static files from public
app.use('/files', express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
// Routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/work', work_1.workRoutes);
app.use('/api/license', license_1.licenseRoutes);
app.use('/api/public', public_1.publicRoutes);
app.use('/api/payment', payment_1.paymentRoutes);
app.use('/api/profile', profile_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Work Licensing API is running' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map