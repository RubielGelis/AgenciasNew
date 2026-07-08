const fs = require('fs');

const files = [
    'src/app/dashboard/invoices/new/ItemPaymentModal.tsx',
    'src/app/dashboard/invoices/new/GlobalPaymentModal.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace <button onClick=... with <button type="button" onClick=...
    content = content.replace(/<button(\s+onClick|\s+className|\s*>)/g, (match) => {
        // Only add if it doesn't already have a type=
        return `<button type="button"${match.substring(7)}`;
    });

    // Also catch <button without anything immediately after (newline)
    content = content.replace(/<button\n/g, '<button type="button"\n');
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Fixed buttons in', file);
});
