const XLSX = require('xlsx');

// Sample data
const data = [
  { Name: 'John Doe', Email: 'john@example.com', Password: 'john123', Roles: 'admin,user' },
  { Name: 'Jane Smith', Email: 'jane@example.com', Password: 'jane123', Roles: 'user' },
  { Name: 'Mike Johnson', Email: 'mike@example.com', Password: 'mike123', Roles: 'admin' },
  { Name: 'Sarah Williams', Email: 'sarah@example.com', Password: 'sarah123', Roles: 'admin,user' },
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Users');

// Write to file
XLSX.writeFile(wb, 'sample_users.xlsx');

console.log('✅ sample_users.xlsx created successfully!');
