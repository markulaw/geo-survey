"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const surveys_1 = __importDefault(require("./routes/surveys"));
const cors = require('cors');
const path = require('path');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static('dist'));
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use('/api/surveys', surveys_1.default);
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
