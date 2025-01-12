import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const dataPath = path.join(process.cwd(), 'data', 'names.json');
        let names = [];

        if (fs.existsSync(dataPath)) {
            names = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        const existingEntry = names.find(entry => entry.ip === ip && entry.userAgent === userAgent);

        if (existingEntry) {
            return res.status(400).json({ success: false, message: 'You have already submitted a name.' });
        }

        names.push({ name, ip, userAgent });
        fs.writeFileSync(dataPath, JSON.stringify(names, null, 2));

        return res.status(200).json({ success: true, name });
    } else {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
