const fs = require('fs');

console.log('Running combine-phone-data.js');

const DATA_FOLDER_PATH = 'src/data/';
const PHONE_FILE = 'schoolPhones.json';
const SCHOOLS_FILE = 'schools.json';
const OUTPUT_FILE = 'mergedData.json';

// Read the contents of the phone file
const phoneData = JSON.parse(fs.readFileSync(DATA_FOLDER_PATH + PHONE_FILE, 'utf8'));

// Read the contents of the schools file
const schoolsData = JSON.parse(fs.readFileSync(DATA_FOLDER_PATH + SCHOOLS_FILE, 'utf8'));

// Merge the data based on the school field
const mergedData = schoolsData.map(school => {
    let phoneRecord = phoneData.find(phone => phone.school === school.school);
    let phoneList = [];

    if (phoneRecord) {
        if (phoneRecord.phone_list == 'NA') {
            phoneList = [];
        } else {
            phoneList = phoneRecord.phone_list.split('|');
            phoneList = phoneList.map(phone => phone.trim());
            phoneList = phoneList.filter(phone => phone != 'NA');
        }
    }


    return {
        ...school,
        phone: phoneRecord ? phoneList : []
    };
});

// Write the merged data to the output file
fs.writeFileSync(DATA_FOLDER_PATH + OUTPUT_FILE, JSON.stringify(mergedData));

console.log('Merged data saved to ' + DATA_FOLDER_PATH + OUTPUT_FILE);

