import React from 'react';

const GeneratorSelect = ({
  isGenerateDataEnabled,
  selectedGenerators,
  tableName,
  columnName,
  handleGeneratorChange,
}) => {
  // Define generator options inside the component
  const generatorOptions = {
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    gender: 'Gender',
    phoneNumber: 'Phone Number',
    city: 'City',
    state: 'State',
    zipcode: 'Zip Code',
    addressline1: 'Address Line 1',
    addressline2: 'Address Line 2',
    fullAddress: 'Full Address',
    ssn: 'SSN',
    emailID: 'Email',
    bookName: 'Book Name',
    bookAuthor: 'Book Author',
    weather: 'Weather',
    temperature: 'Temperature',
    creditCardNumber: 'Credit Card Number',
    dollarAmount: 'Dollar Amount',
    randomNumber: 'Random Number',
    artistName: 'Artist Name',
    regex: 'Regular Expression (Regex)',
    quotes: 'Movie Quotes',
    sentences: 'Sentences',
    ancientGod: 'Ancient God',
    animalName: 'Animal Name',
    productName: 'Product Name',
    catchPhrase: 'Catchphrase',
    hospitalName: 'Hospital Name',
    hospitalType: 'Hospital Type',
    diseaseName: 'Disease Name',
    medicineName: 'Medicine Name',
    sha256: 'SHA 256',
    futureDate: 'Future Date',
    pastDate: 'Past Date',
    boolean: 'Boolean (1/0)',
  };

  const currentValue = selectedGenerators[tableName]?.[columnName] || '';

  return (
    <select
      disabled={!isGenerateDataEnabled}
      value={currentValue}
      onChange={(e) => handleGeneratorChange(tableName, columnName, e.target.value)}
    >
      <option value="">Select Generator</option>
      {Object.entries(generatorOptions).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default GeneratorSelect;
