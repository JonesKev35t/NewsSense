const fs = require('fs').promises;
const path = require('path');

const RAW_DATA_DIR = path.join(__dirname, '../../data/raw');
const PROCESSED_DATA_DIR = path.join(__dirname, '../../data/processed');

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function processTimeSeriesData(data) {
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) return null;

    const processedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
    }));

    return processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function processFile(filePath) {
    try {
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const processedData = await processTimeSeriesData(data);
        
        if (!processedData) {
            console.error(`No time series data found in ${filePath}`);
            return;
        }

        const symbol = path.basename(filePath, '.json');
        const outputPath = path.join(PROCESSED_DATA_DIR, `${symbol}_processed.json`);
        
        await fs.writeFile(outputPath, JSON.stringify(processedData, null, 2));
        console.log(`Processed data saved to ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

async function main() {
    await ensureDirectoryExists(PROCESSED_DATA_DIR);
    
    try {
        const files = await fs.readdir(RAW_DATA_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        for (const file of jsonFiles) {
            const filePath = path.join(RAW_DATA_DIR, file);
            await processFile(filePath);
        }
    } catch (error) {
        console.error('Error reading raw data directory:', error.message);
    }
}

// Run the script
main().catch(console.error); 