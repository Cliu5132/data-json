const fs = require('fs');
const path = require('path');

// Specify the folder containing the JSON files
const dataFolderPath = './data';

// Initialize an array to store all the data
let combinedData = [];

// Loop through each JSON file
for (let i = 1; i <= 31; i++) {
  const fileName = `exam_data_${i}.json`;
  const filePath = path.join(dataFolderPath, fileName);

  try {
    // Read the JSON file
    const fileData = fs.readFileSync(filePath, 'utf8');

    // Parse the JSON data
    const jsonData = JSON.parse(fileData);

    // Add the data to the combinedData array
    combinedData = combinedData.concat(jsonData);
  } catch (error) {
    console.error(`Error reading file ${fileName}: ${error.message}`);
  }
}

// Write the combined data to a single JSON file
const combinedFileName = 'combined_exam_data.json';
const combinedFilePath = path.join(dataFolderPath, combinedFileName);

try {
  fs.writeFileSync(combinedFilePath, JSON.stringify(combinedData, null, 2));
  console.log(`Combined data written to ${combinedFileName}`);
} catch (error) {
  console.error(`Error writing combined data to file: ${error.message}`);
}
