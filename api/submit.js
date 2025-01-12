import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Allow only POST requests
    if (req.method === 'POST') {
        const { name } = req.body;

        // Validate the name
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid name provided.' });
        }

        // Get the user's IP and user agent
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Path to the names.json file
        const dataPath = path.join(process.cwd(), 'data', 'names.json');
        let names = [];

        // Read existing data if the file exists
        if (fs.existsSync(dataPath)) {
            names = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        // Check if the IP and user agent already exist
        const existingEntry = names.find(entry => entry.ip === ip && entry.userAgent === userAgent);

        if (existingEntry) {
            return res.status(400).json({ success: false, message: 'You have already submitted a name.' });
        }

        // Add the new entry
        names.push({ name, ip, userAgent });
        fs.writeFileSync(dataPath, JSON.stringify(names, null, 2));

        // Return success response
        return res.status(200).json({ success: true, name });
    } else {
        // Return error for non-POST requests
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
